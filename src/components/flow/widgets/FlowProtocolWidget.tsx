import {
    Eye,
    Activity,
    Sparkles,
    Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFlow } from "@/context/FlowContext";

const PROTOCOL_STEPS = [
    { icon: Eye, label: "Visual Anchor", desc: "30s focus prime", color: "warning" },
    { icon: Activity, label: "Friction", desc: "0-15min load", color: "warning" },
    { icon: Sparkles, label: "Flow", desc: "15-75min peak", color: "focus" },
    { icon: Timer, label: "Decline", desc: "75-90min wrap", color: "destructive" },
];

export function FlowProtocolWidget() {
    const { phase, currentZone } = useFlow();

    return (
        <div className="card-surface p-3 h-full">
            <h3 className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-2">
                Protocol
            </h3>
            <div className="grid grid-cols-4 gap-1 h-[calc(100%-20px)]">
                {PROTOCOL_STEPS.map((step, idx) => {
                    const Icon = step.icon;
                    const isActive = phase === "focus" && (
                        (idx === 0 && currentZone === null) ||
                        (idx === 1 && currentZone === 0) ||
                        (idx === 2 && currentZone === 1) ||
                        (idx === 3 && currentZone === 2)
                    );
                    return (
                        <div
                            key={idx}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all text-center h-full",
                                isActive ? `bg-${step.color}/10 border border-${step.color}/30` : "opacity-40"
                            )}
                        >
                            <Icon className={cn("h-3.5 w-3.5", isActive ? `text-${step.color}` : "text-muted-foreground")} />
                            <p className="font-mono text-[8px] text-muted-foreground leading-tight">
                                {step.label}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
