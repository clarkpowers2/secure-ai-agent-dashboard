import { useQuery } from "@tanstack/react-query";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface AgentStatus {
  connected: boolean;
  lastHeartbeat: string | null;
  agentState: "running" | "paused";
  config: {
    logFile: string;
    patternsFile: string;
  };
}

export function AgentConnectionStatus() {
  const { data: status, isLoading } = useQuery<AgentStatus>({
    queryKey: ["/api/agent/status"],
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <Badge variant="secondary" className="gap-1">
        <RefreshCw className="h-3 w-3 animate-spin" />
        Connecting
      </Badge>
    );
  }

  const isConnected = status?.connected;
  const agentState = status?.agentState || "running";
  const isPaused = agentState === "paused";
  const lastHeartbeat = status?.lastHeartbeat
    ? new Date(status.lastHeartbeat).toLocaleTimeString()
    : null;

  const getStatusLabel = () => {
    if (!isConnected) return "Agent Offline";
    if (isPaused) return "Agent Paused";
    return "Agent Running";
  };

  const getStatusColor = () => {
    if (!isConnected) return "bg-muted text-muted-foreground";
    if (isPaused) return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
    return "bg-chart-3/10 text-chart-3";
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="secondary"
          className={`gap-1 cursor-default ${getStatusColor()}`}
          data-testid="badge-agent-status"
        >
          {isConnected ? (
            <Wifi className="h-3 w-3" />
          ) : (
            <WifiOff className="h-3 w-3" />
          )}
          {getStatusLabel()}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        {isConnected ? (
          <div className="text-xs">
            <p>State: {agentState}</p>
            <p>Last heartbeat: {lastHeartbeat}</p>
          </div>
        ) : (
          <p className="text-xs">Python agent not connected</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
