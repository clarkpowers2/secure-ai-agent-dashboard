import { useQuery } from "@tanstack/react-query";
import { Shield, FileText, Download, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import type { AuditEvent } from "@shared/schema";

export default function Audit() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data: events, isLoading } = useQuery<AuditEvent[]>({
    queryKey: ["/api/audit"],
  });

  const filteredEvents = events?.filter(e => 
    categoryFilter === "all" || e.category === categoryFilter
  ) || [];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-chart-5/10 text-chart-5";
      case "medium": return "bg-chart-4/10 text-chart-4";
      case "low": return "bg-chart-3/10 text-chart-3";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "security": return "bg-chart-5/10";
      case "privacy": return "bg-chart-4/10";
      case "playbook": return "bg-chart-3/10";
      case "alert": return "bg-chart-2/10";
      case "settings": return "bg-chart-1/10";
      default: return "bg-muted";
    }
  };

  const handleExport = () => {
    window.open("/api/export/audit", "_blank");
  };

  return (
    <div className="space-y-6 p-6" data-testid="page-audit">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Audit Trail</h1>
          <p className="text-sm text-muted-foreground">
            Complete history of security events and changes
          </p>
        </div>
        <Button variant="outline" onClick={handleExport} data-testid="button-export-audit">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <Card data-testid="card-audit-events">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Shield className="h-4 w-4" />
              Audit Events
            </CardTitle>
            <CardDescription>{filteredEvents.length} events recorded</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-32" data-testid="select-category-filter">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="privacy">Privacy</SelectItem>
                <SelectItem value="settings">Settings</SelectItem>
                <SelectItem value="playbook">Playbook</SelectItem>
                <SelectItem value="alert">Alert</SelectItem>
                <SelectItem value="data">Data</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3 rounded-md border p-3">
                  <div className={`mt-0.5 rounded-md p-2 ${getCategoryIcon(event.category)}`}>
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-sm">{event.action}</p>
                      <Badge variant="secondary" className="capitalize text-xs">
                        {event.category}
                      </Badge>
                      <Badge variant="secondary" className={`text-xs ${getSeverityColor(event.severity)}`}>
                        {event.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{event.details}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Shield className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">No audit events recorded yet</p>
              <p className="text-xs text-muted-foreground">Events will appear as you use the system</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
