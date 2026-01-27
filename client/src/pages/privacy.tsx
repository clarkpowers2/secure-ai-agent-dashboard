import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Camera, FolderOpen, Brain, Heart, FileSearch, Shield, Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { PrivacyToggle } from "@/components/privacy-toggle";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { PrivacySettings } from "@shared/schema";

export default function Privacy() {
  const { toast } = useToast();
  const [pendingChanges, setPendingChanges] = useState<Partial<PrivacySettings>>({});

  const { data: settings, isLoading } = useQuery<PrivacySettings>({
    queryKey: ["/api/privacy"],
  });

  const mutation = useMutation({
    mutationFn: async (updates: Partial<PrivacySettings>) => {
      return apiRequest("PATCH", "/api/privacy", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/privacy"] });
      toast({
        title: "Settings Updated",
        description: "Your privacy preferences have been saved.",
      });
      setPendingChanges({});
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to save privacy settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggle = (key: keyof PrivacySettings, value: boolean) => {
    const updates = { ...pendingChanges, [key]: value };
    setPendingChanges(updates);
    mutation.mutate({ [key]: value });
  };

  const currentSettings = {
    ...settings,
    ...pendingChanges,
  } as PrivacySettings;

  const activeCount = settings
    ? Object.values(settings).filter(Boolean).length
    : 0;

  return (
    <div className="space-y-6 p-6" data-testid="page-privacy">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Privacy Settings</h1>
          <p className="text-sm text-muted-foreground">
            Control what data the AI agent can access
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1.5">
          <Shield className="h-3 w-3" />
          {activeCount} of 5 features enabled
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Lock className="h-4 w-4" />
            Data Access Controls
          </CardTitle>
          <CardDescription>
            Toggle permissions for different agent capabilities. Changes are saved automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="mt-1 h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-10 rounded-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : settings ? (
            <div className="space-y-4">
              <PrivacyToggle
                id="camera"
                title="Camera Access"
                description="Allow the agent to use your camera for emotion detection"
                icon={<Camera className="h-5 w-5 text-muted-foreground" />}
                enabled={currentSettings.cameraEnabled}
                onToggle={(value) => handleToggle("cameraEnabled", value)}
                disabled={mutation.isPending}
              />
              <PrivacyToggle
                id="file-access"
                title="File Access"
                description="Allow the agent to read file contents for continuity suggestions"
                icon={<FileSearch className="h-5 w-5 text-muted-foreground" />}
                enabled={currentSettings.fileAccessEnabled}
                onToggle={(value) => handleToggle("fileAccessEnabled", value)}
                disabled={mutation.isPending}
              />
              <PrivacyToggle
                id="auto-organize"
                title="Auto Organization"
                description="Allow the agent to automatically organize files in your Downloads folder"
                icon={<FolderOpen className="h-5 w-5 text-muted-foreground" />}
                enabled={currentSettings.autoOrganizeEnabled}
                onToggle={(value) => handleToggle("autoOrganizeEnabled", value)}
                disabled={mutation.isPending}
              />
              <PrivacyToggle
                id="pattern-learning"
                title="Pattern Learning"
                description="Allow the agent to learn from your application usage patterns"
                icon={<Brain className="h-5 w-5 text-muted-foreground" />}
                enabled={currentSettings.patternLearningEnabled}
                onToggle={(value) => handleToggle("patternLearningEnabled", value)}
                disabled={mutation.isPending}
              />
              <PrivacyToggle
                id="emotion-detection"
                title="Emotion Detection"
                description="Allow the agent to detect and adapt to your emotional state"
                icon={<Heart className="h-5 w-5 text-muted-foreground" />}
                enabled={currentSettings.emotionDetectionEnabled}
                onToggle={(value) => handleToggle("emotionDetectionEnabled", value)}
                disabled={mutation.isPending}
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Data Protection</CardTitle>
          <CardDescription>
            How your data is protected
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <Shield className="mt-0.5 h-4 w-4 text-chart-3" />
              <span>All data is encrypted using Fernet symmetric encryption</span>
            </li>
            <li className="flex items-start gap-2">
              <Shield className="mt-0.5 h-4 w-4 text-chart-3" />
              <span>PIN authentication uses Argon2 secure hashing</span>
            </li>
            <li className="flex items-start gap-2">
              <Shield className="mt-0.5 h-4 w-4 text-chart-3" />
              <span>PII is automatically redacted from all logged data</span>
            </li>
            <li className="flex items-start gap-2">
              <Shield className="mt-0.5 h-4 w-4 text-chart-3" />
              <span>Camera frames are processed locally and never stored</span>
            </li>
            <li className="flex items-start gap-2">
              <Shield className="mt-0.5 h-4 w-4 text-chart-3" />
              <span>All pattern data stays on your device</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
