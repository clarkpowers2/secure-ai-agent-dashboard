import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format, parseISO, isToday, isTomorrow, isPast } from "date-fns";
import {
  Calendar,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle,
  Trash2,
  Edit,
  Bell,
  BellOff,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Appointment, InsertAppointment } from "@shared/schema";

export default function Appointments() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState<Partial<InsertAppointment>>({
    title: "",
    description: "",
    date: "",
    time: "09:00",
    duration: 30,
    priority: "medium",
    status: "scheduled",
    reminder: true,
  });

  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertAppointment) => {
      return apiRequest("POST", "/api/appointments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({ title: "Appointment Created", description: "Your appointment has been scheduled." });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create appointment.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Appointment> }) => {
      return apiRequest("PATCH", `/api/appointments/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({ title: "Appointment Updated", description: "Changes have been saved." });
      setEditingAppointment(null);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update appointment.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/appointments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({ title: "Appointment Deleted", description: "The appointment has been removed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete appointment.", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "09:00",
      duration: 30,
      priority: "medium",
      status: "scheduled",
      reminder: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAppointment) {
      updateMutation.mutate({ id: editingAppointment.id, data: formData });
    } else {
      createMutation.mutate(formData as InsertAppointment);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      title: appointment.title,
      description: appointment.description,
      date: appointment.date,
      time: appointment.time,
      duration: appointment.duration,
      priority: appointment.priority,
      status: appointment.status,
      reminder: appointment.reminder,
    });
  };

  const toggleStatus = (appointment: Appointment) => {
    const newStatus = appointment.status === "completed" ? "scheduled" : "completed";
    updateMutation.mutate({ id: appointment.id, data: { status: newStatus } });
  };

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEE, MMM d");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-chart-5/10 text-chart-5";
      case "medium": return "bg-chart-4/10 text-chart-4";
      case "low": return "bg-chart-3/10 text-chart-3";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const upcomingAppointments = appointments?.filter(a => a.status === "scheduled") || [];
  const completedAppointments = appointments?.filter(a => a.status === "completed") || [];

  return (
    <div className="space-y-6 p-6" data-testid="page-appointments">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Appointments</h1>
          <p className="text-sm text-muted-foreground">
            Track and manage your important appointments
          </p>
        </div>
        <Dialog open={isCreateOpen || !!editingAppointment} onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingAppointment(null);
            resetForm();
          } else {
            setIsCreateOpen(true);
          }
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-appointment">
              <Plus className="mr-2 h-4 w-4" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingAppointment ? "Edit Appointment" : "Create Appointment"}
                </DialogTitle>
                <DialogDescription>
                  {editingAppointment ? "Update the appointment details." : "Schedule a new appointment."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Meeting with team"
                    required
                    data-testid="input-appointment-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add details about this appointment"
                    data-testid="input-appointment-description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      data-testid="input-appointment-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      required
                      data-testid="input-appointment-time"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Select
                      value={String(formData.duration)}
                      onValueChange={(value) => setFormData({ ...formData, duration: parseInt(value) })}
                    >
                      <SelectTrigger data-testid="select-appointment-duration">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 min</SelectItem>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="45">45 min</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: "low" | "medium" | "high") => setFormData({ ...formData, priority: value })}
                    >
                      <SelectTrigger data-testid="select-appointment-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="reminder">Enable reminder</Label>
                  <Switch
                    id="reminder"
                    checked={formData.reminder}
                    onCheckedChange={(checked) => setFormData({ ...formData, reminder: checked })}
                    data-testid="switch-appointment-reminder"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-appointment"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card data-testid="card-upcoming-appointments">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Calendar className="h-4 w-4" />
              Upcoming
            </CardTitle>
            <CardDescription>
              {upcomingAppointments.length} scheduled appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="mt-1 h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-start gap-3 rounded-md border border-border p-3"
                    data-testid={`appointment-${appointment.id}`}
                  >
                    <button
                      onClick={() => toggleStatus(appointment)}
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-input"
                      data-testid={`button-toggle-${appointment.id}`}
                    >
                      {appointment.status === "completed" && (
                        <CheckCircle className="h-4 w-4 text-chart-3" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{appointment.title}</span>
                        <Badge variant="secondary" className={getPriorityColor(appointment.priority)}>
                          {appointment.priority}
                        </Badge>
                        {appointment.reminder ? (
                          <Bell className="h-3 w-3 text-muted-foreground" />
                        ) : (
                          <BellOff className="h-3 w-3 text-muted-foreground/50" />
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{getDateLabel(appointment.date)}</span>
                        <span>at</span>
                        <span>{appointment.time}</span>
                        <Clock className="ml-1 h-3 w-3" />
                        <span>{appointment.duration} min</span>
                      </div>
                      {appointment.description && (
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                          {appointment.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(appointment)}
                        data-testid={`button-edit-${appointment.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            data-testid={`button-delete-${appointment.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Appointment</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{appointment.title}"? This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(appointment.id)}
                              data-testid={`button-confirm-delete-${appointment.id}`}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Calendar className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">No upcoming appointments</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setIsCreateOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add one
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-completed-appointments">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <CheckCircle className="h-4 w-4 text-chart-3" />
              Completed
            </CardTitle>
            <CardDescription>
              {completedAppointments.length} completed appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="mt-1 h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : completedAppointments.length > 0 ? (
              <div className="space-y-3">
                {completedAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-start gap-3 rounded-md bg-muted/50 p-3 opacity-75"
                    data-testid={`appointment-completed-${appointment.id}`}
                  >
                    <button
                      onClick={() => toggleStatus(appointment)}
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-chart-3/20"
                      data-testid={`button-toggle-completed-${appointment.id}`}
                    >
                      <CheckCircle className="h-4 w-4 text-chart-3" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium line-through">{appointment.title}</span>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {getDateLabel(appointment.date)} at {appointment.time}
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          data-testid={`button-delete-completed-${appointment.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Appointment</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{appointment.title}"?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMutation.mutate(appointment.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <CheckCircle className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">No completed appointments</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
