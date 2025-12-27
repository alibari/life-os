import { useState } from "react";
import { Check, Flame, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { habitService } from "@/services/habitService";
import { useLens } from "@/context/LensContext";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import type { Habit } from "@/types/habits";

export function HabitListWidget() {
    const queryClient = useQueryClient();
    const location = useLocation();
    const { currentLens } = useLens();
    const today = new Date().toISOString().split('T')[0];

    // RESTRICTION: Only Visible in North Star AND Lab Mode
    if (location.pathname !== '/north-star' || currentLens === 'focus') {
        return null;
    }

    const { data: habits } = useQuery({
        queryKey: ['active-habits-today'],
        queryFn: () => habitService.getActiveHabitsForToday()
    });

    const { data: logs } = useQuery({
        queryKey: ['habit-logs', today],
        queryFn: () => habitService.getDailyLogs(today)
    });

    const toggleMutation = useMutation({
        mutationFn: ({ id, completed }: { id: string, completed: boolean }) =>
            habitService.toggleHabitLog(id, today, completed),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['habit-logs', today] });
            queryClient.invalidateQueries({ queryKey: ['habit-metrics-widget'] });
        }
    });

    // Score = Adherence % (Simple count for now)
    const completedIds = new Set(logs?.map(l => l.habit_id));
    const totalHabits = habits?.length || 0;
    const completedCount = habits?.reduce((acc, h) => acc + (completedIds.has(h.id) ? 1 : 0), 0) || 0;
    const percentage = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;

    // Motivational Logic
    let statusText = "STANDBY";
    let statusColor = "text-muted-foreground";
    if (percentage >= 100) { statusText = "OPTIMAL"; statusColor = "text-emerald-500"; }
    else if (percentage >= 80) { statusText = "NOMINAL"; statusColor = "text-blue-400"; }
    else if (percentage > 0) { statusText = "ACTIVE"; statusColor = "text-amber-500"; }

    return (
        <div className="card-surface h-full flex flex-col border border-white/5 bg-black/40 backdrop-blur-md overflow-hidden">
            {/* Minimal Header */}
            <div className="p-4 border-b border-white/5 shrink-0">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                        <span className="font-mono text-xs tracking-[0.2em] uppercase text-white font-bold flex items-center gap-2">
                            Timeline Execution
                        </span>
                    </div>
                    <span className={cn("text-[10px] font-mono uppercase", statusColor)}>{statusText}</span>
                </div>

                {/* Micro Progress Bar */}
                <div className="h-0.5 w-full bg-white/10 overflow-hidden">
                    <motion.div
                        className={cn(
                            "h-full",
                            percentage >= 80 ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-blue-500 shadow-[0_0_10px_#3b82f6]"
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ type: "spring", stiffness: 50, damping: 15 }}
                    />
                </div>
            </div>

            {/* Checklist */}
            <ScrollArea className="flex-1">
                <div className="flex flex-col">
                    {habits?.map((habit: Habit) => {
                        const isCompleted = completedIds.has(habit.id);

                        return (
                            <div
                                key={habit.id}
                                onClick={() => toggleMutation.mutate({ id: habit.id, completed: !isCompleted })}
                                className={cn(
                                    "group flex items-center justify-between px-4 py-3 border-b border-white/5 cursor-pointer transition-all duration-200",
                                    isCompleted ? "bg-white/[0.02]" : "hover:bg-white/[0.02]",
                                    toggleMutation.isPending && "opacity-50 cursor-wait"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-5 h-5 rounded border flex items-center justify-center transition-colors duration-200 text-xs",
                                        isCompleted
                                            ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-500"
                                            : "border-white/20 group-hover:border-white/40 text-transparent"
                                    )}>
                                        {isCompleted && <Check className="h-3 w-3" />}
                                    </div>

                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-base">{habit.emoji || '⚡'}</span>
                                            <span className={cn(
                                                "text-xs font-mono transition-colors",
                                                isCompleted ? "text-white/40 line-through" : "text-white/90"
                                            )}>
                                                {habit.name}
                                            </span>
                                        </div>
                                        <div className="flex gap-2 text-[9px] text-zinc-500 items-center mt-1">
                                            {habit.time_of_day !== 'all_day' && (
                                                <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {habit.time_of_day}</span>
                                            )}
                                            {habit.protocol?.scheduling_config && habit.protocol.scheduling_config.type !== 'daily' && (
                                                <span className="flex items-center text-emerald-500/80">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    {habit.protocol.scheduling_config.type === 'monthly' ? `Monthly (Day ${habit.protocol.scheduling_config.days_of_month?.join(',')})` :
                                                        habit.protocol.scheduling_config.type === 'weekly' ? `${habit.protocol.scheduling_config.days?.join(', ')}` :
                                                            habit.protocol.scheduling_config.type}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 ml-6">
                                            {/* Derived Category */}
                                            <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{habit.category}</span>

                                            {/* Friction Cost */}
                                            <span className="text-[9px] text-zinc-600 border border-zinc-800 px-1 rounded flex items-center gap-1">
                                                F{habit.friction}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {habits?.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground text-[10px] font-mono">
                            NO ACTIVE PROTOCOL
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
