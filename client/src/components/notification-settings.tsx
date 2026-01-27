import { Bell, BellOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDesktopNotifications } from "@/hooks/use-pwa";
import { useToast } from "@/hooks/use-toast";

export function NotificationSettings() {
  const { permission, isSupported, requestPermission, showNotification } = useDesktopNotifications();
  const { toast } = useToast();

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast({ title: "Notifications Enabled", description: "You will receive desktop alerts." });
      showNotification("Notifications Active", {
        body: "You will now receive alerts from your AI Agent Dashboard",
      });
    } else {
      toast({ 
        title: "Notifications Blocked", 
        description: "Please enable notifications in your browser settings.",
        variant: "destructive" 
      });
    }
  };

  const handleTestNotification = () => {
    showNotification("Test Notification", {
      body: "This is a test notification from your AI Agent Dashboard",
    });
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <BellOff className="h-4 w-4" />
            Desktop Notifications
          </CardTitle>
          <CardDescription>Not supported in this browser</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card data-testid="card-notification-settings">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Bell className="h-4 w-4" />
          Desktop Notifications
        </CardTitle>
        <CardDescription>
          Receive system alerts even when the dashboard is in the background
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Status:</span>
            {permission === "granted" ? (
              <Badge variant="secondary" className="bg-chart-3/10 text-chart-3">
                <Check className="mr-1 h-3 w-3" />
                Enabled
              </Badge>
            ) : permission === "denied" ? (
              <Badge variant="secondary" className="bg-destructive/10 text-destructive">
                Blocked
              </Badge>
            ) : (
              <Badge variant="secondary">Not enabled</Badge>
            )}
          </div>
          <div className="flex gap-2">
            {permission === "granted" ? (
              <Button variant="outline" size="sm" onClick={handleTestNotification} data-testid="button-test-notification">
                Test Notification
              </Button>
            ) : permission !== "denied" ? (
              <Button size="sm" onClick={handleEnableNotifications} data-testid="button-enable-notifications">
                <Bell className="mr-2 h-4 w-4" />
                Enable Notifications
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground">
                Notifications are blocked. Please enable in browser settings.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
