import { useState, useMemo } from 'react';
import { StackTemplate, MolecularCompound } from '@/types/supplements';
import { supplementService } from '@/services/supplementService';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Search, Layers, ArrowRight, Check, Beaker, Pill,
    Activity, Brain, Zap, Moon, Heart, Shield, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface StackLibraryGalleryProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId?: string;
}

export function StackLibraryGallery({ open, onOpenChange, userId }: StackLibraryGalleryProps) {
    const [search, setSearch] = useState('');
    const [previewTemplate, setPreviewTemplate] = useState<StackTemplate | null>(null);
    const [selectedStackIds, setSelectedStackIds] = useState<string[]>([]);
    const queryClient = useQueryClient();

    // Fetch Templates
    const { data: templates = [], isLoading } = useQuery<StackTemplate[]>({
        queryKey: ['stackTemplates'],
        queryFn: supplementService.getTemplates
    });

    // Fetch Library (for hydration)
    const { data: library = [] } = useQuery<MolecularCompound[]>({
        queryKey: ['molecularLibrary'],
        queryFn: supplementService.getLibrary
    });

    // Bulk Import Mutation
    const importMutation = useMutation({
        mutationFn: async (templatesToImport: StackTemplate[]) => {
            if (!userId) throw new Error("User not authenticated");
            // Execute in parallel
            await Promise.all(templatesToImport.map(t => supplementService.importTemplate(t, userId)));
        },
        onSuccess: (_, vars) => {
            toast.success(`Imported ${vars.length} Protocol${vars.length > 1 ? 's' : ''}`);
            queryClient.invalidateQueries({ queryKey: ['supplement_stacks'] });
            setSelectedStackIds([]);
            onOpenChange(false);
        },
        onError: (err) => {
            toast.error("Failed to import stacks");
            console.error(err);
        }
    });

    const toggleSelection = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setSelectedStackIds(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const filteredTemplates = useMemo(() => {
        if (!search) return templates;
        return templates.filter(t =>
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.description?.toLowerCase().includes(search.toLowerCase()) ||
            t.benefits?.some(b => b.toLowerCase().includes(search.toLowerCase()))
        );
    }, [templates, search]);

    // Icon helper
    const getStackIcon = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('sleep')) return <Moon className="w-5 h-5 text-indigo-400" />;
        if (n.includes('focus') || n.includes('brain') || n.includes('god')) return <Brain className="w-5 h-5 text-cyan-400" />;
        if (n.includes('energy') || n.includes('fire') || n.includes('endurance')) return <Zap className="w-5 h-5 text-yellow-400" />;
        if (n.includes('hypertrophy') || n.includes('pump')) return <Activity className="w-5 h-5 text-red-400" />;
        if (n.includes('immune') || n.includes('repair')) return <Shield className="w-5 h-5 text-emerald-400" />;
        if (n.includes('foundation') || n.includes('hormonal')) return <Heart className="w-5 h-5 text-rose-400" />;
        return <Layers className="w-5 h-5 text-zinc-400" />;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0 bg-zinc-950 border-white/10 overflow-hidden text-zinc-100">

                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-zinc-900/50 backdrop-blur-xl">
                    <DialogTitle className="text-xl font-bold flex items-center gap-3">
                        <Beaker className="w-5 h-5 text-emerald-400" />
                        Molecular Library
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500 font-mono text-xs mt-1">
                        Browse and import scientifically verified supplement protocols.
                    </DialogDescription>

                    <div className="relative mt-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search stacks by name, benefit, or goal..."
                            className="bg-zinc-900/50 border-white/10 pl-9 h-9 text-xs font-mono focus:border-emerald-500/50 focus:ring-emerald-500/20"
                        />
                    </div>
                </div>

                {/* Content Grid */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left: List */}
                    <ScrollArea className="flex-1 border-r border-white/5 bg-black/20">
                        <div className="p-4 grid grid-cols-2 gap-3">
                            {filteredTemplates.map(template => {
                                const isSelected = selectedStackIds.includes(template.id);
                                const isPreview = previewTemplate?.id === template.id;

                                return (
                                    <button
                                        key={template.id}
                                        onClick={() => setPreviewTemplate(template)}
                                        className={cn(
                                            "flex flex-col items-start text-left p-4 rounded-lg border transition-all duration-200 group relative overflow-hidden",
                                            isPreview
                                                ? "bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/20"
                                                : "bg-zinc-900/40 border-white/5 hover:bg-zinc-900/60 hover:border-white/10"
                                        )}
                                    >
                                        {/* Selection Checkbox Overlay */}
                                        <div
                                            onClick={(e) => toggleSelection(e, template.id)}
                                            className={cn("absolute top-3 right-3 w-5 h-5 rounded border flex items-center justify-center transition-all z-20",
                                                isSelected ? "bg-emerald-500 border-emerald-500 text-black" : "border-white/20 bg-black/40 hover:border-white/40"
                                            )}
                                        >
                                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                                        </div>

                                        <div className="flex items-start justify-between w-full mb-3">
                                            <div className="p-2 rounded-md bg-zinc-950 border border-white/5 group-hover:border-white/10 transition-colors">
                                                {getStackIcon(template.name)}
                                            </div>
                                            {template.benefits && (
                                                <div className="flex flex-wrap gap-1 justify-end max-w-[60%] pt-1 pr-6">
                                                    {template.benefits.slice(0, 2).map(b => (
                                                        <span key={b} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-zinc-400">
                                                            {b}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <h3 className={cn(
                                            "font-bold text-sm tracking-tight mb-1 font-mono transition-colors",
                                            isPreview ? "text-emerald-300" : "text-zinc-200 group-hover:text-white"
                                        )}>
                                            {template.name}
                                        </h3>
                                        <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed">
                                            {template.description}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </ScrollArea>

                    {/* Right: Details */}
                    <div className="w-[400px] flex flex-col bg-zinc-900/30">
                        {previewTemplate ? (
                            <div className="flex flex-col h-full">
                                <div className="p-6 border-b border-white/5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                            {getStackIcon(previewTemplate.name)}
                                        </div>
                                        <div>
                                            <h2 className="font-bold text-base text-white font-mono">{previewTemplate.name}</h2>
                                            <div className="flex gap-2 mt-1.5">
                                                {previewTemplate.benefits?.map(b => (
                                                    <span key={b} className="text-[10px] px-1.5 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                                                        {b}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                                        {previewTemplate.description}
                                    </p>
                                </div>

                                <ScrollArea className="flex-1 p-6">
                                    <h4 className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest mb-4">
                                        Stack Composition ({previewTemplate.compounds?.length || 0})
                                    </h4>
                                    <div className="space-y-3">
                                        {previewTemplate.compounds?.map((comp, i) => {
                                            const libItem = library.find(l => l.id === comp.library_id);
                                            return (
                                                <div key={i} className="group p-3 rounded bg-black/20 border border-white/5 hover:border-white/10 transition-colors">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors">
                                                            {libItem?.name || 'Unknown Compound'}
                                                        </span>
                                                        <span className="text-[10px] font-mono text-emerald-400">
                                                            {comp.dosage_amount}{comp.dosage_unit}
                                                        </span>
                                                    </div>
                                                    <div className="text-[10px] text-zinc-500 font-mono mb-2">
                                                        {libItem?.description || comp.notes}
                                                    </div>
                                                    {comp.notes && comp.notes !== libItem?.description && (
                                                        <div className="text-[9px] px-2 py-1 rounded bg-white/5 text-zinc-400 italic border-l-2 border-zinc-700">
                                                            "{comp.notes}"
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </ScrollArea>

                                <div className="p-6 border-t border-white/5 bg-zinc-950/50">
                                    <Button
                                        className="w-full bg-emerald-500 text-black hover:bg-emerald-400 font-mono uppercase tracking-wider gap-2 font-bold"
                                        onClick={() => {
                                            // Import selected IDs + current preview if selected or if nothing else selected
                                            const idsToImport = selectedStackIds.length > 0 ? selectedStackIds : [previewTemplate.id];
                                            const templatesToImport = templates.filter(t => idsToImport.includes(t.id));
                                            importMutation.mutate(templatesToImport);
                                        }}
                                        disabled={importMutation.isPending}
                                    >
                                        {importMutation.isPending ? (
                                            <Activity className="w-4 h-4 animate-spin" />
                                        ) : selectedStackIds.length > 0 ? (
                                            <Layers className="w-4 h-4" />
                                        ) : (
                                            <ArrowRight className="w-4 h-4" />
                                        )}
                                        {importMutation.isPending
                                            ? 'Importing...'
                                            : selectedStackIds.length > 1
                                                ? `Import ${selectedStackIds.length} Stacks`
                                                : 'Import Protocol'
                                        }
                                    </Button>
                                    <p className="text-[9px] text-center text-zinc-600 mt-3 font-mono">
                                        {selectedStackIds.length > 0 ? 'Bulk import selected protocols.' : 'This will create an editable copy in your stacks.'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 p-8 text-center">
                                <div className="w-16 h-16 rounded-full bg-zinc-900/50 border border-white/5 flex items-center justify-center mb-4">
                                    <Layers className="w-8 h-8 opacity-20" />
                                </div>
                                <h3 className="text-sm font-mono uppercase tracking-widest mb-2">Select a Stack</h3>
                                <p className="text-xs max-w-[200px]">
                                    Choose a template from the library to view its scientific composition.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
