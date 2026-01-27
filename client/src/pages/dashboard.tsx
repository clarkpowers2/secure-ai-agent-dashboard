import { useQuery } from "@tanstack/react-query";
import { Cpu, HardDrive, MemoryStick, Clock, Wrench, FileSearch, Heart, Brain, FolderOpen, Monitor, Laptop, Smartphone, Copy, CheckCircle2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SystemGauge } from "@/components/system-gauge";
import { StatusIndicator } from "@/components/status-indicator";
import { ModuleCard } from "@/components/module-card";
import { ActivityLogItem } from "@/components/activity-log-item";
import { CommandPrompt } from "@/components/command-prompt";
import { DiagnosticsPanel } from "@/components/diagnostics-panel";
import { AlertsSummary } from "@/components/alerts-summary";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { SystemStatus, ModuleStatus, ActivityLog } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const dashboardUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const { data: systemStatus, isLoading: statusLoading } = useQuery<SystemStatus>({
    queryKey: ["/api/status"],
    refetchInterval: 5000,
  });

  const { data: modules, isLoading: modulesLoading } = useQuery<ModuleStatus[]>({
    queryKey: ["/api/modules"],
  });

  const { data: recentLogs, isLoading: logsLoading } = useQuery<ActivityLog[]>({
    queryKey: ["/api/logs/recent"],
    refetchInterval: 10000,
  });

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(dashboardUrl);
    setCopiedUrl(true);
    toast({ title: "Copied!", description: "Dashboard URL copied to clipboard" });
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const moduleIcons: Record<string, React.ReactNode> = {
    "Troubleshooter": <Wrench className="h-4 w-4 text-muted-foreground" />,
    "Continuity Watcher": <FileSearch className="h-4 w-4 text-muted-foreground" />,
    "Emotion Adapter": <Heart className="h-4 w-4 text-muted-foreground" />,
    "Pattern Learner": <Brain className="h-4 w-4 text-muted-foreground" />,
    "Auto Organizer": <FolderOpen className="h-4 w-4 text-muted-foreground" />,
  };

  return (
    <div className="space-y-6 p-6" data-testid="page-dashboard">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Monitor your AI agent's health and activity
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-system-health">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">System Health</CardTitle>
            <CardDescription>Real-time resource usage</CardDescription>
          </CardHeader>
          <CardContent>
            {statusLoading ? (
              <div className="flex justify-around py-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-24 w-24 rounded-full" />
              </div>
            ) : systemStatus ? (
              <div className="flex justify-around py-2">
                <SystemGauge
                  value={systemStatus.cpuUsage}
                  label="CPU"
                  icon={<Cpu className="h-3 w-3" />}
                  size="sm"
                />
                <SystemGauge
                  value={systemStatus.memoryUsage}
                  label="Memory"
                  icon={<MemoryStick className="h-3 w-3" />}
                  size="sm"
                />
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card data-testid="card-disk-usage">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Storage</CardTitle>
            <CardDescription>Disk utilization</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-4">
            {statusLoading ? (
              <Skeleton className="h-24 w-24 rounded-full" />
            ) : systemStatus ? (
              <SystemGauge
                value={systemStatus.diskUsage}
                label="Disk"
                icon={<HardDrive className="h-3 w-3" />}
                size="md"
              />
            ) : null}
          </CardContent>
        </Card>

        <Card data-testid="card-agent-status">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Agent Status</CardTitle>
            <CardDescription>Current operational state</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 py-4">
            {statusLoading ? (
              <>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : systemStatus ? (
              <>
                <StatusIndicator status={systemStatus.agentStatus} />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Uptime: {formatUptime(systemStatus.uptime)}</span>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card data-testid="card-last-update">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Last Update</CardTitle>
            <CardDescription>Most recent activity</CardDescription>
          </CardHeader>
          <CardContent className="py-4">
            {statusLoading ? (
              <Skeleton className="h-4 w-full" />
            ) : systemStatus ? (
              <p className="font-mono text-sm">{systemStatus.lastUpdate}</p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-quick-setup" className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Quick Setup</CardTitle>
          <CardDescription>Connect your AI agent from any device</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <code className="flex-1 rounded bg-muted px-3 py-2 text-xs font-mono truncate" data-testid="text-dashboard-url-short">
              {dashboardUrl}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={copyUrl}
              className="gap-2 shrink-0"
              data-testid="button-copy-dashboard-url"
            >
              {copiedUrl ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              {copiedUrl ? "Copied" : "Copy URL"}
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-2 rounded-md border p-3">
              <Monitor className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium">Desktop PC</p>
                <p className="text-xs text-muted-foreground truncate">Run Python agent</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-md border p-3">
              <Laptop className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium">Laptop</p>
                <p className="text-xs text-muted-foreground truncate">Monitor or run agent</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-md border p-3">
              <Smartphone className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium">Mobile</p>
                <p className="text-xs text-muted-foreground truncate">Monitor and control</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Link href="/setup-guide">
              <Button variant="ghost" size="sm" className="gap-2" data-testid="link-full-setup-guide">
                Full Setup Guide
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <DiagnosticsPanel />
        <AlertsSummary />
      </div>

      <CommandPrompt />

      <div>
        <h2 className="mb-4 text-lg font-semibold">Active Modules</h2>
        {modulesLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="mt-2 h-3 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : modules ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <ModuleCard
                key={module.name}
                module={module}
                icon={moduleIcons[module.name] || <Cpu className="h-4 w-4 text-muted-foreground" />}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
        <Card data-testid="card-recent-activity">
          <CardContent className="p-4">
            {logsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <div className="flex-1">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="mt-2 h-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentLogs && recentLogs.length > 0 ? (
              <div>
                {recentLogs.slice(0, 5).map((log) => (
                  <ActivityLogItem key={log.id} log={log} />
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No recent activity
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
