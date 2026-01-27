import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Database, Download, FileArchive, Settings, FileText, Calendar, HardDrive } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { BackupData } from "@shared/schema";

export default function Backup() {
  const { toast } = useToast();
  const [creatingType, setCreatingType] = useState<string | null>(null);

  const { data: backups, isLoading } = useQuery<BackupData[]>({
    queryKey: ["/api/backups"],
  });

  const createMutation = useMutation({
    mutationFn: async (type: string) => {
      setCreatingType(type);
      return apiRequest("POST", "/api/backups", { type });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/backups"] });
      toast({ title: "Backup Created", description: "Your backup has been created successfully." });
    },
    onError: () => {
      toast({ title: "Backup Failed", description: "Could not create backup.", variant: "destructive" });
    },
    onSettled: () => {
      setCreatingType(null);
    },
  });

  const exportTypes = [
    { type: "full", label: "Full Backup", description: "All data including settings, logs, and appointments", icon: Database },
    { type: "settings", label: "Settings Only", description: "Agent settings, privacy, and preferences", icon: Settings },
    { type: "logs", label: "Activity Logs", description: "Complete activity log history", icon: FileText },
    { type: "appointments", label: "Appointments", description: "All scheduled appointments", icon: Calendar },
  ];

  const handleExport = (type: string) => {
    window.open(`/api/export/${type}`, "_blank");
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="space-y-6 p-6" data-testid="page-backup">
      <div>
        <h1 className="text-2xl font-semibold">Backup & Export</h1>
        <p className="text-sm text-muted-foreground">
          Create backups and export your data
        </p>
      </div>

      <Card data-testid="card-export-options">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Download className="h-4 w-4" />
            Export Data
          </CardTitle>
          <CardDescription>Download your data in JSON format</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {exportTypes.map(({ type, label, description, icon: Icon }) => (
              <div key={type} className="flex items-center justify-between rounded-md border p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-muted p-2">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleExport(type)}
                  data-testid={`button-export-${type}`}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-create-backup">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <FileArchive className="h-4 w-4" />
            Create Backup
          </CardTitle>
          <CardDescription>Save a backup of your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {exportTypes.map(({ type, label, icon: Icon }) => (
              <Button
                key={type}
                variant="outline"
                className="h-auto flex-col gap-2 p-4"
                onClick={() => createMutation.mutate(type)}
                disabled={!!creatingType}
                data-testid={`button-backup-${type}`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-sm">{creatingType === type ? "Creating..." : label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-backup-history">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <HardDrive className="h-4 w-4" />
            Backup History
          </CardTitle>
          <CardDescription>Previously created backups</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : backups && backups.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {backups.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-3">
                    <FileArchive className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{backup.filename}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs capitalize">{backup.type}</Badge>
                        <span className="text-xs text-muted-foreground">{formatSize(backup.size)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(backup.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <HardDrive className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No backups created yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
