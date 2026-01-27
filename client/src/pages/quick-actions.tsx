import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Play, Pause, Trash2, Activity, Key, RefreshCw, Zap, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Playbook, PlaybookExecution } from "@shared/schema";

const iconMap: Record<string, typeof Play> = {
  Pause, Play, Trash2, Activity, Key, RefreshCw,
};

export default function QuickActions() {
  const { toast } = useToast();
  const [executingId, setExecutingId] = useState<string | null>(null);

  const { data: playbooks, isLoading: playbooksLoading } = useQuery<Playbook[]>({
    queryKey: ["/api/playbooks"],
  });

  const { data: executions, isLoading: executionsLoading } = useQuery<PlaybookExecution[]>({
    queryKey: ["/api/playbooks/executions"],
  });

  const executeMutation = useMutation({
    mutationFn: async (id: string) => {
      setExecutingId(id);
      return apiRequest("POST", `/api/playbooks/${id}/execute`, {});
    },
    onSuccess: (_, id) => {
      const playbook = playbooks?.find(p => p.id === id);
      queryClient.invalidateQueries({ queryKey: ["/api/playbooks/executions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/status"] });
      toast({
        title: "Action Executed",
        description: `${playbook?.name || "Action"} completed successfully.`,
      });
    },
    onError: () => {
      toast({
        title: "Execution Failed",
        description: "The action could not be completed.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setExecutingId(null);
    },
  });

  const handleExecute = (playbook: Playbook) => {
    if (playbook.dangerous) return;
    executeMutation.mutate(playbook.id);
  };

  const handleDangerousExecute = (playbook: Playbook) => {
    executeMutation.mutate(playbook.id);
  };

  return (
    <div className="space-y-6 p-6" data-testid="page-quick-actions">
      <div>
        <h1 className="text-2xl font-semibold">Quick Actions</h1>
        <p className="text-sm text-muted-foreground">
          Execute common tasks with a single click
        </p>
      </div>

      <Card data-testid="card-playbooks">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Zap className="h-4 w-4" />
            Available Actions
          </CardTitle>
          <CardDescription>Click to execute, some actions require confirmation</CardDescription>
        </CardHeader>
        <CardContent>
          {playbooksLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-28" />)}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {playbooks?.map((playbook) => {
                const Icon = iconMap[playbook.icon] || Zap;
                const isExecuting = executingId === playbook.id;
                
                return playbook.dangerous ? (
                  <AlertDialog key={playbook.id}>
                    <AlertDialogTrigger asChild>
                      <Card className="hover-elevate cursor-pointer" data-testid={`playbook-${playbook.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="rounded-md bg-destructive/10 p-2">
                              <Icon className="h-5 w-5 text-destructive" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">{playbook.name}</p>
                                <Badge variant="secondary" className="text-destructive text-xs">
                                  <AlertTriangle className="mr-1 h-3 w-3" />
                                  Caution
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{playbook.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Action</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action ({playbook.name}) may have significant effects. Are you sure you want to proceed?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDangerousExecute(playbook)}>
                          Execute
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <Card 
                    key={playbook.id} 
                    className="hover-elevate cursor-pointer" 
                    onClick={() => handleExecute(playbook)}
                    data-testid={`playbook-${playbook.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-md bg-chart-3/10 p-2">
                          {isExecuting ? (
                            <RefreshCw className="h-5 w-5 text-chart-3 animate-spin" />
                          ) : (
                            <Icon className="h-5 w-5 text-chart-3" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{playbook.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{playbook.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card data-testid="card-execution-history">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Clock className="h-4 w-4" />
            Execution History
          </CardTitle>
          <CardDescription>Recent action executions</CardDescription>
        </CardHeader>
        <CardContent>
          {executionsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : executions && executions.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {executions.slice(0, 20).map((exec) => (
                <div key={exec.id} className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-3">
                    {exec.status === "success" ? (
                      <CheckCircle className="h-4 w-4 text-chart-3" />
                    ) : exec.status === "running" ? (
                      <RefreshCw className="h-4 w-4 text-chart-4 animate-spin" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{exec.playbookName}</p>
                      {exec.details && (
                        <p className="text-xs text-muted-foreground">{exec.details}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(exec.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Clock className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No executions yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
