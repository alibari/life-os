import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit2, Zap, Brain, Activity, Clock, Battery, Share2, AlertTriangle, Play, Pause, Thermometer, Calendar, BookOpen, MoreVertical, X, RotateCcw, Settings, CheckCircle2, Link2, ArrowRight, Sun, Moon, Timer, FlaskConical, CalendarClock, ChevronsUpDown, Check, Atom, Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { habitService } from "@/services/habitService";
import type { Habit, Protocol, Vector } from "@/types/habits";
import { PROTOCOL_BUNDLES, HABIT_Biblio } from "@/services/habitLibrary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer, RadarChart, PolarGrid, Radar, Legend } from 'recharts';
import { isScheduledForToday } from "@/lib/scheduling";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Helpers reused from service for local calc
const deriveCategory = (vector: Vector, state: number): string => {
    // V10 / V9 Mapping
    if (['Social', 'Spirit'].includes(vector)) return 'Spirit';
    if (['Circadian', 'Sleep', 'Autonomic', 'Rest'].includes(vector)) return 'Sleep'; // Recovery Axis
    if (['Metabolic', 'Thermal', 'Musculoskeletal', 'Nutritional'].includes(vector)) return 'Body'; // Physiology Axis
    if (vector === 'Cognitive') return state > 0 ? 'Focus' : 'Mind'; // Active vs Passive Cognition
    if (['Focus', 'Environment'].includes(vector)) return 'Focus';
    return 'General';
};


// --- DYNAMIC DRIVER LIST ENGINE ---
// 1. Strict Scientific List (Baseline)
const BASE_SCIENTIFIC_DRIVERS = [
    'Dopamine', 'Serotonin', 'Adrenaline', 'Cordisol', 'Endorphin', 'Oxytocin',
    'Acetylcholine', 'GABA', 'Adenosine', 'Testosterone', 'Melatonin',
    'Norepinephrine', 'Nitric Oxide', 'Dynorphin', 'Endocannabinoid',
    'Glutamate', 'Histamine', 'Orexin', 'Ghrelin', 'Leptin', 'Insulin',
    'Vagus Tone', 'Growth Hormone', 'Amygdala Suppression'
];

// 2. Chemical Color Mapping (Lab Grade)
const getDriverColor = (driver: string) => {
    const d = driver.toLowerCase();
    if (d.includes('dopamine')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (d.includes('adrenaline') || d.includes('norepinephrine')) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    if (d.includes('serotonin') || d.includes('melatonin') || d.includes('gaba')) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    if (d.includes('cortisol')) return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    if (d.includes('endorphin') || d.includes('dynorphin')) return 'text-pink-400 bg-pink-500/10 border-pink-500/20';
    if (d.includes('oxytocin')) return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    if (d.includes('testosterone') || d.includes('growth')) return 'text-red-500 bg-red-500/10 border-red-500/20';
    if (d.includes('acetylcholine')) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
};

// 3. Dynamic Aggregator
const getAvailableDrivers = () => {
    const libraryDrivers = new Set<string>();

    // Extract from Library
    HABIT_Biblio.forEach(h => {
        if (h.primary_driver) libraryDrivers.add(h.primary_driver);
        if (h.secondary_driver) libraryDrivers.add(h.secondary_driver);
    });

    // Merge with Baseline
    const combined = new Set([...BASE_SCIENTIFIC_DRIVERS, ...Array.from(libraryDrivers)]);

    // Convert to Sorted Array take 1
    const list = Array.from(combined).sort();

    return list.map(d => ({
        value: d,
        label: capitalize(d),
        colorClass: getDriverColor(d)
    }));
};
const AVAILABLE_DRIVERS_LIST = getAvailableDrivers();


// --- INTERNAL COMPONENT: MolecularStreamSelector (DNA Scroll) ---
// The "Stream" - Fixed Anchor (Searchable) + Scrollable List + Visual Hints
function MolecularStreamSelector({
    label,
    value,
    onChange,
}: {
    label: string,
    value?: string,
    onChange: (val: string) => void,
}) {
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-sort: Active item always moves to index 0, then filtered by search
    const processedList = useMemo(() => {
        let list = [...AVAILABLE_DRIVERS_LIST];

        // 1. Filter if searching
        if (searchQuery) {
            list = list.filter(d => d.label.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        // 2. Sort (Active First, unless searching - then alphabetical is fine, or keep active first?)
        // Let's keep active first if it matches filter
        return list.sort((a, b) => {
            if (a.value === value) return -1;
            if (b.value === value) return 1;
            return 0;
        });
    }, [value, searchQuery]);

    useEffect(() => {
        if (isSearching && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isSearching]);

    return (
        <div className="flex items-center gap-0 w-full group/stream py-1 relative">
            {/* 1. FIXED ANCHOR (Search Toggle) */}
            <div className="shrink-0 z-20 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold font-mono border-r border-white/10 pr-4 mr-1 min-w-[140px] bg-black h-8 group/anchor">
                {isSearching ? (
                    <div className="flex items-center w-full animate-in fade-in slide-in-from-left-2 duration-200">
                        <input
                            ref={inputRef}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onBlur={() => { if (!searchQuery) setIsSearching(false); }}
                            className="bg-transparent border-none outline-none text-white w-[80px] text-[10px] placeholder:text-zinc-700 font-mono"
                            placeholder="SEARCH..."
                        />
                        <button onClick={() => { setIsSearching(false); setSearchQuery(''); }} className="ml-auto text-zinc-600 hover:text-white"><X className="h-3 w-3" /></button>
                    </div>
                ) : (
                    <>
                        <div className="p-1.5 rounded-md bg-white/5 border border-white/10 transition-all duration-300 h-7 w-7 flex items-center justify-center">
                            <Brain className="h-4 w-4 text-zinc-500 group-hover/anchor:text-zinc-300 transition-colors" />
                        </div>

                        <span
                            onClick={() => setIsSearching(true)}
                            className="text-zinc-500 group-hover/anchor:text-zinc-300 transition-colors cursor-pointer mr-auto"
                        >
                            {label}
                        </span>

                        <button
                            onClick={() => setIsSearching(true)}
                            title="Click to Search"
                            className="text-zinc-700 hover:text-white transition-colors p-1"
                        >
                            <Search className="h-3 w-3" />
                        </button>
                    </>
                )}
            </div>

            {/* 2. SCROLLABLE STREAM */}
            <div className="flex-1 relative overflow-hidden group/list">
                {/* Masks */}
                <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none flex items-center justify-end pr-1">
                    <ChevronsUpDown className="h-3 w-3 text-zinc-800 rotate-90 animate-pulse" />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto py-2 pl-4 pr-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    {processedList.length === 0 && <span className="text-[9px] text-zinc-700 font-mono pl-2">NO MATCHES</span>}

                    {processedList.map((driver) => {
                        const isSelected = value === driver.value;

                        return (
                            <button
                                key={driver.value}
                                onClick={() => onChange(driver.value)}
                                className={cn(
                                    "shrink-0 transition-all duration-300 text-[9px] uppercase font-mono tracking-wider px-3 py-1.5 rounded-full border whitespace-nowrap relative group/item",
                                    isSelected
                                        ? "bg-white/20 border-white text-white font-bold shadow-[0_0_15px_-3px_rgba(255,255,255,0.4)]"
                                        : "border-transparent text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
                                )}
                            >
                                <span className="relative z-10">{driver.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// --- INTERNAL COMPONENT: DynamicGridSelector (Periodic Table) ---
// The "Scientific Grid" - Dense, Visible, Dynamic, Compact
function DynamicGridSelector({
    label,
    value,
    onChange,
}: {
    label: string,
    value?: string,
    onChange: (val: string) => void,
}) {
    const [filter, setFilter] = useState('');
    const filteredDrivers = AVAILABLE_DRIVERS_LIST.filter(d => d.value.toLowerCase().includes(filter.toLowerCase()));

    return (
        <div className="space-y-2 bg-black/20 rounded-xl p-3 border border-white/5 relative group hover:border-white/10 transition-all">
            <div className="flex items-center justify-between mb-2">
                <div className="text-[9px] uppercase tracking-widest text-zinc-500 font-mono flex items-center gap-2">
                    {/* Brain Connectivity Line */}
                    <div className="h-2 w-2 rounded-full bg-zinc-800 group-hover:bg-emerald-500/50 transition-colors" />
                    {label}
                </div>
                {/* Search / Filter Input */}
                <input
                    type="text"
                    placeholder="FILTER..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-transparent border-b border-zinc-800 focus:border-emerald-500 text-[9px] w-20 text-right text-zinc-400 focus:text-white outline-none font-mono uppercase transition-all"
                />
            </div>

            {/* Scrollable Compact Grid */}
            <ScrollArea className="h-[120px] pr-3">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                    {filteredDrivers.map((driver) => {
                        const isSelected = value === driver.value;
                        const colorClass = driver.colorClass;
                        // Inactive state: very subtle glass
                        const baseClass = "bg-white/[0.02] border-white/5 text-zinc-600 hover:bg-white/5 hover:text-zinc-300";

                        return (
                            <div
                                key={driver.value}
                                onClick={() => onChange(driver.value)}
                                className={cn(
                                    "cursor-pointer h-6 flex items-center justify-center rounded border transition-all text-[8px] uppercase font-mono tracking-wider relative overflow-hidden group/item",
                                    isSelected ? colorClass + " shadow-[0_0_10px_-3px_currentColor] font-bold border-opacity-50" : baseClass
                                )}
                            >
                                <span className="relative z-10 truncate px-1">{driver.label}</span>
                                {isSelected && <div className={cn("absolute inset-0 opacity-20", colorClass.split(' ')[0].replace('text-', 'bg-'))} />}
                            </div>
                        );
                    })}
                    {filteredDrivers.length === 0 && <div className="col-span-4 text-center text-[9px] text-zinc-700 py-4">NO MOLECULE FOUND</div>}
                </div>
            </ScrollArea>
        </div>
    );
}

// --- INTERNAL COMPONENT: NeuroSelector (Synaptic Orbit) ---
// The "Brain Thing" - Orbiting Molecules around a Central Core
function NeuroSelector({
    label,
    value,
    onChange,
}: {
    label: string,
    value?: string,
    onChange: (val: string) => void,
}) {
    const [isOpen, setIsOpen] = useState(false);

    // Top 6 Drivers for Orbit
    const TOP_MOLECULES = ['Dopamine', 'Serotonin', 'Adrenaline', 'Cortisol', 'Testosterone', 'Endorphin'];
    const selectedColor = value ? getDriverColor(value) : 'text-zinc-600 border-zinc-700 bg-zinc-800/50';
    const glowColor = selectedColor.split(' ')[0].replace('text-', 'bg-'); // e.g. bg-emerald-400

    return (
        <div className="relative flex flex-col items-center justify-center p-4 rounded-xl bg-black/40 border border-white/5 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

            <div className="text-[9px] uppercase tracking-widest text-zinc-500 mb-6 font-mono z-10">{label}</div>

            <div className="relative w-48 h-48 flex items-center justify-center mb-4">
                {/* Orbit Rings */}
                <div className="absolute inset-0 rounded-full border border-white/5 opacity-30" />
                <div className="absolute inset-8 rounded-full border border-white/5 opacity-50" />

                {/* Central Brain Core (Trigger for Full List) */}
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={cn("relative z-20 w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all shadow-[0_0_30px_-5px_currentColor]", selectedColor)}
                            style={{ color: 'inherit' }}
                        >
                            <Brain className="w-8 h-8" />
                            {value && <div className={cn("absolute inset-0 rounded-full opacity-20 blur-md", glowColor)} />}
                        </motion.button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[220px] p-0 bg-black/95 border-zinc-800 backdrop-blur-3xl shadow-2xl">
                        <Command className="bg-transparent">
                            <CommandInput placeholder="SEARCH COMPOUND..." className="h-9 text-[10px] font-mono uppercase tracking-widest border-b border-white/5" />
                            <CommandList className="py-1">
                                <CommandGroup className="max-h-[200px] overflow-y-auto custom-scrollbar p-1">
                                    {AVAILABLE_DRIVERS_LIST.map((driver) => (
                                        <CommandItem
                                            key={driver.value}
                                            value={driver.value}
                                            onSelect={(currentValue) => { onChange(driver.value); setIsOpen(false); }}
                                            className="text-[10px] font-mono rounded-sm aria-selected:bg-white/10 cursor-pointer flex items-center justify-between group py-1.5 px-2 mb-0.5"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={cn("h-1.5 w-1.5 rounded-full opacity-60", driver.colorClass.split(' ')[0].replace('text-', 'bg-'))} />
                                                <span className={cn("transition-colors", value === driver.value ? "text-white" : "text-zinc-400")}>{driver.label}</span>
                                            </div>
                                            {value === driver.value && <Check className="h-3 w-3 text-emerald-500" />}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

                {/* Orbiting Molecules */}
                {TOP_MOLECULES.map((driver, i) => {
                    const angle = (i / 6) * 2 * Math.PI - Math.PI / 2; // Start top
                    const radius = 80; // Distance from center
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    const isSelected = value === driver;
                    const dColor = getDriverColor(driver);

                    return (
                        <motion.button
                            key={driver}
                            initial={{ x, y, opacity: 0 }}
                            animate={{ x, y, opacity: 1 }}
                            transition={{ delay: i * 0.1, type: 'spring' }}
                            onClick={() => onChange(driver)}
                            className={cn(
                                "absolute w-8 h-8 rounded-full border flex items-center justify-center transition-all bg-black z-10",
                                isSelected ? dColor : "border-zinc-800 text-zinc-600 hover:border-zinc-600 hover:text-zinc-300"
                            )}
                            title={driver}
                        >
                            {/* Short Label or Icon */}
                            <span className="text-[8px] font-bold">{driver.slice(0, 2)}</span>
                            {isSelected && <motion.div layoutId="orbit-glow" className={cn("absolute inset-0 rounded-full opacity-50 blur-sm", dColor.split(' ')[0].replace('text-', 'bg-'))} />}
                        </motion.button>
                    )
                })}
            </div>

            {/* Current Selection Readout */}
            <div className="h-6 flex items-center gap-2">
                {value ? (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className={cn("px-2 py-0.5 rounded border text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-2", selectedColor)}>
                        {value}
                    </motion.div>
                ) : <span className="text-[10px] text-zinc-700 font-mono">NO DRIVER SELECTED</span>}
            </div>
        </div>
    );
}

export function HabitManager() {
    const queryClient = useQueryClient();

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isProtocolOpen, setIsProtocolOpen] = useState(false);
    const [isEditProtocolOpen, setIsEditProtocolOpen] = useState(false);
    const [isResetOpen, setIsResetOpen] = useState(false);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);

    // State
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [editingProtocol, setEditingProtocol] = useState<Partial<Protocol> | null>(null);
    const [targetProtocolId, setTargetProtocolId] = useState<string | undefined>(undefined); // Context for adding habit
    const [libraryFilters, setLibraryFilters] = useState<{ driver: string, state: string }>({ driver: 'All', state: 'All' });
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [selectedBundleIds, setSelectedBundleIds] = useState<string[]>([]);

    // Form State (Habit)
    const [habitForm, setHabitForm] = useState<Partial<Habit>>({
        name: '', friction: 1, state: 0, duration: 15,
        primary_driver: 'Dopamine', vector: 'Cognitive', is_active: true,
        category: 'Focus', time_of_day: 'all_day',
        frequency_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        start_date: new Date().toISOString().split('T')[0]
    });

    // Auto-Sync Data Integrity on Mount (V10 Migration)
    useEffect(() => {
        habitService.syncHabitDefinitions();
    }, []);

    const [protocolForm, setProtocolForm] = useState<Partial<Protocol>>({ name: '', is_active: true });

    useEffect(() => {
        if (editingHabit) {
            setHabitForm({
                ...editingHabit,
                start_date: editingHabit.start_date ? editingHabit.start_date.split('T')[0] : new Date().toISOString().split('T')[0],
                end_date: editingHabit.end_date ? editingHabit.end_date.split('T')[0] : undefined
            });
        } else {
            resetHabitForm();
        }
    }, [editingHabit, isCreateOpen]);

    useEffect(() => {
        // Pre-fill protocol ID if we are adding TO a protocol
        if (targetProtocolId && !editingHabit) {
            setHabitForm(prev => ({ ...prev, protocol_id: targetProtocolId }));
        }
    }, [targetProtocolId]);

    useEffect(() => {
        if (editingProtocol) {
            setProtocolForm({ ...editingProtocol });
        } else {
            setProtocolForm({ name: '', is_active: true });
        }
    }, [editingProtocol, isEditProtocolOpen]);

    const resetHabitForm = () => {
        setHabitForm({
            name: '', friction: 1, state: 0, duration: 15,
            primary_driver: 'Dopamine', vector: 'Cognitive', is_active: true,
            category: 'Focus', time_of_day: 'all_day',
            frequency_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            start_date: new Date().toISOString().split('T')[0],
            protocol_id: targetProtocolId // Preserve context if set
        });
    }

    // Queries
    const { data: habits } = useQuery({ queryKey: ['habits'], queryFn: habitService.getHabits });
    const { data: protocols } = useQuery({ queryKey: ['protocols'], queryFn: habitService.getProtocols });

    // CLIENT-SIDE REALTIME METRICS ENGINE (V7.2 Multi-Select + Deep Analysis)
    const metrics = useMemo(() => {
        const activeHabits = (habits || []).filter(h => {
            // 1. Basic Active Check
            if (!h.is_active) return false;

            // 2. Protocol Check
            if (h.protocol_id) {
                const p = protocols?.find(p => p.id === h.protocol_id);
                if (!p || !p.is_active) return false;
                // 3. Schedule Check (Protocol)
                if (p.scheduling_config && !isScheduledForToday(p.scheduling_config, p.start_date)) return false;
            }

            // 4. Schedule Check (Standalone - if it has config)
            if (!h.protocol_id && h.scheduling_config && !isScheduledForToday(h.scheduling_config, h.start_date)) {
                return false;
            }

            return true;
        });

        const calculateStats = (habitList: any[]) => {
            const totalFriction = habitList.reduce((acc, h) => acc + (h.friction || 0), 0);
            const systemLoad = Math.round((totalFriction / 100) * 100);

            // Vector Balance
            const axes = { 'Body': 0, 'Mind': 0, 'Spirit': 0, 'Sleep': 0, 'Focus': 0 };
            habitList.forEach(h => {
                const cat = deriveCategory(h.vector, h.state);
                // @ts-ignore
                if (axes[cat] !== undefined) axes[cat]++;
            });

            // Autonomic Analysis (Sympathetic vs Parasympathetic)
            const autonomic = { sympathetic: 0, parasympathetic: 0, neutral: 0 };
            habitList.forEach(h => {
                if ((h.state || 0) < 0) autonomic.sympathetic++;
                else if ((h.state || 0) > 0) autonomic.parasympathetic++;
                else autonomic.neutral++;
            });

            // Neurochemical Profile
            const drivers: Record<string, number> = {};
            habitList.forEach(h => {
                const driver = h.primary_driver || 'Dopamine';
                drivers[driver] = (drivers[driver] || 0) + 1;
            });
            // Sort drivers by count desc
            const neuroProfile = Object.entries(drivers)
                .sort((a, b) => b[1] - a[1])
                .map(([name, count]) => ({ name, count, percent: Math.round((count / habitList.length) * 100) }));

            const netState = habitList.reduce((acc, h) => acc + (h.state || 0), 0);

            return { systemLoad, vectorBalance: axes, netState, totalFriction, autonomic, neuroProfile };
        };

        const current = calculateStats(activeHabits);

        // Simulation Logic
        let simulated = null;
        if (selectedBundleIds.length > 0) {
            const allNewHabits = selectedBundleIds.flatMap(id => {
                const bundle = PROTOCOL_BUNDLES.find(b => b.id === id);
                if (!bundle) return [];
                return bundle.habits.map(name => {
                    const template = HABIT_Biblio.find(h => h.name === name);
                    if (!template) return null;
                    return {
                        friction: (template as any).friction || 5,
                        vector: (template as any).vector || 'Cognitive',
                        state: (template as any).state || 0,
                        primary_driver: (template as any).primary_driver || 'Dopamine'
                    };
                }).filter(Boolean);
            });

            simulated = calculateStats([...activeHabits, ...allNewHabits]);
        }

        return { ...current, simulated };
    }, [habits, protocols, selectedBundleIds]);

    const createHabitMutation = useMutation({ mutationFn: habitService.createHabit, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['habits'] }); setIsCreateOpen(false); toast.success("Habit Created"); } });
    const updateHabitMutation = useMutation({ mutationFn: ({ id, updates }: { id: string, updates: Partial<Habit> }) => habitService.updateHabit(id, updates), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['habits'] }); setIsCreateOpen(false); setEditingHabit(null); toast.success("Updated"); } });
    const deleteHabitMutation = useMutation({ mutationFn: habitService.deleteHabit, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['habits'] }); toast.success("Deleted"); } });
    const createProtocolMutation = useMutation({
        mutationFn: habitService.createProtocol,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['protocols'] });
            queryClient.invalidateQueries({ queryKey: ['active-habits-today'] }); // Force Widget Refresh
            setIsEditProtocolOpen(false);
            toast.success("Protocol Created");
        }
    });

    const updateProtocolMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string, updates: Partial<Protocol> }) => habitService.updateProtocol(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['protocols'] });
            queryClient.invalidateQueries({ queryKey: ['active-habits-today'] }); // Force Widget Refresh
            setEditingProtocol(null);
            setIsEditProtocolOpen(false);
            toast.success("Protocol Updated");
        }
    }); const deleteProtocolMutation = useMutation({ mutationFn: habitService.deleteProtocol, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['protocols'] }); toast.success("Deleted"); } });
    const importProtocolMutation = useMutation({ mutationFn: habitService.importProtocolBundle, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['habits'] }); queryClient.invalidateQueries({ queryKey: ['protocols'] }); toast.success("Protocol Imported"); } });
    const syncLibraryMutation = useMutation({ mutationFn: habitService.syncHabitDefinitions, onSuccess: (msg: any) => { queryClient.invalidateQueries({ queryKey: ['habits'] }); toast.success(msg || "Library Synced"); } });
    const importBundleMutation = useMutation({ mutationFn: habitService.importProtocolBundle, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['protocols'] }); queryClient.invalidateQueries({ queryKey: ['habits'] }); setIsLibraryOpen(false); toast.success("Protocol Bundle Imported"); } });

    const handleHabitSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // VALIDATION
        if (!habitForm.name?.trim()) { toast.error("Name is required"); return; }

        // Uniqueness Check (Client Side)
        const nameLower = habitForm.name.toLowerCase();
        const duplicate = habits?.find(h => h.name.toLowerCase() === nameLower && h.id !== editingHabit?.id);
        if (duplicate) { toast.error("A habit with this name already exists."); return; }

        // Sanitize Payload (Strip joined relations and system fields)
        const payload: any = {
            name: habitForm.name,
            friction: habitForm.friction,
            state: habitForm.state,
            duration: habitForm.duration,
            primary_driver: habitForm.primary_driver,
            secondary_driver: habitForm.secondary_driver,
            vector: habitForm.vector,
            is_active: habitForm.is_active,
            category: habitForm.category,
            time_of_day: habitForm.time_of_day,
            frequency_days: habitForm.frequency_days,
            protocol_id: habitForm.protocol_id,
            start_date: habitForm.start_date ? new Date(habitForm.start_date).toISOString() : undefined,
            end_date: habitForm.end_date ? new Date(habitForm.end_date).toISOString() : undefined
        };

        if (editingHabit) updateHabitMutation.mutate({ id: editingHabit.id, updates: payload });
        else createHabitMutation.mutate(payload);
    };

    const handleProtocolSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!protocolForm.name?.trim()) { toast.error("Protocol name required"); return; }
        if (editingProtocol && editingProtocol.id) updateProtocolMutation.mutate({ id: editingProtocol.id, updates: protocolForm });
        else createProtocolMutation.mutate(protocolForm);
    };

    // ... Visualization Config (Same) ...
    const gaugeData = [{ name: 'Load', value: metrics?.systemLoad || 0, fill: (metrics?.systemLoad || 0) > 80 ? '#ef4444' : '#10b981' }];
    const radarData = [
        { subject: 'Recovery', A: metrics?.vectorBalance?.Sleep || 0 }, // Was Sleep
        { subject: 'Physiology', A: metrics?.vectorBalance?.Body || 0 }, // Was Body
        { subject: 'Cognition', A: metrics?.vectorBalance?.Mind || 0 }, // Was Mind
        { subject: 'Drive', A: metrics?.vectorBalance?.Spirit || 0 }, // Was Spirit
        { subject: 'Clarity', A: metrics?.vectorBalance?.Focus || 0 }, // Was Focus
    ];
    const netState = metrics?.netState || 0;



    // Timeline Filter: Show ALL habits (Active, Paused, Standby) for management visibility.
    const scheduledHabits = (habits || []).filter(h => {
        return true;
    });

    const groupedHabits = {
        morning: scheduledHabits.filter(h => h.time_of_day === 'morning'),
        afternoon: scheduledHabits.filter(h => h.time_of_day === 'afternoon'),
        evening: scheduledHabits.filter(h => h.time_of_day === 'evening'),
        all_day: scheduledHabits.filter(h => h.time_of_day === 'all_day'),
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-40">
            {/* 1. CHART ENGINE (Same) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* ... same charts ... */}
                <div className="card-surface p-6 border-white/5 bg-black/40 backdrop-blur-xl relative flex flex-col items-center justify-center h-[240px]">
                    <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 absolute top-4 left-4">System Load</h3>
                    <div className="w-full h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={15} data={gaugeData} startAngle={180} endAngle={0}>
                                <RadialBar background dataKey="value" cornerRadius={10} />
                            </RadialBarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="absolute bottom-6 text-center">
                        <span className="text-3xl font-bold font-mono text-white">{metrics?.systemLoad}%</span>
                        <p className="text-[9px] text-zinc-500 uppercase">Friction Coeff</p>
                    </div>
                </div>
                {/* Vector */}
                <div className="card-surface p-4 border-white/5 bg-black/40 backdrop-blur-xl h-[240px]">
                    <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Bio-Vector</h3>
                    <div className="w-full h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                                <PolarGrid stroke="#333" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 9 }} />
                                <Radar name="Balance" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                {/* Net State */}
                <div className="card-surface p-6 border-white/5 bg-black/40 backdrop-blur-xl flex flex-col justify-center h-[240px]">
                    <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 mb-8">Autonomic State</h3>
                    <div className="relative h-2 bg-white/10 rounded-full mb-4">
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/30" />
                        <div className={cn("absolute top-0 bottom-0 rounded-full transition-all", netState > 0 ? "bg-orange-500 left-1/2" : "bg-blue-500 right-1/2")} style={{ width: `${Math.min(50, Math.abs(netState) * 5)}%`, [netState > 0 ? 'left' : 'right']: '50%' }} />
                    </div>
                    <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-500">
                        <span className="text-blue-400">Parasympathetic</span>
                        <span className="text-orange-400">Sympathetic</span>
                    </div>
                    <div className="text-center mt-4">
                        <span className={cn("text-2xl font-mono font-bold", netState > 0 ? "text-orange-400" : "text-blue-400")}>
                            {netState > 0 ? '+' : ''}{netState}
                        </span>
                        <p className="text-[9px] text-zinc-600 uppercase">Net Bias</p>
                    </div>
                    <div className="mt-auto pt-4 border-t border-white/5 w-full text-center">
                        <p className="text-[9px] text-zinc-400 font-mono">
                            {netState > 5 ? "System Oversaturated. Add +Action." :
                                netState < -5 ? "System Depleted. Add +Rest." :
                                    "System Equilibrated."}
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. PROTOCOLS */}
            <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <h2 className="text-lg font-mono font-bold text-white flex items-center gap-2">
                        <Activity className="h-5 w-5 text-emerald-500" /> Protocol Engine
                    </h2>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setIsLibraryOpen(true)} className="text-zinc-400 hover:text-emerald-500">
                            <BookOpen className="h-4 w-4 mr-2" /> Browse Library
                        </Button>
                        <Button size="sm" onClick={() => { setEditingProtocol(null); setIsEditProtocolOpen(true); }} className="bg-emerald-500 text-black hover:bg-emerald-400">
                            <Plus className="h-4 w-4 mr-2" /> New Protocol
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {protocols?.map(p => {
                        // Per-Protocol Stats
                        const pHabits = habits?.filter(h => h.protocol_id === p.id && h.is_active) || [];
                        const load = pHabits.reduce((acc, h) => acc + (h.friction || 0), 0);
                        const net = pHabits.reduce((acc, h) => acc + (h.state || 0), 0);
                        const stateColor = net > 0 ? "text-orange-400" : net < 0 ? "text-blue-400" : "text-zinc-500";

                        const isScheduled = isScheduledForToday(p.scheduling_config, p.start_date);
                        const isActiveToday = p.is_active && isScheduled;

                        return (
                            <div key={p.id} className={cn("p-5 rounded-xl border transition-all flex flex-col justify-between h-[150px] relative overflow-hidden",
                                p.is_active
                                    ? (isScheduled ? "bg-emerald-500/10 border-emerald-500/30" : "bg-amber-500/5 border-amber-500/20")
                                    : "bg-white/[0.02] border-white/5"
                            )}>
                                {isActiveToday && <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 blur-3xl -mr-10 -mt-10" />}

                                <div className="flex justify-between items-start z-10">
                                    <div>
                                        <h3 className={cn("font-bold text-base tracking-tight flex items-center gap-2",
                                            p.is_active
                                                ? (isScheduled ? "text-emerald-400" : "text-amber-500/80")
                                                : "text-zinc-400"
                                        )}>
                                            {p.name}
                                            {p.is_active && !isScheduled && <CalendarClock className="h-3 w-3" />}
                                        </h3>
                                        <p className="text-[10px] text-zinc-500 mt-1 line-clamp-1">
                                            {p.is_active && !isScheduled ? `Standby (Scheduled: ${p.scheduling_config?.type})` : (p.description || "No description")}
                                        </p>
                                    </div>
                                    <div className="flex gap-1 z-20">
                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-zinc-500 hover:text-white hover:bg-white/10" onClick={() => { setEditingProtocol(p); setIsEditProtocolOpen(true); }}>
                                            <Settings className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10" onClick={() => {
                                            const newState = !p.is_active;
                                            updateProtocolMutation.mutate({ id: p.id, updates: { is_active: newState } });
                                            // Cascade to habits
                                            const protocolHabits = habits?.filter(h => h.protocol_id === p.id) || [];
                                            protocolHabits.forEach(h => updateHabitMutation.mutate({ id: h.id, updates: { is_active: newState } }));
                                            toast.success(`${newState ? 'Activated' : 'Paused'} protocol and ${protocolHabits.length} habits.`);
                                        }}>
                                            {p.is_active ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 mt-4 z-10">
                                    <div className="bg-black/20 rounded p-2 text-center">
                                        <div className="text-[9px] text-zinc-500 uppercase">Load</div>
                                        <div className="font-mono font-bold text-white text-xs">{load}</div>
                                    </div>
                                    <div className="bg-black/20 rounded p-2 text-center">
                                        <div className="text-[9px] text-zinc-500 uppercase">State</div>
                                        <div className={cn("font-mono font-bold text-xs", stateColor)}>{net > 0 ? '+' : ''}{net}</div>
                                    </div>
                                    <div className="bg-black/20 rounded p-2 text-center">
                                        <div className="text-[9px] text-zinc-500 uppercase">Habits</div>
                                        <div className="font-mono font-bold text-white text-xs">{pHabits.length}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 3. HABIT CARDS (Timeline View) */}
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 delay-200">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <h2 className="text-lg font-mono font-bold text-white flex items-center gap-2">
                        <Clock className="h-5 w-5 text-emerald-500" /> Timeline Execution
                    </h2>
                    <Button size="sm" onClick={() => { setTargetProtocolId(undefined); setEditingHabit(null); setIsCreateOpen(true); }} className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black border border-emerald-500/20">
                        <Plus className="h-4 w-4 mr-2" /> Add Habit
                    </Button>
                </div>

                <div className="relative pl-8 border-l border-dashed border-white/10 ml-4 space-y-12">
                    {['morning', 'afternoon', 'evening', 'all_day'].map((time, idx) => {
                        // @ts-ignore
                        const slotHabits = groupedHabits[time];
                        // If no habits, we still show the slot if desired, but user likely wants compact. 
                        // Let's show it if it has habits OR if it's the first one to anchor the timeline.
                        if (!slotHabits.length) return null;

                        const title = time === 'all_day' ? 'Anytime' : time;
                        const timeIcon = time === 'morning' ? <Sun className="h-4 w-4" /> : time === 'afternoon' ? <Sun className="h-4 w-4 opacity-50" /> : time === 'evening' ? <Moon className="h-4 w-4" /> : <Clock className="h-4 w-4" />;

                        return (
                            <div key={time} className="relative">
                                {/* Timeline Node */}
                                <div className="absolute -left-[41px] top-0 h-5 w-5 rounded-full bg-black border border-white/20 flex items-center justify-center z-10">
                                    <div className="h-2 w-2 rounded-full bg-zinc-600" />
                                </div>

                                <h4 className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">
                                    {timeIcon} {title}
                                </h4>

                                <div className="grid grid-cols-1 gap-3">
                                    {slotHabits.map((h: Habit) => {
                                        const protocol = h.protocol_id ? protocols?.find(p => p.id === h.protocol_id) : undefined;
                                        const protocolName = protocol?.name;

                                        // 1. Determine Effective Status
                                        const isHabitPaused = !h.is_active;
                                        const isProtocolPaused = protocol && !protocol.is_active;
                                        const effectivelyPaused = isHabitPaused || isProtocolPaused;

                                        // 2. Determine "Standby" (Active but not scheduled for today)
                                        let isStandby = false;
                                        // Check Protocol Schedule first
                                        if (protocol && protocol.scheduling_config) {
                                            if (!isScheduledForToday(protocol.scheduling_config, protocol.start_date)) isStandby = true;
                                        }
                                        // Check Habit Schedule (Legacy/Simple Frequency - Prioritize for Standalone Habits matches UI)
                                        else if (h.frequency_days && h.frequency_days.length > 0) {
                                            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                                            const todayName = days[new Date().getDay()];
                                            if (!h.frequency_days.includes(todayName)) isStandby = true;
                                        }
                                        // Check Habit Schedule (V11 Config - Fallback)
                                        else if (h.scheduling_config) {
                                            if (!isScheduledForToday(h.scheduling_config, h.start_date)) isStandby = true;
                                        }

                                        // 3. Status Logic
                                        const effectivelyStandby = !effectivelyPaused && isStandby;

                                        return (
                                            <div key={h.id} className={cn("group relative border rounded-xl p-4 transition-all flex flex-col gap-3",
                                                effectivelyPaused ? "bg-white/[0.04] border-white/10 opacity-75" : // Improved Visibility
                                                    effectivelyStandby ? "bg-amber-500/5 border-amber-500/20" : // Standby Style
                                                        "bg-white/5 border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.07]"
                                            )}>

                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-start gap-4 flex-1">
                                                        {/* Status Toggle Dot */}
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); updateHabitMutation.mutate({ id: h.id, updates: { is_active: !h.is_active } }); }}
                                                            className={cn("mt-1.5 h-3 w-3 rounded-full border transition-all hover:scale-110 flex-shrink-0",
                                                                !effectivelyPaused
                                                                    ? (effectivelyStandby ? "bg-transparent border-amber-500 text-amber-500" : "bg-emerald-500 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]")
                                                                    : "bg-transparent border-zinc-500 hover:border-zinc-400")}
                                                            title={effectivelyPaused ? "Activate" : effectivelyStandby ? "Standby (Scheduled)" : "Pause"}
                                                        >
                                                            {effectivelyStandby && <Clock className="h-1.5 w-1.5 mx-auto mt-[1px]" />}
                                                        </button>

                                                        <div className="w-full">
                                                            <div className="flex items-center justify-between w-full">
                                                                <div className="flex items-center gap-2">
                                                                    <h3 onClick={() => { setEditingHabit(h); setIsCreateOpen(true); }}
                                                                        className={cn("text-sm font-bold cursor-pointer hover:text-emerald-500 transition-colors",
                                                                            effectivelyPaused ? "text-zinc-400 line-through decoration-zinc-600" :
                                                                                effectivelyStandby ? "text-amber-500/80" :
                                                                                    "text-white"
                                                                        )}>
                                                                        {h.name}
                                                                    </h3>
                                                                    {effectivelyStandby && <span className="text-[9px] uppercase font-bold text-amber-500/60 border border-amber-500/20 px-1 rounded">Standby</span>}
                                                                    {protocolName && (
                                                                        <Badge variant="secondary" className={cn("text-[9px] h-4 px-1.5 border-none",
                                                                            effectivelyStandby ? "bg-amber-500/10 text-amber-500/80" : "bg-emerald-500/10 text-emerald-500/80"
                                                                        )}>
                                                                            {protocolName}
                                                                        </Badge>
                                                                    )}
                                                                </div>

                                                                <Badge className={cn("text-[9px] font-mono border bg-transparent ml-auto", (h.state || 0) > 0 ? "text-blue-400 border-blue-900/30" : "text-orange-400 border-orange-900/30")}>
                                                                    {(h.state || 0) > 0 ? `REST +${h.state}` : `ACTIB -${Math.abs(h.state || 0)}`}
                                                                </Badge>
                                                            </div>

                                                            {/* Redesigned Info Specs */}
                                                            <div className="flex flex-wrap items-center gap-2 mt-3">
                                                                {/* Time */}
                                                                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/20 border border-white/5 text-[10px] text-zinc-400">
                                                                    <Timer className="h-3 w-3 text-zinc-500" />
                                                                    <span className="font-mono">{h.duration}m</span>
                                                                </div>

                                                                {/* Driver */}
                                                                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/20 border border-white/5 text-[10px] text-zinc-400">
                                                                    <Zap className="h-3 w-3 text-zinc-500" />
                                                                    <span className="uppercase tracking-wide">{h.primary_driver}</span>
                                                                    {h.secondary_driver && <span className="text-zinc-600 text-[9px] font-mono">+ {h.secondary_driver.slice(0, 3).toUpperCase()}</span>}
                                                                </div>

                                                                {/* Friction */}
                                                                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/20 border border-white/5 text-[10px] text-zinc-400">
                                                                    <Activity className="h-3 w-3 text-zinc-500" />
                                                                    <span>Load: <span className="text-zinc-300">{h.friction}</span></span>
                                                                </div>

                                                                {/* Category (if exists) */}
                                                                {h.category && (
                                                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/20 border border-white/5 text-[10px] text-zinc-400">
                                                                        <span className="capitalize">{h.category}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Quick Actions (Always Visible) */}
                                                    <div className="flex flex-col gap-1 ml-4 opacity-100 transition-opacity">
                                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-zinc-500 hover:text-white hover:bg-white/10" onClick={() => { setEditingHabit(h); setIsCreateOpen(true); }}>
                                                            <Settings className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10" onClick={() => updateHabitMutation.mutate({ id: h.id, updates: { is_active: !h.is_active } })}>
                                                            {h.is_active ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            {/* HABIT MODAL (Sleek Scientific Redesign) */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-4xl bg-black/95 border-zinc-800 backdrop-blur-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
                    <DialogHeader className="p-6 border-b border-white/5 sticky top-0 bg-black/95 z-10">
                        <DialogTitle className="font-mono uppercase tracking-widest text-emerald-500 flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                <span>{editingHabit ? 'Configure Habit Protocol' : 'Initialize New Habit'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Label className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Status</Label>
                                <Switch checked={habitForm.is_active} onCheckedChange={c => setHabitForm({ ...habitForm, is_active: c })} />
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleHabitSubmit} className="grid grid-cols-12 min-h-[600px]">

                        {/* LEFT: Context & Identity (4 Cols) */}
                        <div className="col-span-12 md:col-span-4 border-r border-white/5 p-6 space-y-8 bg-white/[0.02]">
                            {/* Name Input (No Emoji) */}
                            <div className="space-y-4">
                                <Label className="text-[9px] uppercase text-zinc-500 tracking-widest">Identity</Label>
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <Input value={habitForm.name || ''} onChange={e => setHabitForm({ ...habitForm, name: e.target.value })} className="h-12 bg-transparent border-white/10 focus:border-emerald-500/50 font-bold text-lg px-4" placeholder="Habit Name" />
                                    </div>
                                </div>
                            </div>

                            {/* Protocol Context */}
                            <div className="space-y-3">
                                <Label className="text-[9px] uppercase text-zinc-500 tracking-widest">Protocol Assignment</Label>
                                <Select value={habitForm.protocol_id || 'none'} onValueChange={(val) => setHabitForm({ ...habitForm, protocol_id: val === 'none' ? undefined : val })}>
                                    <SelectTrigger className="h-10 bg-white/5 border-white/10 text-xs text-zinc-300"><SelectValue placeholder="Standalone" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No Protocol (Standalone)</SelectItem>
                                        {protocols?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Scheduling */}
                            <div className="space-y-4">
                                <Label className="text-[9px] uppercase text-zinc-500 tracking-widest">Temporal Architecture</Label>

                                {/* Time of Day */}
                                <div className="grid grid-cols-2 gap-2">
                                    {['morning', 'afternoon', 'evening', 'all_day'].map((t: any) => (
                                        <div key={t}
                                            onClick={() => setHabitForm({ ...habitForm, time_of_day: t })}
                                            className={cn("cursor-pointer border rounded-lg p-2 text-center transition-all", habitForm.time_of_day === t ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-600")}
                                        >
                                            <div className="text-[9px] uppercase font-bold">{t === 'all_day' ? 'Anytime' : t}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Duration (Smart Selector) */}
                                <div className="space-y-3 pt-2">
                                    <div className="flex justify-between text-[9px] text-zinc-500 uppercase"><span>Duration</span> <span className="text-white font-mono">{habitForm.duration}m</span></div>
                                    <div className="flex gap-1 mb-2">
                                        {[5, 15, 30, 45, 60, 90].map(m => (
                                            <button type="button" key={m} onClick={() => setHabitForm({ ...habitForm, duration: m })}
                                                className={cn("flex-1 h-6 rounded text-[9px] font-mono transition-all border",
                                                    habitForm.duration === m ? "bg-white text-black border-white font-bold" : "bg-transparent text-zinc-600 border-zinc-800 hover:border-zinc-600"
                                                )}
                                            >
                                                {m}m
                                            </button>
                                        ))}
                                    </div>
                                    <Input type="range" min="1" max="180" step="5" value={habitForm.duration || 15} onChange={e => setHabitForm({ ...habitForm, duration: parseInt(e.target.value) })} className="h-1 bg-zinc-800 accent-white w-full" />
                                </div>

                                {/* Days */}
                                <div className="flex justify-between gap-1 pt-2">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                                        const isSelected = habitForm.frequency_days?.includes(day);
                                        return (
                                            <div key={day} onClick={() => { const current = habitForm.frequency_days || []; setHabitForm({ ...habitForm, frequency_days: isSelected ? current.filter(d => d !== day) : [...current, day] }); }}
                                                className={cn("w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-mono cursor-pointer transition-all border", isSelected ? "bg-emerald-500 text-black border-emerald-500 font-bold" : "bg-transparent text-zinc-600 border-zinc-800 hover:border-zinc-600")}
                                            >
                                                {day.charAt(0)}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Science & Metrics (8 Cols) */}
                        <div className="col-span-12 md:col-span-8 p-8 space-y-8">

                            {/* Neuro-Chemistry (Compact Grid) */}
                            <div className="space-y-4">
                                <Label className="text-[9px] uppercase text-emerald-500 tracking-widest font-bold flex items-center gap-2 mb-4"><Zap className="h-3 w-3" /> Neuro-Chemistry</Label>

                                <div className="relative border-l border-white/5 space-y-2">
                                    <MolecularStreamSelector
                                        label="Primary"
                                        value={habitForm.primary_driver}
                                        onChange={(val) => setHabitForm({ ...habitForm, primary_driver: val as any })}
                                    />

                                    <div className="h-px bg-white/5 w-full" />

                                    <MolecularStreamSelector
                                        label="Secondary"
                                        value={habitForm.secondary_driver as string}
                                        onChange={(val) => setHabitForm({ ...habitForm, secondary_driver: val })}
                                    />
                                </div>
                            </div>

                            {/* Autonomic State (Gradient Slider) */}
                            <div className="space-y-6 bg-white/[0.02] rounded-xl p-6 border border-white/5">
                                <div className="flex justify-between items-end">
                                    <Label className="text-[9px] uppercase text-zinc-500 tracking-widest">Autonomic Impact</Label>
                                    <div className={cn("text-xs font-mono font-bold", (habitForm.state || 0) > 0 ? "text-blue-400" : (habitForm.state || 0) < 0 ? "text-orange-400" : "text-zinc-500")}>
                                        {(habitForm.state || 0) > 0 ? 'Parasympathetic (Rest)' : (habitForm.state || 0) < 0 ? 'Sympathetic (Action)' : 'Neutral'}
                                    </div>
                                </div>

                                <div className="relative h-12 flex items-center">
                                    {/* Gradient Track */}
                                    <div className="absolute left-0 right-0 h-4 rounded-full bg-gradient-to-r from-orange-900/50 via-zinc-800 to-blue-900/50 border border-white/5 overflow-hidden">
                                        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/20" /> {/* Center Marker */}
                                        <div className="absolute top-0 bottom-0 left-0 w-[10%] bg-orange-500/20 blur-xl" />
                                        <div className="absolute top-0 bottom-0 right-0 w-[10%] bg-blue-500/20 blur-xl" />
                                    </div>

                                    {/* Slider Input overlay */}
                                    <Input
                                        type="range" min="-5" max="5" step="1"
                                        value={habitForm.state || 0}
                                        onChange={e => setHabitForm({ ...habitForm, state: parseInt(e.target.value) })}
                                        className="relative z-10 w-full h-8 opacity-0 cursor-pointer"
                                    />

                                    {/* Custom Thumb/Indicator (Visual only, positioned by value) */}
                                    <div
                                        className="absolute h-8 w-8 bg-black border-2 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shadow-xl pointer-events-none z-0"
                                        style={{
                                            left: `calc(${((habitForm.state || 0) + 5) * 10}% - 16px)`, // Map -5..5 to 0..100%
                                            borderColor: (habitForm.state || 0) > 0 ? '#60a5fa' : (habitForm.state || 0) < 0 ? '#fb923c' : '#71717a',
                                            color: (habitForm.state || 0) > 0 ? '#60a5fa' : (habitForm.state || 0) < 0 ? '#fb923c' : '#71717a'
                                        }}
                                    >
                                        {(habitForm.state || 0) > 0 ? '+' : ''}{habitForm.state}
                                    </div>
                                </div>
                                <div className="flex justify-between text-[9px] text-zinc-600 uppercase font-mono">
                                    <span>High Alert (-5)</span>
                                    <span>Deep Rest (+5)</span>
                                </div>
                            </div>

                            {/* Vector & Friction */}
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <Label className="text-[9px] uppercase text-zinc-500 tracking-widest">Vector</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Cognitive', 'Metabolic', 'Musculoskeletal', 'Social', 'Circadian', 'Thermal'].map(v => (
                                            <div key={v} onClick={() => setHabitForm({ ...habitForm, vector: v as any })}
                                                className={cn("cursor-pointer text-center text-[9px] uppercase p-2 border rounded transition-all", habitForm.vector === v ? "bg-white/10 border-white/30 text-white" : "border-transparent text-zinc-600 hover:text-zinc-400")}
                                            >
                                                {v}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-[9px] text-zinc-500 uppercase"><span>Friction Cost</span> <span className="text-white font-mono">{habitForm.friction}</span></div>
                                    <Input type="range" min="1" max="10" value={habitForm.friction || 5} onChange={e => setHabitForm({ ...habitForm, friction: parseInt(e.target.value) })} className="h-1 bg-zinc-800 accent-white" />
                                    <p className="text-xs text-zinc-500 leading-relaxed mt-2">
                                        Estimate the cognitive or physical effort required to initiate this protocol. Used for load calculations. Higher friction = harder to start.
                                    </p>
                                </div>
                            </div>

                            <div className="h-px bg-white/5" />

                            <div className="flex justify-end gap-4 pt-4">
                                {editingHabit && <Button type="button" variant="ghost" className="text-red-500 hover:text-red-400/90 text-xs" onClick={(e) => { e.preventDefault(); deleteHabitMutation.mutate(editingHabit.id); setIsCreateOpen(false); }}>Delete Habit</Button>}
                                <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)} className="text-zinc-500">Cancel</Button>
                                <Button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold uppercase tracking-widest text-xs px-8 h-10">Save Habit</Button>
                            </div>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* PROTOCOL MODAL (Parity Logic) */}
            <Dialog open={isEditProtocolOpen} onOpenChange={setIsEditProtocolOpen}>
                <DialogContent className="sm:max-w-4xl bg-black/95 border-zinc-800 backdrop-blur-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
                    <DialogHeader className="p-6 border-b border-white/5 sticky top-0 bg-black/95 z-10">
                        <DialogTitle className="font-mono uppercase tracking-widest text-emerald-500 flex justify-between items-center text-sm">
                            <span>{editingProtocol ? 'Protocol Design' : 'New Protocol'}</span>
                            <div className="flex items-center gap-3">
                                <Label className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Active System</Label>
                                <Switch checked={protocolForm.is_active} onCheckedChange={c => {
                                    setProtocolForm({ ...protocolForm, is_active: c });
                                    if (editingProtocol) {
                                        updateProtocolMutation.mutate({ id: editingProtocol.id, updates: { is_active: c } });
                                        const protocolHabits = habits?.filter(h => h.protocol_id === editingProtocol.id) || [];
                                        protocolHabits.forEach(h => updateHabitMutation.mutate({ id: h.id, updates: { is_active: c } }));
                                        toast.success(`System ${c ? 'Live' : 'Hypoxic'} - ${protocolHabits.length} habits updated.`);
                                    }
                                }} />
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleProtocolSubmit} className="grid grid-cols-12 min-h-[600px]">
                        {/* LEFT: Meta & List */}
                        <div className="col-span-12 md:col-span-5 border-r border-white/5 p-6 space-y-8 bg-white/[0.02]">
                            <div className="space-y-4">
                                <Label className="text-[9px] uppercase text-zinc-500 tracking-widest">Properties</Label>
                                <Input value={protocolForm.name || ''} onChange={e => setProtocolForm({ ...protocolForm, name: e.target.value })} className="h-12 bg-transparent border-white/10 focus:border-emerald-500/50 font-bold text-lg px-4" placeholder="Protocol Name" />
                                <textarea
                                    value={protocolForm.description || ''}
                                    onChange={e => setProtocolForm({ ...protocolForm, description: e.target.value })}
                                    className="flex w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-32 custom-scrollbar resize-none"
                                    placeholder="Description/Manifesto..."
                                />
                            </div>

                            {/* SCHEDULING (V11: Advanced Control) */}
                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <div className="space-y-4">

                                    <div className="space-y-1">
                                        <Label className="text-[9px] uppercase text-zinc-500">Frequency Type</Label>
                                        <Select
                                            value={protocolForm.scheduling_config?.type || 'daily'}
                                            onValueChange={(val: any) => setProtocolForm({
                                                ...protocolForm,
                                                scheduling_config: { ...protocolForm.scheduling_config, type: val }
                                            })}
                                        >
                                            <SelectTrigger className="h-8 bg-black/40 border-white/10 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-zinc-800">
                                                <SelectItem value="daily">Daily Schedule</SelectItem>
                                                <SelectItem value="weekly">Weekly Schedule</SelectItem>
                                                <SelectItem value="monthly">Monthly (Specific Date)</SelectItem>
                                                <SelectItem value="monthly_relative">Monthly (Relative)</SelectItem>
                                                <SelectItem value="interval">Interval (Every X days)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* CONDITIONAL INPUTS */}
                                    {(protocolForm.scheduling_config?.type === 'daily') && (
                                        <div className="space-y-1">
                                            <Label className="text-[9px] uppercase text-zinc-500">Repetition</Label>
                                            <div className="h-8 bg-black/40 border border-emerald-500/20 rounded flex items-center px-3 text-xs text-emerald-500/80 font-mono">
                                                Every Day (Mon-Sun)
                                            </div>
                                        </div>
                                    )}

                                    {(protocolForm.scheduling_config?.type === 'interval') && (
                                        <div className="space-y-1">
                                            <Label className="text-[9px] uppercase text-zinc-500">Every (Days)</Label>
                                            <Input
                                                type="number"
                                                className="h-8 bg-black/40 border-white/10 text-xs"
                                                placeholder="e.g. 3"
                                                value={protocolForm.scheduling_config?.interval_days || ''}
                                                onChange={e => setProtocolForm({
                                                    ...protocolForm,
                                                    scheduling_config: { ...protocolForm.scheduling_config, type: 'interval', interval_days: parseInt(e.target.value) }
                                                })}
                                            />
                                        </div>
                                    )}

                                    {(protocolForm.scheduling_config?.type === 'monthly') && (
                                        <div className="space-y-1">
                                            <Label className="text-[9px] uppercase text-zinc-500">Day of Month</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="number"
                                                    className="h-8 bg-black/40 border-white/10 text-xs w-20"
                                                    placeholder="1"
                                                    min={1} max={31}
                                                    value={protocolForm.scheduling_config?.days_of_month?.[0] || ''}
                                                    onChange={e => setProtocolForm({
                                                        ...protocolForm,
                                                        scheduling_config: { ...protocolForm.scheduling_config, type: 'monthly', days_of_month: [parseInt(e.target.value)] }
                                                    })}
                                                />
                                                <div className="flex items-center text-[10px] text-zinc-500 italic">Day 1-31</div>
                                            </div>
                                        </div>
                                    )}

                                    {(protocolForm.scheduling_config?.type === 'monthly_relative') && (
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <Label className="text-[9px] uppercase text-zinc-500">Week</Label>
                                                <Select
                                                    value={protocolForm.scheduling_config?.week_num?.toString() || '1'}
                                                    onValueChange={v => setProtocolForm({
                                                        ...protocolForm,
                                                        // @ts-ignore
                                                        scheduling_config: { ...protocolForm.scheduling_config, type: 'monthly_relative', week_num: parseInt(v) }
                                                    })}
                                                >
                                                    <SelectTrigger className="h-8 bg-black/40 border-white/10 text-xs"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="1">1st Week</SelectItem>
                                                        <SelectItem value="2">2nd Week</SelectItem>
                                                        <SelectItem value="3">3rd Week</SelectItem>
                                                        <SelectItem value="4">4th Week</SelectItem>
                                                        <SelectItem value="-1">Last Week</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[9px] uppercase text-zinc-500">Day</Label>
                                                <Select
                                                    value={protocolForm.scheduling_config?.weekday || 'Mon'}
                                                    onValueChange={v => setProtocolForm({
                                                        ...protocolForm,
                                                        // @ts-ignore
                                                        scheduling_config: { ...protocolForm.scheduling_config, type: 'monthly_relative', weekday: v }
                                                    })}
                                                >
                                                    <SelectTrigger className="h-8 bg-black/40 border-white/10 text-xs"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* DAY SELECTOR (Only for Weekly) */}
                                {protocolForm.scheduling_config?.type === 'weekly' && (
                                    <div className="flex justify-between gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                                            const isActive = (protocolForm.scheduling_config?.days || []).includes(day);
                                            return (
                                                <button
                                                    key={day}
                                                    type="button"
                                                    onClick={() => {
                                                        const currentDays = protocolForm.scheduling_config?.days || [];
                                                        const newDays = currentDays.includes(day)
                                                            ? currentDays.filter(d => d !== day)
                                                            : [...currentDays, day];
                                                        setProtocolForm({
                                                            ...protocolForm,
                                                            scheduling_config: {
                                                                ...protocolForm.scheduling_config,
                                                                type: 'weekly',
                                                                days: newDays
                                                            }
                                                        });
                                                    }}
                                                    className={cn(
                                                        "text-[10px] w-8 h-8 rounded flex items-center justify-center transition-all font-medium",
                                                        isActive ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50" : "text-zinc-600 hover:text-zinc-400"
                                                    )}
                                                >
                                                    {day.charAt(0)}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* HABIT LIST INSIDE PROTOCOL (Smart Management) */}
                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <div className="flex justify-between items-center">
                                    <Label className="text-[9px] uppercase text-zinc-500 tracking-widest">Contained Habits</Label>
                                    <div className="flex gap-2">
                                        {/* SMART ADD: Create New or Link Existing */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button type="button" size="sm" variant="ghost" className="text-[10px] h-6 text-emerald-500 hover:text-emerald-400">
                                                    <Plus className="h-3 w-3 mr-1" /> Add Habit
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="bg-black/95 border-emerald-500/20">
                                                <DropdownMenuItem onClick={() => { setTargetProtocolId(editingProtocol?.id); setIsCreateOpen(true); }}>
                                                    <Plus className="h-3 w-3 mr-2" /> Create New
                                                </DropdownMenuItem>
                                                <DropdownMenuLabel className="text-[9px] uppercase text-zinc-600">Link Existing (Standalone)</DropdownMenuLabel>
                                                {habits?.filter(h => !h.protocol_id).map(h => (
                                                    <DropdownMenuItem key={h.id} onClick={() => { updateHabitMutation.mutate({ id: h.id, updates: { protocol_id: editingProtocol?.id } }); toast.success("Habit Linked"); }}>
                                                        <Link2 className="h-3 w-3 mr-2 text-zinc-500" /> {h.name}
                                                    </DropdownMenuItem>
                                                ))}
                                                {!habits?.filter(h => !h.protocol_id).length && <div className="p-2 text-[9px] text-zinc-600 italic">No standalone habits avail.</div>}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                <div className="space-y-2 h-[260px] overflow-y-auto pr-2 custom-scrollbar bg-black/20 rounded-lg p-1">
                                    {habits?.filter(h => h.protocol_id === editingProtocol?.id).map(h => (
                                        <div key={h.id} className="group p-3 rounded border border-white/5 bg-white/5 hover:border-emerald-500/30 transition-all flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <div className="text-sm font-bold text-zinc-300">{h.name}</div>
                                                    <div className="flex gap-2 text-[9px] text-zinc-500">
                                                        <span>{h.primary_driver} {h.secondary_driver && `+ ${h.secondary_driver}`}</span>
                                                        {h.state !== 0 && <span className={h.state > 0 ? "text-blue-500" : "text-orange-500"}>{h.state > 0 ? `REST +${h.state}` : `ACTIB ${h.state}`}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button type="button" size="icon" variant="ghost" className="h-6 w-6 text-zinc-500 hover:text-white" onClick={() => { setEditingHabit(h); setIsCreateOpen(true); }}>
                                                    <Edit2 className="h-3 w-3" />
                                                </Button>
                                                <Button type="button" size="icon" variant="ghost" className="h-6 w-6 text-zinc-500 hover:text-red-500" onClick={() => updateHabitMutation.mutate({ id: h.id, updates: { protocol_id: null } })}>
                                                    <div className="relative">
                                                        <Link2 className="h-3 w-3" />
                                                        <div className="absolute top-[50%] left-0 w-full h-[1px] bg-red-500 rotate-45" />
                                                    </div>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {(!habits?.some(h => h.protocol_id === editingProtocol?.id) && editingProtocol) && (
                                        <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
                                            <div className="text-zinc-600 text-xs italic mb-2">System Empty</div>
                                            <div className="text-[10px] text-zinc-700">Add habits to calculate stats.</div>
                                        </div>
                                    )}
                                    {!editingProtocol && <div className="text-center py-12 text-xs text-zinc-600 italic">Save protocol to unlock habit management.</div>}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Dynamic Stats Dashboard (V6) */}
                        <div className="col-span-12 md:col-span-7 p-8 space-y-8 bg-black/20">
                            {(() => {
                                // DYNAMIC AGGREGATION
                                const protocolHabits = habits?.filter(h => h.protocol_id === editingProtocol?.id) || [];
                                const netState = protocolHabits.reduce((acc, h) => acc + (h.state || 0), 0);
                                const totalFriction = protocolHabits.reduce((acc, h) => acc + (h.friction || 0), 0);

                                // Dominant Driver
                                const driverCounts: Record<string, number> = {};
                                protocolHabits.forEach(h => { driverCounts[h.primary_driver] = (driverCounts[h.primary_driver] || 0) + 1; });
                                const domDriver = Object.entries(driverCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Balanced';

                                return (
                                    <>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-mono font-bold text-white flex items-center gap-2">
                                                    <Activity className="h-5 w-5 text-emerald-500" /> System Diagnostics
                                                </h3>
                                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Live Calculation</p>
                                            </div>
                                            {/* Date Logic Moved to Left Column */}
                                        </div>

                                        {/* STATS GRID */}
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Net State */}
                                            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col justify-between h-[100px]">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-[9px] uppercase text-zinc-500 tracking-widest">Net State Impact</span>
                                                    <Thermometer className={cn("h-4 w-4", netState > 0 ? "text-blue-500" : netState < 0 ? "text-orange-500" : "text-zinc-500")} />
                                                </div>
                                                <div className="flex items-end gap-2">
                                                    <span className={cn("text-3xl font-mono font-bold", netState > 0 ? "text-blue-400" : netState < 0 ? "text-orange-400" : "text-zinc-400")}>
                                                        {netState > 0 ? '+' : ''}{netState}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-500 mb-1">{netState > 0 ? 'Parasympathetic Bias' : netState < 0 ? 'Sympathetic Bias' : 'Neutral'}</span>
                                                </div>
                                            </div>

                                            {/* Friction Load */}
                                            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col justify-between h-[100px]">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-[9px] uppercase text-zinc-500 tracking-widest">Total Friction</span>
                                                    <Zap className="h-4 w-4 text-emerald-500" />
                                                </div>
                                                <div className="flex items-end gap-2">
                                                    <span className="text-3xl font-mono font-bold text-white">{totalFriction}</span>
                                                    <div className="h-2 flex-1 bg-zinc-800 rounded-full mb-2 overflow-hidden">
                                                        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${Math.min(100, (totalFriction / 50) * 100)}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* INSIGHTS */}
                                        <div className="p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
                                            <Label className="text-[9px] uppercase text-emerald-600 tracking-widest font-bold">AI Neuro-Analysis</Label>
                                            <div className="text-sm text-emerald-100/80 leading-relaxed font-mono">
                                                {protocolHabits.length === 0 ? "System inactive. Add protocols to initialize analysis." : (
                                                    <>
                                                        Protocol exhibits a <span className="text-white font-bold">{domDriver}</span> dominance with {netState > 0 ? "restorative" : "activating"} properties.
                                                        Recommended for {netState < 0 ? "morning/performance" : "evening/recovery"} windows.
                                                        {totalFriction > 20 && " High friction load detected - ensure adequate readiness."}
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                    </>
                                );
                            })()}
                        </div>

                        {/* FOOTER ACTION BAR */}
                        <div className="col-span-12 bg-black/40 backdrop-blur-md p-6 flex justify-end items-center z-20 mt-auto sticky bottom-0">
                            <div className="flex gap-4">
                                <Button type="button" variant="ghost" onClick={() => setIsEditProtocolOpen(false)} className="text-zinc-500 hover:text-white">Cancel</Button>
                                <Button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-widest text-xs px-8 h-10 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                    {editingProtocol ? 'Save System' : 'Create System'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>



            {/* LIBRARY MODAL (V7.2 Split Layout) */}
            <Dialog open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
                <DialogContent className="sm:max-w-4xl bg-black/95 border-emerald-500/20 backdrop-blur-xl h-[85vh] p-0 flex flex-col overflow-hidden">
                    <DialogHeader className="p-6 pb-2 border-b border-white/5 flex-shrink-0 flex flex-row justify-between items-center">
                        <DialogTitle className="font-mono uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                            <BookOpen className="h-5 w-5" /> Protocol Library
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-1 overflow-hidden">
                        {/* LEFT: Grid & Filters */}
                        <div className="w-[60%] flex flex-col border-r border-white/5 p-6 overflow-hidden">
                            {/* Filters */}
                            <div className="flex gap-2 bg-white/5 p-2 rounded-lg mb-4 flex-shrink-0">
                                <Select value={libraryFilters.driver} onValueChange={v => setLibraryFilters(prev => ({ ...prev, driver: v }))}>
                                    <SelectTrigger className="h-8 text-[10px] bg-black/40 border-white/10 w-[120px]"><SelectValue placeholder="Driver" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Drivers</SelectItem>
                                        {['Dopamine', 'Serotonin', 'Cortisol', 'Endorphin', 'GABA', 'Oxytocin'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Select value={libraryFilters.state} onValueChange={v => setLibraryFilters(prev => ({ ...prev, state: v }))}>
                                    <SelectTrigger className="h-8 text-[10px] bg-black/40 border-white/10 w-[120px]"><SelectValue placeholder="Impact" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Impacts</SelectItem>
                                        <SelectItem value="Rest">Restorative (+)</SelectItem>
                                        <SelectItem value="Action">Activation (-)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <ScrollArea className="flex-1 pr-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-10">
                                    {PROTOCOL_BUNDLES.filter(b => {
                                        // Hide Already Imported
                                        if (protocols?.some(p => p.name === b.name)) return false;

                                        const firstHabit = HABIT_Biblio.find(h => h.name === b.habits[0]);
                                        if (!firstHabit) return true;
                                        const hState = (firstHabit as any).impact_score > 5 ? 'Rest' : 'Action';
                                        const hDriver = (firstHabit as any).reward_pathway ? capitalize((firstHabit as any).reward_pathway.split('_')[0]) : 'Dopamine';
                                        if (libraryFilters.driver !== 'All' && hDriver !== libraryFilters.driver) return false;
                                        if (libraryFilters.state !== 'All' && hState !== libraryFilters.state) return false;
                                        return true;
                                    }).sort((a, b) => {
                                        const getScore = (bundle: typeof PROTOCOL_BUNDLES[0]) => {
                                            const firstHabit = HABIT_Biblio.find(h => h.name === bundle.habits[0]);
                                            const hStateVal = (firstHabit as any).impact_score > 5 ? 2 : -2;
                                            const needed = metrics.netState < -5 ? 1 : metrics.netState > 5 ? -1 : 0;
                                            if (needed === 1 && hStateVal > 0) return 10;
                                            if (needed === -1 && hStateVal < 0) return 10;
                                            return 0;
                                        };
                                        return getScore(b) - getScore(a);
                                    }).map(bundle => {
                                        const firstHabit = HABIT_Biblio.find(h => h.name === bundle.habits[0]);
                                        const hStateVal = (firstHabit as any).impact_score > 5 ? 1 : -1;
                                        const isRecommended = (metrics.netState < -5 && hStateVal > 0) || (metrics.netState > 5 && hStateVal < 0);

                                        return (
                                            <div key={bundle.id}
                                                onClick={() => {
                                                    if (selectedBundleIds.includes(bundle.id)) {
                                                        setSelectedBundleIds(prev => prev.filter(id => id !== bundle.id));
                                                    } else {
                                                        setSelectedBundleIds(prev => [...prev, bundle.id]);
                                                    }
                                                }}
                                                className={cn("p-3 rounded-lg border bg-white/5 transition-colors flex flex-col justify-between h-[140px] relative overflow-hidden group hover:border-emerald-500/50 cursor-pointer select-none",
                                                    selectedBundleIds.includes(bundle.id) ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]" : isRecommended ? "border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "border-white/10")}>

                                                {isRecommended && !selectedBundleIds.includes(bundle.id) && <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[9px] font-bold px-2 py-0.5 rounded-bl">RECOMMENDED</div>}
                                                {selectedBundleIds.includes(bundle.id) && <div className="absolute top-2 right-2"><CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-500/20" /></div>}
                                                <div>
                                                    <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                                                        {bundle.name}
                                                    </h3>
                                                    <p className="text-[10px] text-zinc-400 mb-3 leading-relaxed line-clamp-2">{bundle.description}</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {bundle.habits.slice(0, 2).map(h => (
                                                            <Badge key={h} variant="secondary" className="text-[9px] bg-black/50 text-zinc-500 border-none">{h.split('(')[0]}</Badge>
                                                        ))}
                                                        {bundle.habits.length > 2 && <Badge variant="secondary" className="text-[9px] bg-black/50 text-zinc-500 border-none">+{bundle.habits.length - 2} more</Badge>}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* RIGHT: Simulation Deck (Visualizer) */}
                        <div className="w-[40%] bg-white/[0.02] flex flex-col border-l border-white/5 p-6 h-full">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2 flex-shrink-0">
                                <Activity className="h-4 w-4" /> Simulation Deck
                            </h3>

                            <ScrollArea className="flex-1 pr-4 -mr-2">
                                <div className="space-y-8 pb-4">
                                    {/* RADAR CHART COMPARISON */}
                                    <div className="aspect-square w-full relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                                                { subject: 'Recovery', A: metrics.vectorBalance.Sleep, B: metrics.simulated?.vectorBalance.Sleep || 0, fullMark: 10 },
                                                { subject: 'Physiology', A: metrics.vectorBalance.Body, B: metrics.simulated?.vectorBalance.Body || 0, fullMark: 10 },
                                                { subject: 'Cognition', A: metrics.vectorBalance.Mind, B: metrics.simulated?.vectorBalance.Mind || 0, fullMark: 10 },
                                                { subject: 'Drive', A: metrics.vectorBalance.Spirit, B: metrics.simulated?.vectorBalance.Spirit || 0, fullMark: 10 },
                                                { subject: 'Clarity', A: metrics.vectorBalance.Focus, B: metrics.simulated?.vectorBalance.Focus || 0, fullMark: 10 },
                                            ]}>
                                                <PolarGrid stroke="#333" />
                                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 10, fontWeight: 600 }} />
                                                {/* Current State (Ghost) */}
                                                <Radar name="Current" dataKey="A" stroke="#333" fill="#666" fillOpacity={0.2} />
                                                {/* Simulated State (Active) */}
                                                {selectedBundleIds.length > 0 && <Radar name="Projected" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />}
                                            </RadarChart>
                                        </ResponsiveContainer>

                                        {selectedBundleIds.length === 0 && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="text-zinc-600 text-xs font-mono text-center">Select protocols to<br />simulate impact</div>
                                            </div>
                                        )}
                                    </div>

                                    {/* DELTA STATS (Grid Layout) */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* NET STATE */}
                                        <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                                            <div className="text-[9px] uppercase text-zinc-500 mb-1">Net State Shift</div>
                                            <div className="flex items-baseline gap-2">
                                                <div className={cn("text-lg font-mono font-bold", metrics.netState > 0 ? "text-blue-500" : "text-orange-500")}>
                                                    {metrics.netState > 0 ? '+' : ''}{metrics.netState}
                                                </div>
                                                {selectedBundleIds.length > 0 && metrics.simulated && (
                                                    <>
                                                        <ArrowRight className="h-3 w-3 text-zinc-600" />
                                                        <div className={cn("text-lg font-mono font-bold", metrics.simulated.netState > 0 ? "text-blue-400" : "text-orange-400")}>
                                                            {metrics.simulated.netState > 0 ? '+' : ''}{metrics.simulated.netState}
                                                        </div>
                                                        <div className={cn("text-[10px] font-mono", (metrics.simulated.netState - metrics.netState) > 0 ? "text-blue-500" : "text-orange-500")}>
                                                            ({(metrics.simulated.netState - metrics.netState) > 0 ? '+' : ''}{metrics.simulated.netState - metrics.netState})
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* FRICTION */}
                                        <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                                            <div className="text-[9px] uppercase text-zinc-500 mb-1">System Load</div>
                                            <div className="flex items-baseline gap-2">
                                                <div className="text-lg font-mono font-bold text-white">{metrics.totalFriction}</div>
                                                {selectedBundleIds.length > 0 && metrics.simulated && (
                                                    <>
                                                        <ArrowRight className="h-3 w-3 text-zinc-600" />
                                                        <div className="text-lg font-mono font-bold text-white">
                                                            {metrics.simulated.totalFriction}
                                                        </div>
                                                        <div className={cn("text-[10px] font-mono", (metrics.simulated.totalFriction - metrics.totalFriction) > 0 ? "text-red-400" : "text-emerald-400")}>
                                                            ({(metrics.simulated.totalFriction - metrics.totalFriction) > 0 ? '+' : ''}{metrics.simulated.totalFriction - metrics.totalFriction})
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* AUTONOMIC BALANCE */}
                                    {metrics.autonomic && (
                                        <div className="border-t border-white/5 pt-6">
                                            <h4 className="text-[10px] uppercase tracking-widest text-zinc-500 mb-4 flex justify-between">
                                                <span>Autonomic Balance</span>
                                                {selectedBundleIds.length > 0 && metrics.simulated?.autonomic && (
                                                    <span className="text-xs font-mono text-zinc-400">
                                                        Diff: <span className="text-white">{Math.abs((metrics.simulated.autonomic.sympathetic / Math.max(1, metrics.simulated.autonomic.sympathetic + metrics.simulated.autonomic.parasympathetic) * 100) - (metrics.autonomic.sympathetic / Math.max(1, metrics.autonomic.sympathetic + metrics.autonomic.parasympathetic) * 100)).toFixed(0)}%</span>
                                                    </span>
                                                )}
                                            </h4>
                                            <div className="space-y-4">
                                                {[
                                                    { label: 'Current', data: metrics.autonomic },
                                                    ...(selectedBundleIds.length > 0 && metrics.simulated?.autonomic ? [{ label: 'Simulated', data: metrics.simulated.autonomic }] : [])
                                                ].map((set, idx) => {
                                                    const total = set.data.sympathetic + set.data.parasympathetic + set.data.neutral || 1;
                                                    const sym = (set.data.sympathetic / total) * 100;
                                                    const para = (set.data.parasympathetic / total) * 100;

                                                    return (
                                                        <div key={idx} className="space-y-1">
                                                            <div className="flex justify-between text-[9px] text-zinc-500 uppercase">
                                                                <span>{set.label}</span>
                                                                <div className="flex gap-2">
                                                                    <span className="text-orange-400">{sym.toFixed(0)}% Sym</span>
                                                                    <span className="text-zinc-600">/</span>
                                                                    <span className="text-blue-400">{para.toFixed(0)}% Para</span>
                                                                </div>
                                                            </div>
                                                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden flex">
                                                                <div style={{ width: `${sym}%` }} className="bg-orange-500/80 h-full transition-all duration-500" />
                                                                <div className="flex-1 bg-transparent" />
                                                                <div style={{ width: `${para}%` }} className="bg-blue-500/80 h-full transition-all duration-500" />
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* NEUROCHEMICAL PROFILE */}
                                    {metrics.neuroProfile && (
                                        <div className="border-t border-white/5 pt-6">
                                            <h4 className="text-[10px] uppercase tracking-widest text-zinc-500 mb-4 flex justify-between">
                                                <span>Neuro-Chemical Profile</span>
                                                {selectedBundleIds.length > 0 && <span className="text-[9px] text-emerald-500">Optimized</span>}
                                            </h4>
                                            <div className="flex flex-col gap-2">
                                                {/* Show Top 5 Drivers with Delta */}
                                                {metrics.neuroProfile.slice(0, 5).map((n: any) => {
                                                    const simN = metrics.simulated?.neuroProfile?.find((sn: any) => sn.name === n.name);
                                                    const diff = simN ? simN.percent - n.percent : 0;

                                                    return (
                                                        <div key={n.name} className="flex items-center gap-3 text-[9px]">
                                                            <div className="w-20 uppercase text-zinc-500 flex-shrink-0">{n.name}</div>
                                                            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden relative">
                                                                <div className="absolute top-0 left-0 bottom-0 bg-zinc-600" style={{ width: `${n.percent}%` }} />
                                                                {simN && (
                                                                    <div className="absolute top-0 left-0 bottom-0 bg-emerald-500/50" style={{ width: `${simN.percent}%` }} />
                                                                )}
                                                            </div>
                                                            <div className="w-12 text-right font-mono text-zinc-400">
                                                                {selectedBundleIds.length > 0 && simN ? (
                                                                    <span className={cn(diff > 0 ? "text-emerald-500" : "text-zinc-500")}>
                                                                        {diff > 0 ? '+' : ''}{diff.toFixed(0)}%
                                                                    </span>
                                                                ) : (
                                                                    <span>{n.percent}%</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </ScrollArea>

                            {/* BULK ACTION (Sticky Bottom) */}
                            <div className="pt-4 border-t border-white/5 mt-auto flex-shrink-0">
                                <Button
                                    disabled={selectedBundleIds.length === 0}
                                    onClick={() => {
                                        selectedBundleIds.forEach(id => importBundleMutation.mutate(id));
                                        setSelectedBundleIds([]); // Clear selection after import
                                        toast.success(`Imported ${selectedBundleIds.length} protocols.`);
                                    }}
                                    className="w-full h-12 bg-emerald-500 text-black font-bold uppercase tracking-widest hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {selectedBundleIds.length > 0 ? `Import ${selectedBundleIds.length} Protocol${selectedBundleIds.length > 1 ? 's' : ''}` : "Select Protocols"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* DANGER ZONE: Purge */}
            <div className="border-t border-white/5 mt-20 pt-10 pb-10 flex justify-center">
                <div className="text-center space-y-4">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Danger Zone</p>
                    <Button variant="ghost" onClick={() => setIsResetOpen(true)} className="text-red-900 hover:text-red-500 hover:bg-red-500/10 border border-red-900/30">
                        <Trash2 className="h-4 w-4 mr-2" /> Purge All Data
                    </Button>
                </div>
            </div>

            <Dialog open={isResetOpen} onOpenChange={(o) => { setIsResetOpen(o); if (!o) setDeleteConfirmation(''); }}>
                <DialogContent className="sm:max-w-[400px] border-red-500/20 bg-black/95">
                    <DialogHeader><DialogTitle className="text-red-500">PURGE ALL DATA?</DialogTitle></DialogHeader>
                    <div className="text-xs text-zinc-500 mb-4">
                        This will permanently delete ALL habits, protocols, and logs.
                        <br /><br />
                        This action cannot be undone. To confirm, type <span className="text-white font-bold select-all">DELETE</span> below.
                    </div>
                    <Input
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        className="bg-red-500/10 border-red-500/30 text-red-500 font-bold text-center spacing-widest placeholder:text-red-500/30 mb-4"
                        placeholder="Type DELETE"
                    />
                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setIsResetOpen(false)}>Cancel</Button>
                        <Button variant="destructive" disabled={deleteConfirmation !== 'DELETE'} onClick={() => {
                            habitService.purgeAllHabits().then(() => {
                                queryClient.invalidateQueries({ queryKey: ['habits'] });
                                queryClient.invalidateQueries({ queryKey: ['protocols'] });
                                setIsResetOpen(false);
                                toast.success("All data purged.");
                            });
                        }}>
                            Confirm Purge
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

        </div >
    );
}
