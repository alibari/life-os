import { useState } from "react";
import { 
  Heart, 
  Moon, 
  Footprints, 
  Flame, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Activity,
  Droplets,
  Brain
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

// Mock data for bio-metrics
const sleepData = [
  { day: "Mon", hours: 7.2, quality: 82 },
  { day: "Tue", hours: 6.5, quality: 68 },
  { day: "Wed", hours: 8.1, quality: 91 },
  { day: "Thu", hours: 7.0, quality: 75 },
  { day: "Fri", hours: 6.8, quality: 70 },
  { day: "Sat", hours: 8.5, quality: 95 },
  { day: "Sun", hours: 7.8, quality: 88 },
];

const hrvData = [
  { time: "6AM", value: 45 },
  { time: "9AM", value: 52 },
  { time: "12PM", value: 48 },
  { time: "3PM", value: 55 },
  { time: "6PM", value: 42 },
  { time: "9PM", value: 58 },
];

const weeklyMetrics = {
  avgSleep: 7.4,
  avgHRV: 52,
  totalSteps: 58420,
  avgCalories: 2340,
  hydration: 78,
  recoveryScore: 85,
};

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color: string;
}

function MetricCard({ icon, label, value, unit, trend, trendValue, color }: MetricCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-primary" : trend === "down" ? "text-destructive" : "text-muted-foreground";

  return (
    <Card className="card-surface p-4">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
            <TrendIcon className="w-3 h-3" />
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">
        {label}
      </p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-mono font-bold text-foreground">{value}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
    </Card>
  );
}

interface RingProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  label: string;
  unit: string;
}

function RingProgress({ value, max, size = 120, strokeWidth = 8, color, label, unit }: RingProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(value / max, 1);
  const offset = circumference - progress * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-xl font-bold text-foreground">{value}</span>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
      </div>
      <p className="mt-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}

export default function Lab() {
  const [selectedPeriod] = useState<"day" | "week" | "month">("week");

  return (
    <div className="min-h-screen p-4 pt-20 pb-8">
      {/* Header */}
      <header className="mb-6">
        <p className="font-mono text-xs text-muted-foreground tracking-wider">
          BIO-DATA
        </p>
        <h1 className="font-mono text-2xl font-bold text-foreground mt-1">
          THE LAB
        </h1>
      </header>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <MetricCard
          icon={<Moon className="w-4 h-4 text-primary-foreground" />}
          label="Avg Sleep"
          value={weeklyMetrics.avgSleep}
          unit="hrs"
          trend="up"
          trendValue="+0.3"
          color="bg-primary/20"
        />
        <MetricCard
          icon={<Heart className="w-4 h-4 text-destructive" />}
          label="HRV"
          value={weeklyMetrics.avgHRV}
          unit="ms"
          trend="up"
          trendValue="+5"
          color="bg-destructive/20"
        />
        <MetricCard
          icon={<Footprints className="w-4 h-4 text-accent-foreground" />}
          label="Steps"
          value={(weeklyMetrics.totalSteps / 1000).toFixed(1)}
          unit="k"
          trend="neutral"
          trendValue="0%"
          color="bg-accent/20"
        />
        <MetricCard
          icon={<Flame className="w-4 h-4 text-orange-400" />}
          label="Calories"
          value={weeklyMetrics.avgCalories}
          unit="kcal"
          trend="down"
          trendValue="-120"
          color="bg-orange-500/20"
        />
      </div>

      {/* Ring Progress Section */}
      <Card className="card-surface p-6 mb-6">
        <h2 className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-6">
          Recovery Vitals
        </h2>
        <div className="flex justify-around">
          <RingProgress
            value={weeklyMetrics.recoveryScore}
            max={100}
            color="hsl(var(--primary))"
            label="Recovery"
            unit="%"
          />
          <RingProgress
            value={weeklyMetrics.hydration}
            max={100}
            color="hsl(var(--accent))"
            label="Hydration"
            unit="%"
          />
          <RingProgress
            value={weeklyMetrics.avgHRV}
            max={100}
            color="hsl(var(--destructive))"
            label="HRV"
            unit="ms"
          />
        </div>
      </Card>

      {/* Sleep Chart */}
      <Card className="card-surface p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-primary" />
            <h2 className="font-mono text-sm text-foreground">Sleep Analysis</h2>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            This Week
          </span>
        </div>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sleepData}>
              <defs>
                <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              />
              <YAxis 
                domain={[0, 10]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#sleepGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* HRV Chart */}
      <Card className="card-surface p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-destructive" />
            <h2 className="font-mono text-sm text-foreground">HRV Trend</h2>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            Today
          </span>
        </div>
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hrvData}>
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              />
              <YAxis 
                domain={[30, 70]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--destructive))', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: 'hsl(var(--destructive))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Body Metrics */}
      <Card className="card-surface p-4">
        <h2 className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-4">
          Body Metrics
        </h2>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-accent" />
                <span className="text-sm text-foreground">Hydration</span>
              </div>
              <span className="font-mono text-sm text-foreground">{weeklyMetrics.hydration}%</span>
            </div>
            <Progress value={weeklyMetrics.hydration} className="h-2" />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">Recovery Score</span>
              </div>
              <span className="font-mono text-sm text-foreground">{weeklyMetrics.recoveryScore}%</span>
            </div>
            <Progress value={weeklyMetrics.recoveryScore} className="h-2" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-destructive" />
                <span className="text-sm text-foreground">Resting HR</span>
              </div>
              <span className="font-mono text-sm text-foreground">58 bpm</span>
            </div>
            <Progress value={58} max={100} className="h-2" />
          </div>
        </div>
      </Card>
    </div>
  );
}
