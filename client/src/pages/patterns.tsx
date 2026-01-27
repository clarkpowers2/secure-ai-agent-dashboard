import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, Smile, Frown, Meh } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import type { PatternData } from "@shared/schema";

export default function Patterns() {
  const { data: patterns, isLoading } = useQuery<PatternData>({
    queryKey: ["/api/patterns"],
  });

  const appData = patterns
    ? Object.entries(patterns.appOpens)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    : [];

  const fileData = patterns
    ? Object.entries(patterns.fileAccess)
        .map(([name, count]) => ({ name: name.length > 15 ? name.slice(0, 15) + "..." : name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    : [];

  const emotionData = patterns?.emotionHistory || [];

  const getEmotionIcon = (emotion: string) => {
    const emotionLower = emotion.toLowerCase();
    if (emotionLower.includes("happy") || emotionLower.includes("joy")) {
      return <Smile className="h-4 w-4 text-chart-3" />;
    }
    if (emotionLower.includes("sad") || emotionLower.includes("stress")) {
      return <Frown className="h-4 w-4 text-chart-5" />;
    }
    return <Meh className="h-4 w-4 text-chart-4" />;
  };

  return (
    <div className="space-y-6 p-6" data-testid="page-patterns">
      <div>
        <h1 className="text-2xl font-semibold">Pattern Insights</h1>
        <p className="text-sm text-muted-foreground">
          Analyze your usage patterns and behaviors
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card data-testid="card-app-usage">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <BarChart3 className="h-4 w-4" />
              Application Usage
            </CardTitle>
            <CardDescription>Most frequently opened applications</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : appData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={appData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) =>
                      value.length > 12 ? value.slice(0, 12) + "..." : value
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center">
                <p className="text-sm text-muted-foreground">No application data yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-file-access">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <TrendingUp className="h-4 w-4" />
              File Access Patterns
            </CardTitle>
            <CardDescription>Most frequently accessed files</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : fileData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={fileData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    className="font-mono"
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center">
                <p className="text-sm text-muted-foreground">No file access data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-emotion-timeline">
        <CardHeader>
          <CardTitle className="text-base font-medium">Emotion Timeline</CardTitle>
          <CardDescription>Anonymized sentiment analysis over time</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[250px] w-full" />
          ) : emotionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={emotionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="timestamp"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="confidence"
                  name="Confidence"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--chart-3))", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center">
              <p className="text-sm text-muted-foreground">No emotion data yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {patterns?.emotionHistory && patterns.emotionHistory.length > 0 && (
        <Card data-testid="card-recent-emotions">
          <CardHeader>
            <CardTitle className="text-base font-medium">Recent Emotions Detected</CardTitle>
            <CardDescription>Latest detected emotional states</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {patterns.emotionHistory.slice(-10).map((entry, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="flex items-center gap-1.5 py-1"
                >
                  {getEmotionIcon(entry.emotion)}
                  <span className="capitalize">{entry.emotion}</span>
                  <span className="text-muted-foreground">
                    ({Math.round(entry.confidence)}%)
                  </span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
