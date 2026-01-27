import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import type { ActivityLog } from "@shared/schema";

interface ActivityLogItemProps {
  log: ActivityLog;
}

export function ActivityLogItem({ log }: ActivityLogItemProps) {
  const levelConfig = {
    info: {
      icon: Info,
      color: "text-chart-1",
      bg: "bg-chart-1/10",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-chart-4",
      bg: "bg-chart-4/10",
    },
    error: {
      icon: AlertCircle,
      color: "text-chart-5",
      bg: "bg-chart-5/10",
    },
    success: {
      icon: CheckCircle,
      color: "text-chart-3",
      bg: "bg-chart-3/10",
    },
  };

  const config = levelConfig[log.level];
  const Icon = config.icon;

  const moduleLabels = {
    troubleshoot: "Troubleshoot",
    continuity: "Continuity",
    emotion: "Emotion",
    patterns: "Patterns",
    organize: "Organize",
    security: "Security",
  };

  return (
    <div
      className="flex items-start gap-3 border-b border-border py-3 last:border-0"
      data-testid={`log-item-${log.id}`}
    >
      <div className={cn("mt-0.5 rounded-md p-1.5", config.bg)}>
        <Icon className={cn("h-4 w-4", config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {moduleLabels[log.module]}
          </span>
          <span className="text-xs text-muted-foreground/60">
            {log.timestamp}
          </span>
        </div>
        <p className="mt-1 text-sm">{log.message}</p>
        {log.details && (
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {log.details}
          </p>
        )}
      </div>
    </div>
  );
}
