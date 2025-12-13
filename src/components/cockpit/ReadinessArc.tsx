import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { mockReadinessData, getReadinessStatus } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export function ReadinessArc() {
  const { readinessScore, sleepQuality, hrv, morningMood } = mockReadinessData;
  const status = getReadinessStatus(readinessScore);

  const data = [
    { name: "score", value: readinessScore },
    { name: "remaining", value: 100 - readinessScore },
  ];

  const getColor = () => {
    if (status.state === "anabolic") return "hsl(160, 84%, 39%)";
    if (status.state === "catabolic") return "hsl(0, 84%, 60%)";
    return "hsl(217, 91%, 60%)";
  };

  return (
    <div className="card-surface p-6 animate-fade-in">
      <h2 className="font-mono text-xs text-muted-foreground tracking-wider mb-4">
        READINESS INDEX
      </h2>

      <div className="relative h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius="70%"
              outerRadius="100%"
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={getColor()} />
              <Cell fill="hsl(240, 4%, 16%)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Score */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <span
            className={cn(
              "font-mono text-5xl font-bold",
              status.state === "anabolic" && "text-primary",
              status.state === "catabolic" && "text-destructive",
              status.state === "neutral" && "text-secondary"
            )}
          >
            {readinessScore}
          </span>
        </div>
      </div>

      {/* Status Message */}
      <div
        className={cn(
          "text-center font-mono text-sm tracking-wider mt-2",
          status.state === "anabolic" && "text-primary",
          status.state === "catabolic" && "text-destructive",
          status.state === "neutral" && "text-secondary"
        )}
      >
        {status.message}
      </div>

      {/* Metric Breakdown */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border">
        <div className="text-center">
          <p className="font-mono text-2xl font-semibold text-foreground">
            {sleepQuality}
          </p>
          <p className="text-xs text-muted-foreground mt-1">SLEEP</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-2xl font-semibold text-foreground">
            {hrv}
          </p>
          <p className="text-xs text-muted-foreground mt-1">HRV</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-2xl font-semibold text-foreground">
            {morningMood}
          </p>
          <p className="text-xs text-muted-foreground mt-1">MOOD</p>
        </div>
      </div>
    </div>
  );
}
