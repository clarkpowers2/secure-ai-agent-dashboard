# Complete System Setup Guide

This guide explains how to run the Python AI Agent and Web Dashboard together as one integrated system.

---

## System Overview

Your system has two parts:
1. **Python AI Agent** - Runs on your computer, handles automation tasks
2. **Web Dashboard** - Monitors and controls the agent from any browser

They communicate via API calls every 5 seconds (heartbeat).

---

## Part 1: Setting Up the Web Dashboard

### Step 1: Start the Dashboard
The dashboard is already running in Replit. It serves on port 5000.

### Step 2: Access the Dashboard
Open the webview URL in your browser. You'll see:
- Login screen (default PIN: 1234)
- After login: Dashboard with system health, modules, activity

### Step 3: Change Default PIN (Important!)
1. Go to **Security** page
2. Enter current PIN (1234)
3. Set a new secure PIN
4. Save changes

---

## Part 2: Setting Up the Python Agent

### Step 1: Install Required Python Packages
```bash
pip install requests psutil
```

### Step 2: Copy the Bridge File
Copy `agent_bridge.py` to the same folder as your AI agent code.

### Step 3: Add Bridge to Your Agent
Add these lines to your existing agent (the file you shared):

```python
# At the top of your file, add:
from agent_bridge import integrate_with_agent, get_bridge

# After your existing imports and before the Kivy App class:
# Set up the dashboard connection
bridge = integrate_with_agent(
    troubleshoot_func=troubleshoot_pc,
    organize_func=auto_organize
)

# Update module statuses
bridge.update_module_status("troubleshoot", "active")
bridge.update_module_status("file_continuity", "active")
bridge.update_module_status("emotion_detection", "inactive" if not camera_opt_in else "active")
bridge.update_module_status("pattern_learning", "active")
bridge.update_module_status("auto_organize", "active")

# In your AgentApp build() method, add:
bridge.start()
```

### Step 4: Configure Dashboard URL
If the dashboard is running on a different machine:

```python
import os
os.environ['DASHBOARD_URL'] = 'https://your-replit-url.replit.app'
```

---

## Part 3: How They Work Together

### Automatic Sync (Every 5 Seconds)
The Python agent sends:
- CPU and memory usage
- Module statuses (active/inactive/error)
- Usage patterns (app opens, file access)

### Dashboard Controls
From the dashboard, you can:
- **Pause/Resume** the agent
- **Run diagnostics** 
- **Clear cache**
- **Restart modules**
- **Rotate encryption keys**

### Command Flow
1. You click "Pause Agent" in Dashboard
2. Command goes into queue
3. Python agent picks it up on next heartbeat
4. Agent executes the pause
5. Status updates on dashboard

---

## Part 4: Feature Reference

### Dashboard Pages

| Page | What It Does |
|------|--------------|
| Dashboard | System health, module status, quick stats |
| Appointments | Schedule and track appointments |
| Activity Logs | View all system events, filter by module/level |
| Pattern Insights | Charts of app usage, file access, emotions |
| Alerts | Set up threshold alerts, view notifications |
| Quick Actions | One-click commands: pause, diagnostics, etc. |
| Audit Trail | Security event history |
| Backup & Export | Download data as JSON |
| Privacy Settings | Toggle camera, file access, patterns |
| Security | Change PIN, rotate encryption key |
| Settings | Configure intervals, thresholds, folders |

### Keyboard Shortcuts (when installed as app)
- `Alt + H` - Go to Dashboard (Home)
- `Alt + A` - Appointments
- `Alt + L` - Activity Logs
- `Alt + P` - Pattern Insights
- `Alt + Q` - Quick Actions
- `Alt + S` - Settings

### Install as Desktop App
1. Open dashboard in Chrome/Edge
2. Click the install prompt or menu > "Install App"
3. Access from desktop like a native app

---

## Part 5: Troubleshooting

### Dashboard Shows "Agent Offline"
1. Check Python agent is running
2. Verify DASHBOARD_URL is correct
3. Check network connectivity
4. Look at agent.log for errors

### Commands Not Executing
1. Commands queue until next heartbeat (5 seconds)
2. Check Python console for errors
3. Verify command handlers are registered

### Patterns Not Syncing
1. Call `bridge.update_patterns(app_opens, file_access)` in your agent
2. Patterns sync on each heartbeat

---

## Part 6: Security Notes

- **PIN**: Change from default (1234) immediately
- **Encryption**: All patterns stored encrypted (Fernet)
- **Session**: Auto-expires after inactivity
- **Audit Trail**: All security events logged
- **HTTPS**: Use Replit's HTTPS URL for production

---

## Quick Start Checklist

- [ ] Dashboard running in Replit
- [ ] Changed default PIN from 1234
- [ ] Installed `requests` and `psutil` in Python environment
- [ ] Copied `agent_bridge.py` to agent folder
- [ ] Added bridge integration code to agent
- [ ] Set DASHBOARD_URL if needed
- [ ] Started Python agent
- [ ] Verified "Agent Connected" appears in dashboard sidebar
