import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: "running" | "paused" | "stopped" | "active" | "inactive" | "error";
  label?: string;
  showPulse?: boolean;
}

export function StatusIndicator({ status, label, showPulse = true }: StatusIndicatorProps) {
  const statusConfig = {
    running: { color: "bg-status-online", label: "Running" },
    active: { color: "bg-status-online", label: "Active" },
    paused: { color: "bg-status-away", label: "Paused" },
    inactive: { color: "bg-status-offline", label: "Inactive" },
    stopped: { color: "bg-status-busy", label: "Stopped" },
    error: { color: "bg-status-busy", label: "Error" },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className={cn("h-2.5 w-2.5 rounded-full", config.color)} />
        {showPulse && (status === "running" || status === "active") && (
          <div
            className={cn(
              "absolute inset-0 h-2.5 w-2.5 animate-ping rounded-full opacity-75",
              config.color
            )}
          />
        )}
      </div>
      {label !== undefined ? (
        <span className="text-sm text-muted-foreground">{label}</span>
      ) : (
        <span className="text-sm text-muted-foreground">{config.label}</span>
      )}
    </div>
  );
}
