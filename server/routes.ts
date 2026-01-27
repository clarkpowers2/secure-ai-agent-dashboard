import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { pinVerifySchema, privacySettingsSchema, moduleStatusSchema, patternDataSchema, insertAppointmentSchema, appointmentSchema, insertAlertRuleSchema, alertRuleSchema, sessionSettingsSchema, dashboardWidgetSchema } from "@shared/schema";
import { z } from "zod";

// Additional validation schemas
const changePinSchema = z.object({
  currentPin: z.string().min(4).max(8),
  newPin: z.string().min(4).max(8),
});

const agentSettingsSchema = z.object({
  troubleshootInterval: z.number().min(30).max(86400).optional(),
  organizeInterval: z.number().min(300).max(86400).optional(),
  patternInterval: z.number().min(60).max(3600).optional(),
  emotionInterval: z.number().min(30).max(600).optional(),
  organizeFolder: z.string().min(1).max(255).optional(),
  cpuThreshold: z.number().min(50).max(100).optional(),
  memoryThreshold: z.number().min(50).max(100).optional(),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // PIN authentication
  app.post("/api/auth/verify-pin", async (req, res) => {
    try {
      const { pin } = pinVerifySchema.parse(req.body);
      const isValid = await storage.verifyPin(pin);
      
      if (isValid) {
        res.json({ success: true });
      } else {
        res.status(401).json({ error: "Invalid PIN" });
      }
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.post("/api/auth/change-pin", async (req, res) => {
    try {
      const { currentPin, newPin } = changePinSchema.parse(req.body);
      
      const success = await storage.changePin(currentPin, newPin);
      
      if (success) {
        res.json({ success: true });
      } else {
        res.status(401).json({ error: "Current PIN is incorrect" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid PIN format" });
      }
      res.status(500).json({ error: "Failed to change PIN" });
    }
  });

  // System status
  app.get("/api/status", async (req, res) => {
    try {
      const status = await storage.getSystemStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to get status" });
    }
  });

  // Module status
  app.get("/api/modules", async (req, res) => {
    try {
      const modules = await storage.getModules();
      res.json(modules);
    } catch (error) {
      res.status(500).json({ error: "Failed to get modules" });
    }
  });

  app.patch("/api/modules/:name", async (req, res) => {
    try {
      const { name } = req.params;
      const updates = moduleStatusSchema.partial().parse(req.body);
      const module = await storage.updateModuleStatus(name, updates);
      
      if (module) {
        res.json(module);
      } else {
        res.status(404).json({ error: "Module not found" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid module data" });
      }
      res.status(500).json({ error: "Failed to update module" });
    }
  });

  // Privacy settings
  app.get("/api/privacy", async (req, res) => {
    try {
      const settings = await storage.getPrivacySettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to get privacy settings" });
    }
  });

  app.patch("/api/privacy", async (req, res) => {
    try {
      const updates = privacySettingsSchema.partial().parse(req.body);
      const settings = await storage.updatePrivacySettings(updates);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ error: "Invalid settings" });
    }
  });

  // Activity logs
  app.get("/api/logs", async (req, res) => {
    try {
      const logs = await storage.getLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to get logs" });
    }
  });

  app.get("/api/logs/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const logs = await storage.getRecentLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to get recent logs" });
    }
  });

  // Pattern data
  app.get("/api/patterns", async (req, res) => {
    try {
      const patterns = await storage.getPatterns();
      res.json(patterns);
    } catch (error) {
      res.status(500).json({ error: "Failed to get patterns" });
    }
  });

  app.patch("/api/patterns", async (req, res) => {
    try {
      const updates = patternDataSchema.partial().parse(req.body);
      const patterns = await storage.updatePatterns(updates);
      res.json(patterns);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid pattern data" });
      }
      res.status(500).json({ error: "Failed to update patterns" });
    }
  });

  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to get settings" });
    }
  });

  app.patch("/api/settings", async (req, res) => {
    try {
      const updates = agentSettingsSchema.parse(req.body);
      const settings = await storage.updateSettings(updates);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ error: "Invalid settings" });
    }
  });

  // PIN status
  app.get("/api/auth/pin-status", async (req, res) => {
    try {
      const isDefault = await storage.isDefaultPin();
      res.json({ isDefault });
    } catch (error) {
      res.status(500).json({ error: "Failed to get PIN status" });
    }
  });

  // Security - key rotation (simulated)
  app.post("/api/security/rotate-key", async (req, res) => {
    try {
      // Simulate key rotation
      await storage.addLog({
        timestamp: new Date().toLocaleString(),
        module: "security",
        level: "success",
        message: "Encryption key rotated successfully",
        details: "All data re-encrypted with new key",
      });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to rotate key" });
    }
  });

  // Appointments
  app.get("/api/appointments", async (req, res) => {
    try {
      const appointments = await storage.getAppointments();
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: "Failed to get appointments" });
    }
  });

  app.get("/api/appointments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const appointment = await storage.getAppointment(id);
      
      if (appointment) {
        res.json(appointment);
      } else {
        res.status(404).json({ error: "Appointment not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to get appointment" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const data = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(data);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid appointment data" });
      }
      res.status(500).json({ error: "Failed to create appointment" });
    }
  });

  app.patch("/api/appointments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = appointmentSchema.partial().parse(req.body);
      const appointment = await storage.updateAppointment(id, updates);
      
      if (appointment) {
        res.json(appointment);
      } else {
        res.status(404).json({ error: "Appointment not found" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid appointment data" });
      }
      res.status(500).json({ error: "Failed to update appointment" });
    }
  });

  app.delete("/api/appointments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteAppointment(id);
      
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Appointment not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete appointment" });
    }
  });

  // Alert Rules
  app.get("/api/alerts/rules", async (req, res) => {
    try {
      const rules = await storage.getAlertRules();
      res.json(rules);
    } catch (error) {
      res.status(500).json({ error: "Failed to get alert rules" });
    }
  });

  app.post("/api/alerts/rules", async (req, res) => {
    try {
      const data = insertAlertRuleSchema.parse(req.body);
      const rule = await storage.createAlertRule(data);
      res.status(201).json(rule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid alert rule data" });
      }
      res.status(500).json({ error: "Failed to create alert rule" });
    }
  });

  app.patch("/api/alerts/rules/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertAlertRuleSchema.partial().parse(req.body);
      const rule = await storage.updateAlertRule(id, updates);
      if (rule) {
        res.json(rule);
      } else {
        res.status(404).json({ error: "Alert rule not found" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid alert rule data" });
      }
      res.status(500).json({ error: "Failed to update alert rule" });
    }
  });

  app.delete("/api/alerts/rules/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteAlertRule(id);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Alert rule not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete alert rule" });
    }
  });

  // Alert Notifications
  app.get("/api/alerts/notifications", async (req, res) => {
    try {
      const notifications = await storage.getAlertNotifications();
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to get notifications" });
    }
  });

  app.patch("/api/alerts/notifications/:id/read", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.markNotificationRead(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark notification read" });
    }
  });

  app.post("/api/alerts/notifications/mark-all-read", async (req, res) => {
    try {
      await storage.markAllNotificationsRead();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark all notifications read" });
    }
  });

  // Playbooks
  app.get("/api/playbooks", async (req, res) => {
    try {
      const playbooks = await storage.getPlaybooks();
      res.json(playbooks);
    } catch (error) {
      res.status(500).json({ error: "Failed to get playbooks" });
    }
  });

  app.post("/api/playbooks/:id/execute", async (req, res) => {
    try {
      const { id } = req.params;
      const execution = await storage.executePlaybook(id);
      res.json(execution);
    } catch (error) {
      res.status(500).json({ error: "Failed to execute playbook" });
    }
  });

  app.get("/api/playbooks/executions", async (req, res) => {
    try {
      const executions = await storage.getPlaybookExecutions();
      res.json(executions);
    } catch (error) {
      res.status(500).json({ error: "Failed to get playbook executions" });
    }
  });

  // Audit Trail
  app.get("/api/audit", async (req, res) => {
    try {
      const events = await storage.getAuditEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to get audit events" });
    }
  });

  // Dashboard Widgets
  app.get("/api/dashboard/widgets", async (req, res) => {
    try {
      const widgets = await storage.getDashboardWidgets();
      res.json(widgets);
    } catch (error) {
      res.status(500).json({ error: "Failed to get dashboard widgets" });
    }
  });

  app.put("/api/dashboard/widgets", async (req, res) => {
    try {
      const widgets = z.array(dashboardWidgetSchema).parse(req.body);
      const updated = await storage.updateDashboardWidgets(widgets);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update dashboard widgets" });
    }
  });

  // Session Settings
  app.get("/api/session/settings", async (req, res) => {
    try {
      const settings = await storage.getSessionSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to get session settings" });
    }
  });

  app.patch("/api/session/settings", async (req, res) => {
    try {
      const updates = sessionSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateSessionSettings(updates);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update session settings" });
    }
  });

  // Backup & Export
  app.get("/api/backups", async (req, res) => {
    try {
      const backups = await storage.getBackups();
      res.json(backups);
    } catch (error) {
      res.status(500).json({ error: "Failed to get backups" });
    }
  });

  app.post("/api/backups", async (req, res) => {
    try {
      const { type } = req.body;
      const backup = await storage.createBackup(type || "full");
      res.status(201).json(backup);
    } catch (error) {
      res.status(500).json({ error: "Failed to create backup" });
    }
  });

  app.get("/api/export/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const data = await storage.getExportData(type);
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename=export-${type}-${Date.now()}.json`);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  // Python Agent Bridge API
  const agentBridge = await import("./agent-bridge");

  app.get("/api/agent/status", async (req, res) => {
    try {
      const status = agentBridge.getAgentConnectionStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to get agent status" });
    }
  });

  app.post("/api/agent/heartbeat", async (req, res) => {
    try {
      const { status, cpuUsage, memoryUsage, modules, patterns } = req.body;
      const nextCommand = await agentBridge.handleAgentHeartbeat({
        status,
        cpuUsage,
        memoryUsage,
        modules,
        patterns,
      });
      res.json({ success: true, command: nextCommand });
    } catch (error) {
      res.status(500).json({ error: "Failed to process heartbeat" });
    }
  });

  app.post("/api/agent/command", async (req, res) => {
    try {
      const { command, params } = req.body;
      const result = agentBridge.queueAgentCommand({ command, params });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to queue command" });
    }
  });

  app.get("/api/agent/commands", async (req, res) => {
    try {
      const commands = agentBridge.getPendingCommands();
      res.json(commands);
    } catch (error) {
      res.status(500).json({ error: "Failed to get pending commands" });
    }
  });

  app.post("/api/agent/configure", async (req, res) => {
    try {
      const config = req.body;
      agentBridge.configureAgentBridge(config);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to configure agent bridge" });
    }
  });

  return httpServer;
}
