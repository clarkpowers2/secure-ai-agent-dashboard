import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter, Download, RefreshCw, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ActivityLogItem } from "@/components/activity-log-item";
import { queryClient } from "@/lib/queryClient";
import type { ActivityLog } from "@shared/schema";

export default function Activity() {
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: logs, isLoading, isFetching } = useQuery<ActivityLog[]>({
    queryKey: ["/api/logs"],
    refetchInterval: 30000,
  });

  const filteredLogs = logs?.filter((log) => {
    const matchesModule = moduleFilter === "all" || log.module === moduleFilter;
    const matchesLevel = levelFilter === "all" || log.level === levelFilter;
    const matchesSearch =
      searchQuery === "" ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesModule && matchesLevel && matchesSearch;
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
  };

  const handleExport = () => {
    if (!filteredLogs) return;
    const csv = [
      "Timestamp,Module,Level,Message,Details",
      ...filteredLogs.map(
        (log) =>
          `"${log.timestamp}","${log.module}","${log.level}","${log.message}","${log.details || ""}"`
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 p-6" data-testid="page-activity">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Activity Logs</h1>
          <p className="text-sm text-muted-foreground">
            Monitor all agent activities and events
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetching}
            data-testid="button-refresh-logs"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={!filteredLogs?.length}
            data-testid="button-export-logs"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-logs"
              />
            </div>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-module-filter">
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                <SelectItem value="troubleshoot">Troubleshoot</SelectItem>
                <SelectItem value="continuity">Continuity</SelectItem>
                <SelectItem value="emotion">Emotion</SelectItem>
                <SelectItem value="patterns">Patterns</SelectItem>
                <SelectItem value="organize">Organize</SelectItem>
                <SelectItem value="security">Security</SelectItem>
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-level-filter">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="success">Success</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-activity-logs">
        <CardHeader>
          <CardTitle className="text-base font-medium">Activity Stream</CardTitle>
          <CardDescription>
            {filteredLogs ? `${filteredLogs.length} entries` : "Loading..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="flex gap-3 py-3">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <div className="flex-1">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="mt-2 h-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredLogs && filteredLogs.length > 0 ? (
              <div>
                {filteredLogs.map((log) => (
                  <ActivityLogItem key={log.id} log={log} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  No logs match your filters
                </p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
