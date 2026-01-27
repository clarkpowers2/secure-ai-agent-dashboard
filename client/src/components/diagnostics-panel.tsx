import { useQuery } from "@tanstack/react-query";
import { Activity, Server, HardDrive, Clock, CheckCircle2, AlertCircle, Wifi, Database } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { SystemStatus, ModuleStatus } from "@shared/schema";

interface AgentStatus {
  connected: boolean;
  lastHeartbeat: string | null;
  agentState: string;
}

interface DiagnosticItem {
  name: string;
  status: "healthy" | "warning" | "error";
  value: string;
  icon: typeof Activity;
}

export function DiagnosticsPanel() {
  const { data: systemStatus, isLoading: statusLoading } = useQuery<SystemStatus>({
    queryKey: ["/api/status"],
    refetchInterval: 5000,
  });

  const { data: agentStatus } = useQuery<AgentStatus>({
    queryKey: ["/api/agent/status"],
    refetchInterval: 5000,
  });

  const { data: modules } = useQuery<ModuleStatus[]>({
    queryKey: ["/api/modules"],
  });

  const activeModules = modules?.filter(m => m.status === "active").length || 0;
  const totalModules = modules?.length || 0;

  const getStatusFromValue = (value: number, warning: number, error: number): "healthy" | "warning" | "error" => {
    if (value >= error) return "error";
    if (value >= warning) return "warning";
    return "healthy";
  };

  const diagnostics: DiagnosticItem[] = systemStatus ? [
    {
      name: "CPU Usage",
      status: getStatusFromValue(systemStatus.cpuUsage, 70, 90),
      value: `${systemStatus.cpuUsage.toFixed(1)}%`,
      icon: Activity,
    },
    {
      name: "Memory Usage",
      status: getStatusFromValue(systemStatus.memoryUsage, 75, 90),
      value: `${systemStatus.memoryUsage.toFixed(1)}%`,
      icon: Server,
    },
    {
      name: "Disk Usage",
      status: getStatusFromValue(systemStatus.diskUsage, 80, 95),
      value: `${systemStatus.diskUsage}%`,
      icon: HardDrive,
    },
    {
      name: "Agent Connection",
      status: agentStatus?.connected ? "healthy" : "warning",
      value: agentStatus?.connected ? "Connected" : "Offline",
      icon: Wifi,
    },
    {
      name: "Active Modules",
      status: activeModules === totalModules ? "healthy" : activeModules > 0 ? "warning" : "error",
      value: `${activeModules}/${totalModules}`,
      icon: Database,
    },
    {
      name: "Uptime",
      status: "healthy",
      value: formatUptime(systemStatus.uptime),
      icon: Clock,
    },
  ] : [];

  const getStatusColor = (status: "healthy" | "warning" | "error") => {
    switch (status) {
      case "healthy": return "text-green-500";
      case "warning": return "text-yellow-500";
      case "error": return "text-red-500";
    }
  };

  const getStatusBg = (status: "healthy" | "warning" | "error") => {
    switch (status) {
      case "healthy": return "bg-green-500/10";
      case "warning": return "bg-yellow-500/10";
      case "error": return "bg-red-500/10";
    }
  };

  const overallHealth = diagnostics.some(d => d.status === "error")
    ? "error"
    : diagnostics.some(d => d.status === "warning")
    ? "warning"
    : "healthy";

  return (
    <Card data-testid="card-diagnostics">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-medium">System Diagnostics</CardTitle>
          </div>
          <Badge
            variant="secondary"
            className={`gap-1 ${getStatusBg(overallHealth)} ${getStatusColor(overallHealth)}`}
          >
            {overallHealth === "healthy" ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <AlertCircle className="h-3 w-3" />
            )}
            {overallHealth === "healthy" ? "All Systems Operational" : overallHealth === "warning" ? "Minor Issues" : "Critical Issues"}
          </Badge>
        </div>
        <CardDescription>Real-time system health monitoring</CardDescription>
      </CardHeader>
      <CardContent>
        {statusLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {diagnostics.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.name}
                  className={`flex items-center gap-3 rounded-md border p-3 ${getStatusBg(item.status)}`}
                  data-testid={`diagnostic-${item.name.toLowerCase().replace(/\s/g, "-")}`}
                >
                  <div className={`rounded-md p-2 ${getStatusBg(item.status)}`}>
                    <Icon className={`h-4 w-4 ${getStatusColor(item.status)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{item.name}</p>
                    <p className={`text-sm font-semibold ${getStatusColor(item.status)}`}>
                      {item.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  return `${hours}h ${minutes}m`;
}
