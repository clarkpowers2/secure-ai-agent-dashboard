import { cn } from "@/lib/utils";

interface SystemGaugeProps {
  value: number;
  label: string;
  icon: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export function SystemGauge({ value, label, icon, size = "md" }: SystemGaugeProps) {
  const getColor = (val: number) => {
    if (val < 60) return "text-chart-3";
    if (val < 80) return "text-chart-4";
    return "text-chart-5";
  };

  const getStrokeColor = (val: number) => {
    if (val < 60) return "stroke-chart-3";
    if (val < 80) return "stroke-chart-4";
    return "stroke-chart-5";
  };

  const sizeConfig = {
    sm: { width: 80, strokeWidth: 6, fontSize: "text-lg" },
    md: { width: 100, strokeWidth: 8, fontSize: "text-2xl" },
    lg: { width: 120, strokeWidth: 10, fontSize: "text-3xl" },
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: config.width, height: config.width }}>
        <svg
          className="transform -rotate-90"
          width={config.width}
          height={config.width}
        >
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={config.strokeWidth}
            className="text-muted/30"
          />
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn("transition-all duration-500", getStrokeColor(value))}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-semibold", config.fontSize, getColor(value))}>
            {value}%
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
    </div>
  );
}
