import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Settings as SettingsIcon, Monitor, FolderOpen, Clock, Save, Download, CheckCircle, Laptop, Keyboard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { NotificationSettings } from "@/components/notification-settings";
import { usePWA } from "@/hooks/use-pwa";

interface AgentSettings {
  troubleshootInterval: number;
  organizeInterval: number;
  patternInterval: number;
  emotionInterval: number;
  organizeFolder: string;
  cpuThreshold: number;
  memoryThreshold: number;
}

export default function Settings() {
  const { toast } = useToast();
  const { theme } = useTheme();
  const [localSettings, setLocalSettings] = useState<Partial<AgentSettings>>({});
  const { isInstalled, isInstallable, install } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    if (!isInstallable) return;
    
    setIsInstalling(true);
    try {
      const success = await install();
      if (success) {
        toast({
          title: "Installation Started",
          description: "The app is being installed on your device.",
        });
      }
    } catch {
      toast({
        title: "Installation Failed",
        description: "Could not install the app. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsInstalling(false);
    }
  };

  const { data: settings, isLoading } = useQuery<AgentSettings>({
    queryKey: ["/api/settings"],
  });

  const mutation = useMutation({
    mutationFn: async (updates: Partial<AgentSettings>) => {
      return apiRequest("PATCH", "/api/settings", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully.",
      });
      setLocalSettings({});
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const currentSettings = {
    ...settings,
    ...localSettings,
  } as AgentSettings;

  const handleChange = <K extends keyof AgentSettings>(key: K, value: AgentSettings[K]) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (Object.keys(localSettings).length > 0) {
      mutation.mutate(localSettings);
    }
  };

  const hasChanges = Object.keys(localSettings).length > 0;

  return (
    <div className="space-y-6 p-6" data-testid="page-settings">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure the AI agent behavior
          </p>
        </div>
        {hasChanges && (
          <Button
            onClick={handleSave}
            disabled={mutation.isPending}
            data-testid="button-save-settings"
          >
            <Save className="mr-2 h-4 w-4" />
            {mutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card data-testid="card-install-app">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Laptop className="h-4 w-4" />
              Install on Desktop
            </CardTitle>
            <CardDescription>
              Add this dashboard to your computer for quick access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isInstalled ? (
              <div className="flex items-center gap-3 rounded-md bg-chart-3/10 p-3">
                <CheckCircle className="h-5 w-5 text-chart-3" />
                <div>
                  <p className="text-sm font-medium">App Installed</p>
                  <p className="text-xs text-muted-foreground">
                    The dashboard is installed on this device
                  </p>
                </div>
              </div>
            ) : isInstallable ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Install this dashboard as a desktop app to access it anytime without opening your browser.
                </p>
                <Button
                  onClick={handleInstall}
                  disabled={isInstalling}
                  className="w-full"
                  data-testid="button-install-app"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isInstalling ? "Installing..." : "Install App"}
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  To install this app on your desktop, laptop, or PC:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary" className="mt-0.5 shrink-0">1</Badge>
                    <span>Look for the install icon in your browser's address bar</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary" className="mt-0.5 shrink-0">2</Badge>
                    <span>Click it and select "Install" or "Add to Desktop"</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary" className="mt-0.5 shrink-0">3</Badge>
                    <span>The app will appear on your desktop/start menu</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Works on Chrome, Edge, and other modern browsers
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-appearance">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Monitor className="h-4 w-4" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the dashboard appearance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Theme</p>
                <p className="text-xs text-muted-foreground">
                  Current: {theme === "dark" ? "Dark" : "Light"} mode
                </p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-file-organization">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <FolderOpen className="h-4 w-4" />
              File Organization
            </CardTitle>
            <CardDescription>
              Configure auto-organize behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="organize-folder">Target Folder</Label>
                  <Input
                    id="organize-folder"
                    value={currentSettings.organizeFolder || ""}
                    onChange={(e) => handleChange("organizeFolder", e.target.value)}
                    placeholder="~/Downloads"
                    data-testid="input-organize-folder"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organize-interval">Organization Interval</Label>
                  <Select
                    value={String(currentSettings.organizeInterval || 3600)}
                    onValueChange={(value) => handleChange("organizeInterval", parseInt(value))}
                  >
                    <SelectTrigger id="organize-interval" data-testid="select-organize-interval">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1800">Every 30 minutes</SelectItem>
                      <SelectItem value="3600">Every hour</SelectItem>
                      <SelectItem value="7200">Every 2 hours</SelectItem>
                      <SelectItem value="14400">Every 4 hours</SelectItem>
                      <SelectItem value="86400">Once a day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-intervals">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Clock className="h-4 w-4" />
              Module Intervals
            </CardTitle>
            <CardDescription>
              Set how often each module runs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="troubleshoot-interval">Troubleshoot Check</Label>
                  <Select
                    value={String(currentSettings.troubleshootInterval || 60)}
                    onValueChange={(value) => handleChange("troubleshootInterval", parseInt(value))}
                  >
                    <SelectTrigger id="troubleshoot-interval" data-testid="select-troubleshoot-interval">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">Every 30 seconds</SelectItem>
                      <SelectItem value="60">Every minute</SelectItem>
                      <SelectItem value="120">Every 2 minutes</SelectItem>
                      <SelectItem value="300">Every 5 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pattern-interval">Pattern Learning</Label>
                  <Select
                    value={String(currentSettings.patternInterval || 300)}
                    onValueChange={(value) => handleChange("patternInterval", parseInt(value))}
                  >
                    <SelectTrigger id="pattern-interval" data-testid="select-pattern-interval">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">Every minute</SelectItem>
                      <SelectItem value="300">Every 5 minutes</SelectItem>
                      <SelectItem value="600">Every 10 minutes</SelectItem>
                      <SelectItem value="900">Every 15 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emotion-interval">Emotion Detection</Label>
                  <Select
                    value={String(currentSettings.emotionInterval || 60)}
                    onValueChange={(value) => handleChange("emotionInterval", parseInt(value))}
                  >
                    <SelectTrigger id="emotion-interval" data-testid="select-emotion-interval">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">Every 30 seconds</SelectItem>
                      <SelectItem value="60">Every minute</SelectItem>
                      <SelectItem value="120">Every 2 minutes</SelectItem>
                      <SelectItem value="300">Every 5 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-thresholds">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <SettingsIcon className="h-4 w-4" />
              Performance Thresholds
            </CardTitle>
            <CardDescription>
              Set alerting thresholds for system resources
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="cpu-threshold">CPU Alert Threshold (%)</Label>
                  <Input
                    id="cpu-threshold"
                    type="number"
                    min={50}
                    max={100}
                    value={currentSettings.cpuThreshold || 80}
                    onChange={(e) => handleChange("cpuThreshold", parseInt(e.target.value))}
                    data-testid="input-cpu-threshold"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memory-threshold">Memory Alert Threshold (%)</Label>
                  <Input
                    id="memory-threshold"
                    type="number"
                    min={50}
                    max={100}
                    value={currentSettings.memoryThreshold || 80}
                    onChange={(e) => handleChange("memoryThreshold", parseInt(e.target.value))}
                    data-testid="input-memory-threshold"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <NotificationSettings />

        <Card data-testid="card-keyboard-shortcuts">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Keyboard className="h-4 w-4" />
              Keyboard Shortcuts
            </CardTitle>
            <CardDescription>
              Quick navigation with your keyboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Dashboard (Home)</span>
                <Badge variant="secondary">Alt + H</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Appointments</span>
                <Badge variant="secondary">Alt + A</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Activity Logs</span>
                <Badge variant="secondary">Alt + L</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pattern Insights</span>
                <Badge variant="secondary">Alt + P</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Alerts (Notifications)</span>
                <Badge variant="secondary">Alt + N</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Quick Actions</span>
                <Badge variant="secondary">Alt + Q</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Settings</span>
                <Badge variant="secondary">Alt + S</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
