import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for PIN authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// System Status
export const systemStatusSchema = z.object({
  cpuUsage: z.number().min(0).max(100),
  memoryUsage: z.number().min(0).max(100),
  diskUsage: z.number().min(0).max(100),
  agentStatus: z.enum(["running", "paused", "stopped"]),
  uptime: z.number(),
  lastUpdate: z.string(),
});

export type SystemStatus = z.infer<typeof systemStatusSchema>;

// Privacy Settings
export const privacySettingsSchema = z.object({
  cameraEnabled: z.boolean(),
  fileAccessEnabled: z.boolean(),
  autoOrganizeEnabled: z.boolean(),
  patternLearningEnabled: z.boolean(),
  emotionDetectionEnabled: z.boolean(),
});

export type PrivacySettings = z.infer<typeof privacySettingsSchema>;

// Activity Log Entry
export const activityLogSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  module: z.enum(["troubleshoot", "continuity", "emotion", "patterns", "organize", "security"]),
  level: z.enum(["info", "warning", "error", "success"]),
  message: z.string(),
  details: z.string().optional(),
});

export type ActivityLog = z.infer<typeof activityLogSchema>;

// Pattern Data
export const patternDataSchema = z.object({
  appOpens: z.record(z.string(), z.number()),
  fileAccess: z.record(z.string(), z.number()),
  emotionHistory: z.array(z.object({
    timestamp: z.string(),
    emotion: z.string(),
    confidence: z.number(),
  })),
});

export type PatternData = z.infer<typeof patternDataSchema>;

// Agent Module Status
export const moduleStatusSchema = z.object({
  name: z.string(),
  status: z.enum(["active", "inactive", "error"]),
  lastActivity: z.string(),
  description: z.string(),
});

export type ModuleStatus = z.infer<typeof moduleStatusSchema>;

// PIN Verification
export const pinVerifySchema = z.object({
  pin: z.string().min(4).max(8),
});

export type PinVerify = z.infer<typeof pinVerifySchema>;

// Appointments
export const appointmentSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  date: z.string(),
  time: z.string(),
  duration: z.number().min(15).max(480),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["scheduled", "completed", "cancelled"]),
  reminder: z.boolean(),
});

export type Appointment = z.infer<typeof appointmentSchema>;

export const insertAppointmentSchema = appointmentSchema.omit({ id: true });
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

// Alert Rules
export const alertRuleSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  metric: z.enum(["cpu", "memory", "disk", "agent_status"]),
  condition: z.enum(["above", "below", "equals"]),
  threshold: z.number(),
  enabled: z.boolean(),
  notifyInApp: z.boolean(),
  createdAt: z.string(),
});

export type AlertRule = z.infer<typeof alertRuleSchema>;
export const insertAlertRuleSchema = alertRuleSchema.omit({ id: true, createdAt: true });
export type InsertAlertRule = z.infer<typeof insertAlertRuleSchema>;

// Alert Notifications
export const alertNotificationSchema = z.object({
  id: z.string(),
  ruleId: z.string(),
  ruleName: z.string(),
  message: z.string(),
  metric: z.string(),
  value: z.number(),
  threshold: z.number(),
  timestamp: z.string(),
  read: z.boolean(),
});

export type AlertNotification = z.infer<typeof alertNotificationSchema>;

// Playbooks (Quick Actions)
export const playbookSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  action: z.enum(["pause_agent", "resume_agent", "clear_cache", "run_diagnostics", "rotate_keys", "restart_modules"]),
  icon: z.string(),
  dangerous: z.boolean(),
});

export type Playbook = z.infer<typeof playbookSchema>;

// Playbook Execution Log
export const playbookExecutionSchema = z.object({
  id: z.string(),
  playbookId: z.string(),
  playbookName: z.string(),
  action: z.string(),
  status: z.enum(["success", "failed", "running"]),
  timestamp: z.string(),
  details: z.string().optional(),
});

export type PlaybookExecution = z.infer<typeof playbookExecutionSchema>;

// Audit Events
export const auditEventSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  category: z.enum(["security", "privacy", "settings", "playbook", "alert", "data"]),
  action: z.string(),
  details: z.string(),
  severity: z.enum(["low", "medium", "high"]),
});

export type AuditEvent = z.infer<typeof auditEventSchema>;

// Dashboard Widget Configuration
export const dashboardWidgetSchema = z.object({
  id: z.string(),
  type: z.enum(["system_health", "recent_activity", "alerts", "appointments", "quick_actions", "module_status"]),
  position: z.number(),
  enabled: z.boolean(),
  size: z.enum(["small", "medium", "large"]),
});

export type DashboardWidget = z.infer<typeof dashboardWidgetSchema>;

// Session Settings
export const sessionSettingsSchema = z.object({
  timeoutMinutes: z.number().min(5).max(120),
  autoLogoutEnabled: z.boolean(),
  lastActivity: z.string(),
});

export type SessionSettings = z.infer<typeof sessionSettingsSchema>;

// Backup Data
export const backupDataSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  type: z.enum(["full", "settings", "logs", "appointments"]),
  size: z.number(),
  filename: z.string(),
});

export type BackupData = z.infer<typeof backupDataSchema>;
