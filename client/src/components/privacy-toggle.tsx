import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface PrivacyToggleProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
}

export function PrivacyToggle({
  id,
  title,
  description,
  icon,
  enabled,
  onToggle,
  disabled = false,
}: PrivacyToggleProps) {
  return (
    <Card data-testid={`privacy-toggle-${id}`}>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <Label htmlFor={id} className="text-sm font-medium cursor-pointer">
            {title}
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
        <Switch
          id={id}
          checked={enabled}
          onCheckedChange={onToggle}
          disabled={disabled}
          data-testid={`switch-${id}`}
        />
      </CardContent>
    </Card>
  );
}
