import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFlow } from "@/context/FlowContext";

export function FlowHistoryWidget() {
    const { sessions } = useFlow();

    const todaySessions = sessions.filter(
        (s) => new Date(s.startTime).toDateString() === new Date().toDateString()
    );

    return (
        <div className="card-surface p-3 h-full overflow-hidden flex flex-col">
            <h3 className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5 flex-shrink-0">
                <Clock className="h-3 w-3" />
                Recent
            </h3>
            {todaySessions.length === 0 ? (
                <p className="font-mono text-[10px] text-muted-foreground/50">No sessions today</p>
            ) : (
                <div className="space-y-1.5 overflow-y-auto flex-1">
                    {todaySessions.slice(-4).reverse().map((session) => (
                        <div
                            key={session.id}
                            className="flex items-center justify-between p-2 bg-background/50 rounded-lg border border-border"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-growth" />
                                <span className="font-mono text-[10px] text-muted-foreground">
                                    {new Date(session.startTime).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[10px] text-foreground">{session.focusMinutes}m</span>
                                {session.rpe && (
                                    <span className={cn(
                                        "font-mono text-[9px] px-1 py-0.5 rounded",
                                        session.rpe <= 4 && "bg-primary/20 text-primary",
                                        session.rpe > 4 && session.rpe <= 7 && "bg-warning/20 text-warning",
                                        session.rpe > 7 && "bg-destructive/20 text-destructive"
                                    )}>
                                        {session.rpe}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
