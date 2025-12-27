import { useState, useEffect, useMemo } from "react";
import {
    Check, Flame, Clock, Calendar, Sun, Moon, Activity, Settings, Layers, List,
    Zap, Star, Heart, Target, Anchor, Compass, Coffee, Briefcase, Book,
    Dumbbell, Utensils, Smile, Eye, Key, Shield, Flag, Award, Gift,
    Music, Video, Image, Mic, MessageCircle, Mail, Phone, MapPin,
    Navigation, Globe, Wifi, Bluetooth, Cpu, Database, Server,
    Code, Terminal, Command, Hash, DollarSign, CreditCard
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { habitService } from "@/services/habitService";
import { useLens } from "@/context/LensContext";
import { useWidget } from "@/context/WidgetContext";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import type { Habit } from "@/types/habits";

// --- ICONS REGISTRY ---
const ICON_MAP: Record<string, React.ElementType> = {
    // Default
    Layers, Sun, Flame, Moon, Activity, List,
    // Custom Options
    Zap, Star, Heart, Target, Anchor, Compass, Coffee, Briefcase, Book,
    Dumbbell, Utensils, Smile, Eye, Key, Shield, Flag, Award, Gift,
    Music, Video, Image, Mic, MessageCircle, Mail, Phone, MapPin,
    Navigation, Globe, Wifi, Bluetooth, Cpu, Database, Server,
    Code, Terminal, Command, Hash, DollarSign, CreditCard, Clock, Calendar
};

// --- SETTINGS TYPES ---
interface TabConfig {
    id: string;
    isVisible: boolean;
    customLabel?: string;
    customIcon?: string;
}

interface WidgetSettings {
    tabs: Record<string, TabConfig>; // id -> config
    lastActiveTab: string;
}

const DEFAULT_SETTINGS: WidgetSettings = {
    tabs: {
        'global': { id: 'global', isVisible: true },
        'morning': { id: 'morning', isVisible: true },
        'afternoon': { id: 'afternoon', isVisible: true },
        'evening': { id: 'evening', isVisible: true },
        'all_day': { id: 'all_day', isVisible: true }
    },
    lastActiveTab: 'global'
};

export function HabitListWidget() {
    const [showCompleted, setShowCompleted] = useState(false);
    const queryClient = useQueryClient();
    const location = useLocation();
    const { currentLens } = useLens();
    const { setHeaderActions } = useWidget();
    const today = new Date().toISOString().split('T')[0];

    // -- STATE --
    const [settings, setSettings] = useState<WidgetSettings>(() => {
        try {
            const saved = localStorage.getItem('life-os-habit-widget-settings');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Deep merge or ensure tabs exist to prevent crash
                return {
                    ...DEFAULT_SETTINGS,
                    ...parsed,
                    tabs: { ...DEFAULT_SETTINGS.tabs, ...(parsed.tabs || {}) }
                };
            }
            return DEFAULT_SETTINGS;
        } catch (e) {
            return DEFAULT_SETTINGS;
        }
    });

    // Save Settings Side Effect
    useEffect(() => {
        localStorage.setItem('life-os-habit-widget-settings', JSON.stringify(settings));
    }, [settings]);

    // Active Tab Logic with Persistence
    const [activeTab, setActiveTabInternal] = useState<string>(() => {
        // use last active if valid, else default to global
        return settings.lastActiveTab || 'global';
    });

    const setActiveTab = (id: string) => {
        setActiveTabInternal(id);
        setSettings(prev => ({ ...prev, lastActiveTab: id }));
    };

    // RESTRICTION: Only Visible in North Star AND Lab Mode
    if (location.pathname !== '/north-star' || currentLens === 'focus') {
        return null;
    }

    // --- DATA ---
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

    // --- METRICS ---
    const completedIds = new Set(logs?.map(l => l.habit_id));
    const totalHabits = habits?.length || 0;
    const completedCount = habits?.reduce((acc, h) => acc + (completedIds.has(h.id) ? 1 : 0), 0) || 0;
    const percentage = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;

    // --- PHASE DEFINITIONS ---
    // Only 'global' remains as a fixed base phase per user request.
    const basePhases = [
        { id: 'global', defaultLabel: 'OVERVIEW', defaultIcon: 'Layers' as const },
    ] as const;

    // Detect Active Protocols
    const protocolPhases = useMemo(() => {
        const uniqueProtocols = new Map();
        habits?.forEach(h => {
            if (h.protocol) {
                if (!uniqueProtocols.has(h.protocol.id)) {
                    uniqueProtocols.set(h.protocol.id, {
                        id: `protocol-${h.protocol.id}`,
                        defaultLabel: h.protocol.name, // Use full name by default
                        fullLabel: h.protocol.name,
                        time: 'PROTOCOL',
                        defaultIcon: 'List',
                        color: 'text-emerald-400',
                        border: 'border-emerald-500/50',
                        bg: 'bg-emerald-500/10',
                        isProtocol: true
                    });
                }
            }
        });
        return Array.from(uniqueProtocols.values());
    }, [habits]);

    // Merged & Configured Tabs
    const allTabs = useMemo(() => {
        return [...basePhases, ...protocolPhases].map(base => {
            const config: TabConfig = settings.tabs[base.id] || { id: base.id, isVisible: true };
            return {
                ...base,
                ...config,
                label: config.customLabel || base.defaultLabel,
                iconName: config.customIcon || base.defaultIcon,
                IconComponent: ICON_MAP[config.customIcon || base.defaultIcon] || ICON_MAP['Activity']
            };
        });
    }, [basePhases, protocolPhases, settings.tabs]);

    const activePhaseObj = allTabs.find(p => p.id === activeTab) || allTabs[0];
    const visibleTabs = allTabs.filter(p => p.isVisible);

    // --- FILTER & GROUP LOGIC ---
    // Get habits for the current view
    const currentHabits = useMemo(() => {
        if (!habits) return [];
        if (activeTab === 'global') return habits;
        if (activeTab.startsWith('protocol-')) {
            const protocolId = activeTab.replace('protocol-', '');
            return habits.filter(h => h.protocol?.id === protocolId);
        }
        return [];
    }, [habits, activeTab]);

    // --- SETTINGS ACTIONS ---
    const updateTabConfig = (id: string, updates: Partial<TabConfig>) => {
        setSettings(prev => {
            const current = prev.tabs[id] || { id, isVisible: true };
            return {
                ...prev,
                tabs: {
                    ...prev.tabs,
                    [id]: { ...current, ...updates }
                }
            };
        });
    };

    // --- VISUALIZATION HELPERS ---

    // Calculates Total Duration for a list of habits
    const calculateDuration = (habitsList: Habit[]) => {
        return habitsList.reduce((acc, h) => acc + (h.duration || 0), 0);
    };

    const formatDuration = (mins: number) => {
        if (mins < 60) return `${mins}m`;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return m > 0 ? `${h}h${m}m` : `${h}h`;
    };

    const renderGroupedView = (habitsToRender: Habit[]) => {
        const sections = [
            { id: 'morning', label: 'Morning', icon: Sun, color: 'text-amber-400', bg: 'bg-amber-400/10' },
            { id: 'afternoon', label: 'Afternoon', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
            { id: 'evening', label: 'Evening', icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
            { id: 'all_day', label: 'Anytime', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10' }
        ];

        // Filter out completed if showCompleted is false
        const filteredHabits = showCompleted ? habitsToRender : habitsToRender.filter(h => {
            // Check if habit is completed for today
            const isCompleted = completedIds.has(h.id);
            return !isCompleted;
        });

        // Grouping Logic
        const grouped = filteredHabits.reduce((acc, habit) => {
            const timeOfDay = habit.time_of_day || 'all_day';
            if (!acc[timeOfDay]) acc[timeOfDay] = [];
            acc[timeOfDay].push(habit);
            return acc;
        }, {} as Record<string, Habit[]>);

        return (
            <div className="space-y-6">
                {sections.map(section => {
                    const sectionHabits = grouped[section.id] || [];
                    if (sectionHabits.length === 0) return null;

                    const sectionDuration = calculateDuration(sectionHabits);

                    return (
                        <div key={section.id} className="relative">
                            <div className="flex items-center justify-between mb-3 pl-2 border-l-2 border-white/10">
                                <h3 className={cn("text-xs font-bold uppercase tracking-widest flex items-center gap-2", section.color)}>
                                    <section.icon className="w-3.5 h-3.5" />
                                    {section.label}
                                </h3>
                                <span className="text-[10px] font-mono font-bold text-zinc-500">
                                    {sectionDuration > 0 && formatDuration(sectionDuration)}
                                </span>
                            </div>
                            <div className="space-y-2">
                                {renderHabitList(sectionHabits)}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // Enhanced Progress Bar
    const renderProgressBar = () => (
        <div className="relative h-2.5 w-full bg-zinc-900/80 rounded-full overflow-hidden border border-white/5 mb-6 group/progress">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.05)_75%,transparent_75%,transparent)] bg-[size:10px_10px]" />

            <motion.div
                className={cn("h-full absolute left-0 top-0 rounded-r-full relative overflow-hidden", progressColor)}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ type: "spring", stiffness: 40, damping: 15 }}
            >
                {/* Shimmer */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                {/* Glow Line */}
                <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white/50 shadow-[0_0_10px_white]" />
            </motion.div>
        </div>
    );

    // --- MOTIVATIONAL STATUS ---
    let statusText = "INITIATING";
    let statusColor = "text-zinc-500";
    let progressColor = "bg-zinc-800";
    if (percentage >= 100) { statusText = "DOPAMINE OPTIMIZED"; statusColor = "text-emerald-400"; progressColor = "bg-gradient-to-r from-emerald-500 to-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)]"; }
    else if (percentage >= 80) { statusText = "FLOW STATE"; statusColor = "text-blue-400"; progressColor = "bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"; }
    else if (percentage > 0) { statusText = "ENGAGED"; statusColor = "text-amber-400"; progressColor = "bg-gradient-to-r from-amber-500 to-orange-500"; }

    // Helper for List Item with ENRICHED Metadata
    const renderHabitList = (habitsToRender: Habit[]) => {
        if (!habitsToRender || habitsToRender.length === 0) return null;

        return (
            <div className="space-y-1">
                <AnimatePresence initial={false}>
                    {habitsToRender.map((habit) => {
                        const isCompleted = completedIds.has(habit.id);
                        return (
                            <motion.div
                                key={habit.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                onClick={() => toggleMutation.mutate({ id: habit.id, completed: !isCompleted })}
                                className={cn(
                                    "group flex items-center justify-between px-4 py-3.5 bg-black/40 border border-white/5 rounded-xl cursor-pointer hover:border-white/15 hover:bg-white/[0.03] transition-all duration-300 relative overflow-hidden",
                                    isCompleted && "opacity-60 grayscale-[0.3]"
                                )}
                            >
                                {/* Left Active Indicator */}
                                {!isCompleted && (
                                    <div className={cn("absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300", activePhaseObj.bg?.replace('/10', '') || 'bg-white/50')} />
                                )}

                                <div className="flex items-center gap-4 flex-1">
                                    {/* Checkbox */}
                                    <div className={cn(
                                        "w-6 h-6 rounded-lg border flex items-center justify-center transition-all duration-300 shadow-inner",
                                        isCompleted ? "bg-emerald-500 border-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]" : "border-zinc-700/50 group-hover:border-zinc-500 bg-black/30"
                                    )}>
                                        {isCompleted && <Check className="w-4 h-4 stroke-[3.5]" />}
                                    </div>

                                    {/* Content */}
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">

                                            <span className={cn(
                                                "text-[15px] font-semibold truncate transition-colors",
                                                isCompleted ? "text-zinc-500 line-through decoration-zinc-700" : "text-zinc-200 group-hover:text-white"
                                            )}>
                                                {habit.name}
                                            </span>
                                        </div>

                                        {/* Metadata Row */}
                                        <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500">
                                            {/* Protocol / Time */}
                                            {(habit.protocol || activeTab === 'global') && (
                                                <span className={cn("uppercase tracking-wide flex items-center gap-1", isCompleted ? "text-zinc-600" : "text-zinc-400 group-hover:text-zinc-300")}>
                                                    {habit.protocol ? (
                                                        <>
                                                            <Layers className="w-3 h-3 opacity-70" />
                                                            {habit.protocol.name}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Clock className="w-3 h-3 opacity-70" />
                                                            {habit.time_of_day}
                                                        </>
                                                    )}
                                                </span>
                                            )}

                                            {/* Duration */}
                                            {habit.duration > 0 && (
                                                <span className="flex items-center gap-1 opacity-60">
                                                    <span className="w-0.5 h-0.5 rounded-full bg-zinc-500" />
                                                    {habit.duration}m
                                                </span>
                                            )}

                                            {/* Vector / System */}
                                            {habit.vector && (
                                                <span className="flex items-center gap-1 opacity-60 text-purple-400">
                                                    <span className="w-0.5 h-0.5 rounded-full bg-zinc-500" />
                                                    {habit.vector}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side Metrics / Friction */}
                                <div className="flex items-center gap-2 pl-2">
                                    {!isCompleted && habit.friction && (
                                        <div className="flex flex-col items-end gap-0.5">
                                            {/* Visual Friction Dots */}
                                            <div className="flex items-center gap-0.5" title={`Friction Level: ${habit.friction}/10`}>
                                                {Array.from({ length: 3 }).map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={cn(
                                                            "w-1 h-3 rounded-full",
                                                            // Logic: 1 dot for 1-3 (Low), 2 for 4-7 (Med), 3 for 8-10 (High)
                                                            i < (habit.friction <= 3 ? 1 : habit.friction <= 7 ? 2 : 3)
                                                                ? (habit.friction <= 3 ? "bg-emerald-500" : habit.friction <= 7 ? "bg-amber-500" : "bg-red-500")
                                                                : "bg-zinc-800"
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-[8px] font-mono text-zinc-600">F{habit.friction}</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        );

    };

    return (
        <div className="card-surface h-full flex flex-col border border-white/5 bg-black/40 backdrop-blur-xl overflow-hidden relative group/widget shadow-2xl">
            {/* Ambient Glow */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />

            {/* Header */}
            <div className="p-6 pb-2 border-b border-white/5 shrink-0 bg-gradient-to-b from-white/[0.02] to-transparent relative z-20">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex flex-col">
                        <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-zinc-500 mb-2 flex items-center gap-2">
                            {statusText}
                        </span>

                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-white tracking-tighter">Daily Protocols</span>
                            {/* Controls Row (Inline) */}
                            <div className="flex items-center gap-1 ml-2">
                                {/* Settings Trigger */}
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-white/10 text-zinc-600 hover:text-white transition-colors">
                                            <Settings className="w-4 h-4" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 bg-zinc-950/95 border-white/10 text-white backdrop-blur-xl p-4 shadow-2xl max-h-[80vh] overflow-y-auto" align="end">
                                        <div className="flex flex-col space-y-4">
                                            <div className="space-y-1 border-b border-white/10 pb-2">
                                                <h4 className="font-bold text-sm tracking-wide">VIEW & PROTOCOL SETTINGS</h4>
                                                <p className="text-[10px] text-zinc-500">Enable/disable protocols and customize tabs.</p>
                                            </div>
                                            <div className="space-y-2">
                                                {allTabs.map(tab => (
                                                    <div key={tab.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group/row border border-white/5">
                                                        {/* Visibility Toggle */}
                                                        <button
                                                            onClick={() => updateTabConfig(tab.id, { isVisible: !tab.isVisible })}
                                                            className={cn(
                                                                "w-5 h-5 rounded border flex items-center justify-center transition-colors mr-2 shrink-0",
                                                                tab.isVisible ? "bg-emerald-500 border-emerald-500" : "border-zinc-700 bg-transparent hover:border-zinc-500"
                                                            )}
                                                            title={tab.isVisible ? "Hide Tab" : "Show Tab"}
                                                        >
                                                            {tab.isVisible && <Check className="w-3.5 h-3.5 text-black stroke-[3.5]" />}
                                                        </button>

                                                        {/* Icon Picker Trigger */}
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <button className="p-1.5 rounded bg-black/40 hover:bg-white/20 transition-colors shrink-0 text-zinc-400">
                                                                    <tab.IconComponent className="w-4 h-4" />
                                                                </button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-[340px] p-4 bg-zinc-950 border-zinc-800 shadow-2xl" align="start" side="left">
                                                                <div className="mb-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Select Icon</div>
                                                                <div className="grid grid-cols-8 gap-1 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                                    {Object.entries(ICON_MAP).map(([name, Icon]) => (
                                                                        <button
                                                                            key={name}
                                                                            onClick={() => updateTabConfig(tab.id, { customIcon: name })}
                                                                            className="p-2 rounded hover:bg-white/20 flex items-center justify-center text-zinc-400 hover:text-white transition-all hover:scale-110"
                                                                            title={name}
                                                                        >
                                                                            <Icon className="w-4 h-4" />
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </PopoverContent>
                                                        </Popover>

                                                        {/* Label Input */}
                                                        <Input
                                                            value={settings.tabs[tab.id]?.customLabel ?? ''}
                                                            onChange={(e) => updateTabConfig(tab.id, { customLabel: e.target.value })}
                                                            className="h-8 text-xs bg-transparent border-none focus-visible:ring-0 px-2 min-w-0 flex-1 hover:bg-white/5 focus:bg-white/10 transition-colors placeholder:text-zinc-600 font-medium text-white"
                                                            placeholder={tab.defaultLabel}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>

                                {/* Show/Hide Toggle */}
                                <button
                                    onClick={() => setShowCompleted(!showCompleted)}
                                    className={cn(
                                        "h-6 w-6 rounded-md flex items-center justify-center transition-all duration-300",
                                        showCompleted
                                            ? "bg-white/10 text-white hover:bg-white/20"
                                            : "bg-transparent text-zinc-600 hover:text-white hover:bg-white/10"
                                    )}
                                    title={showCompleted ? "Hide Completed" : "Show All"}
                                >
                                    {showCompleted ? <Eye className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Right Side: Controls & Metric */}
                    {/* Right Side: Metric Only */}
                    <div>
                        <span className={cn("text-5xl font-mono font-black tracking-tighter leading-none drop-shadow-2xl mb-1", statusColor)}>
                            {percentage}%
                        </span>
                    </div>
                </div>
                {/* Enhanced Progress Bar */}
                {renderProgressBar()}
            </div>

            {/* Scrollable Tab Navigation & Controls */}
            <div className="relative flex items-center justify-between pl-1 pr-6 pb-2 gap-4">
                <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-700/50 hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600 [&::-webkit-scrollbar-track]:bg-transparent pb-2 mask-gradient-x flex items-center gap-2">
                    {visibleTabs.map(p => {
                        const isActive = activeTab === p.id;
                        // Calculate habits for this specific tab (not filtered by 'showCompleted' for stats, usually standard is total count)
                        // But usually users want to see progress on the full set.
                        const tabHabits = p.id === 'global' ? habits : habits?.filter(h => h.protocol?.id === p.id.replace('protocol-', ''));
                        const safeTabHabits = tabHabits || [];

                        // Dynamic Duration: Only count remaining (uncompleted) habits
                        const uncompletedHabits = safeTabHabits.filter(h => !completedIds.has(h.id));
                        const remainingDuration = calculateDuration(uncompletedHabits);

                        const completedCount = safeTabHabits.filter(h => completedIds.has(h.id)).length;
                        const totalCount = safeTabHabits.length;

                        // Check if this tab has a custom label but a "real" name (fullLabel) that differs
                        const hasRealLabel = p.fullLabel && p.label !== p.fullLabel;

                        return (
                            <button
                                key={p.id}
                                onClick={() => setActiveTab(p.id)}
                                className={cn(
                                    "flex-none px-4 py-2.5 rounded-lg transition-all duration-300 relative overflow-hidden group/tab flex flex-col items-start gap-1 border min-w-[100px]",
                                    isActive
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_4px_20px_rgba(16,185,129,0.15)]"
                                        : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                                )}
                            >
                                <div className="flex items-center gap-2 w-full justify-between">
                                    <div className="flex items-center gap-2">
                                        <p.IconComponent className={cn("h-3.5 w-3.5 shrink-0 transition-colors", isActive ? "text-emerald-400" : "opacity-50 group-hover/tab:opacity-100")} />
                                        <span className="text-[10px] font-mono tracking-widest font-bold uppercase whitespace-nowrap">{p.label}</span>
                                    </div>
                                    <span className="text-[9px] font-mono opacity-50">{completedCount}/{totalCount}</span>
                                </div>

                                {/* Tabs Metadata (Duration) */}
                                <div className="flex items-center gap-2 w-full">
                                    <div className={cn("h-0.5 rounded-full flex-1 bg-zinc-800 overflow-hidden", isActive ? "bg-emerald-900/30" : "")}>
                                        <div
                                            className={cn("h-full transition-all duration-500", isActive ? "bg-emerald-500" : "bg-zinc-600")}
                                            style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <span className="text-[9px] font-mono opacity-50 pl-0.5 whitespace-nowrap">
                                        {remainingDuration > 0 ? formatDuration(remainingDuration) : '0m'}
                                    </span>
                                </div>

                                {/* Active Bottom Line */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabLine"
                                        className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500"
                                    />
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>
            <div className="flex-1 relative flex flex-col p-4 overflow-hidden">
                <ScrollArea className="flex-1 -mx-2 px-2 [&_[data-radix-scroll-area-thumb]]:bg-transparent hover:[&_[data-radix-scroll-area-thumb]]:bg-zinc-700/50 [&_[data-radix-scroll-area-thumb]]:transition-colors">
                    <div className="flex flex-col pb-10">
                        {/* Unified Render Logic: Always Grouped */}
                        {renderGroupedView(currentHabits || [])}

                        {(!currentHabits?.length) && (
                            <div className="flex flex-col items-center justify-center py-20 opacity-30 space-y-4">
                                <div className="p-4 rounded-full bg-white/5 border border-white/5">
                                    <Activity className="h-8 w-8 text-zinc-500" />
                                </div>
                                <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">NO ACTIVE SIGNALS</span>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none -z-10 opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none -z-5" />
            </div>
        </div >
    );
}
