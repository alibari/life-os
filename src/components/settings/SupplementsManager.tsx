import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supplementService } from "@/services/supplementService";
import { Supplement, SupplementPayload, SupplementStack } from "@/types/supplements";
import { Plus, Layers, Beaker, Save, X, Info, Pill, Activity, Zap, Archive, Check, Trash2, RefreshCw, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { StackLibraryGallery } from "./StackLibraryGallery";
import { StackCard } from "./StackCard";
import { cn } from "@/lib/utils";

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function SupplementsManager() {
    const queryClient = useQueryClient();

    // --- STATE ---
    const [isStackModalOpen, setIsStackModalOpen] = useState(false);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const { data: user } = useQuery({ queryKey: ['user'], queryFn: () => supplementService.getUser() });

    const [editingStack, setEditingStack] = useState<SupplementStack | null>(null);
    const [stackForm, setStackForm] = useState({
        name: "", description: "", days: [] as string[], is_active: true,
        type: 'weekly' as 'weekly' | 'cycle' | 'condition',
        cycle_on: 5, cycle_off: 2, start_date: new Date().toISOString().split('T')[0]
    });

    const [isSupModalOpen, setIsSupModalOpen] = useState(false);
    const [editingSup, setEditingSup] = useState<Supplement | null>(null);
    const [targetStackId, setTargetStackId] = useState<string | null>(null);
    const [supForm, setSupForm] = useState<SupplementPayload>({
        name: "", dosage_amount: 0, dosage_unit: "mg", form: "capsule",
        frequency: "daily", time_of_day: "morning", status: "active",
        inventory_count: 0, notes: "", stack_id: null
    });

    const [isResetOpen, setIsResetOpen] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');

    // --- QUERIES ---
    const { data: stacks, isLoading } = useQuery({
        queryKey: ['supplement_stacks'],
        queryFn: supplementService.getStacks
    });

    const { data: library } = useQuery({
        queryKey: ['molecular_library'],
        queryFn: supplementService.getLibrary
    });

    const activeStacks = stacks?.filter(s => s.is_active) || [];
    const inactiveStacks = stacks?.filter(s => !s.is_active) || [];
    const sortedStacks = stacks?.sort((a, b) => (Number(b.is_active) - Number(a.is_active))) || [];

    // --- MUTATIONS ---
    // Stack Mutations
    const createStackMutation = useMutation({
        mutationFn: (data: any) => supplementService.createStack(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['supplement_stacks'] });
            toast.success("New Protocol Stack Initialized");
            setIsStackModalOpen(false);
            resetStackForm();
        }
    });

    const updateStackMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string, updates: any }) => supplementService.updateStack(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['supplement_stacks'] });
            toast.success("Stack Configuration Updated");
            setIsStackModalOpen(false);
            resetStackForm();
        }
    });

    const deleteStackMutation = useMutation({
        mutationFn: supplementService.deleteStack,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['supplement_stacks'] });
            toast.success("Stack Decommissioned");
        }
    });

    // Supplement Mutations
    const createSupMutation = useMutation({
        mutationFn: supplementService.createSupplement,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['supplement_stacks'] });
            toast.success("Compound Added to Stack");
            setIsSupModalOpen(false);
            resetSupForm();
        }
    });

    const updateSupMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string, updates: any }) => supplementService.updateSupplement(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['supplement_stacks'] });
            toast.success("Compound Data Refined");
            setIsSupModalOpen(false);
            resetSupForm();
        }
    });

    const deleteSupMutation = useMutation({
        mutationFn: supplementService.deleteSupplement,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['supplement_stacks'] });
            toast.success("Compound Removed");
        }
    });

    // --- HANDLERS ---
    const resetStackForm = () => {
        setStackForm({
            name: "", description: "", days: DAYS, is_active: true,
            type: 'weekly', cycle_on: 5, cycle_off: 2, start_date: new Date().toISOString().split('T')[0]
        });
        setEditingStack(null);
    };

    const resetSupForm = () => {
        setSupForm({
            name: "", dosage_amount: 100, dosage_unit: "mg", form: "capsule",
            frequency: "daily", time_of_day: "morning", status: "active",
            inventory_count: 0, notes: "", stack_id: null
        });
        setEditingSup(null);
        setTargetStackId(null);
    };

    const openStackModal = (stack?: SupplementStack) => {
        if (stack) {
            setEditingStack(stack);
            setStackForm({
                name: stack.name,
                description: stack.description || "",
                days: stack.scheduling_config?.days || DAYS,
                is_active: stack.is_active,
                // Load Cycle Config or Defaults
                type: stack.scheduling_config?.type || 'weekly',
                cycle_on: stack.scheduling_config?.cycle_on || 5,
                cycle_off: stack.scheduling_config?.cycle_off || 2,
                start_date: stack.scheduling_config?.start_date || new Date().toISOString().split('T')[0]
            });
        } else {
            resetStackForm();
        }
        setIsStackModalOpen(true);
    };

    const openSupModal = (stackId: string | null, sup?: Supplement) => {
        setTargetStackId(stackId);
        if (sup) {
            setEditingSup(sup);
            setSupForm({
                name: sup.name,
                dosage_amount: sup.dosage_amount || 0,
                dosage_unit: sup.dosage_unit || "mg",
                form: sup.form || "capsule",
                frequency: sup.frequency || "daily",
                time_of_day: sup.time_of_day || "morning",
                status: sup.status,
                inventory_count: sup.inventory_count || 0,
                notes: sup.notes || "",
                stack_id: stackId
            });
        } else {
            resetSupForm();
            setSupForm(prev => ({ ...prev, stack_id: stackId }));
        }
        setIsSupModalOpen(true);
    };

    const handleStackSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Construct Scheduling Config based on Type
        let scheduling_config: any = { type: stackForm.type };

        if (stackForm.type === 'weekly') {
            scheduling_config.days = stackForm.days;
        } else if (stackForm.type === 'cycle') {
            scheduling_config.cycle_on = Number(stackForm.cycle_on);
            scheduling_config.cycle_off = Number(stackForm.cycle_off);
            scheduling_config.start_date = stackForm.start_date;
            scheduling_config.days = []; // Empty for cycle
        }

        const payload = {
            name: stackForm.name,
            description: stackForm.description,
            scheduling_config: scheduling_config,
            is_active: stackForm.is_active
        };

        if (editingStack) {
            updateStackMutation.mutate({ id: editingStack.id, updates: payload });
        } else {
            createStackMutation.mutate(payload);
        }
    };

    const handleSupSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingSup) {
            updateSupMutation.mutate({ id: editingSup.id, updates: supForm });
        } else {
            createSupMutation.mutate(supForm);
        }
    };

    const toggleDay = (day: string) => {
        setStackForm(prev => {
            const days = prev.days.includes(day)
                ? prev.days.filter(d => d !== day)
                : [...prev.days, day];
            return { ...prev, days };
        });
    };

    // Library Auto-Fill
    const handleLibrarySelect = (libId: string) => {
        const item = library?.find(l => l.id === libId);
        if (item) {
            setSupForm(prev => ({
                ...prev,
                name: item.name,
                dosage_amount: item.default_dosage_amount || prev.dosage_amount,
                dosage_unit: item.default_dosage_unit || prev.dosage_unit,
                description: item.description // notes
            }));
        }
    };

    return (
        <div className="space-y-12 pb-24 max-w-[1600px] mx-auto">

            {/* 1. MOLECULAR ANALYTICS DASHBOARD */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* ... (Kept existing dashboard cards) ... */}

                {/* CARD 1: MOLECULAR LOAD */}
                <div className="card-surface p-6 border-white/5 bg-zinc-900/20 backdrop-blur-xl relative flex flex-col justify-between h-[200px] overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[60px] rounded-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
                    <div className="flex justify-between items-start z-10">
                        <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 flex items-center gap-2 font-mono">
                            <Pill className="h-3 w-3 text-emerald-500" /> System Load
                        </h3>
                        <div className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Optimal</div>
                    </div>
                    <div className="z-10">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-mono font-bold tracking-tighter text-white">
                                {stacks?.reduce((acc, s) => acc + (s.supplements?.length || 0), 0) || 0}
                            </span>
                            <span className="text-[10px] text-zinc-500 uppercase font-bold">Compounds</span>
                        </div>
                        <div className="h-1 w-full bg-zinc-800 rounded-full mt-3 overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[45%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                        </div>
                        <p className="text-[9px] text-zinc-600 mt-2 font-mono">Total active metabolic agents</p>
                    </div>
                </div>

                {/* CARD 2: PROTOCOL STATUS */}
                <div className="card-surface p-6 border-white/5 bg-zinc-900/20 backdrop-blur-xl relative flex flex-col justify-between h-[200px]">
                    <div className="flex justify-between items-start">
                        <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 flex items-center gap-2 font-mono">
                            <Activity className="h-3 w-3 text-blue-400" /> Active Protocols
                        </h3>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-mono font-bold tracking-tighter text-white">
                                {stacks?.filter(s => s.is_active).length || 0}
                            </span>
                            <span className="text-[10px] text-zinc-500 uppercase font-bold">Stacks Running</span>
                        </div>
                        <div className="flex gap-1 mt-3">
                            {activeStacks.map((s, i) => (
                                <div key={i} className="h-1 flex-1 bg-blue-500 rounded-full opacity-60" />
                            ))}
                            {Array.from({ length: Math.max(0, 3 - activeStacks.length) }).map((_, i) => (
                                <div key={`i-${i}`} className="h-1 flex-1 bg-zinc-800 rounded-full" />
                            ))}
                        </div>
                        <p className="text-[9px] text-zinc-600 mt-2 font-mono">{(stacks?.filter(s => s.is_active).length || 0) > 0 ? "System bio-modulated" : "System baseline"}</p>
                    </div>
                </div>

                {/* CARD 3: BIO-AVAILABILITY */}
                <div className="card-surface p-6 border-white/5 bg-zinc-900/20 backdrop-blur-xl relative flex flex-col justify-between h-[200px]">
                    <div className="flex justify-between items-start">
                        <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 flex items-center gap-2 font-mono">
                            <Zap className="h-3 w-3 text-purple-400" /> Bio-Availability
                        </h3>
                    </div>
                    <div className="relative">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-mono font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">94%</span>
                            <span className="text-[10px] text-zinc-500 uppercase font-bold">Absorption</span>
                        </div>
                        <p className="text-[9px] text-zinc-600 mt-2 font-mono leading-relaxed">Current stack formulation has high estimated bioavailability efficiency.</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center border-b border-white/5 pb-4 mt-8">
                <h2 className="text-lg font-mono font-bold text-white flex items-center gap-2">
                    <Layers className="h-5 w-5 text-emerald-500" /> Molecular Protocols
                </h2>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openSupModal(null)}
                        className="text-zinc-400 hover:text-white font-mono text-xs uppercase tracking-wider border border-white/5 hover:bg-white/5"
                    >
                        <Plus className="w-3 h-3 mr-2" /> Add Compound
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsLibraryOpen(true)}
                        className="text-zinc-400 hover:text-emerald-500 font-mono text-xs uppercase tracking-wider border border-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all"
                    >
                        <Beaker className="w-4 h-4 mr-2" /> Library
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => openStackModal()}
                        className="bg-emerald-500 text-black hover:bg-emerald-400 font-mono text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
                    >
                        <Layers className="w-4 h-4 mr-2" /> New Protocol
                    </Button>
                </div>
            </div>

            {/* 3. UNIFIED STACK LIST (Rows) */}
            <div className="space-y-4">
                <div className="flex flex-col gap-4">
                    {stacks?.sort((a, b) => (Number(b.is_active) - Number(a.is_active))).map((stack, index) => (
                        <StackCard
                            key={stack.id}
                            stack={stack}
                            defaultOpen={index === 0}
                            onEdit={openStackModal}
                            onDelete={(id) => deleteStackMutation.mutate(id)}
                            onAddSupplement={(id) => openSupModal(id)}
                            onEditSupplement={(sup) => {
                                setEditingSup(sup);
                                setTargetStackId(stack.id);
                                openSupModal(stack.id, sup);
                            }}
                            onDeleteSupplement={(id) => deleteSupMutation.mutate(id)}
                            onToggleActive={(id, currentState) => updateStackMutation.mutate({ id, updates: { is_active: !currentState } })}
                        />
                    ))}
                    {(!stacks || stacks.length === 0) && (
                        <div className="py-12 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                            <p className="text-zinc-500 text-sm font-mono">No protocols initialized.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 4. MOLECULAR COMPOUND STREAM (ADVANCED) */}
            <div className="pt-8 border-t border-white/5 space-y-6">
                <h2 className="text-lg font-mono font-bold text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-500" /> Molecular Compound Stream
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {stacks?.flatMap(s => s.supplements?.map(sup => ({ ...sup, _parentStack: s })) || [])
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((sup, idx) => (
                            <AdvancedCompoundCard
                                key={sup.id || idx}
                                supplement={sup}
                                parentStack={sup._parentStack}
                                onEdit={(s) => {
                                    setEditingSup(s);
                                    setTargetStackId(s._parentStack?.id || null);
                                    openSupModal(s._parentStack?.id || '', s);
                                }}
                                onDelete={(id) => deleteSupMutation.mutate(id)}
                            />
                        ))}

                    {stacks?.flatMap(s => s.supplements || []).length === 0 && (
                        <div className="col-span-full py-12 text-center text-zinc-600 text-xs font-mono border border-dashed border-white/10 rounded-xl">
                            System empty. Initialize protocols to view compound stream.
                        </div>
                    )}
                </div>
            </div>

            {/* --- STACK MODAL (Refined Emerald Theme) --- */}
            <Dialog open={isStackModalOpen} onOpenChange={setIsStackModalOpen}>
                <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-mono uppercase tracking-widest text-sm text-emerald-400">
                            {editingStack ? "Configure Stack" : "Initialize Stack"}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleStackSubmit} className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-mono text-zinc-500 uppercase">Stack Designation</Label>
                            <Input
                                value={stackForm.name}
                                onChange={e => setStackForm({ ...stackForm, name: e.target.value })}
                                placeholder="e.g. MORNING PROTOCOL"
                                className="bg-black/50 border-white/10 font-bold font-mono tracking-wide focus:border-emerald-500/50"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-mono text-zinc-500 uppercase">Description / Intent</Label>
                            <Textarea
                                value={stackForm.description}
                                onChange={e => setStackForm({ ...stackForm, description: e.target.value })}
                                placeholder="Primary objective..."
                                className="bg-black/50 border-white/10 h-20 text-xs focus:border-emerald-500/50"
                            />
                        </div>

                        {/* SCHEDULING CONFIG */}
                        <div className="space-y-3 pt-2 border-t border-white/5">
                            <Label className="text-[10px] font-mono text-zinc-500 uppercase">Scheduling Strategy</Label>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <button
                                    type="button"
                                    onClick={() => setStackForm({ ...stackForm, type: 'weekly' })}
                                    className={cn("text-xs font-mono py-2 rounded-lg border transition-all",
                                        stackForm.type === 'weekly' ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" : "bg-black/40 border-white/5 text-zinc-500 hover:bg-white/5"
                                    )}
                                >
                                    Weekly Schedule
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStackForm({ ...stackForm, type: 'cycle' })}
                                    className={cn("text-xs font-mono py-2 rounded-lg border transition-all",
                                        stackForm.type === 'cycle' ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" : "bg-black/40 border-white/5 text-zinc-500 hover:bg-white/5"
                                    )}
                                >
                                    Load / Deload Cycle
                                </button>
                            </div>

                            {stackForm.type === 'weekly' ? (
                                <div className="space-y-2 animate-in fade-in zoom-in-95">
                                    <Label className="text-[10px] font-mono text-zinc-500 uppercase">Active Days</Label>
                                    <div className="flex justify-between gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
                                        {DAYS.map(day => {
                                            const isActive = stackForm.days.includes(day);
                                            return (
                                                <button
                                                    key={day}
                                                    type="button"
                                                    onClick={() => toggleDay(day)}
                                                    className={cn(
                                                        "text-[10px] w-10 h-10 rounded flex items-center justify-center transition-all font-medium",
                                                        isActive
                                                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                                                            : "text-zinc-600 hover:text-zinc-400 hover:bg-white/5"
                                                    )}
                                                >
                                                    {day.slice(0, 3)}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-mono text-zinc-500 uppercase">Load Phase (Days On)</Label>
                                        <Input
                                            type="number"
                                            value={stackForm.cycle_on}
                                            onChange={e => setStackForm({ ...stackForm, cycle_on: parseInt(e.target.value) })}
                                            className="bg-black/50 border-white/10 font-mono focus:border-emerald-500/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-mono text-zinc-500 uppercase">Washout (Days Off)</Label>
                                        <Input
                                            type="number"
                                            value={stackForm.cycle_off}
                                            onChange={e => setStackForm({ ...stackForm, cycle_off: parseInt(e.target.value) })}
                                            className="bg-black/50 border-white/10 font-mono focus:border-emerald-500/50"
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <Label className="text-[10px] font-mono text-zinc-500 uppercase">Cycle Start Date</Label>
                                        <Input
                                            type="date"
                                            value={stackForm.start_date}
                                            onChange={e => setStackForm({ ...stackForm, start_date: e.target.value })}
                                            className="bg-black/50 border-white/10 font-mono focus:border-emerald-500/50"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="ghost" onClick={() => setIsStackModalOpen(false)} className="text-zinc-500 hover:text-white">Cancel</Button>
                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-black font-bold font-mono text-xs uppercase tracking-wider">
                                <Save className="w-3 h-3 mr-2" /> Save Protocol
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ... (Kept existing Supplement Modal, Library, Danger Zone) ... */}
            <Dialog open={isSupModalOpen} onOpenChange={setIsSupModalOpen}>
                <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="font-mono uppercase tracking-widest text-sm text-emerald-400 flex items-center gap-2">
                            <Beaker className="w-4 h-4" />
                            {editingSup ? "Modify Compound" : "Add Compound"}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSupSubmit} className="space-y-5 pt-4">

                        {/* Library Search & Name */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-mono text-zinc-500 uppercase">Compound Name</Label>
                                {/* Quick Search Dropdown */}
                                {!editingSup && (
                                    <Select onValueChange={handleLibrarySelect}>
                                        <SelectTrigger className="h-6 w-[140px] text-[10px] bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                                            <SelectValue placeholder="Quick Lookup" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-950 border-zinc-800 max-h-[200px]">
                                            {library?.map(item => (
                                                <SelectItem key={item.id} value={item.id} className="text-xs">{item.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                            <Input
                                value={supForm.name}
                                onChange={e => setSupForm({ ...supForm, name: e.target.value })}
                                placeholder="Chemical Name"
                                className="bg-black/50 border-white/10 font-bold font-mono tracking-wide focus:border-emerald-500/50"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-mono text-zinc-500 uppercase">Dosage Amount</Label>
                                <Input
                                    type="number"
                                    value={supForm.dosage_amount}
                                    onChange={e => setSupForm({ ...supForm, dosage_amount: parseFloat(e.target.value) })}
                                    className="bg-black/50 border-white/10 font-mono focus:border-emerald-500/50"
                                />
                                {/* Validation Feedback */}
                                {supForm.name && (
                                    <DosageValidator
                                        name={supForm.name}
                                        amount={supForm.dosage_amount || 0}
                                        unit={supForm.dosage_unit || 'mg'}
                                    />
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-mono text-zinc-500 uppercase">Unit</Label>
                                <Select value={supForm.dosage_unit} onValueChange={v => setSupForm({ ...supForm, dosage_unit: v })}>
                                    <SelectTrigger className="bg-black/50 border-white/10 h-10 font-mono text-xs focus:border-emerald-500/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800">
                                        {['mg', 'mcg', 'g', 'IU', 'ml', 'drops', 'sprays', 'capsules'].map(u => (
                                            <SelectItem key={u} value={u}>{u}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-mono text-zinc-500 uppercase">Form Factor</Label>
                                <Select value={supForm.form} onValueChange={v => setSupForm({ ...supForm, form: v })}>
                                    <SelectTrigger className="bg-black/50 border-white/10 h-10 font-mono text-xs focus:border-emerald-500/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800">
                                        {['capsule', 'tablet', 'powder', 'liquid', 'gummy', 'softgel'].map(f => (
                                            <SelectItem key={f} value={f}>{f.toUpperCase()}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-mono text-zinc-500 uppercase">Time of Day</Label>
                                <Select value={supForm.time_of_day} onValueChange={v => setSupForm({ ...supForm, time_of_day: v })}>
                                    <SelectTrigger className="bg-black/50 border-white/10 h-10 font-mono text-xs focus:border-emerald-500/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800">
                                        {['morning', 'afternoon', 'evening', 'bedtime', 'anytime', 'pre-workout', 'post-workout'].map(t => (
                                            <SelectItem key={t} value={t}>{t.replace('-', ' ').toUpperCase()}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-mono text-zinc-500 uppercase">Bio-Mechanism Notes</Label>
                            <Textarea
                                value={supForm.notes}
                                onChange={e => setSupForm({ ...supForm, notes: e.target.value })}
                                placeholder="Effect on physiology..."
                                className="bg-black/50 border-white/10 h-16 text-xs font-mono focus:border-emerald-500/50"
                            />
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button type="button" variant="ghost" onClick={() => setIsSupModalOpen(false)} className="text-zinc-500 hover:text-white mr-2">Cancel</Button>
                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-black font-bold font-mono text-xs uppercase tracking-wider">
                                <Save className="w-3 h-3 mr-2" /> Confirm Component
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>


            {/* --- LIBRARY MODAL --- */}
            <StackLibraryGallery
                open={isLibraryOpen}
                onOpenChange={setIsLibraryOpen}
                userId={stacks?.[0]?.user_id || user?.id}
            />

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
                <DialogContent className="sm:max-w-[400px] border-red-500/20 bg-black/95 text-zinc-100">
                    <DialogHeader><DialogTitle className="text-red-500">PURGE ALL PROTOCOLS?</DialogTitle></DialogHeader>
                    <div className="text-xs text-zinc-500 mb-4">
                        This will permanently delete ALL supplement stacks and compounds.
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
                        <Button variant="ghost" onClick={() => setIsResetOpen(false)} className="text-zinc-500 hover:text-white">Cancel</Button>
                        <Button variant="destructive" disabled={deleteConfirmation !== 'DELETE'} onClick={() => {
                            supplementService.purgeAllStacks().then(() => {
                                queryClient.invalidateQueries({ queryKey: ['supplement_stacks'] });
                                setIsResetOpen(false);
                                toast.success("All stacks purged.");
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

// ----------------------------------------------------------------------
// ADVANCED COMPOUND CARD
// ----------------------------------------------------------------------

function AdvancedCompoundCard({
    supplement,
    parentStack,
    onEdit,
    onDelete
}: {
    supplement: Supplement & { _parentStack?: SupplementStack },
    parentStack?: SupplementStack,
    onEdit: (sup: Supplement & { _parentStack?: SupplementStack }) => void,
    onDelete: (id: string) => void
}) {
    // 1. DETERMINE STATUS
    // Logic: 
    // - If paused manually -> 'paused' (Grey)
    // - If parent stack paused -> 'paused' (Grey)
    // - If active BUT scheduled day is NOT today -> 'standby' (Orange)
    // - If active AND scheduled today -> 'active' (Green)

    const isManuallyPaused = supplement.status === 'paused';
    const isStackPaused = parentStack && !parentStack.is_active;
    const isPaused = isManuallyPaused || isStackPaused;

    // Schedule Check
    let isScheduledToday = true; // Default to true if no schedule info

    if (parentStack?.scheduling_config) {
        const config = parentStack.scheduling_config;
        if (config.type === 'cycle' && config.cycle_on && config.cycle_off && config.start_date) {
            // Cycle Logic
            const start = new Date(config.start_date).getTime();
            const now = new Date().getTime();
            const daysDiff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
            const cycleLen = config.cycle_on + config.cycle_off;
            const position = (daysDiff % cycleLen) + 1;
            isScheduledToday = position <= config.cycle_on;
        } else if (config.days && config.days.length > 0) {
            // Weekly Logic
            const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
            isScheduledToday = config.days.map(d => d.toLowerCase()).includes(today);
        }
    }
    // If standalone, check its own frequency (simplified: assumed daily unless 'as_needed')
    // TODO: Add granularity if needed for standalone items.

    const isStandby = !isPaused && !isScheduledToday;
    const isActive = !isPaused && isScheduledToday;

    // Styles
    const containerStyle = isActive
        ? "bg-emerald-500/[0.03] border-emerald-500/20 hover:bg-emerald-500/[0.05]"
        : isStandby
            ? "bg-amber-500/[0.03] border-amber-500/20 hover:bg-amber-500/[0.05]"
            : "bg-zinc-900/40 border-white/5 hover:bg-white/5 opacity-60"; // Paused

    const statusColor = isActive ? "text-emerald-400" : isStandby ? "text-amber-500" : "text-zinc-500";
    const highlightColor = isActive ? "text-emerald-300" : isStandby ? "text-amber-300" : "text-zinc-400";
    const bgBadge = isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        : isStandby ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
            : "bg-zinc-800 text-zinc-500 border-white/5";

    return (
        <div
            onClick={() => onEdit(supplement)}
            className={cn("relative p-4 rounded-lg border flex flex-col justify-between group transition-all duration-300 overflow-hidden cursor-pointer", containerStyle)}
        >
            {/* Active Glow */}
            {isActive && <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 blur-[40px] pointer-events-none" />}

            <div className="flex justify-between items-start z-10 mb-3">
                <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-md border backdrop-blur-md transition-colors",
                        isActive ? "bg-emerald-500/10 border-emerald-500/30" : "bg-black/40 border-white/5"
                    )}>
                        <Pill className={cn("w-4 h-4", statusColor)} />
                    </div>
                    <div>
                        <div className={cn("font-bold font-mono text-sm leading-none mb-1", highlightColor)}>
                            {supplement.name}
                        </div>
                        <div className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider flex items-center gap-1.5">
                            {parentStack ? (
                                <>
                                    <Layers className="w-2.5 h-2.5" />
                                    {parentStack.name}
                                </>
                            ) : (
                                <span>Standalone</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="flex flex-col items-end gap-1">
                    <div className={cn("text-[9px] px-2 py-0.5 rounded font-mono uppercase font-bold border flex items-center gap-1.5", bgBadge)}>
                        {isActive && <Activity className="w-2.5 h-2.5 animate-pulse" />}
                        {isStandby && <RefreshCw className="w-2.5 h-2.5" />}
                        {isPaused && <Pause className="w-2.5 h-2.5" />}

                        {isActive ? "Bio-Active" : isStandby ? "Standby" : "Paused"}
                    </div>
                    {/* Hover Actions */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4 bg-black/60 backdrop-blur rounded-lg p-1 border border-white/10 flex gap-1 z-20">
                        <div
                            onClick={(e) => { e.stopPropagation(); onDelete(supplement.id); }}
                            className="p-1.5 rounded hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="z-10 grid grid-cols-2 gap-2 mt-auto">
                <div className="bg-black/20 rounded px-2 py-1.5 border border-white/5">
                    <span className="text-[9px] text-zinc-500 uppercase block font-mono">Dosage</span>
                    <span className={cn("text-xs font-mono font-bold", highlightColor)}>
                        {supplement.dosage_amount}{supplement.dosage_unit}
                    </span>
                </div>
                <div className="bg-black/20 rounded px-2 py-1.5 border border-white/5">
                    <span className="text-[9px] text-zinc-500 uppercase block font-mono">Timing</span>
                    <span className="text-xs font-mono text-zinc-300">
                        {supplement.time_of_day?.replace('_', ' ').toUpperCase() || 'ANYTIME'}
                    </span>
                </div>
            </div>
        </div>
    );
}

// Helper Component for Visual Validation
function DosageValidator({ name, amount, unit }: { name: string, amount: number, unit: string }) {
    // Check validation / scientific standard
    const { data: standard } = useQuery({
        queryKey: ['dosage_validate', name],
        queryFn: () => supplementService.validateDosage({
            name,
            dosage_amount: amount,
            dosage_unit: unit,
            id: 'temp',
            user_id: '',
            form: 'capsule',
            frequency: 'daily',
            status: 'active'
        }),
        enabled: !!name && name.length > 2,
        staleTime: 1000 * 60 * 60 * 24 // Cache for 24h
    });

    if (!standard) return null;

    // Logic:
    // If we have a standard, show the Range.
    // If amount is > 0, validate it against range.

    const min = standard.min_effective;
    const max = standard.max_safe;
    const notes = standard.clinical_note;

    let status = 'neutral';
    let message = `Optimal Range: ${min} - ${max} ${standard.unit}`;

    if (amount > 0) {
        if (amount < min) {
            status = 'low';
            message = `Below Optimal (${min} - ${max} ${standard.unit})`;
        } else if (amount > max) {
            status = 'high';
            message = `Above Safety Limit (${max} ${standard.unit})`;
        } else {
            status = 'good';
            message = `Optimal Dosage (${min} - ${max} ${standard.unit})`;
        }
    }

    return (
        <div className="mt-2 text-[10px] font-mono border rounded p-2 flex items-start gap-2 bg-black/40 border-white/5">
            <div className={cn("p-0.5 rounded-full mt-0.5",
                status === 'good' ? "bg-emerald-500/20 text-emerald-400" :
                    status === 'low' ? "bg-amber-500/20 text-amber-500" :
                        status === 'high' ? "bg-red-500/20 text-red-500" :
                            "bg-blue-500/20 text-blue-400"
            )}>
                {status === 'good' ? <Check className="w-3 h-3" /> : <Info className="w-3 h-3" />}
            </div>
            <div>
                <div className={cn("font-bold uppercase mb-0.5",
                    status === 'good' ? "text-emerald-400" :
                        status === 'low' ? "text-amber-500" :
                            status === 'high' ? "text-red-500" :
                                "text-zinc-400"
                )}>
                    {message}
                </div>
                {notes && <div className="text-zinc-500 leading-tight">{notes}</div>}
            </div>
        </div>
    );
}
