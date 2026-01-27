import { useQuery } from "@tanstack/react-query";
import { Bell, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import type { AlertNotification, AlertRule } from "@shared/schema";

export function AlertsSummary() {
  const { data: notifications, isLoading: notificationsLoading } = useQuery<AlertNotification[]>({
    queryKey: ["/api/alerts/notifications"],
    refetchInterval: 10000,
  });

  const { data: rules, isLoading: rulesLoading } = useQuery<AlertRule[]>({
    queryKey: ["/api/alerts"],
  });

  const unreadNotifications = notifications?.filter(n => !n.read) || [];
  const activeRules = rules?.filter(r => r.enabled).length || 0;
  const totalRules = rules?.length || 0;
  const hasUnread = unreadNotifications.length > 0;

  const isLoading = notificationsLoading || rulesLoading;

  return (
    <Card data-testid="card-alerts-summary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-medium">Alerts Summary</CardTitle>
          </div>
          {hasUnread && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {unreadNotifications.length} Active
            </Badge>
          )}
        </div>
        <CardDescription>{activeRules} of {totalRules} alert rules enabled</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : hasUnread ? (
          <div className="space-y-2">
            {unreadNotifications.slice(0, 3).map((notification) => (
              <div
                key={notification.id}
                className="flex items-center gap-3 rounded-md border border-destructive/20 bg-destructive/5 p-3"
              >
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{notification.ruleName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {notification.metric}: {notification.value.toFixed(1)}% (threshold: {notification.threshold}%)
                  </p>
                </div>
              </div>
            ))}
            {unreadNotifications.length > 3 && (
              <p className="text-xs text-muted-foreground text-center">
                +{unreadNotifications.length - 3} more alerts
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-md border bg-green-500/5 border-green-500/20 p-3">
            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">All Clear</p>
              <p className="text-xs text-muted-foreground">No active alerts at this time</p>
            </div>
          </div>
        )}
        <div className="flex justify-end">
          <Link href="/alerts">
            <Button variant="ghost" size="sm" className="gap-2" data-testid="link-manage-alerts">
              Manage Alerts
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
