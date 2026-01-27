import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusIndicator } from "@/components/status-indicator";
import type { ModuleStatus } from "@shared/schema";

interface ModuleCardProps {
  module: ModuleStatus;
  icon: React.ReactNode;
}

export function ModuleCard({ module, icon }: ModuleCardProps) {
  return (
    <Card data-testid={`card-module-${module.name.toLowerCase().replace(/\s+/g, "-")}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
            {icon}
          </div>
          <CardTitle className="text-base font-medium">{module.name}</CardTitle>
        </div>
        <StatusIndicator status={module.status} showPulse={module.status === "active"} />
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{module.description}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Last activity: {module.lastActivity}
        </p>
      </CardContent>
    </Card>
  );
}
