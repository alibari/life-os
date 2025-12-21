import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInDays } from "date-fns";
import { FlaskConical, Plus, ArrowRight, TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { metricRepository } from "@/services/repository/MetricRepository";
import { METRIC_REGISTRY } from "@/services/registry/metrics";
import { MetricID } from "@/services/registry/types";
import { cn } from "@/lib/utils";

interface Experiment {
    id: string;
    name: string;
    hypothesis: string;
    start_date: string;
    end_date: string | null;
    status: 'active' | 'completed' | 'cancelled';
    metrics: MetricID[];
}

interface ExperimentImpact {
    metricId: MetricID;
    baseline: number;
    current: number;
    delta: number; // Percent change
}

export function ExperimentLab() {
    const [experiments, setExperiments] = useState<Experiment[]>([]);
    const [impacts, setImpacts] = useState<Record<string, ExperimentImpact[]>>({}); // keyed by experiment ID
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Form State
    const [newName, setNewName] = useState("");
    const [newHypothesis, setNewHypothesis] = useState("");
    const [newMetric, setNewMetric] = useState<MetricID>("sleep_efficiency");

    useEffect(() => {
        fetchExperiments();
    }, []);

    const fetchExperiments = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("experiments")
            .select("*")
            .eq("status", "active")
            .order("start_date", { ascending: false });

        if (error) {
            console.error("Error fetching experiments:", error);
            setLoading(false);
            return;
        }

        setExperiments(data || []);

        // Calculate impacts for each experiment
        const impactMap: Record<string, ExperimentImpact[]> = {};
        for (const exp of (data || [])) {
            impactMap[exp.id] = await calculateImpact(exp);
        }
        setImpacts(impactMap);
        setLoading(false);
    };

    const calculateImpact = async (exp: Experiment): Promise<ExperimentImpact[]> => {
        const results: ExperimentImpact[] = [];
        const startDate = new Date(exp.start_date);
        const endDate = exp.end_date ? new Date(exp.end_date) : new Date(); // Updates live if active

        // Baseline: 14 days before start
        const baselineStart = new Date(startDate);
        baselineStart.setDate(baselineStart.getDate() - 14);
        const baselineEnd = new Date(startDate);
        baselineEnd.setDate(baselineEnd.getDate() - 1);

        for (const metricId of exp.metrics) {
            const baselineAvg = await metricRepository.getAverage(metricId, baselineStart, baselineEnd);
            const currentAvg = await metricRepository.getAverage(metricId, startDate, endDate);

            if (baselineAvg !== null && currentAvg !== null && baselineAvg !== 0) {
                const delta = ((currentAvg - baselineAvg) / baselineAvg) * 100;
                results.push({
                    metricId: metricId,
                    baseline: baselineAvg,
                    current: currentAvg,
                    delta: delta
                });
            }
        }
        return results;
    };

    const handleCreate = async () => {
        if (!newName || !newMetric) return;

        const { error } = await supabase.from("experiments").insert({
            name: newName,
            hypothesis: newHypothesis,
            start_date: new Date().toISOString(),
            status: 'active',
            metrics: [newMetric]
        });

        if (error) {
            console.error("Error creating experiment:", error);
        } else {
            setIsCreateOpen(false);
            setNewName("");
            setNewHypothesis("");
            fetchExperiments();
        }
    };

    const handleStop = async (id: string) => {
        await supabase
            .from("experiments")
            .update({ status: 'completed', end_date: new Date().toISOString() })
            .eq("id", id);
        fetchExperiments();
    };

    // Helper to format metric value
    const formatMetric = (id: MetricID, val: number) => {
        const unit = METRIC_REGISTRY[id]?.unit || "";
        return `${val.toFixed(1)}${unit}`;
    };

    // Helper for delta color/icon
    const getDeltaBadge = (id: MetricID, delta: number) => {
        // Simple logic: higher is better unless we define otherwise in Registry (TODO)
        // Check if delta is positive or negative
        const isPositive = delta > 0;
        const colorClass = isPositive ? "text-emerald-500" : "text-rose-500";
        const Icon = isPositive ? TrendingUp : TrendingDown;

        return (
            <div className={cn("flex items-center gap-1 font-mono text-xs", colorClass)}>
                <Icon className="h-3 w-3" />
                <span>{delta > 0 ? "+" : ""}{delta.toFixed(1)}%</span>
            </div>
        );
    };

    return (
        <Card className="col-span-12 border-white/5 bg-black/40 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-mono tracking-tight text-primary flex items-center gap-2">
                        <FlaskConical className="h-5 w-5" />
                        N=1 EXPERIMENT LAB
                    </CardTitle>
                    <CardDescription className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Hypothesis Testing & Impact Analysis
                    </CardDescription>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="h-8 gap-2 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary border border-primary/20">
                            <Plus className="h-3.5 w-3.5" />
                            <span className="font-mono text-xs">New Experiment</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#09090b] border-white/10">
                        <DialogHeader>
                            <DialogTitle className="font-mono tracking-tight">Launch Experiment</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-mono text-muted-foreground">Experiment Name</Label>
                                <Input
                                    placeholder="e.g. Magnesium Glycinate"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="bg-white/5 border-white/10 font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-mono text-muted-foreground">Hypothesis</Label>
                                <Input
                                    placeholder="e.g. Will increase deep sleep"
                                    value={newHypothesis}
                                    onChange={(e) => setNewHypothesis(e.target.value)}
                                    className="bg-white/5 border-white/10 font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-mono text-muted-foreground">Target Metric</Label>
                                <Select value={newMetric} onValueChange={(v) => setNewMetric(v as MetricID)}>
                                    <SelectTrigger className="bg-white/5 border-white/10 font-mono">
                                        <SelectValue placeholder="Select metric" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60">
                                        {Object.keys(METRIC_REGISTRY).map((id) => (
                                            <SelectItem key={id} value={id} className="font-mono text-xs">
                                                {METRIC_REGISTRY[id as MetricID].name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreate} disabled={!newName || !newMetric}>Launch</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>

            <CardContent className="space-y-4">
                {loading ? (
                    <div className="flex h-20 items-center justify-center">
                        <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                ) : experiments.length === 0 ? (
                    <div className="h-24 flex flex-col items-center justify-center text-center border border-dashed border-white/10 rounded-lg bg-white/5">
                        <p className="font-mono text-xs text-muted-foreground">No active experiments.</p>
                        <p className="font-mono text-[10px] text-muted-foreground/50 mt-1">Start tracking an intervention to see your Δ.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {experiments.map((exp) => (
                            <div key={exp.id} className="p-4 rounded-lg bg-white/5 border border-white/5 hover:border-primary/30 transition-all group relative overflow-hidden">
                                {/* Scientific Header */}
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-sm tracking-tight text-white mb-0.5">{exp.name}</h3>
                                        <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[180px]">
                                            {exp.hypothesis || "No hypothesis"}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-mono uppercase">
                                        Day {differenceInDays(new Date(), new Date(exp.start_date)) + 1}
                                    </Badge>
                                </div>

                                {/* Impact grid */}
                                <div className="space-y-2 mb-4">
                                    {impacts[exp.id]?.length > 0 ? (
                                        impacts[exp.id].map((impact) => (
                                            <div key={impact.metricId} className="flex items-center justify-between p-2 rounded bg-black/20 text-xs font-mono">
                                                <span className="text-muted-foreground uppercase">{METRIC_REGISTRY[impact.metricId]?.name.split(" ")[0]}</span>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex flex-col items-end leading-none">
                                                        <span className="text-[10px] text-muted-foreground/50">PRE {formatMetric(impact.metricId, impact.baseline)}</span>
                                                        <span>{formatMetric(impact.metricId, impact.current)}</span>
                                                    </div>
                                                    {getDeltaBadge(impact.metricId, impact.delta)}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-[10px] font-mono text-muted-foreground/50 italic py-2">
                                            Collecting initial data...
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end pt-2 border-t border-white/5">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleStop(exp.id)}
                                        className="h-6 text-[10px] text-muted-foreground hover:text-white hover:bg-white/5"
                                    >
                                        Conclude Experiment
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
