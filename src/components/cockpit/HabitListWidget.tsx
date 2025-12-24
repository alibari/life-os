import { useState } from "react";
import { Check, CheckSquare, Square, Zap, Flame, Trophy, TrendingUp, AlertTriangle, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { habitService } from "@/services/habitService";
import { useLens } from "@/context/LensContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

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
        queryKey: ['habits'],
        queryFn: () => habitService.getHabits()
    });

    const { data: logs } = useQuery({
        queryKey: ['habit-logs', today],
        queryFn: () => habitService.getDailyLogs(today)
    });

    // Use Advanced Metrics to get Streaks efficiently
    const { data: metrics } = useQuery({
        queryKey: ['habit-metrics-widget'],
        queryFn: () => habitService.getAdvancedMetrics(),
        staleTime: 1000 * 60 // 1 min cache
    });

    const toggleMutation = useMutation({
        mutationFn: ({ id, completed }: { id: string, completed: boolean }) =>
            habitService.toggleHabitLog(id, today, completed),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['habit-logs', today] });
            queryClient.invalidateQueries({ queryKey: ['habit-metrics-widget'] }); // Update streaks immediately
        }
    });

    // Calculate Score relative to max possible score
    const completedIds = new Set(logs?.map(l => l.habit_id));
    const currentScore = habits?.reduce((acc, h) => {
        if (completedIds.has(h.id)) {
            return acc + (h.type === 'positive' ? h.impact_score : -h.impact_score);
        }
        return acc;
    }, 0) || 0;

    const maxScore = habits?.reduce((acc, h) => acc + (h.type === 'positive' ? h.impact_score : 0), 0) || 1;
    const percentage = Math.round(Math.max(0, (currentScore / maxScore) * 100));

    // Motivational Logic (Adherence)
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
                        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", statusColor.replace("text-", "bg-"))} />
                        <span className="font-mono text-xs tracking-[0.2em] uppercase text-white font-bold">Daily Protocol</span>
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
                    {habits?.map(habit => {
                        const isCompleted = completedIds.has(habit.id);
                        const streak = metrics?.streaks?.[habit.id] || 0;

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
                                        "w-4 h-4 rounded border flex items-center justify-center transition-colors duration-200",
                                        isCompleted
                                            ? (habit.type === 'positive' ? "bg-emerald-500 border-emerald-500 text-black" : "bg-transparent border-red-500 text-red-500")
                                            : "border-white/20 group-hover:border-white/40"
                                    )}>
                                        {isCompleted && (habit.type === 'positive' ? <Check className="h-3 w-3 bold" /> : <X className="h-3 w-3" />)}
                                    </div>

                                    <div className="flex flex-col">
                                        <span className={cn(
                                            "text-xs font-mono transition-colors",
                                            isCompleted ? "text-white/40 line-through" : "text-white/90"
                                        )}>
                                            {habit.name}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {/* Category Tag */}
                                            <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{habit.category}</span>
                                            {/* Streak Indicator */}
                                            {streak > 0 && (
                                                <span className={cn(
                                                    "text-[9px] flex items-center gap-0.5",
                                                    streak > 5 ? "text-orange-400" : "text-white/30"
                                                )}>
                                                    <Flame className="h-2 w-2" /> {streak}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <span className={cn(
                                    "text-[9px] font-mono opacity-0 group-hover:opacity-100 transition-opacity",
                                    habit.type === 'positive' ? "text-emerald-500" : "text-red-500"
                                )}>
                                    {habit.type === 'positive' ? '+' : '-'}{habit.impact_score} PTS
                                </span>
                            </div>
                        );
                    })}

                    {habits?.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground text-[10px] font-mono">
                            NO PROTOCOL LOADED
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
