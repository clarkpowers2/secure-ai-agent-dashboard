import { storage } from "./storage";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

interface AgentConfig {
  logFile: string;
  patternsFile: string;
  keyFile: string;
  organizeFolder: string;
}

const defaultConfig: AgentConfig = {
  logFile: path.join(process.env.HOME || "", "agent.log"),
  patternsFile: path.join(process.env.HOME || "", "patterns.enc"),
  keyFile: path.join(process.env.HOME || "", "agent.key"),
  organizeFolder: path.join(process.env.HOME || "", "Downloads"),
};

let agentConfig = { ...defaultConfig };
let isAgentConnected = false;
let lastAgentHeartbeat: Date | null = null;
let agentRunningState: "running" | "paused" = "running";

const HEARTBEAT_TIMEOUT_MS = 15000; // 15 seconds - 3 missed heartbeats

export function configureAgentBridge(config: Partial<AgentConfig>) {
  agentConfig = { ...agentConfig, ...config };
}

function checkHeartbeatTimeout(): boolean {
  if (!lastAgentHeartbeat) return false;
  const elapsed = Date.now() - lastAgentHeartbeat.getTime();
  if (elapsed > HEARTBEAT_TIMEOUT_MS) {
    isAgentConnected = false;
    return false;
  }
  return isAgentConnected;
}

export function getAgentConnectionStatus() {
  const connected = checkHeartbeatTimeout();
  return {
    connected,
    lastHeartbeat: lastAgentHeartbeat?.toISOString() || null,
    agentState: agentRunningState,
    config: {
      logFile: agentConfig.logFile,
      patternsFile: agentConfig.patternsFile,
    },
  };
}

export function setAgentConnected(connected: boolean) {
  isAgentConnected = connected;
  if (connected) {
    lastAgentHeartbeat = new Date();
  }
}

export function setAgentRunningState(state: "running" | "paused") {
  agentRunningState = state;
}

export async function readAgentLogs(limit = 100): Promise<string[]> {
  try {
    if (!fs.existsSync(agentConfig.logFile)) {
      return [];
    }
    const content = fs.readFileSync(agentConfig.logFile, "utf-8");
    const lines = content.split("\n").filter((line) => line.trim());
    return lines.slice(-limit);
  } catch (error) {
    console.error("Failed to read agent logs:", error);
    return [];
  }
}

export function parseLogLine(line: string): {
  timestamp: string;
  level: string;
  message: string;
} | null {
  const match = line.match(
    /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3}) - (\w+) - (.+)$/
  );
  if (match) {
    return {
      timestamp: match[1],
      level: match[2].toLowerCase(),
      message: match[3],
    };
  }
  return null;
}

export async function syncAgentLogs() {
  const logLines = await readAgentLogs(50);

  for (const line of logLines) {
    const parsed = parseLogLine(line);
    if (parsed) {
      const levelMap: Record<string, "info" | "warning" | "error" | "success"> =
        {
          info: "info",
          warning: "warning",
          error: "error",
          critical: "error",
          debug: "info",
        };

      await storage.addLog({
        timestamp: parsed.timestamp,
        module: "patterns",
        level: levelMap[parsed.level] || "info",
        message: parsed.message,
      });
    }
  }
}

export async function decryptPatterns(): Promise<object | null> {
  try {
    if (
      !fs.existsSync(agentConfig.patternsFile) ||
      !fs.existsSync(agentConfig.keyFile)
    ) {
      return null;
    }

    const key = fs.readFileSync(agentConfig.keyFile);
    const encrypted = fs.readFileSync(agentConfig.patternsFile);

    const decipher = crypto.createDecipheriv(
      "aes-128-cbc",
      key.slice(0, 16),
      key.slice(16, 32)
    );
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return JSON.parse(decrypted.toString());
  } catch (error) {
    console.error("Failed to decrypt patterns:", error);
    return null;
  }
}

export interface AgentCommand {
  command:
    | "pause"
    | "resume"
    | "troubleshoot"
    | "organize"
    | "update_settings";
  params?: Record<string, unknown>;
}

const commandQueue: AgentCommand[] = [];

export function queueAgentCommand(command: AgentCommand) {
  commandQueue.push(command);
  return { queued: true, position: commandQueue.length };
}

export function getNextAgentCommand(): AgentCommand | null {
  return commandQueue.shift() || null;
}

export function getPendingCommands(): AgentCommand[] {
  return [...commandQueue];
}

export async function handleAgentHeartbeat(data: {
  status: string;
  cpuUsage: number;
  memoryUsage: number;
  modules: { name: string; status: string; lastActivity: string }[];
  patterns?: { app_opens: Record<string, number>; file_access: Record<string, number> };
}) {
  setAgentConnected(true);
  
  // Track agent's reported running state
  if (data.status === "paused" || data.status === "running") {
    setAgentRunningState(data.status);
  }

  if (data.patterns) {
    await storage.updatePatterns({
      appOpens: data.patterns.app_opens,
      fileAccess: data.patterns.file_access,
    });
  }

  for (const module of data.modules || []) {
    await storage.updateModuleStatus(module.name, {
      status: module.status as "active" | "inactive" | "error",
      lastActivity: module.lastActivity,
    });
  }

  await storage.addAuditEvent({
    timestamp: new Date().toISOString(),
    category: "data",
    action: "Agent heartbeat received",
    details: `Status: ${data.status}, CPU: ${data.cpuUsage.toFixed(1)}%, Memory: ${data.memoryUsage.toFixed(1)}%`,
    severity: "low",
  });

  return getNextAgentCommand();
}
