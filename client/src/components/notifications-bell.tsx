import { useQuery, useMutation } from "@tanstack/react-query";
import { Bell, BellRing, Check, AlertTriangle, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { AlertNotification } from "@shared/schema";
import { Link } from "wouter";

export function NotificationsBell() {
  const { data: notifications } = useQuery<AlertNotification[]>({
    queryKey: ["/api/alerts/notifications"],
    refetchInterval: 10000,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("PATCH", `/api/alerts/notifications/${id}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts/notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/alerts/notifications/read-all", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts/notifications"] });
    },
  });

  const unreadCount = notifications?.filter(n => !n.read).length || 0;
  const hasUnread = unreadCount > 0;

  const getSeverityIcon = (metric: string) => {
    switch (metric) {
      case "cpu":
      case "memory":
        return <AlertTriangle className="h-4 w-4 text-chart-5" />;
      default:
        return <Info className="h-4 w-4 text-chart-4" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          data-testid="button-notifications"
        >
          {hasUnread ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {hasUnread && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 min-w-5 px-1 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b p-3">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {hasUnread && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              className="h-7 text-xs"
              data-testid="button-mark-all-read"
            >
              <Check className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications && notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 ${!notification.read ? "bg-muted/50" : ""}`}
                >
                  <div className="mt-0.5">
                    {getSeverityIcon(notification.metric)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{notification.ruleName}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => markReadMutation.mutate(notification.id)}
                      data-testid={`button-dismiss-${notification.id}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <Bell className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No notifications</p>
            </div>
          )}
        </ScrollArea>
        <div className="border-t p-2">
          <Link href="/alerts">
            <Button variant="ghost" size="sm" className="w-full" data-testid="link-view-all-alerts">
              View all alerts
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
