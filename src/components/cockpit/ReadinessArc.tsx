import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { useScientificModel } from "@/hooks/useScientificModel";
import { useQuery } from "@tanstack/react-query";
import { healthService } from "@/services/health";

export function ReadinessArc() {
  const { weights } = useScientificModel();

  // Fetch Real Data
  const { data: sleepData } = useQuery({ queryKey: ['readiness-sleep'], queryFn: () => healthService.getQuickAverage('sleep_duration', 3) });
  const { data: hrvData } = useQuery({ queryKey: ['readiness-hrv'], queryFn: () => healthService.getQuickAverage('heart_rate_variability', 3) });

  // Normalize Inputs (Sleep target: 8h = 480m, HRV target: 100ms)
  const sleepScore = Math.min(100, ((sleepData || 0) / 480) * 100);
  const hrvScore = Math.min(100, ((hrvData || 0) / 100) * 100);
  const moodScore = 75; // TODO: Manual Input

  // Dynamic Formula
  const readinessScore = Math.round(
    (sleepScore * weights.readiness_sleep_weight) +
    (hrvScore * weights.readiness_hrv_weight) +
    (moodScore * weights.readiness_mood_weight)
  );

  const getReadinessStatus = (score: number) => {
    if (score >= 80) return { state: "anabolic", message: "PRIME STATE" };
    if (score >= 50) return { state: "neutral", message: "MAINTENANCE" };
    return { state: "catabolic", message: "RECOVERY NEEDED" };
  };

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
    <div className="card-surface p-4 h-full flex flex-col">
      <h2 className="font-mono text-xs text-muted-foreground tracking-wider mb-3 shrink-0 uppercase">
        Readiness Index
      </h2>

      <div className="relative flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="85%"
              startAngle={180}
              endAngle={0}
              innerRadius="65%"
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
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-[15%]">
          <span
            className={cn(
              "font-mono font-bold",
              "text-4xl sm:text-5xl lg:text-6xl",
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
          "text-center font-mono text-sm tracking-wider mt-2 shrink-0",
          status.state === "anabolic" && "text-primary",
          status.state === "catabolic" && "text-destructive",
          status.state === "neutral" && "text-secondary"
        )}
      >
        {status.message}
      </div>

      {/* Metric Breakdown */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border shrink-0">
        <div className="text-center">
          <p className="font-mono text-xl lg:text-2xl font-semibold text-foreground">
            {sleepData ? Math.round(sleepData / 60) + 'h' : '--'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">SLEEP</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-xl lg:text-2xl font-semibold text-foreground">
            {hrvData ? Math.round(hrvData) : '--'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">HRV</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-xl lg:text-2xl font-semibold text-foreground">
            {moodScore}
          </p>
          <p className="text-xs text-muted-foreground mt-1">MOOD</p>
        </div>
      </div>
    </div>
  );
}
