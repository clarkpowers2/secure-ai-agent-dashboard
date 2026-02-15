import { type User, type InsertUser, type SystemStatus, type PrivacySettings, type ActivityLog, type PatternData, type ModuleStatus, type Appointment, type InsertAppointment, type AlertRule, type InsertAlertRule, type AlertNotification, type Playbook, type PlaybookExecution, type AuditEvent, type DashboardWidget, type SessionSettings, type BackupData, type CoiDisclosure, type InsertCoiDisclosure, type CoiReview, type InsurancePolicy, type InsertInsurancePolicy } from "@shared/schema";
import { randomUUID } from "crypto";

// Agent settings interface
interface AgentSettings {
  troubleshootInterval: number;
  organizeInterval: number;
  patternInterval: number;
  emotionInterval: number;
  organizeFolder: string;
  cpuThreshold: number;
  memoryThreshold: number;
}

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Agent status
  getSystemStatus(): Promise<SystemStatus>;
  updateSystemStatus(status: Partial<SystemStatus>): Promise<SystemStatus>;
  
  // Privacy settings
  getPrivacySettings(): Promise<PrivacySettings>;
  updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<PrivacySettings>;
  
  // Activity logs
  getLogs(): Promise<ActivityLog[]>;
  getRecentLogs(limit?: number): Promise<ActivityLog[]>;
  addLog(log: Omit<ActivityLog, "id">): Promise<ActivityLog>;
  
  // Pattern data
  getPatterns(): Promise<PatternData>;
  updatePatterns(patterns: Partial<PatternData>): Promise<PatternData>;
  
  // Module status
  getModules(): Promise<ModuleStatus[]>;
  updateModuleStatus(name: string, status: Partial<ModuleStatus>): Promise<ModuleStatus | undefined>;
  
  // Agent settings
  getSettings(): Promise<AgentSettings>;
  updateSettings(settings: Partial<AgentSettings>): Promise<AgentSettings>;
  
  // Appointments
  getAppointments(): Promise<Appointment[]>;
  getAppointment(id: string): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: string): Promise<boolean>;
  
  // PIN verification
  verifyPin(pin: string): Promise<boolean>;
  changePin(currentPin: string, newPin: string): Promise<boolean>;
  isDefaultPin(): Promise<boolean>;
  
  // Alert Rules
  getAlertRules(): Promise<AlertRule[]>;
  createAlertRule(rule: InsertAlertRule): Promise<AlertRule>;
  updateAlertRule(id: string, updates: Partial<AlertRule>): Promise<AlertRule | undefined>;
  deleteAlertRule(id: string): Promise<boolean>;
  
  // Alert Notifications
  getAlertNotifications(): Promise<AlertNotification[]>;
  addAlertNotification(notification: Omit<AlertNotification, "id">): Promise<AlertNotification>;
  markNotificationRead(id: string): Promise<boolean>;
  markAllNotificationsRead(): Promise<void>;
  
  // Playbooks
  getPlaybooks(): Promise<Playbook[]>;
  executePlaybook(id: string): Promise<PlaybookExecution>;
  getPlaybookExecutions(): Promise<PlaybookExecution[]>;
  
  // Audit Trail
  getAuditEvents(): Promise<AuditEvent[]>;
  addAuditEvent(event: Omit<AuditEvent, "id">): Promise<AuditEvent>;
  
  // Dashboard Widgets
  getDashboardWidgets(): Promise<DashboardWidget[]>;
  updateDashboardWidgets(widgets: DashboardWidget[]): Promise<DashboardWidget[]>;
  
  // Session Settings
  getSessionSettings(): Promise<SessionSettings>;
  updateSessionSettings(settings: Partial<SessionSettings>): Promise<SessionSettings>;
  
  // Backup & Export
  createBackup(type: "full" | "settings" | "logs" | "appointments"): Promise<BackupData>;
  getBackups(): Promise<BackupData[]>;
  getExportData(type: string): Promise<object>;
  
  // COI Disclosures
  getCoiDisclosures(): Promise<CoiDisclosure[]>;
  getCoiDisclosure(id: string): Promise<CoiDisclosure | undefined>;
  createCoiDisclosure(disclosure: InsertCoiDisclosure): Promise<CoiDisclosure>;
  updateCoiDisclosure(id: string, updates: Partial<CoiDisclosure>): Promise<CoiDisclosure | undefined>;
  deleteCoiDisclosure(id: string): Promise<boolean>;
  reviewCoiDisclosure(id: string, review: CoiReview): Promise<CoiDisclosure | undefined>;
  
  // Insurance Policies
  getInsurancePolicies(): Promise<InsurancePolicy[]>;
  getInsurancePolicy(id: string): Promise<InsurancePolicy | undefined>;
  createInsurancePolicy(policy: InsertInsurancePolicy): Promise<InsurancePolicy>;
  updateInsurancePolicy(id: string, updates: Partial<InsurancePolicy>): Promise<InsurancePolicy | undefined>;
  deleteInsurancePolicy(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private systemStatus: SystemStatus;
  private privacySettings: PrivacySettings;
  private logs: ActivityLog[];
  private patterns: PatternData;
  private modules: ModuleStatus[];
  private agentSettings: AgentSettings;
  private appointments: Appointment[];
  private pin: string;
  private hasCustomPin: boolean;
  private alertRules: AlertRule[];
  private alertNotifications: AlertNotification[];
  private playbooks: Playbook[];
  private playbookExecutions: PlaybookExecution[];
  private auditEvents: AuditEvent[];
  private dashboardWidgets: DashboardWidget[];
  private sessionSettings: SessionSettings;
  private backups: BackupData[];
  private coiDisclosures: CoiDisclosure[];
  private insurancePolicies: InsurancePolicy[];

  constructor() {
    this.users = new Map();
    this.pin = "1234"; // Default PIN
    this.hasCustomPin = false;
    
    // Initialize system status with simulated values
    this.systemStatus = {
      cpuUsage: 45,
      memoryUsage: 62,
      diskUsage: 38,
      agentStatus: "running",
      uptime: 7200,
      lastUpdate: new Date().toLocaleString(),
    };
    
    // Initialize privacy settings
    this.privacySettings = {
      cameraEnabled: false,
      fileAccessEnabled: true,
      autoOrganizeEnabled: true,
      patternLearningEnabled: true,
      emotionDetectionEnabled: false,
    };
    
    // Initialize modules
    this.modules = [
      {
        name: "Troubleshooter",
        status: "active",
        lastActivity: new Date().toLocaleString(),
        description: "Monitors system resources and suggests optimizations",
      },
      {
        name: "Continuity Watcher",
        status: "active",
        lastActivity: new Date().toLocaleString(),
        description: "Tracks file changes and provides continuity suggestions",
      },
      {
        name: "Emotion Adapter",
        status: "inactive",
        lastActivity: "Not started",
        description: "Detects emotional state and adapts system settings",
      },
      {
        name: "Pattern Learner",
        status: "active",
        lastActivity: new Date().toLocaleString(),
        description: "Learns from application usage patterns",
      },
      {
        name: "Auto Organizer",
        status: "active",
        lastActivity: new Date().toLocaleString(),
        description: "Automatically organizes files in the Downloads folder",
      },
    ];
    
    // Initialize patterns with sample data
    this.patterns = {
      appOpens: {
        "VS Code": 156,
        "Chrome": 234,
        "Terminal": 89,
        "Slack": 67,
        "Finder": 45,
        "Notes": 34,
        "Safari": 28,
        "Discord": 22,
        "Spotify": 19,
        "Mail": 15,
      },
      fileAccess: {
        "project/src/App.tsx": 45,
        "Documents/notes.md": 38,
        "project/package.json": 32,
        "Downloads/report.pdf": 28,
        ".zshrc": 22,
        "project/README.md": 18,
        "Desktop/todo.txt": 15,
        "Pictures/screenshot.png": 12,
      },
      emotionHistory: [
        { timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), emotion: "neutral", confidence: 72 },
        { timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), emotion: "focused", confidence: 85 },
        { timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), emotion: "happy", confidence: 78 },
        { timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), emotion: "stressed", confidence: 65 },
        { timestamp: new Date(Date.now() - 3600000).toISOString(), emotion: "relaxed", confidence: 82 },
        { timestamp: new Date().toISOString(), emotion: "focused", confidence: 88 },
      ],
    };
    
    // Initialize sample logs
    this.logs = [
      {
        id: randomUUID(),
        timestamp: new Date(Date.now() - 60000 * 10).toLocaleString(),
        module: "troubleshoot",
        level: "info",
        message: "System health check completed",
        details: "CPU: 45%, Memory: 62%",
      },
      {
        id: randomUUID(),
        timestamp: new Date(Date.now() - 60000 * 8).toLocaleString(),
        module: "patterns",
        level: "success",
        message: "Pattern data saved successfully",
        details: "Encrypted and stored to patterns.enc",
      },
      {
        id: randomUUID(),
        timestamp: new Date(Date.now() - 60000 * 5).toLocaleString(),
        module: "continuity",
        level: "info",
        message: "File modification detected",
        details: "project/src/App.tsx modified",
      },
      {
        id: randomUUID(),
        timestamp: new Date(Date.now() - 60000 * 3).toLocaleString(),
        module: "organize",
        level: "success",
        message: "File organized successfully",
        details: "Moved report.pdf to Documents/Reports",
      },
      {
        id: randomUUID(),
        timestamp: new Date(Date.now() - 60000 * 2).toLocaleString(),
        module: "security",
        level: "warning",
        message: "PIN verification attempt",
        details: "Authentication successful",
      },
      {
        id: randomUUID(),
        timestamp: new Date(Date.now() - 60000).toLocaleString(),
        module: "troubleshoot",
        level: "info",
        message: "High memory usage detected",
        details: "Suggested closing unused applications",
      },
    ];
    
    // Initialize agent settings
    this.agentSettings = {
      troubleshootInterval: 60,
      organizeInterval: 3600,
      patternInterval: 300,
      emotionInterval: 60,
      organizeFolder: "~/Downloads",
      cpuThreshold: 80,
      memoryThreshold: 80,
    };
    
    // Initialize sample appointments
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    this.appointments = [
      {
        id: randomUUID(),
        title: "Team standup meeting",
        description: "Daily sync with the development team",
        date: tomorrow.toISOString().split("T")[0],
        time: "09:00",
        duration: 30,
        priority: "medium",
        status: "scheduled",
        reminder: true,
      },
      {
        id: randomUUID(),
        title: "System maintenance review",
        description: "Review AI agent performance and logs",
        date: tomorrow.toISOString().split("T")[0],
        time: "14:00",
        duration: 60,
        priority: "high",
        status: "scheduled",
        reminder: true,
      },
      {
        id: randomUUID(),
        title: "Pattern analysis report",
        description: "Weekly analysis of usage patterns",
        date: nextWeek.toISOString().split("T")[0],
        time: "10:00",
        duration: 45,
        priority: "low",
        status: "scheduled",
        reminder: false,
      },
    ];
    
    // Initialize alert rules with defaults
    this.alertRules = [
      {
        id: randomUUID(),
        name: "High CPU Usage",
        metric: "cpu",
        condition: "above",
        threshold: 85,
        enabled: true,
        notifyInApp: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: randomUUID(),
        name: "High Memory Usage",
        metric: "memory",
        condition: "above",
        threshold: 90,
        enabled: true,
        notifyInApp: true,
        createdAt: new Date().toISOString(),
      },
    ];
    
    this.alertNotifications = [];
    
    // Initialize playbooks
    this.playbooks = [
      { id: "1", name: "Pause Agent", description: "Temporarily pause all agent operations", action: "pause_agent", icon: "Pause", dangerous: false },
      { id: "2", name: "Resume Agent", description: "Resume agent operations", action: "resume_agent", icon: "Play", dangerous: false },
      { id: "3", name: "Clear Cache", description: "Clear all cached data and patterns", action: "clear_cache", icon: "Trash2", dangerous: true },
      { id: "4", name: "Run Diagnostics", description: "Run full system diagnostics", action: "run_diagnostics", icon: "Activity", dangerous: false },
      { id: "5", name: "Rotate Keys", description: "Rotate encryption keys", action: "rotate_keys", icon: "Key", dangerous: true },
      { id: "6", name: "Restart Modules", description: "Restart all agent modules", action: "restart_modules", icon: "RefreshCw", dangerous: false },
    ];
    
    this.playbookExecutions = [];
    this.auditEvents = [];
    this.backups = [];
    this.coiDisclosures = [];
    this.insurancePolicies = [];
    
    // Initialize dashboard widgets
    this.dashboardWidgets = [
      { id: "1", type: "system_health", position: 0, enabled: true, size: "large" },
      { id: "2", type: "module_status", position: 1, enabled: true, size: "medium" },
      { id: "3", type: "alerts", position: 2, enabled: true, size: "medium" },
      { id: "4", type: "recent_activity", position: 3, enabled: true, size: "medium" },
      { id: "5", type: "quick_actions", position: 4, enabled: true, size: "small" },
      { id: "6", type: "appointments", position: 5, enabled: true, size: "small" },
    ];
    
    // Initialize session settings
    this.sessionSettings = {
      timeoutMinutes: 30,
      autoLogoutEnabled: false,
      lastActivity: new Date().toISOString(),
    };
    
    // Simulate dynamic status updates
    this.startStatusSimulation();
  }

  private startStatusSimulation() {
    setInterval(() => {
      // Simulate fluctuating CPU/memory usage
      this.systemStatus.cpuUsage = Math.max(10, Math.min(95, this.systemStatus.cpuUsage + (Math.random() - 0.5) * 10));
      this.systemStatus.memoryUsage = Math.max(20, Math.min(90, this.systemStatus.memoryUsage + (Math.random() - 0.5) * 5));
      this.systemStatus.uptime += 5;
      this.systemStatus.lastUpdate = new Date().toLocaleString();
    }, 5000);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getSystemStatus(): Promise<SystemStatus> {
    return { ...this.systemStatus };
  }

  async updateSystemStatus(status: Partial<SystemStatus>): Promise<SystemStatus> {
    this.systemStatus = { ...this.systemStatus, ...status };
    return { ...this.systemStatus };
  }

  async getPrivacySettings(): Promise<PrivacySettings> {
    return { ...this.privacySettings };
  }

  async updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<PrivacySettings> {
    this.privacySettings = { ...this.privacySettings, ...settings };
    
    // Update emotion module status based on settings
    if (settings.emotionDetectionEnabled !== undefined || settings.cameraEnabled !== undefined) {
      const emotionModule = this.modules.find(m => m.name === "Emotion Adapter");
      if (emotionModule) {
        emotionModule.status = (this.privacySettings.emotionDetectionEnabled && this.privacySettings.cameraEnabled) 
          ? "active" 
          : "inactive";
        emotionModule.lastActivity = emotionModule.status === "active" ? new Date().toLocaleString() : "Not started";
      }
    }
    
    return { ...this.privacySettings };
  }

  async getLogs(): Promise<ActivityLog[]> {
    return [...this.logs].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getRecentLogs(limit: number = 10): Promise<ActivityLog[]> {
    return (await this.getLogs()).slice(0, limit);
  }

  async addLog(log: Omit<ActivityLog, "id">): Promise<ActivityLog> {
    const newLog: ActivityLog = {
      ...log,
      id: randomUUID(),
    };
    this.logs.unshift(newLog);
    
    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(0, 1000);
    }
    
    return newLog;
  }

  async getPatterns(): Promise<PatternData> {
    return JSON.parse(JSON.stringify(this.patterns));
  }

  async updatePatterns(patterns: Partial<PatternData>): Promise<PatternData> {
    if (patterns.appOpens) {
      this.patterns.appOpens = { ...this.patterns.appOpens, ...patterns.appOpens };
    }
    if (patterns.fileAccess) {
      this.patterns.fileAccess = { ...this.patterns.fileAccess, ...patterns.fileAccess };
    }
    if (patterns.emotionHistory) {
      this.patterns.emotionHistory = [...this.patterns.emotionHistory, ...patterns.emotionHistory];
    }
    return JSON.parse(JSON.stringify(this.patterns));
  }

  async getModules(): Promise<ModuleStatus[]> {
    return [...this.modules];
  }

  async updateModuleStatus(name: string, status: Partial<ModuleStatus>): Promise<ModuleStatus | undefined> {
    const module = this.modules.find(m => m.name === name);
    if (module) {
      Object.assign(module, status);
      return { ...module };
    }
    return undefined;
  }

  async getSettings(): Promise<AgentSettings> {
    return { ...this.agentSettings };
  }

  async updateSettings(settings: Partial<AgentSettings>): Promise<AgentSettings> {
    this.agentSettings = { ...this.agentSettings, ...settings };
    return { ...this.agentSettings };
  }

  async verifyPin(pin: string): Promise<boolean> {
    const isValid = pin === this.pin;
    
    // Log the attempt
    await this.addLog({
      timestamp: new Date().toLocaleString(),
      module: "security",
      level: isValid ? "success" : "warning",
      message: isValid ? "PIN verification successful" : "PIN verification failed",
      details: isValid ? "User authenticated" : "Invalid PIN entered",
    });
    
    return isValid;
  }

  async changePin(currentPin: string, newPin: string): Promise<boolean> {
    if (currentPin !== this.pin) {
      await this.addLog({
        timestamp: new Date().toLocaleString(),
        module: "security",
        level: "warning",
        message: "PIN change failed",
        details: "Current PIN verification failed",
      });
      return false;
    }
    
    this.pin = newPin;
    this.hasCustomPin = true;
    
    await this.addLog({
      timestamp: new Date().toLocaleString(),
      module: "security",
      level: "success",
      message: "PIN changed successfully",
    });
    
    return true;
  }

  async isDefaultPin(): Promise<boolean> {
    return !this.hasCustomPin;
  }

  async getAppointments(): Promise<Appointment[]> {
    return [...this.appointments].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    return this.appointments.find(a => a.id === id);
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const newAppointment: Appointment = {
      ...appointment,
      id: randomUUID(),
    };
    this.appointments.push(newAppointment);
    
    await this.addLog({
      timestamp: new Date().toLocaleString(),
      module: "patterns",
      level: "success",
      message: "Appointment created",
      details: `"${newAppointment.title}" scheduled for ${newAppointment.date}`,
    });
    
    return newAppointment;
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | undefined> {
    const index = this.appointments.findIndex(a => a.id === id);
    if (index === -1) return undefined;
    
    this.appointments[index] = { ...this.appointments[index], ...updates };
    
    await this.addLog({
      timestamp: new Date().toLocaleString(),
      module: "patterns",
      level: "info",
      message: "Appointment updated",
      details: `"${this.appointments[index].title}" modified`,
    });
    
    return { ...this.appointments[index] };
  }

  async deleteAppointment(id: string): Promise<boolean> {
    const index = this.appointments.findIndex(a => a.id === id);
    if (index === -1) return false;
    
    const deleted = this.appointments.splice(index, 1)[0];
    
    await this.addLog({
      timestamp: new Date().toLocaleString(),
      module: "patterns",
      level: "info",
      message: "Appointment deleted",
      details: `"${deleted.title}" removed`,
    });
    
    return true;
  }

  // Alert Rules
  async getAlertRules(): Promise<AlertRule[]> {
    return [...this.alertRules];
  }

  async createAlertRule(rule: InsertAlertRule): Promise<AlertRule> {
    const newRule: AlertRule = {
      ...rule,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.alertRules.push(newRule);
    await this.addAuditEvent({
      timestamp: new Date().toISOString(),
      category: "alert",
      action: "Alert rule created",
      details: `Created alert "${newRule.name}" for ${newRule.metric}`,
      severity: "low",
    });
    return newRule;
  }

  async updateAlertRule(id: string, updates: Partial<AlertRule>): Promise<AlertRule | undefined> {
    const index = this.alertRules.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    const { id: _id, createdAt: _createdAt, ...safeUpdates } = updates as Partial<AlertRule> & { id?: string; createdAt?: string };
    this.alertRules[index] = { ...this.alertRules[index], ...safeUpdates };
    return { ...this.alertRules[index] };
  }

  async deleteAlertRule(id: string): Promise<boolean> {
    const index = this.alertRules.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.alertRules.splice(index, 1);
    return true;
  }

  // Alert Notifications
  async getAlertNotifications(): Promise<AlertNotification[]> {
    return [...this.alertNotifications].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async addAlertNotification(notification: Omit<AlertNotification, "id">): Promise<AlertNotification> {
    const newNotification: AlertNotification = {
      ...notification,
      id: randomUUID(),
    };
    this.alertNotifications.unshift(newNotification);
    if (this.alertNotifications.length > 100) {
      this.alertNotifications = this.alertNotifications.slice(0, 100);
    }
    return newNotification;
  }

  async markNotificationRead(id: string): Promise<boolean> {
    const notification = this.alertNotifications.find(n => n.id === id);
    if (!notification) return false;
    notification.read = true;
    return true;
  }

  async markAllNotificationsRead(): Promise<void> {
    this.alertNotifications.forEach(n => n.read = true);
  }

  // Playbooks
  async getPlaybooks(): Promise<Playbook[]> {
    return [...this.playbooks];
  }

  async executePlaybook(id: string): Promise<PlaybookExecution> {
    const playbook = this.playbooks.find(p => p.id === id);
    if (!playbook) throw new Error("Playbook not found");

    const execution: PlaybookExecution = {
      id: randomUUID(),
      playbookId: playbook.id,
      playbookName: playbook.name,
      action: playbook.action,
      status: "running",
      timestamp: new Date().toISOString(),
    };

    // Simulate execution
    switch (playbook.action) {
      case "pause_agent":
        this.systemStatus.agentStatus = "paused";
        execution.status = "success";
        execution.details = "Agent paused successfully";
        break;
      case "resume_agent":
        this.systemStatus.agentStatus = "running";
        execution.status = "success";
        execution.details = "Agent resumed successfully";
        break;
      case "clear_cache":
        execution.status = "success";
        execution.details = "Cache cleared successfully";
        break;
      case "run_diagnostics":
        execution.status = "success";
        execution.details = `Diagnostics complete: CPU ${this.systemStatus.cpuUsage.toFixed(1)}%, Memory ${this.systemStatus.memoryUsage.toFixed(1)}%`;
        break;
      case "rotate_keys":
        execution.status = "success";
        execution.details = "Encryption keys rotated successfully";
        break;
      case "restart_modules":
        this.modules.forEach(m => m.lastActivity = new Date().toLocaleString());
        execution.status = "success";
        execution.details = "All modules restarted";
        break;
    }

    this.playbookExecutions.unshift(execution);
    
    await this.addAuditEvent({
      timestamp: new Date().toISOString(),
      category: "playbook",
      action: `Executed: ${playbook.name}`,
      details: execution.details || "",
      severity: playbook.dangerous ? "high" : "medium",
    });

    await this.addLog({
      timestamp: new Date().toLocaleString(),
      module: "security",
      level: execution.status === "success" ? "success" : "error",
      message: `Playbook executed: ${playbook.name}`,
      details: execution.details,
    });

    return execution;
  }

  async getPlaybookExecutions(): Promise<PlaybookExecution[]> {
    return [...this.playbookExecutions];
  }

  // Audit Trail
  async getAuditEvents(): Promise<AuditEvent[]> {
    return [...this.auditEvents].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async addAuditEvent(event: Omit<AuditEvent, "id">): Promise<AuditEvent> {
    const newEvent: AuditEvent = {
      ...event,
      id: randomUUID(),
    };
    this.auditEvents.unshift(newEvent);
    if (this.auditEvents.length > 500) {
      this.auditEvents = this.auditEvents.slice(0, 500);
    }
    return newEvent;
  }

  // Dashboard Widgets
  async getDashboardWidgets(): Promise<DashboardWidget[]> {
    return [...this.dashboardWidgets].sort((a, b) => a.position - b.position);
  }

  async updateDashboardWidgets(widgets: DashboardWidget[]): Promise<DashboardWidget[]> {
    this.dashboardWidgets = widgets;
    return [...this.dashboardWidgets];
  }

  // Session Settings
  async getSessionSettings(): Promise<SessionSettings> {
    return { ...this.sessionSettings };
  }

  async updateSessionSettings(settings: Partial<SessionSettings>): Promise<SessionSettings> {
    this.sessionSettings = { ...this.sessionSettings, ...settings };
    await this.addAuditEvent({
      timestamp: new Date().toISOString(),
      category: "settings",
      action: "Session settings updated",
      details: JSON.stringify(settings),
      severity: "low",
    });
    return { ...this.sessionSettings };
  }

  // Backup & Export
  async createBackup(type: "full" | "settings" | "logs" | "appointments"): Promise<BackupData> {
    const backup: BackupData = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      type,
      size: Math.floor(Math.random() * 1000) + 100,
      filename: `backup-${type}-${Date.now()}.json`,
    };
    this.backups.unshift(backup);
    
    await this.addAuditEvent({
      timestamp: new Date().toISOString(),
      category: "data",
      action: "Backup created",
      details: `Created ${type} backup: ${backup.filename}`,
      severity: "low",
    });
    
    return backup;
  }

  async getBackups(): Promise<BackupData[]> {
    return [...this.backups];
  }

  async getExportData(type: string): Promise<object> {
    switch (type) {
      case "settings":
        return {
          agentSettings: this.agentSettings,
          privacySettings: this.privacySettings,
          sessionSettings: this.sessionSettings,
          alertRules: this.alertRules,
          dashboardWidgets: this.dashboardWidgets,
        };
      case "logs":
        return { logs: this.logs };
      case "appointments":
        return { appointments: this.appointments };
      case "audit":
        return { auditEvents: this.auditEvents };
      case "full":
      default:
        return {
          exportedAt: new Date().toISOString(),
          agentSettings: this.agentSettings,
          privacySettings: this.privacySettings,
          sessionSettings: this.sessionSettings,
          alertRules: this.alertRules,
          logs: this.logs,
          appointments: this.appointments,
          auditEvents: this.auditEvents,
          patterns: this.patterns,
        };
    }
  }

  // COI Disclosures implementation
  async getCoiDisclosures(): Promise<CoiDisclosure[]> {
    return this.coiDisclosures;
  }

  async getCoiDisclosure(id: string): Promise<CoiDisclosure | undefined> {
    return this.coiDisclosures.find(d => d.id === id);
  }

  async createCoiDisclosure(disclosure: InsertCoiDisclosure): Promise<CoiDisclosure> {
    const newDisclosure: CoiDisclosure = {
      ...disclosure,
      id: randomUUID(),
      status: "pending",
      submittedAt: new Date().toISOString(),
    };
    this.coiDisclosures.push(newDisclosure);
    
    await this.addAuditEvent({
      timestamp: new Date().toISOString(),
      category: "data",
      action: "COI Disclosure Created",
      details: `New ${disclosure.relationship} disclosure for ${disclosure.entityName}`,
      severity: "medium",
    });
    
    return newDisclosure;
  }

  async updateCoiDisclosure(id: string, updates: Partial<CoiDisclosure>): Promise<CoiDisclosure | undefined> {
    const index = this.coiDisclosures.findIndex(d => d.id === id);
    if (index === -1) return undefined;
    
    this.coiDisclosures[index] = { ...this.coiDisclosures[index], ...updates };
    
    await this.addAuditEvent({
      timestamp: new Date().toISOString(),
      category: "data",
      action: "COI Disclosure Updated",
      details: `Disclosure ${id} was updated`,
      severity: "low",
    });
    
    return this.coiDisclosures[index];
  }

  async deleteCoiDisclosure(id: string): Promise<boolean> {
    const index = this.coiDisclosures.findIndex(d => d.id === id);
    if (index === -1) return false;
    
    const disclosure = this.coiDisclosures[index];
    this.coiDisclosures.splice(index, 1);
    
    await this.addAuditEvent({
      timestamp: new Date().toISOString(),
      category: "data",
      action: "COI Disclosure Deleted",
      details: `Disclosure for ${disclosure.entityName} was deleted`,
      severity: "medium",
    });
    
    return true;
  }

  async reviewCoiDisclosure(id: string, review: CoiReview): Promise<CoiDisclosure | undefined> {
    const index = this.coiDisclosures.findIndex(d => d.id === id);
    if (index === -1) return undefined;
    
    this.coiDisclosures[index] = {
      ...this.coiDisclosures[index],
      status: review.status,
      reviewedAt: new Date().toISOString(),
      reviewedBy: review.reviewedBy,
      reviewComments: review.comments,
    };
    
    await this.addAuditEvent({
      timestamp: new Date().toISOString(),
      category: "data",
      action: "COI Disclosure Reviewed",
      details: `Disclosure ${id} reviewed with status: ${review.status}`,
      severity: "medium",
    });
    
    return this.coiDisclosures[index];
  }

  // Insurance Policies implementation
  async getInsurancePolicies(): Promise<InsurancePolicy[]> {
    // Update statuses based on expiration dates
    const now = new Date();
    this.insurancePolicies.forEach(policy => {
      const expirationDate = new Date(policy.expirationDate);
      const daysUntilExpiration = Math.floor((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiration < 0) {
        policy.status = "expired";
      } else if (daysUntilExpiration <= policy.reminderDays) {
        policy.status = "expiring_soon";
      } else if (policy.status !== "cancelled" && policy.status !== "renewed") {
        policy.status = "active";
      }
    });
    
    return this.insurancePolicies;
  }

  async getInsurancePolicy(id: string): Promise<InsurancePolicy | undefined> {
    return this.insurancePolicies.find(p => p.id === id);
  }

  async createInsurancePolicy(policy: InsertInsurancePolicy): Promise<InsurancePolicy> {
    const now = new Date();
    const expirationDate = new Date(policy.expirationDate);
    const daysUntilExpiration = Math.floor((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    let status: InsurancePolicy["status"] = "active";
    if (daysUntilExpiration < 0) {
      status = "expired";
    } else if (daysUntilExpiration <= policy.reminderDays) {
      status = "expiring_soon";
    }
    
    const newPolicy: InsurancePolicy = {
      ...policy,
      id: randomUUID(),
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.insurancePolicies.push(newPolicy);
    
    await this.addAuditEvent({
      timestamp: new Date().toISOString(),
      category: "data",
      action: "Insurance Policy Created",
      details: `New ${policy.policyType} policy from ${policy.provider} (${policy.policyNumber})`,
      severity: "low",
    });
    
    return newPolicy;
  }

  async updateInsurancePolicy(id: string, updates: Partial<InsurancePolicy>): Promise<InsurancePolicy | undefined> {
    const index = this.insurancePolicies.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    
    this.insurancePolicies[index] = {
      ...this.insurancePolicies[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    await this.addAuditEvent({
      timestamp: new Date().toISOString(),
      category: "data",
      action: "Insurance Policy Updated",
      details: `Policy ${this.insurancePolicies[index].policyNumber} was updated`,
      severity: "low",
    });
    
    return this.insurancePolicies[index];
  }

  async deleteInsurancePolicy(id: string): Promise<boolean> {
    const index = this.insurancePolicies.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    const policy = this.insurancePolicies[index];
    this.insurancePolicies.splice(index, 1);
    
    await this.addAuditEvent({
      timestamp: new Date().toISOString(),
      category: "data",
      action: "Insurance Policy Deleted",
      details: `Policy ${policy.policyNumber} from ${policy.provider} was deleted`,
      severity: "medium",
    });
    
    return true;
  }
}

export const storage = new MemStorage();
