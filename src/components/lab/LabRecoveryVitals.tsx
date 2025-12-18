import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const weeklyMetrics = {
    recoveryScore: 85,
    hydration: 78,
    avgHRV: 52,
};

interface RingProgressProps {
    value: number;
    max: number;
    size?: number; // removed default, will use CSS/container logic or prop
    strokeWidth?: number;
    color: string;
    label: string;
    unit: string;
    compact?: boolean;
}

function RingProgress({ value, max, strokeWidth = 8, color, label, unit, compact }: RingProgressProps) {
    // We'll use a viewBox and percentage widths to make it scalable
    const viewBoxSize = 120;
    const radius = (viewBoxSize - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = Math.min(value / max, 1);
    const offset = circumference - progress * circumference;

    return (
        <div className={cn("flex flex-col items-center justify-center h-full w-full min-w-0", compact ? "gap-1" : "gap-2")}>
            <div className="relative w-full aspect-square max-w-[140px] max-h-[140px] flex items-center justify-center">
                <svg viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} className="w-full h-full rotate-[-90deg]">
                    <circle
                        cx={viewBoxSize / 2}
                        cy={viewBoxSize / 2}
                        r={radius}
                        fill="none"
                        stroke="hsl(var(--muted))"
                        strokeWidth={strokeWidth}
                    />
                    <circle
                        cx={viewBoxSize / 2}
                        cy={viewBoxSize / 2}
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-mono font-bold text-foreground leading-none" style={{ fontSize: 'clamp(1rem, 20cqw, 2rem)' }}>
                        {value}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{unit}</span>
                </div>
            </div>
            {!compact && (
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider text-center truncate w-full">
                    {label}
                </p>
            )}
        </div>
    );
}

export function LabRecoveryVitals({ compact }: { compact?: boolean }) {
    return (
        <div className="h-full flex flex-col">
            {!compact && (
                <h3 className="text-xs font-mono text-muted-foreground mb-4 uppercase tracking-wider shrink-0">
                    Recovery Vitals
                </h3>
            )}
            <div className="flex-1 grid grid-cols-3 gap-2 items-center justify-items-center h-full min-h-0">
                <RingProgress
                    value={weeklyMetrics.recoveryScore}
                    max={100}
                    color="hsl(var(--primary))"
                    label="Recovery"
                    unit="%"
                    compact={compact}
                />
                <RingProgress
                    value={weeklyMetrics.hydration}
                    max={100}
                    color="hsl(var(--accent))"
                    label="Hydration"
                    unit="%"
                    compact={compact}
                />
                <RingProgress
                    value={weeklyMetrics.avgHRV}
                    max={100}
                    color="hsl(var(--destructive))"
                    label="HRV"
                    unit="ms"
                    compact={compact}
                />
            </div>
        </div>
    );
}
