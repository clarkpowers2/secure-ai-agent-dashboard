"""
Python Agent Bridge - Connects the AI agent to the web dashboard
Add this to your existing agent code to enable dashboard integration
"""

import os
import json
import time
import threading
import requests
import psutil
from typing import Optional, Dict, Any, Callable
import logging

# Configuration
DASHBOARD_URL = os.getenv('DASHBOARD_URL', 'http://localhost:5000')
HEARTBEAT_INTERVAL = 5  # seconds
AGENT_NAME = os.getenv('AGENT_NAME', 'AI Agent')

logger = logging.getLogger(__name__)

class DashboardBridge:
    def __init__(self, dashboard_url: str = DASHBOARD_URL):
        self.dashboard_url = dashboard_url.rstrip('/')
        self.is_connected = False
        self.is_running = False
        self._is_paused = False
        self.command_handlers: Dict[str, Callable] = {}
        self._heartbeat_thread: Optional[threading.Thread] = None
        self.modules_status: Dict[str, Dict[str, Any]] = {}
        self.patterns: Dict[str, Any] = {"app_opens": {}, "file_access": {}}
        
    def register_command_handler(self, command: str, handler: Callable):
        """Register a handler function for a specific command from the dashboard"""
        self.command_handlers[command] = handler
        
    def update_module_status(self, name: str, status: str, last_activity: str = None):
        """Update the status of a module to be reported to dashboard"""
        self.modules_status[name] = {
            "name": name,
            "status": status,
            "lastActivity": last_activity or time.strftime("%Y-%m-%d %H:%M:%S")
        }
        
    def update_patterns(self, app_opens: Dict[str, int] = None, file_access: Dict[str, int] = None):
        """Update usage patterns to sync with dashboard"""
        if app_opens:
            self.patterns["app_opens"].update(app_opens)
        if file_access:
            self.patterns["file_access"].update(file_access)
            
    def set_paused(self, paused: bool):
        """Set the agent's paused state - called by pause/resume command handlers"""
        self._is_paused = paused
        logger.info(f"Agent {'paused' if paused else 'resumed'}")
        
    def get_current_state(self) -> str:
        """Get current agent state for heartbeat reporting"""
        if not self.is_running:
            return "stopped"
        return "paused" if self._is_paused else "running"
    
    def _get_system_metrics(self) -> Dict[str, float]:
        """Get current CPU and memory usage"""
        return {
            "cpuUsage": psutil.cpu_percent(interval=0.1),
            "memoryUsage": psutil.virtual_memory().percent
        }
    
    def _send_heartbeat(self):
        """Send heartbeat with status to the dashboard"""
        try:
            metrics = self._get_system_metrics()
            payload = {
                "status": self.get_current_state(),
                "cpuUsage": metrics["cpuUsage"],
                "memoryUsage": metrics["memoryUsage"],
                "modules": list(self.modules_status.values()),
                "patterns": self.patterns
            }
            
            response = requests.post(
                f"{self.dashboard_url}/api/agent/heartbeat",
                json=payload,
                timeout=5
            )
            
            if response.status_code == 200:
                self.is_connected = True
                data = response.json()
                
                # Process any pending commands
                if data.get("command"):
                    self._handle_command(data["command"])
            else:
                self.is_connected = False
                logger.warning(f"Heartbeat failed: {response.status_code}")
                
        except requests.RequestException as e:
            self.is_connected = False
            logger.debug(f"Dashboard not reachable: {e}")
        except Exception as e:
            logger.error(f"Heartbeat error: {e}")
    
    def _handle_command(self, command_data: Dict[str, Any]):
        """Process a command received from the dashboard"""
        command = command_data.get("command")
        params = command_data.get("params", {})
        
        if command in self.command_handlers:
            try:
                self.command_handlers[command](params)
                logger.info(f"Executed command: {command}")
            except Exception as e:
                logger.error(f"Error executing command {command}: {e}")
        else:
            logger.warning(f"Unknown command: {command}")
    
    def _heartbeat_loop(self):
        """Background thread for sending heartbeats"""
        while self.is_running:
            self._send_heartbeat()
            time.sleep(HEARTBEAT_INTERVAL)
    
    def start(self):
        """Start the dashboard bridge"""
        self.is_running = True
        self._heartbeat_thread = threading.Thread(target=self._heartbeat_loop, daemon=True)
        self._heartbeat_thread.start()
        logger.info(f"Dashboard bridge started, connecting to {self.dashboard_url}")
        
    def stop(self):
        """Stop the dashboard bridge"""
        self.is_running = False
        if self._heartbeat_thread:
            self._heartbeat_thread.join(timeout=2)
        logger.info("Dashboard bridge stopped")
        
    def send_log(self, level: str, message: str, module: str = "agent"):
        """Send a log entry to the dashboard"""
        try:
            requests.post(
                f"{self.dashboard_url}/api/logs",
                json={
                    "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                    "module": module,
                    "level": level,
                    "message": message
                },
                timeout=2
            )
        except:
            pass  # Don't block on log failures
            
    def send_alert(self, title: str, message: str, severity: str = "medium"):
        """Send an alert notification to the dashboard"""
        try:
            requests.post(
                f"{self.dashboard_url}/api/alerts/notifications",
                json={
                    "title": title,
                    "message": message,
                    "severity": severity,
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
                },
                timeout=2
            )
        except:
            pass


# Global bridge instance
_bridge: Optional[DashboardBridge] = None

def get_bridge() -> DashboardBridge:
    """Get or create the dashboard bridge singleton"""
    global _bridge
    if _bridge is None:
        _bridge = DashboardBridge()
    return _bridge


# Integration helper for existing agent code
def integrate_with_agent(
    troubleshoot_func: Callable = None,
    organize_func: Callable = None,
    pause_func: Callable = None,
    resume_func: Callable = None
):
    """
    Helper function to integrate the bridge with your existing agent.
    
    Usage:
        from agent_bridge import integrate_with_agent, get_bridge
        
        integrate_with_agent(
            troubleshoot_func=troubleshoot_pc,
            organize_func=auto_organize,
            pause_func=lambda _: set_paused(True),
            resume_func=lambda _: set_paused(False)
        )
        
        bridge = get_bridge()
        bridge.start()
    """
    bridge = get_bridge()
    
    if troubleshoot_func:
        bridge.register_command_handler("troubleshoot", troubleshoot_func)
    if organize_func:
        bridge.register_command_handler("organize", organize_func)
    
    # Set up pause/resume handlers that update bridge state
    def default_pause_handler(params):
        bridge.set_paused(True)
        if pause_func:
            pause_func(params)
            
    def default_resume_handler(params):
        bridge.set_paused(False)
        if resume_func:
            resume_func(params)
    
    bridge.register_command_handler("pause", default_pause_handler)
    bridge.register_command_handler("resume", default_resume_handler)
    
    return bridge


# Example usage when running standalone
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    bridge = get_bridge()
    
    # Register some test handlers
    bridge.register_command_handler("pause", lambda p: print("Pausing agent..."))
    bridge.register_command_handler("resume", lambda p: print("Resuming agent..."))
    bridge.register_command_handler("troubleshoot", lambda p: print("Running diagnostics..."))
    
    # Update module status
    bridge.update_module_status("troubleshoot", "active")
    bridge.update_module_status("file_continuity", "active")
    bridge.update_module_status("emotion_detection", "inactive")
    bridge.update_module_status("pattern_learning", "active")
    bridge.update_module_status("auto_organize", "active")
    
    # Start the bridge
    bridge.start()
    
    print(f"Bridge running, connecting to {bridge.dashboard_url}")
    print("Press Ctrl+C to stop")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        bridge.stop()
        print("Bridge stopped")
