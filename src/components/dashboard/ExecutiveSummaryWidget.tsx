import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export function ExecutiveSummaryWidget({ compact }: { compact?: boolean }) {
    if (compact) {
        return (
            <div className="flex items-center justify-between h-full bg-primary/10 p-4">
                <span className="font-mono text-sm tracking-widest text-primary uppercase">Readiness</span>
                <span className="font-bold text-2xl text-white">94%</span>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col gap-4 animate-in fade-in duration-500">
            <div className="card-surface p-8 flex items-center justify-between border-l-4 border-l-primary/50 h-full">
                <div className="flex flex-col gap-2">
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">System Readiness</span>
                    <span className="text-5xl font-bold tracking-tight text-white">94%</span>
                    <span className="text-[10px] font-mono text-primary uppercase tracking-widest mt-1">Ready to Perform</span>
                </div>
                <Activity className="h-16 w-16 text-primary/20" />
            </div>
        </div>
    );
}

export function SleepBankWidget({ compact }: { compact?: boolean }) {
    return (
        <div className="card-surface p-6 border-l-4 border-l-blue-500/50 h-full flex flex-col justify-center">
            <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Sleep Bank</span>
                <span className="text-2xl font-bold text-white">7h 42m</span>
            </div>
        </div>
    );
}

export function StrainCapacityWidget({ compact }: { compact?: boolean }) {
    return (
        <div className="card-surface p-6 border-l-4 border-l-amber-500/50 h-full flex flex-col justify-center">
            <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Strain Capacity</span>
                <span className="text-2xl font-bold text-white">High</span>
                <span className="text-[9px] text-muted-foreground">Based on HRV avg</span>
            </div>
        </div>
    );
}
