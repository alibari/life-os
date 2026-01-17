import { useState, useEffect } from "react";
import { SupplementStack, Supplement } from "@/types/supplements";
import {
    Plus, Edit2, Trash2,
    Play, Pause, Beaker, Pill, Activity, Zap, Settings, Calendar,
    Shield, ShieldAlert, ShieldCheck, RefreshCw, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { supplementService } from "@/services/supplementService";
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from "@/components/ui/tooltip";

interface StackCardProps {
    stack: SupplementStack;
    defaultOpen?: boolean;
    onEdit: (stack: SupplementStack) => void;
    onDelete: (id: string) => void;
    onAddSupplement: (stackId: string) => void;
    onEditSupplement: (sup: Supplement) => void;
    onDeleteSupplement: (id: string) => void;
    onToggleActive: (id: string, currentState: boolean) => void;
}

export function StackCard({
    stack, defaultOpen = false, onEdit, onDelete, onAddSupplement, onEditSupplement, onDeleteSupplement, onToggleActive
}: StackCardProps) {
    const [isExpanded, setIsExpanded] = useState(defaultOpen);

    useEffect(() => { setIsExpanded(defaultOpen); }, [defaultOpen]);

    // --- SCIENCE ENGINE ---
    const { data: interactions } = useQuery({
        queryKey: ['interactions', stack.id],
        queryFn: () => supplementService.checkInteractions(stack.id),
        enabled: stack.is_active && (stack.supplements?.length || 0) > 1
    });

    const hasWarnings = interactions && interactions.some(i => i.type === 'Dangerous' || i.type === 'Antagonistic');
    const warningLevel = interactions?.some(i => i.type === 'Dangerous') ? 'high' :
        interactions?.some(i => i.type === 'Antagonistic') ? 'medium' : 'low';

    // --- SCHEDULING LOGIC ---
    const config = stack.scheduling_config;
    const isCycle = config?.type === 'cycle';
    const activeDays = config?.days || [];
    const compoundCount = stack.supplements?.length || 0;

    let isTodayScheduled = false;
    let cycleStatusText = "";
    let cycleProgress = 0; // 0-1 for visuals

    if (isCycle && config.cycle_on && config.cycle_off && config.start_date) {
        const start = new Date(config.start_date).getTime();
        const now = new Date().getTime();
        // Difference in days (floored)
        const daysDiff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
        const cycleLen = config.cycle_on + config.cycle_off;
        // Current position in cycle (1-based for humans, 0-based for math)
        const position = (daysDiff % cycleLen) + 1;

        isTodayScheduled = position <= config.cycle_on;
        cycleStatusText = isTodayScheduled
            ? `Day ${position}/${config.cycle_on} (ON)`
            : `Rest Day ${position - config.cycle_on}/${config.cycle_off}`;

        cycleProgress = position / cycleLen;
    } else {
        // Standard Weekly
        const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();

        // If config exists but days is empty, OR config is missing (legacy), treat as Daily if stack is active.
        if (!config || !activeDays || activeDays.length === 0) {
            isTodayScheduled = true;
        } else {
            isTodayScheduled = activeDays.map(d => d.toLowerCase()).includes(today);
        }
    }

    const isSystemActive = stack.is_active;
    const isStandby = isSystemActive && !isTodayScheduled;
    const isFullyActive = isSystemActive && isTodayScheduled;

    const statusText = isCycle ? cycleStatusText : (isFullyActive ? "Bio-Active" : isStandby ? "Standby" : "Paused");

    return (
        <TooltipProvider>
            <div className={cn("rounded-xl border transition-all flex flex-col relative overflow-hidden group hover:border-white/20",
                isFullyActive ? "bg-emerald-500/10 border-emerald-500/30" :
                    isStandby ? "bg-amber-500/5 border-amber-500/20" :
                        "bg-white/[0.02] border-white/5"
            )}>
                {/* Background Glows */}
                {isFullyActive && <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] -mr-10 -mt-10 pointer-events-none" />}
                {isStandby && <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[50px] -mr-10 -mt-10 pointer-events-none" />}

                {/* MAIN CARD CONTENT */}
                <div className="p-5 flex flex-col relative z-10">

                    {/* HEADER */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className={cn("font-bold text-base tracking-tight flex items-center gap-2 font-mono uppercase",
                                    isFullyActive ? "text-emerald-400" : isStandby ? "text-amber-500" : "text-zinc-400"
                                )}>
                                    {stack.name}
                                    {isFullyActive && <Activity className="h-3 w-3 animate-pulse" />}
                                    {isStandby && <RefreshCw className="h-3 w-3 text-amber-500" />}
                                </h3>

                                {/* INTERACTION BADGE (Scientific Module) */}
                                {stack.is_active && hasWarnings && (
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <div className={cn("px-1.5 py-0.5 rounded flex items-center gap-1 border",
                                                warningLevel === 'high' ? "bg-red-500/10 border-red-500/30 text-red-500" :
                                                    "bg-amber-500/10 border-amber-500/30 text-amber-500"
                                            )}>
                                                <ShieldAlert className="h-3 w-3" />
                                                <span className="text-[9px] font-mono font-bold uppercase">{interactions?.length} Warn</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-zinc-950 border-zinc-800 text-xs max-w-[250px]">
                                            <div className="font-bold mb-1 text-zinc-300">Stack Interactions:</div>
                                            <ul className="space-y-1">
                                                {interactions?.map((i, idx) => (
                                                    <li key={idx} className="flex gap-2 text-zinc-400">
                                                        <span className={cn("text-[9px] uppercase px-1 rounded h-fit",
                                                            i.type === 'Dangerous' ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
                                                        )}>{i.type}</span>
                                                        <span>{i.target_name}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                                {stack.is_active && !hasWarnings && (interactions?.length || 0) > 0 && (
                                    <div className="px-1.5 py-0.5 rounded flex items-center gap-1 border bg-blue-500/10 border-blue-500/30 text-blue-400">
                                        <ShieldCheck className="h-3 w-3" />
                                        <span className="text-[9px] font-mono font-bold uppercase">Safe</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                {isSystemActive ? (
                                    <span className={cn("text-[9px] uppercase tracking-widest font-mono flex items-center gap-1",
                                        isFullyActive ? "text-emerald-500/70" : "text-amber-500/70"
                                    )}>
                                        <Zap className="h-3 w-3" /> System {isFullyActive ? (isCycle ? "On Cycle" : "Bio-Active") : (isCycle ? "Off Cycle" : "Standby")}
                                    </span>
                                ) : (
                                    <span className="text-[9px] uppercase tracking-widest text-zinc-600 font-mono">
                                        System Paused
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1 z-20">
                            <Button
                                size="icon"
                                variant="ghost"
                                className={cn("h-7 w-7",
                                    isFullyActive ? "text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10" :
                                        isStandby ? "text-amber-500 hover:text-amber-400 hover:bg-amber-500/10" :
                                            "text-zinc-600 hover:text-zinc-400 hover:bg-white/5"
                                )}
                                onClick={(e) => { e.stopPropagation(); onToggleActive(stack.id, stack.is_active); }}
                            >
                                {isSystemActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                            </Button>

                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-zinc-500 hover:text-white hover:bg-white/10"
                                onClick={(e) => { e.stopPropagation(); onEdit(stack); }}
                            >
                                <Settings className="h-3.5 w-3.5" />
                            </Button>

                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                                onClick={(e) => { e.stopPropagation(); onDelete(stack.id); }}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>

                    {/* STATS GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                        {/* Stats Block */}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="bg-black/20 rounded-lg p-3 border border-white/5 hover:bg-white/5 transition-all group/stat flex flex-col justify-between h-[80px]"
                        >
                            <div className="w-full flex justify-between items-start">
                                <div className="text-[9px] text-zinc-500 uppercase tracking-wider group-hover/stat:text-zinc-400">Inventory</div>
                                <Activity className="h-3 w-3 text-zinc-700 group-hover/stat:text-zinc-500" />
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className={cn("font-mono font-bold text-xl transition-colors",
                                    isFullyActive ? "text-white group-hover/stat:text-emerald-400" : "text-zinc-400 group-hover/stat:text-white"
                                )}>
                                    {compoundCount}
                                </span>
                                <span className="text-[9px] text-zinc-600 font-mono uppercase">compounds</span>
                            </div>
                        </button>

                        {/* Second Block - Active Count / Status */}
                        <div className="bg-black/20 rounded-lg p-3 border border-white/5 flex flex-col justify-between h-[80px]">
                            <div className="w-full flex justify-between items-start">
                                <div className="text-[9px] text-zinc-500 uppercase tracking-wider">Schedule</div>
                                {isCycle ? (
                                    <RefreshCw className={cn("h-3 w-3", isFullyActive ? "text-emerald-500" : "text-zinc-700")} />
                                ) : (
                                    <Zap className={cn("h-3 w-3", isFullyActive ? "text-emerald-500" : "text-zinc-700")} />
                                )}
                            </div>
                            <div className="flex flex-col justify-end h-full">
                                {isCycle ? (
                                    <div>
                                        <div className="text-[10px] text-white font-mono mb-1">{statusText}</div>
                                        <div className="flex gap-0.5">
                                            {Array.from({ length: (config?.cycle_on || 0) + (config?.cycle_off || 0) }).map((_, i) => {
                                                const isOn = i < (config?.cycle_on || 0);
                                                // TODO: Visually show current day indicator
                                                return (
                                                    <div key={i} className={cn("h-1 flex-1 rounded-full",
                                                        isOn ? "bg-emerald-500/50" : "bg-zinc-800"
                                                    )} />
                                                )
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-baseline gap-2">
                                        <span className={cn("font-mono font-bold text-xl",
                                            isFullyActive ? "text-emerald-400" : isStandby ? "text-amber-500" : "text-zinc-500"
                                        )}>
                                            {isFullyActive ? "ONLINE" : isStandby ? "STANDBY" : "OFFLINE"}
                                        </span>
                                        <span className="text-[9px] text-zinc-600 font-mono uppercase">
                                            {isTodayScheduled ? "TODAY" : "REST DAY"}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* EXPANDABLE INGREDIENT LIST */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-white/5 bg-black/20"
                        >
                            {(stack.supplements?.length || 0) === 0 ? (
                                <div className="py-8 flex flex-col items-center justify-center text-zinc-700 gap-2">
                                    <Beaker className="h-6 w-6 opacity-20" />
                                    <span className="text-[10px] font-mono uppercase tracking-widest opacity-60">Protocol Empty</span>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {stack.supplements?.map((sup) => (
                                        <div
                                            key={sup.id}
                                            onClick={() => onEditSupplement(sup)}
                                            className="group/item relative flex items-center justify-between py-3 px-5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4">
                                                {/* Icon */}
                                                <div className="h-8 w-8 rounded bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-600 group-hover/item:border-emerald-500/20 group-hover/item:text-emerald-400 transition-colors">
                                                    <Pill className="h-4 w-4" />
                                                </div>

                                                {/* Info */}
                                                <div>
                                                    <span className="text-xs font-bold text-zinc-300 group-hover/item:text-white transition-colors font-mono block">
                                                        {sup.name}
                                                    </span>
                                                    <div className="flex items-center gap-3 text-[10px] text-zinc-600 font-mono mt-0.5">
                                                        <span className="text-emerald-500/80">{sup.dosage_amount}{sup.dosage_unit}</span>
                                                        <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                                        <span>{sup.form}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                {/* Edit Button is redundant if row is clickable, but keeping as visual cue or removing? User said "same for compounds... add delete icon separately" */}
                                                {/* I will keep them but ensure click propagation is stopped */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-zinc-600 hover:text-white hover:bg-white/10"
                                                    onClick={(e) => { e.stopPropagation(); onEditSupplement(sup); }}
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-zinc-600 hover:text-red-400 hover:bg-red-500/10"
                                                    onClick={(e) => { e.stopPropagation(); onDeleteSupplement(sup.id); }}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* "Add Compound" Button in UI */}
                            <div className="p-3 border-t border-white/5">
                                <Button
                                    variant="ghost"
                                    onClick={() => onAddSupplement(stack.id)}
                                    className="w-full flex items-center justify-center gap-2 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/5 h-9 border border-dashed border-white/10 hover:border-emerald-500/30 transition-all text-xs font-mono uppercase tracking-wider"
                                >
                                    <Plus className="h-3 w-3" /> Add Compound
                                </Button>
                            </div>

                            <div className="py-2 bg-gradient-to-b from-black/20 to-transparent" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Toggle Arrow (Visual Hint) */}
                <div
                    className="h-4 flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors absolute bottom-0 w-full z-20"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className={cn("w-8 h-1 rounded-full bg-zinc-800 transition-all", isExpanded ? isFullyActive ? "bg-emerald-500/50" : "bg-zinc-700" : "")} />
                </div>
            </div>
        </TooltipProvider>
    );
}
