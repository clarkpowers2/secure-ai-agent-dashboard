import { useQuery } from "@tanstack/react-query";
import { Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AgentStatus {
  connected: boolean;
  lastHeartbeat: string | null;
  agentState: string;
}

export function AgentStatusIndicator() {
  const { data: status } = useQuery<AgentStatus>({
    queryKey: ["/api/agent/status"],
    refetchInterval: 5000,
  });

  const isConnected = status?.connected ?? false;
  const lastHeartbeat = status?.lastHeartbeat
    ? new Date(status.lastHeartbeat).toLocaleTimeString()
    : "Never";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant={isConnected ? "default" : "secondary"}
          className="gap-1.5 cursor-default"
          data-testid="badge-agent-status"
        >
          {isConnected ? (
            <>
              <Wifi className="h-3 w-3" />
              <span className="hidden sm:inline">Agent Online</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3" />
              <span className="hidden sm:inline">Agent Offline</span>
            </>
          )}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">
          {isConnected ? "Python Agent Connected" : "Python Agent Disconnected"}
        </p>
        <p className="text-xs text-muted-foreground">
          Last heartbeat: {lastHeartbeat}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
