import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Send, Loader2, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CommandHistoryItem {
  id: string;
  command: string;
  params: Record<string, string>;
  status: "pending" | "sent" | "executed";
  timestamp: Date;
}

const SUGGESTED_COMMANDS = [
  { label: "Pause Agent", command: "pause", description: "Stop all agent operations" },
  { label: "Resume Agent", command: "resume", description: "Start agent operations" },
  { label: "Run Diagnostics", command: "diagnostics", description: "Check system health" },
  { label: "Organize Files", command: "organize", description: "Organize Downloads folder" },
  { label: "Clear Cache", command: "clear_cache", description: "Clear cached data" },
  { label: "Check Status", command: "status", description: "Get current status" },
];

export function CommandPrompt() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [commandInput, setCommandInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<CommandHistoryItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: agentStatus } = useQuery<{ connected: boolean }>({
    queryKey: ["/api/agent/status"],
    refetchInterval: 5000,
  });

  const sendCommandMutation = useMutation({
    mutationFn: async (data: { command: string; params: Record<string, string> }) => {
      const response = await apiRequest("POST", "/api/agent/command", data);
      return response.json();
    },
    onSuccess: (data, variables) => {
      const newItem: CommandHistoryItem = {
        id: Date.now().toString(),
        command: variables.command,
        params: variables.params,
        status: "sent",
        timestamp: new Date(),
      };
      setCommandHistory((prev) => [...prev, newItem]);
      setCommandInput("");
      queryClient.invalidateQueries({ queryKey: ["/api/agent/commands"] });
      toast({
        title: "Command Sent",
        description: `"${variables.command}" queued for agent`,
      });
    },
    onError: () => {
      toast({
        title: "Failed",
        description: "Could not send command to agent",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    
    const parts = commandInput.trim().split(" ");
    const command = parts[0];
    const params: Record<string, string> = {};
    
    parts.slice(1).forEach((part, index) => {
      if (part.includes("=")) {
        const [key, value] = part.split("=");
        params[key] = value;
      } else {
        params[`arg${index}`] = part;
      }
    });

    sendCommandMutation.mutate({ command, params });
  };

  const handleQuickCommand = (command: string) => {
    sendCommandMutation.mutate({ command, params: {} });
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [commandHistory]);

  const isConnected = agentStatus?.connected ?? false;

  return (
    <Card data-testid="card-command-prompt">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-medium">Command Prompt</CardTitle>
          </div>
          <Badge variant={isConnected ? "default" : "secondary"} className="gap-1">
            <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-muted-foreground"}`} />
            {isConnected ? "Agent Connected" : "Agent Offline"}
          </Badge>
        </div>
        <CardDescription>Send commands to your AI agent</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_COMMANDS.map((cmd) => (
            <Button
              key={cmd.command}
              variant="outline"
              size="sm"
              onClick={() => handleQuickCommand(cmd.command)}
              disabled={sendCommandMutation.isPending}
              data-testid={`button-cmd-${cmd.command}`}
            >
              {cmd.label}
            </Button>
          ))}
        </div>

        {commandHistory.length > 0 && (
          <ScrollArea className="h-32 rounded-md border bg-muted/30 p-3" ref={scrollRef}>
            <div className="space-y-2 font-mono text-sm">
              {commandHistory.map((item) => (
                <div key={item.id} className="flex items-start gap-2">
                  <span className="text-muted-foreground select-none">$</span>
                  <span className="text-foreground">{item.command}</span>
                  {Object.keys(item.params).length > 0 && (
                    <span className="text-muted-foreground">
                      {Object.entries(item.params).map(([k, v]) => `${k}=${v}`).join(" ")}
                    </span>
                  )}
                  <span className="ml-auto flex items-center gap-1">
                    {item.status === "sent" && (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    )}
                    {item.status === "pending" && (
                      <Clock className="h-3 w-3 text-yellow-500" />
                    )}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-muted-foreground select-none">
              $
            </span>
            <Input
              ref={inputRef}
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder={isConnected ? "Type a command..." : "Agent offline - commands will queue"}
              className="pl-7 font-mono"
              disabled={sendCommandMutation.isPending}
              data-testid="input-command"
            />
          </div>
          <Button
            type="submit"
            disabled={!commandInput.trim() || sendCommandMutation.isPending}
            data-testid="button-send-command"
          >
            {sendCommandMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        {!isConnected && (
          <div className="flex items-center gap-2 rounded-md bg-muted p-3 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Commands will be queued and sent when the agent reconnects.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
