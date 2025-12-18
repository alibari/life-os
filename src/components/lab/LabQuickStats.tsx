import {
    Heart,
    Moon,
    Footprints,
    Flame,
    TrendingUp,
    TrendingDown,
    Minus
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Mock data - in a real app this would come from props or context
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
    compact?: boolean;
}

function MetricCard({ icon, label, value, unit, trend, trendValue, color, compact }: MetricCardProps) {
    const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
    const trendColor = trend === "up" ? "text-primary" : trend === "down" ? "text-destructive" : "text-muted-foreground";

    return (
        <div className={cn(
            "flex flex-col justify-between p-2 transition-colors border-b border-border/10 last:border-0",
            compact ? "gap-1" : "gap-2"
        )}>
            <div className="flex items-start justify-between">
                <div className={cn("rounded-md bg-opacity-20 flex items-center justify-center text-foreground", color, compact ? "p-1.5" : "p-2")}>
                    {icon}
                </div>
                {!compact && trend && (
                    <div className={cn("flex items-center gap-1 text-[10px] font-mono", trendColor)}>
                        <TrendIcon className="w-3 h-3" />
                        <span>{trendValue}</span>
                    </div>
                )}
            </div>

            <div>
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-0.5 truncate">
                    {label}
                </p>
                <div className="flex items-baseline gap-1">
                    <span className={cn("font-mono font-bold text-foreground leading-none", compact ? "text-lg" : "text-xl")}>
                        {value}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{unit}</span>
                </div>
            </div>
        </div>
    );
}

export function LabQuickStats({ compact }: { compact?: boolean }) {
    return (
        <div className="h-full overflow-hidden flex flex-col">
            {/* Header only if not huge or if compact */}
            {!compact && (
                <h3 className="text-xs font-mono text-muted-foreground mb-3 uppercase tracking-wider shrink-0">
                    Weekly Snapshot
                </h3>
            )}
            <div className="grid grid-cols-2 gap-2 h-full overflow-y-auto min-h-0 container-grid">
                <MetricCard
                    icon={<Moon className="w-3.5 h-3.5" />}
                    label="Avg Sleep"
                    value={weeklyMetrics.avgSleep}
                    unit="hrs"
                    trend="up"
                    trendValue="+0.3"
                    color="bg-primary/20 text-primary"
                    compact={compact}
                />
                <MetricCard
                    icon={<Heart className="w-3.5 h-3.5 text-destructive" />}
                    label="HRV"
                    value={weeklyMetrics.avgHRV}
                    unit="ms"
                    trend="up"
                    trendValue="+5"
                    color="bg-destructive/20 text-destructive"
                    compact={compact}
                />
                <MetricCard
                    icon={<Footprints className="w-3.5 h-3.5 text-accent-foreground" />}
                    label="Steps"
                    value={(weeklyMetrics.totalSteps / 1000).toFixed(1)}
                    unit="k"
                    trend="neutral"
                    trendValue="0%"
                    color="bg-accent/20 text-accent-foreground"
                    compact={compact}
                />
                <MetricCard
                    icon={<Flame className="w-3.5 h-3.5 text-orange-400" />}
                    label="Calories"
                    value={weeklyMetrics.avgCalories}
                    unit="kcal"
                    trend="down"
                    trendValue="-120"
                    color="bg-orange-500/20 text-orange-500"
                    compact={compact}
                />
            </div>
            <style>{`
                  @container (min-width: 300px) {
                      .container-grid {
                          grid-template-columns: repeat(2, 1fr);
                      }
                  }
                  @container (min-width: 500px) {
                      .container-grid {
                          grid-template-columns: repeat(4, 1fr);
                      }
                  }
              `}</style>
        </div>
    );
}

