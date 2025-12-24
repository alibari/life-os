import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { healthService } from "@/services/health";
import { useScientificModel } from "@/hooks/useScientificModel";

export function ExecutiveSummaryWidget({ compact }: { compact?: boolean }) {
    const { weights } = useScientificModel();

    // Fetch Inputs
    const { data: sleepAvg } = useQuery({
        queryKey: ['exec-sleep'],
        queryFn: () => healthService.getQuickAverage('sleep_duration', 3)
    });
    const { data: hrvAvg } = useQuery({
        queryKey: ['exec-hrv'],
        queryFn: () => healthService.getQuickAverage('heart_rate_variability', 3)
    });

    // Calculate Real Score
    const sleepScore = Math.min(100, ((sleepAvg || 0) / 480) * 100);
    const hrvScore = Math.min(100, ((hrvAvg || 0) / 100) * 100);
    const score = Math.round(
        (sleepScore * weights.readiness_sleep_weight) +
        (hrvScore * weights.readiness_hrv_weight) +
        (75 * weights.readiness_mood_weight) // Default mood for now
    );

    // Fallback if no data
    const hasData = sleepAvg !== null || hrvAvg !== null;
    const displayScore = hasData ? `${score}%` : "--";

    if (compact) {
        return (
            <div className="flex items-center justify-between h-full bg-primary/10 p-4">
                <span className="font-mono text-sm tracking-widest text-primary uppercase">Readiness</span>
                <span className="font-bold text-2xl text-white">{displayScore}</span>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col gap-4 animate-in fade-in duration-500">
            <div className="card-surface p-8 flex items-center justify-between border-l-4 border-l-primary/50 h-full">
                <div className="flex flex-col gap-2">
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">System Readiness</span>
                    <span className="text-5xl font-bold tracking-tight text-white">{displayScore}</span>
                    <span className="text-[10px] font-mono text-primary uppercase tracking-widest mt-1">
                        {hasData ? "Ready to Perform" : "Awaiting Data"}
                    </span>
                </div>
                <Activity className="h-16 w-16 text-primary/20" />
            </div>
        </div>
    );
}

export function SleepBankWidget({ compact }: { compact?: boolean }) {
    const { data: avg } = useQuery({
        queryKey: ['sleep-bank-avg'],
        queryFn: () => healthService.getQuickAverage('sleep_duration', 7)
    });

    const hours = avg ? Math.floor(avg / 60) : 0;
    const mins = avg ? Math.round(avg % 60) : 0;
    const displayTime = avg ? `${hours}h ${mins}m` : "--";

    return (
        <div className="card-surface p-6 border-l-4 border-l-blue-500/50 h-full flex flex-col justify-center">
            <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Sleep Avg (7d)</span>
                <span className="text-2xl font-bold text-white">{displayTime}</span>
            </div>
        </div>
    );
}

export function StrainCapacityWidget({ compact }: { compact?: boolean }) {
    const { data: hrv } = useQuery({
        queryKey: ['strain-capacity-hrv'],
        queryFn: () => healthService.getQuickAverage('heart_rate_variability', 7)
    });

    let capacity = "--";
    if (hrv !== null) {
        if (hrv > 70) capacity = "High";
        else if (hrv > 40) capacity = "Moderate";
        else capacity = "Low";
    }

    return (
        <div className="card-surface p-6 border-l-4 border-l-amber-500/50 h-full flex flex-col justify-center">
            <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Strain Capacity</span>
                <span className="text-2xl font-bold text-white">{capacity}</span>
                <span className="text-[9px] text-muted-foreground">Based on HRV avg</span>
            </div>
        </div>
    );
}
