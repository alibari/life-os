import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, CheckCircle2, XCircle, Settings, RefreshCw, Zap, Brain, Activity, Clock, Flame, Battery, Share2, AlertTriangle, ShieldAlert, BookOpen, Calendar, ChevronDown, Check, ToggleLeft, ToggleRight, MoreVertical, Play, Pause } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { habitService } from "@/services/habitService";
import type { Habit } from "@/types/habits";
import { HABIT_Biblio, PROTOCOL_BUNDLES } from "@/services/habitLibrary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["Mind", "Body", "Spirit", "Business", "Focus", "Environment", "Sleep", "Discipline"];

export function HabitManager() {
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isProtocolOpen, setIsProtocolOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);
    const [isResetOpen, setIsResetOpen] = useState(false);

    // Form State for Reactivity
    const [formData, setFormData] = useState<Partial<Habit>>({
        energy_cost: 5,
        impact_score: 5,
        duration_minutes: 15,
        reward_pathway: 'dopamine_drive',
        is_active: true,
        frequency_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        start_date: new Date().toISOString().split('T')[0]
    });

    // Reset form
    useEffect(() => {
        if (editingHabit) {
            setFormData({
                name: editingHabit.name,
                category: editingHabit.category,
                time_of_day: editingHabit.time_of_day,
                energy_cost: editingHabit.energy_cost,
                impact_score: editingHabit.impact_score,
                duration_minutes: editingHabit.duration_minutes,
                reward_pathway: editingHabit.reward_pathway,
                is_active: editingHabit.is_active,
                start_date: editingHabit.start_date ? editingHabit.start_date.split('T')[0] : new Date().toISOString().split('T')[0],
                end_date: editingHabit.end_date ? editingHabit.end_date.split('T')[0] : undefined,
                frequency_days: editingHabit.frequency_days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            });
        } else {
            setFormData({
                energy_cost: 5,
                impact_score: 5,
                duration_minutes: 15,
                reward_pathway: 'dopamine_drive',
                is_active: true,
                frequency_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                start_date: new Date().toISOString().split('T')[0]
            });
        }
    }, [editingHabit, isCreateOpen]);

    // Initial Load - Ensure fresh data
    const { data: habits, isLoading, error: queryError } = useQuery({
        queryKey: ['habits'],
        queryFn: habitService.getHabits,
        staleTime: 0, // Always fetch fresh
    });

    const { data: metrics } = useQuery({
        queryKey: ['habit-metrics'],
        queryFn: () => habitService.getAdvancedMetrics(),
        refetchInterval: 5000
    });

    const createMutation = useMutation({
        mutationFn: habitService.createHabit,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['habits'] });
            setIsCreateOpen(false);
            toast.success("Protocol Updated");
        },
        onError: () => toast.error("Failed to update protocol")
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string, updates: Partial<Habit> }) =>
            habitService.updateHabit(id, updates),
        onSuccess: async (_, variables) => {
            // Force hard reset of cache to ensure UI syncs with DB
            await queryClient.removeQueries({ queryKey: ['habits'] });
            await queryClient.invalidateQueries({ queryKey: ['habits'] });

            setEditingHabit(null);
            setIsCreateOpen(false);

            if (variables.updates.is_active !== undefined) {
                toast.success(variables.updates.is_active ? "Protocol Resumed 🚀" : "Protocol Paused ⏸️");
            } else {
                toast.success("Protocol Updated");
            }
        },
        onError: (error) => {
            console.error("Update Failed:", error);
            toast.error("Failed to update protocol");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: habitService.deleteHabit,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['habits'] });
            toast.success("Habit Removed");
        }
    });

    // Import Protocol Mutation
    const importProtocolMutation = useMutation({
        mutationFn: async (protocolId: string) => {
            const bundle = PROTOCOL_BUNDLES.find(p => p.id === protocolId);
            if (!bundle) throw new Error("Protocol not found");

            // Map bundle strings to actual objects from library
            const habitsToImport = bundle.habits.map(name => {
                const h = HABIT_Biblio.find(bib => bib.name === name);
                if (!h) console.warn(`Habit not found in library: ${name}`);
                return h ? h : null;
            }).filter(h => h !== null);

            if (habitsToImport.length === 0) {
                throw new Error("No valid habits found in this bundle.");
            }

            return await habitService.importProtocol(habitsToImport as Partial<Habit>[]);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['habits'] });
            setIsProtocolOpen(false);
            toast.success(data || "Protocol Bundle Injected Successfully");
        },
        onError: (error: any) => {
            console.error("Import Failed Detailed:", error);
            const msg = error?.message || "Failed to import protocol";
            const hint = error?.hint || "";
            const details = error?.details || "";
            toast.error(`Import Error: ${msg} ${hint} ${details}`, { duration: 5000 });
        }
    });

    // PURGE Mutation (Delete All)
    const purgeMutation = useMutation({
        mutationFn: async () => {
            // @ts-ignore
            const { data: { user } } = await import("@/integrations/supabase/client").then(m => m.supabase.auth.getUser());
            if (!user) throw new Error("No user");
            return habitService.purgeAllHabits(user.id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['habits'] });
            toast.success("System Purged. Protocol Zeroed.");
        },
        onError: (error) => {
            toast.error("Purge Failed: " + error.message);
        }
    });

    const handleToggleActive = (e: React.MouseEvent, habit: Habit) => {
        e.stopPropagation();
        updateMutation.mutate({ id: habit.id, updates: { is_active: !habit.is_active } });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);

        const data = {
            name: form.get('name') as string,
            category: form.get('category') as string,
            type: form.get('type') as 'positive' | 'negative',
            time_of_day: form.get('time_of_day') as any,
            // Use state values or fallbacks
            energy_cost: formData.energy_cost || 5,
            impact_score: formData.impact_score || 5,
            duration_minutes: formData.duration_minutes || 15,
            reward_pathway: formData.reward_pathway as any,
            is_active: formData.is_active,
            frequency_days: formData.frequency_days,
            start_date: formData.start_date ? new Date(formData.start_date).toISOString() : new Date().toISOString(),
            end_date: formData.end_date ? new Date(formData.end_date).toISOString() : undefined,
        };

        if (editingHabit) {
            updateMutation.mutate({ id: editingHabit.id, updates: data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (habit: Habit) => {
        setEditingHabit(habit);
        setIsCreateOpen(true);
    };

    // Grouping Logic
    const groupedHabits = {
        morning: habits?.filter(h => h.time_of_day === 'morning') || [],
        afternoon: habits?.filter(h => h.time_of_day === 'afternoon') || [],
        evening: habits?.filter(h => h.time_of_day === 'evening') || [],
        all_day: habits?.filter(h => h.time_of_day === 'all_day') || [],
    };

    const getPathwayColor = (pathway: string) => {
        if (pathway?.includes('dopamine')) return 'text-amber-400 border-amber-400/20 bg-amber-400/5';
        if (pathway?.includes('serotonin')) return 'text-sky-400 border-sky-400/20 bg-sky-400/5';
        if (pathway?.includes('endorphin')) return 'text-red-400 border-red-400/20 bg-red-400/5';
        if (pathway?.includes('oxytocin')) return 'text-pink-400 border-pink-400/20 bg-pink-400/5';
        if (pathway?.includes('cortisol')) return 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5';
        return 'text-zinc-400 border-zinc-400/20 bg-zinc-400/5';
    };

    const getPathwayLabel = (pathway: string) => {
        if (!pathway) return 'Unknown';
        if (pathway === 'dopamine_drive') return 'Dopamine (Drive)';
        if (pathway === 'serotonin_satisfaction') return 'Serotonin (Zen)';
        if (pathway === 'endorphin_relief') return 'Endorphin (Power)';
        if (pathway === 'oxytocin_connection') return 'Oxytocin (Bond)';
        if (pathway === 'cortisol_reduction') return 'Cortisol (Reset)';
        return pathway;
    };


    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* 1. SCIENTIFIC METRICS UI (Recap from previous task, unchanged visual) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* System Load */}
                <div className="card-surface p-5 border-white/5 bg-black/40 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-20"><Battery className="h-6 w-6 text-white" /></div>
                    <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1">Daily System Load</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-white font-mono">{metrics?.systemLoad || 0}</span>
                        <span className="text-[10px] text-zinc-400 mb-1">bio-units</span>
                    </div>
                    <div className="mt-3 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                            className={cn("h-full rounded-full transition-all duration-1000", (metrics?.systemLoad || 0) > 40 ? "bg-red-500" : "bg-emerald-500")}
                            style={{ width: `${Math.min(100, (metrics?.systemLoad || 0))}%` }}
                        />
                    </div>
                </div>

                {/* Neuroplasticity */}
                <div className="card-surface p-5 border-white/5 bg-black/40 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-20"><Brain className="h-6 w-6 text-white" /></div>
                    <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1">Neuroplasticity Index</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-emerald-400 font-mono">{metrics?.neuroplasticity || 0}</span>
                        <span className="text-[10px] text-zinc-400 mb-1">/100</span>
                    </div>
                    <div className="mt-3 flex gap-1">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className={cn("h-1.5 w-full rounded-sm", i < ((metrics?.neuroplasticity || 0) / 10) ? "bg-emerald-500" : "bg-white/5")} />
                        ))}
                    </div>
                </div>

                {/* Pathway Profile */}
                <div className="card-surface p-4 border-white/5 bg-black/40 backdrop-blur-xl flex flex-col justify-center gap-2">
                    <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1">Rewards Profile</h3>
                    <div className="space-y-1.5">
                        {Object.entries(metrics?.pathwayProfile || {}).slice(0, 3).map(([key, val]) => (
                            <div key={key} className="flex items-center gap-2 text-[9px]">
                                <span className={cn("w-2 h-2 rounded-full", getPathwayColor(key).split(' ')[2].replace('/5', ''))} />
                                <span className="flex-1 uppercase text-zinc-400 truncate">{getPathwayLabel(key)}</span>
                                <span className="font-mono text-white">{val as any}%</span>
                            </div>
                        ))}
                        {Object.keys(metrics?.pathwayProfile || {}).length === 0 && <span className="text-[10px] text-zinc-600 italic">No data yet</span>}
                    </div>
                </div>
            </div>

            {/* 2. ACTIONS & HEADER (UPDATED) */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-lg font-mono font-medium text-white tracking-tight flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Protocol Architect
                    </h2>
                    <p className="text-xs text-zinc-500">Design your neuro-chemical day.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-9 gap-2 bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white"
                        onClick={() => setIsProtocolOpen(true)}
                    >
                        <BookOpen className="h-4 w-4 text-sky-500" />
                        <span className="hidden sm:inline">Browse Protocols</span>
                    </Button>

                    <Button
                        size="sm"
                        className="h-9 gap-2 bg-primary text-black hover:bg-primary/90 font-medium"
                        onClick={() => { setEditingHabit(null); setIsCreateOpen(true); }}
                    >
                        <Plus className="h-4 w-4" />
                        New Habit
                    </Button>

                    {/* CREATE CUSTOM DIALOG */}
                    <Dialog open={isCreateOpen} onOpenChange={(open) => {
                        setIsCreateOpen(open);
                        if (!open) setEditingHabit(null);
                    }}>
                        <DialogContent className="sm:max-w-[500px] border-white/10 bg-black/90 backdrop-blur-xl">
                            <DialogHeader>
                                <DialogTitle className="font-mono uppercase tracking-widest text-sm text-primary flex justify-between items-center">
                                    <span>{editingHabit ? 'Calibrate Habit' : 'Inject Custom Protocol'}</span>
                                </DialogTitle>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-3">
                                    {/* Active & Scheduling */}
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                                        <div className="flex items-center gap-2">
                                            <Label className="text-xs uppercase text-emerald-400 font-mono">Active Protocol</Label>
                                        </div>
                                        <Switch
                                            name="is_active"
                                            checked={formData.is_active}
                                            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase text-zinc-500">Protocol Name</Label>
                                        <Input
                                            name="name"
                                            value={formData.name || ''}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="bg-white/5 border-white/10 font-mono text-sm"
                                            placeholder="e.g. Deep Work"
                                            required
                                        />
                                    </div>

                                    {/* Date Scheduling */}
                                    {/* Date & Frequency Scheduling */}
                                    {formData.is_active && (
                                        <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/5">
                                            <Label className="text-[10px] uppercase text-zinc-500 font-mono flex items-center gap-2">
                                                <Calendar className="h-3 w-3" /> Frequency Schedule
                                            </Label>

                                            {/* Days Selector */}
                                            <div className="flex justify-between gap-1">
                                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                                                    const isSelected = formData.frequency_days?.includes(day);
                                                    return (
                                                        <div
                                                            key={day}
                                                            onClick={() => {
                                                                const current = formData.frequency_days || [];
                                                                const newDays = isSelected
                                                                    ? current.filter(d => d !== day)
                                                                    : [...current, day];
                                                                setFormData({ ...formData, frequency_days: newDays });
                                                            }}
                                                            className={cn(
                                                                "flex-1 h-9 rounded-md flex items-center justify-center text-[10px] font-mono cursor-pointer transition-all uppercase",
                                                                isSelected
                                                                    ? "bg-primary text-black font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                                                    : "bg-black/20 text-zinc-500 hover:bg-white/10"
                                                            )}
                                                        >
                                                            {day.charAt(0)}
                                                        </div>
                                                    )
                                                })}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pt-2">
                                                <div className="space-y-1">
                                                    <Label className="text-[9px] uppercase text-zinc-600">Start Date</Label>
                                                    <Input
                                                        type="date"
                                                        value={formData.start_date || ''}
                                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                                        className="bg-black/20 border-white/5 text-xs text-zinc-400 h-8"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[9px] uppercase text-zinc-600">End (Optional)</Label>
                                                    <Input
                                                        type="date"
                                                        value={formData.end_date || ''}
                                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                                        className="bg-black/20 border-white/5 text-xs text-zinc-400 h-8"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase text-zinc-500">Category</Label>
                                        <Select
                                            name="category"
                                            value={formData.category || "Focus"}
                                            onValueChange={(val) => setFormData({ ...formData, category: val })}
                                        >
                                            <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase text-zinc-500">Time of Day</Label>
                                        <Select
                                            name="time_of_day"
                                            value={formData.time_of_day || "all_day"}
                                            onValueChange={(val: any) => setFormData({ ...formData, time_of_day: val })}
                                        >
                                            <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="morning">🌅 Morning</SelectItem>
                                                <SelectItem value="afternoon">☀️ Afternoon</SelectItem>
                                                <SelectItem value="evening">🌙 Evening</SelectItem>
                                                <SelectItem value="all_day">🔄 Anytime</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Scientific Data */}
                                <div className="p-4 rounded-lg bg-white/5 border border-white/5 space-y-4">
                                    <div className="flex items-center gap-2 text-xs font-mono text-primary uppercase">
                                        <Brain className="h-3 w-3" /> Bio-Feedback Calibration
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between text-[10px] text-zinc-400 mb-2">
                                                <span>Activation Energy (Friction)</span>
                                                {/* Dynamic Value Display */}
                                                <span className={cn("font-mono px-2 py-0.5 rounded text-black font-bold", (formData.energy_cost || 5) > 7 ? 'bg-red-400' : (formData.energy_cost || 5) > 3 ? 'bg-amber-400' : 'bg-emerald-400')}>
                                                    Level {formData.energy_cost || 5}
                                                </span>
                                            </div>
                                            <Input
                                                name="energy_cost"
                                                type="range"
                                                min="1"
                                                max="10"
                                                value={formData.energy_cost || 5}
                                                onChange={(e) => setFormData({ ...formData, energy_cost: parseInt(e.target.value) })}
                                                className="h-2 bg-black/50 accent-primary cursor-pointer"
                                            />
                                            <div className="flex justify-between text-[8px] text-zinc-600 mt-1 uppercase font-mono">
                                                <span>Low Friction</span>
                                                <span>High Friction</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-[10px] text-zinc-400 mb-2">
                                                <span>Synaptic Impact (Growth)</span>
                                                <span className="text-white font-mono bg-white/10 px-2 py-0.5 rounded">Level {formData.impact_score || 5}</span>
                                            </div>
                                            <Input
                                                name="impact_score"
                                                type="range"
                                                min="1"
                                                max="10"
                                                value={formData.impact_score || 5}
                                                onChange={(e) => setFormData({ ...formData, impact_score: parseInt(e.target.value) })}
                                                className="h-2 bg-black/50 accent-emerald-500 cursor-pointer"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase text-zinc-500">Target Chemical</Label>
                                            <Select
                                                name="reward_pathway"
                                                value={formData.reward_pathway || "dopamine_drive"}
                                                onValueChange={(val: any) => setFormData({ ...formData, reward_pathway: val })}
                                            >
                                                <SelectTrigger className="bg-black/20 border-white/10 text-xs"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="dopamine_drive">⚡ Dopamine</SelectItem>
                                                    <SelectItem value="serotonin_satisfaction">🧘‍♂️ Serotonin</SelectItem>
                                                    <SelectItem value="endorphin_relief">🔥 Endorphin</SelectItem>
                                                    <SelectItem value="oxytocin_connection">❤️ Oxytocin</SelectItem>
                                                    <SelectItem value="cortisol_reduction">🛡️ Cortisol</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase text-zinc-500">Duration (Min)</Label>
                                            <Input
                                                name="duration_minutes"
                                                type="number"
                                                value={formData.duration_minutes || 15}
                                                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                                                className="bg-black/20 border-white/10 text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <input type="hidden" name="type" value="positive" />

                                <Button type="submit" className="w-full bg-primary text-black font-mono uppercase tracking-widest hover:bg-primary/90">
                                    {editingHabit ? 'Save Protocol Changes' : 'Initialize Protocol'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* BUNDLE VIEWER DIALOG (Rich UI) */}
                    <Dialog open={isProtocolOpen} onOpenChange={setIsProtocolOpen}>
                        <DialogContent className="sm:max-w-4xl border-white/10 bg-black/95 backdrop-blur-xl h-[80vh] flex flex-col p-0 overflow-hidden shadow-2xl shadow-sky-900/20">
                            <div className="flex h-full">
                                {/* Sidebar */}
                                <div className="w-64 border-r border-white/5 bg-white/5 p-6 flex flex-col gap-6 hidden md:flex">
                                    <div>
                                        <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                                            <BookOpen className="h-4 w-4" /> Collections
                                        </h3>
                                        <div className="space-y-1">
                                            {['All', 'Focus', 'Body', 'Sleep', 'Mind', 'Discipline', 'Longevity'].map(cat => (
                                                <Button
                                                    key={cat}
                                                    variant="ghost"
                                                    size="sm"
                                                    className={cn("w-full justify-start text-xs font-mono", selectedProtocol === cat ? "bg-sky-500/10 text-sky-400" : "text-zinc-400 hover:text-white")}
                                                    onClick={() => setSelectedProtocol(cat === 'All' ? null : cat)} // Using selectedProtocol as filter hack for now
                                                >
                                                    {cat}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-auto p-4 rounded-xl bg-sky-500/5 border border-sky-500/10">
                                        <div className="flex items-center gap-2 text-sky-400 mb-2">
                                            <Zap className="h-4 w-4" />
                                            <span className="text-xs font-bold">Pro Tip</span>
                                        </div>
                                        <p className="text-[10px] text-zinc-400 leading-relaxed">
                                            Bundles inject scientifically optimized habit stacks. You can customize them after import.
                                        </p>
                                    </div>
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 flex flex-col bg-black/40">
                                    <DialogHeader className="p-6 border-b border-white/5 bg-black/20">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <DialogTitle className="font-mono uppercase tracking-widest text-lg text-white flex items-center gap-2">
                                                    Protocol Library
                                                </DialogTitle>
                                                <p className="text-sm text-zinc-500 mt-1">Select a neuro-optimized behavioral stack.</p>
                                            </div>
                                            <Badge variant="outline" className="border-sky-500/30 text-sky-400 bg-sky-500/10 font-mono">
                                                v2.4.0
                                            </Badge>
                                        </div>
                                    </DialogHeader>

                                    <ScrollArea className="flex-1 p-6">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            {PROTOCOL_BUNDLES.filter(b => !selectedProtocol || selectedProtocol === 'All' || b.description.includes(selectedProtocol) || b.name.includes(selectedProtocol)).map(bundle => (
                                                <div key={bundle.id} className="group relative p-5 rounded-xl border border-white/10 bg-white/5 hover:border-sky-500/30 hover:bg-white/10 transition-all cursor-pointer flex flex-col h-full">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-lg bg-sky-500/10 flex items-center justify-center border border-sky-500/20 group-hover:bg-sky-500/20 transition-colors">
                                                                <Activity className="h-5 w-5 text-sky-400" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-white group-hover:text-sky-400 transition-colors text-sm">{bundle.name}</h3>
                                                                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{bundle.habits.length} Habits</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-zinc-400 mb-6 line-clamp-2 h-8">{bundle.description}</p>

                                                    <div className="space-y-1.5 mt-auto bg-black/20 p-3 rounded-lg border border-white/5">
                                                        {bundle.habits.slice(0, 3).map((h, i) => (
                                                            <div key={i} className="flex items-center gap-2 text-[10px] text-zinc-500">
                                                                <CheckCircle2 className="h-3 w-3 text-emerald-500/50" />
                                                                <span className="truncate">{h}</span>
                                                            </div>
                                                        ))}
                                                        {bundle.habits.length > 3 && <div className="text-[10px] text-zinc-600 pl-5">+{bundle.habits.length - 3} more...</div>}
                                                    </div>

                                                    <Button
                                                        className="w-full mt-4 bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 text-xs font-mono group-hover:bg-sky-500 group-hover:text-white group-hover:border-sky-500 transition-all"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            importProtocolMutation.mutate(bundle.id);
                                                        }}
                                                    >
                                                        Inject Protocol
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* 3. HABIT LIST - Timeline View (Updated with Active Logic) */}
            <div className="space-y-8 pb-20">
                {isLoading ? (
                    <div className="flex justify-center p-12"><RefreshCw className="animate-spin text-zinc-600" /></div>
                ) : habits?.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-white/5 rounded-xl bg-white/5">
                        <Activity className="h-10 w-10 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-zinc-500 font-mono text-sm">No Active Protocols</h3>
                        <p className="text-zinc-600 text-xs mt-2">Seed the library or create a custom protocol.</p>
                    </div>
                ) : (
                    ['morning', 'afternoon', 'evening', 'all_day'].map((timeSlot) => {
                        // @ts-ignore
                        const slotHabits = groupedHabits[timeSlot];
                        if (slotHabits.length === 0) return null;

                        const slotTitle = timeSlot === 'all_day' ? 'Anytime Protocols' : `${timeSlot.charAt(0).toUpperCase() + timeSlot.slice(1)} Block`;
                        const slotIcon = timeSlot === 'morning' ? '🌅' : timeSlot === 'afternoon' ? '☀️' : timeSlot === 'evening' ? '🌙' : '🔄';

                        return (
                            <div key={timeSlot} className="relative pl-6 border-l border-white/5 space-y-4">
                                <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-700" />
                                <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                    <span>{slotIcon}</span> {slotTitle}
                                </h3>

                                <div className="grid grid-cols-1 gap-3">
                                    {slotHabits.map((habit: Habit) => (
                                        <div key={habit.id} className={cn("group relative flex items-center justify-between p-4 rounded-xl border transition-all duration-300", habit.is_active ? "bg-white/5 border-white/5 hover:border-primary/30 hover:bg-white/10" : "bg-black/40 border-dashed border-white/5 opacity-60 grayscale hover:opacity-100 hover:grayscale-0")}>
                                            {/* Left */}
                                            <div className="flex items-center gap-4">
                                                <div onClick={(e) => handleToggleActive(e, habit)} className={cn("cursor-pointer p-2 rounded-lg border transition-all", getPathwayColor(habit.reward_pathway), !habit.is_active && "text-zinc-600 border-zinc-700 bg-zinc-800/10")}>
                                                    {habit.is_active ? (habit.reward_pathway?.includes('dopamine') && <Zap className="h-4 w-4" />) : <Pause className="h-4 w-4" />}
                                                    {habit.is_active && habit.reward_pathway?.includes('serotonin') && <Brain className="h-4 w-4" />}
                                                    {habit.is_active && habit.reward_pathway?.includes('endorphin') && <Flame className="h-4 w-4" />}
                                                    {habit.is_active && habit.reward_pathway?.includes('oxytocin') && <Share2 className="h-4 w-4" />}
                                                    {habit.is_active && habit.reward_pathway?.includes('cortisol') && <ShieldAlert className="h-4 w-4" />}
                                                    {habit.is_active && !habit.reward_pathway && <Activity className="h-4 w-4" />}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors flex items-center gap-2">
                                                        {habit.name}
                                                        {!habit.is_active && <span className="text-[9px] uppercase tracking-wider text-zinc-500 border border-zinc-700 px-1 rounded">Paused</span>}
                                                    </h4>
                                                    <div className="flex items-center gap-3 text-[10px] text-zinc-500 mt-1 font-mono">
                                                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {habit.duration_minutes}m</span>
                                                        <span className="opacity-30">|</span>
                                                        <span className="flex items-center gap-1"><Battery className="h-3 w-3" /> Cost: {habit.energy_cost}/10</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right */}
                                            <div className="flex items-center gap-4">
                                                {/* Toggle Active Switch (Mini) */}
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10" onClick={() => updateMutation.mutate({ id: habit.id, updates: { is_active: !habit.is_active } })}>
                                                        {habit.is_active ? <ToggleRight className="h-5 w-5 text-emerald-500" /> : <ToggleLeft className="h-5 w-5 text-zinc-600" />}
                                                    </Button>
                                                </div>

                                                <Badge variant="outline" className={cn("text-[9px] uppercase tracking-wider rounded-md h-5 px-2 bg-transparent", getPathwayColor(habit.reward_pathway))}>
                                                    {getPathwayLabel(habit.reward_pathway).split(' ')[0]}
                                                </Badge>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <MoreVertical className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-black/90 border-white/10 text-white">
                                                        <DropdownMenuItem onClick={() => handleEdit(habit)}>
                                                            <Edit2 className="h-3.5 w-3.5 mr-2" /> Edit Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => updateMutation.mutate({ id: habit.id, updates: { is_active: !habit.is_active } })}>
                                                            {habit.is_active ? <><Pause className="h-3.5 w-3.5 mr-2" /> Pause Protocol</> : <><Play className="h-3.5 w-3.5 mr-2" /> Resume Protocol</>}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-white/10" />
                                                        <DropdownMenuItem className="text-red-400 focus:text-red-300 focus:bg-red-500/10" onClick={() => deleteMutation.mutate(habit.id)}>
                                                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* DANGER ZONE / RESET */}
            <div className="mt-12 pt-12 border-t border-white/5 flex justify-center">
                <Button
                    variant="ghost"
                    onClick={() => setIsResetOpen(true)}
                    disabled={purgeMutation.isPending}
                    className="text-xs text-zinc-700 hover:text-red-400 hover:bg-red-950/20 transition-colors uppercase tracking-widest font-mono"
                >
                    <AlertTriangle className="h-3 w-3 mr-2" />
                    System Purge
                </Button>
            </div>

            {/* RESET CONFIRMATION DIALOG */}
            <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
                <DialogContent className="sm:max-w-[400px] border-red-500/20 bg-black/95 backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="font-mono uppercase tracking-widest text-sm text-red-500 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" /> SYSTEM PURGE SEQUENCE
                        </DialogTitle>
                        <p className="text-xs text-zinc-400 mt-2">
                            This action will <span className="text-red-400 font-bold">PERMANENTLY DELETE ALL</span> active habits, history, and metrics.
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                            Your dashboard will be blank. This action cannot be undone.
                        </p>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="ghost" size="sm" onClick={() => setIsResetOpen(false)} className="text-zinc-400 hover:text-white mb-2 sm:mb-0">
                            ABORT
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 font-mono text-xs"
                            onClick={() => {
                                purgeMutation.mutate();
                                setIsResetOpen(false);
                            }}
                        >
                            INITIATE PURGE
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
