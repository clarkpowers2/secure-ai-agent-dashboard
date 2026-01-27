import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Bell, Plus, Trash2, Edit, BellOff, Check, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { AlertRule, InsertAlertRule, AlertNotification } from "@shared/schema";

export default function Alerts() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [formData, setFormData] = useState<Partial<InsertAlertRule>>({
    name: "",
    metric: "cpu",
    condition: "above",
    threshold: 80,
    enabled: true,
    notifyInApp: true,
  });

  const { data: rules, isLoading: rulesLoading } = useQuery<AlertRule[]>({
    queryKey: ["/api/alerts/rules"],
  });

  const { data: notifications, isLoading: notificationsLoading } = useQuery<AlertNotification[]>({
    queryKey: ["/api/alerts/notifications"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertAlertRule) => apiRequest("POST", "/api/alerts/rules", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts/rules"] });
      toast({ title: "Alert Rule Created" });
      setIsCreateOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AlertRule> }) => 
      apiRequest("PATCH", `/api/alerts/rules/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts/rules"] });
      toast({ title: "Alert Rule Updated" });
      setEditingRule(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/alerts/rules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts/rules"] });
      toast({ title: "Alert Rule Deleted" });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => apiRequest("POST", "/api/alerts/notifications/mark-all-read", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts/notifications"] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      metric: "cpu",
      condition: "above",
      threshold: 80,
      enabled: true,
      notifyInApp: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRule) {
      updateMutation.mutate({ id: editingRule.id, data: formData });
    } else {
      createMutation.mutate(formData as InsertAlertRule);
    }
  };

  const handleEdit = (rule: AlertRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      metric: rule.metric,
      condition: rule.condition,
      threshold: rule.threshold,
      enabled: rule.enabled,
      notifyInApp: rule.notifyInApp,
    });
  };

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <div className="space-y-6 p-6" data-testid="page-alerts">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Alerts & Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Configure alert rules and view notification history
          </p>
        </div>
        <Dialog open={isCreateOpen || !!editingRule} onOpenChange={(open) => {
          if (!open) { setIsCreateOpen(false); setEditingRule(null); resetForm(); }
          else setIsCreateOpen(true);
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-alert">
              <Plus className="mr-2 h-4 w-4" />
              New Alert Rule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingRule ? "Edit Alert Rule" : "Create Alert Rule"}</DialogTitle>
                <DialogDescription>
                  Set up conditions that trigger alerts
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Rule Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="High CPU Alert"
                    required
                    data-testid="input-alert-name"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Metric</Label>
                    <Select
                      value={formData.metric}
                      onValueChange={(v: "cpu" | "memory" | "disk" | "agent_status") => 
                        setFormData({ ...formData, metric: v })}
                    >
                      <SelectTrigger data-testid="select-alert-metric">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cpu">CPU Usage</SelectItem>
                        <SelectItem value="memory">Memory Usage</SelectItem>
                        <SelectItem value="disk">Disk Usage</SelectItem>
                        <SelectItem value="agent_status">Agent Status</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Condition</Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(v: "above" | "below" | "equals") => 
                        setFormData({ ...formData, condition: v })}
                    >
                      <SelectTrigger data-testid="select-alert-condition">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="above">Above</SelectItem>
                        <SelectItem value="below">Below</SelectItem>
                        <SelectItem value="equals">Equals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="threshold">Threshold</Label>
                    <Input
                      id="threshold"
                      type="number"
                      value={formData.threshold}
                      onChange={(e) => setFormData({ ...formData, threshold: parseInt(e.target.value) })}
                      data-testid="input-alert-threshold"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enabled">Enabled</Label>
                  <Switch
                    id="enabled"
                    checked={formData.enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notify">In-App Notifications</Label>
                  <Switch
                    id="notify"
                    checked={formData.notifyInApp}
                    onCheckedChange={(checked) => setFormData({ ...formData, notifyInApp: checked })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card data-testid="card-alert-rules">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <AlertTriangle className="h-4 w-4" />
              Alert Rules
            </CardTitle>
            <CardDescription>{rules?.length || 0} configured rules</CardDescription>
          </CardHeader>
          <CardContent>
            {rulesLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : rules && rules.length > 0 ? (
              <div className="space-y-3">
                {rules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${rule.enabled ? "bg-chart-3" : "bg-muted"}`} />
                      <div>
                        <p className="text-sm font-medium">{rule.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {rule.metric} {rule.condition} {rule.threshold}%
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(rule)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(rule.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">No alert rules configured</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-notifications">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Bell className="h-4 w-4" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="secondary">{unreadCount} new</Badge>
                )}
              </CardTitle>
              <CardDescription>Recent alert notifications</CardDescription>
            </div>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={() => markAllReadMutation.mutate()}>
                <Check className="mr-2 h-4 w-4" />
                Mark all read
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {notificationsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : notifications && notifications.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className={`rounded-md p-3 text-sm ${n.read ? "bg-muted/30" : "bg-muted"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">{n.message}</p>
                      {!n.read && <div className="h-2 w-2 rounded-full bg-chart-5 shrink-0 mt-1" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(n.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <BellOff className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">No notifications yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
