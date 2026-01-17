import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Shield, Activity, Database, Cpu, RefreshCw, Layers, UploadCloud, Check, Search, Download, Trash2, Target, Pill } from "lucide-react";
import { healthService } from "@/services/health";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { MetricDetailView } from "@/components/cockpit/MetricDetailView";
import { HabitManager } from "@/components/settings/HabitManager";
import { SupplementsManager } from "@/components/settings/SupplementsManager";

export default function Settings() {
    // 1. Hardware Metadata
    const { data: sources } = useQuery({
        queryKey: ["health-hardware"],
        queryFn: () => healthService.getHardwareMetadata(),
    });

    // 2. Data Reservoir (Audit)
    const { data: audit, isLoading: auditLoading, refetch: refetchAudit } = useQuery({
        queryKey: ["health-audit"],
        queryFn: () => healthService.getSystemAudit(),
    });

    // 3. Activity Feed (Heartbeat) - Refetch every 30s
    const { refetch: refetchFeed } = useQuery({
        queryKey: ["health-feed"],
        queryFn: () => healthService.getRecentActivityFeed(),
        refetchInterval: 30000,
    });

    // 4. Source Map (Registry) - Removed


    // Default to Bio-Data as per user request (Persisted)
    const [activeTab, setActiveTabState] = useState(() => localStorage.getItem("controlCenterTab") || "bio-data");

    const setActiveTab = (tab: string) => {
        setActiveTabState(tab);
        localStorage.setItem("controlCenterTab", tab);
    };

    return (
        <div className="min-h-screen pb-20 cockpit-canvas flex flex-col">
            {/* STICKY HEADER & TABS */}
            <div className="sticky top-0 z-40 bg-transparent backdrop-blur-sm pt-8 px-6 pb-4 mb-6">
                <PageHeader
                    title="CONTROL CENTER"
                    subtitle="BIO-DATA & BEHAVIORAL PROTOCOLS"
                    icon={Shield}
                    className="w-full mb-6"
                />

                <div className="flex justify-center">
                    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-full border border-white/10 shadow-lg">
                        {[
                            { id: "bio-data", label: "Bio Metrics Data", icon: Database },
                            { id: "behavioral", label: "Behavioral", icon: Layers },
                            { id: "supplements", label: "Supplements Stack", icon: Pill },
                            { id: "ingest", label: "Ingest", icon: UploadCloud },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "relative flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-mono tracking-wide uppercase transition-all duration-300",
                                    activeTab === tab.id
                                        ? "text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                                        : "text-muted-foreground hover:text-white"
                                )}
                            >
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-primary/10 rounded-full border border-primary/20"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <tab.icon className="h-3.5 w-3.5 relative z-10" />
                                <span className="relative z-10">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* TAB CONTENT (Scrollable) */}
            <div className="px-6 min-h-[500px]">
                {/* --- BIO-DATA TAB (Was Integrity) --- */}
                {activeTab === "bio-data" && (
                    <IntegrityDashboard
                        sources={sources}
                        audit={audit}
                        auditLoading={auditLoading}
                        refetchAudit={refetchAudit}
                    />
                )}

                {/* --- BEHAVIORAL TAB (Habits) --- */}
                {activeTab === "behavioral" && (
                    <div className="w-full max-w-5xl mx-auto">
                        <HabitManager />
                    </div>
                )}

                {/* --- SUPPLEMENTS TAB --- */}
                {activeTab === "supplements" && (
                    <div className="w-full max-w-5xl mx-auto">
                        <SupplementsManager />
                    </div>
                )}

                {/* --- INGEST TAB --- */}
                {activeTab === "ingest" && (
                    <IngestTab refetchFeed={refetchFeed} refetchAudit={refetchAudit} />
                )}
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// WidgetRegistry and RegistryCard components removed



// ----------------------------------------------------------------------
// ENHANCED INTEGRITY DASHBOARD
// ----------------------------------------------------------------------

// ----------------------------------------------------------------------
// ENHANCED INTEGRITY DASHBOARD
// ----------------------------------------------------------------------

function IntegrityDashboard({ sources, audit, auditLoading, refetchAudit }: any) {
    const [filter, setFilter] = useState("");
    const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const ROWS_PER_PAGE = 20;

    // Filter First
    const filteredAudit = audit?.filter((item: any) => {
        const term = filter.toLowerCase();
        // Optimistic matching on name first, unit matching happens after fetch but for search we might miss unit if not fetched.
        // For performance, we search name. If strict unit search needed, we need unit in audit list or fetch all.
        // Assuming user searches mostly metric names.
        return item.name.toLowerCase().includes(term);
    }).sort((a: any, b: any) => b.count - a.count) || [];

    // Then Paginate
    const totalPages = Math.ceil(filteredAudit.length / ROWS_PER_PAGE);
    const paginatedAudit = filteredAudit.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE);

    // Fetch Metadata (Units) ONLY for visible rows
    const { data: metadata } = useQuery({
        queryKey: ["health-metadata", page, paginatedAudit.map((i: any) => i.name).join(',')],
        queryFn: () => healthService.getMetricMetadata(paginatedAudit.map((i: any) => i.name) || []),
        enabled: paginatedAudit.length > 0,
        staleTime: 1000 * 60 * 5 // Cache units for 5 mins
    });

    const handleDeleteAll = async () => {
        if (!confirm("WARNING: DESTROY ALL DATA?\n\nThis action is irreversible. All imported metrics and history will be permanently erased.")) return;
        if (!confirm("FINAL CONFIRMATION: Type 'DELETE' mentally and click OK to wipe everything.")) return;

        const toastId = toast.loading("Purging System Data...");
        try {
            await healthService.deleteAllData();
            toast.success("System Purged. Memory Clear.", { id: toastId });
            refetchAudit();
        } catch (e) {
            toast.error("Purge Failed", { id: toastId });
        }
    };

    const totalRecords = audit?.reduce((acc: number, item: any) => acc + item.count, 0) || 0;
    const distinctMetrics = audit?.length || 0;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-6xl mx-auto space-y-6">

            {/* SYSTEM STATUS & SUMMARY */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* 1. Total Metrics (Distinct) */}
                <div className="card-surface p-4 border-white/10 bg-black/40 flex flex-col justify-between h-24">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-[10px] font-mono uppercase tracking-widest">Active Metrics</span>
                        <Target className="h-3 w-3" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <div className="text-2xl font-mono text-white">
                            {distinctMetrics}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">Signals</span>
                    </div>
                </div>

                {/* 2. Total Records (Volume) */}
                <div className="card-surface p-4 border-white/10 bg-black/40 flex flex-col justify-between h-24">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-[10px] font-mono uppercase tracking-widest">Data Volume</span>
                        <Database className="h-3 w-3" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <div className="text-2xl font-mono text-white">
                            {totalRecords.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">Points</span>
                    </div>
                </div>

                {/* 3. Hardware Identity (Double Width) */}
                <div className="md:col-span-2 card-surface p-4 border-white/10 bg-black/40 flex flex-col justify-between h-24">
                    <div className="flex items-center justify-between text-muted-foreground mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest flex items-center gap-2">
                            <Cpu className="h-3 w-3" /> Hardware Identity
                        </span>
                        <div className="flex gap-4 text-[9px] font-mono text-right">
                            <div className="text-emerald-400">AES-256 ENCRYPTED</div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {sources?.map((s: string, i: number) => (
                            <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] font-mono text-white">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                {s}
                            </div>
                        ))}
                        {(!sources || sources.length === 0) && (
                            <div className="text-xs text-muted-foreground italic">No Active Uplinks</div>
                        )}
                    </div>
                </div>
            </div>

            {/* DATA RESERVOIR - Full Width */}
            < div className="card-surface p-0 overflow-hidden border-white/10 bg-black/60 flex flex-col h-[800px]" >
                <div className="p-4 border-b border-white/5 bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <Database className="h-4 w-4 text-primary" />
                        <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">Data Reservoir</h3>
                    </div>

                    <div className="flex items-center gap-4 flex-1 justify-end">
                        <div className="relative w-full max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="FILTER METRICS..."
                                value={filter}
                                onChange={(e) => { setFilter(e.target.value); setPage(0); }}
                                className="w-full bg-black/40 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-xs font-mono text-white focus:outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>

                        <button
                            onClick={handleDeleteAll}
                            className="bg-red-500/10 border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/20 px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider flex items-center gap-2 transition-all"
                        >
                            <Trash2 className="h-3 w-3" />
                            <span>Purge All</span>
                        </button>

                        <button
                            onClick={async () => {
                                const toastId = toast.loading("Generating full system export...");
                                try {
                                    const data = await healthService.generateFullExport();
                                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement("a");
                                    a.href = url;
                                    a.download = `life - os -export -${new Date().toISOString().split('T')[0]}.json`;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(url);
                                    toast.success("Export downloaded successfully", { id: toastId });
                                } catch (e) {
                                    console.error(e);
                                    toast.error("Export failed", { id: toastId });
                                }
                            }}
                            className="bg-black/40 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider flex items-center gap-2 transition-all"
                        >
                            <Download className="h-3 w-3" />
                            <span>Export Json</span>
                        </button>
                        <button
                            onClick={() => refetchAudit()}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <RefreshCw className={cn("h-4 w-4 text-muted-foreground", auditLoading && "animate-spin")} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-0 flex flex-col">
                    {auditLoading ? (
                        <div className="flex-1 flex items-center justify-center flex-col gap-3">
                            <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                            <span className="text-xs font-mono text-muted-foreground animate-pulse">Scanning Bio-Database...</span>
                        </div>
                    ) : (
                        <>
                            <div className="w-full text-left flex-1">
                                <div className="sticky top-0 bg-black/80 backdrop-blur-sm z-10 grid grid-cols-12 gap-4 text-[9px] font-mono text-muted-foreground uppercase tracking-wider px-6 py-3 border-b border-white/5">
                                    <div className="col-span-5">Metric Identity</div>
                                    <div className="col-span-1 text-center">Unit</div>
                                    <div className="col-span-2 text-right">Data Volume</div>
                                    <div className="col-span-2 text-right">First Signal</div>
                                    <div className="col-span-2 text-right">Latest Signal</div>
                                </div>

                                <div className="divide-y divide-white/5">
                                    {paginatedAudit?.map((item: any) => (
                                        <div
                                            key={item.name}
                                            onClick={() => setSelectedMetric(item.name)}
                                            className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-white/5 transition-colors cursor-pointer group animate-in fade-in duration-300"
                                        >
                                            <div className="col-span-5 flex items-center gap-4">
                                                <div className="p-2 rounded bg-white/5 group-hover:bg-primary/10 transition-colors">
                                                    <Activity className="h-4 w-4 text-white group-hover:text-primary transition-colors" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-mono text-white font-medium group-hover:text-primary transition-colors">
                                                        {item.name.replace(/_/g, ' ')}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground font-mono">
                                                        ID: {item.name}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-span-1 text-center">
                                                {metadata?.[item.name] ? (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground border border-white/5 lowercase">
                                                        {metadata[item.name]}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-zinc-700 animate-pulse">...</span>
                                                )}
                                            </div>
                                            <div className="col-span-2 text-right">
                                                <span className="text-xs font-mono text-white/90 bg-white/5 px-2 py-1 rounded">{item.count.toLocaleString()}</span>
                                            </div>
                                            <div className="col-span-2 text-right text-[11px] font-mono text-muted-foreground">
                                                {item.firstSeen ? new Date(item.firstSeen).toLocaleDateString() : '—'}
                                            </div>
                                            <div className="col-span-2 text-right text-[11px] font-mono text-emerald-400">
                                                {item.latestSync ? new Date(item.latestSync).toLocaleDateString() : '—'}
                                            </div>
                                        </div>
                                    ))}
                                    {paginatedAudit.length === 0 && (
                                        <div className="p-8 text-center text-muted-foreground text-xs font-mono">
                                            No metrics found matches query or system is empty.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Pagination Footer */}
                            {filteredAudit.length > ROWS_PER_PAGE && (
                                <div className="p-3 border-t border-white/5 bg-black/40 flex items-center justify-between sticky bottom-0 z-20">
                                    <button
                                        onClick={() => setPage(p => Math.max(0, p - 1))}
                                        disabled={page === 0}
                                        className="px-3 py-1 rounded hover:bg-white/10 text-xs font-mono disabled:opacity-30 transition-colors"
                                    >
                                        PREV
                                    </button>
                                    <span className="text-[10px] font-mono text-muted-foreground">
                                        PAGE {page + 1} OF {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                        disabled={page >= totalPages - 1}
                                        className="px-3 py-1 rounded hover:bg-white/10 text-xs font-mono disabled:opacity-30 transition-colors"
                                    >
                                        NEXT
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div >

            {/* Drill Down View */}
            < MetricDetailView
                metricName={selectedMetric}
                open={!!selectedMetric}
                onOpenChange={(open) => !open && setSelectedMetric(null)}
                unit={selectedMetric ? metadata?.[selectedMetric] : undefined}
            />
        </motion.div >
    );
}

// ----------------------------------------------------------------------
// INGEST TAB (Refactored to Sub-Component)
// ----------------------------------------------------------------------

function IngestTab({ refetchFeed, refetchAudit }: any) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [processedCount, setProcessedCount] = useState(0);
    const [uploadStatus, setUploadStatus] = useState<string | null>(null);

    const normalizeMetricName = (name: string) => {
        if (name.includes("heart_rate_variability")) return "heart_rate_variability";
        if (name.includes("resting_heart_rate")) return "resting_heart_rate";
        if (name.includes("step_count")) return "step_count";
        if (name.includes("active_energy")) return "active_energy";
        if (name.includes("sleep")) return "sleep_duration";
        if (name.includes("respiratory_rate")) return "respiratory_rate";
        return name;
    };

    const cleanDate = (dateStr: string) => {
        const sanitized = dateStr.replace(/\u202F/g, ' ');
        const date = new Date(sanitized);
        return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadProgress(0);
        setProcessedCount(0);
        setUploadStatus("Initializing Reader...");

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                setUploadStatus("Reading File Content...");
                const rawContent = e.target?.result as string;

                let json;
                try {
                    json = JSON.parse(rawContent);
                } catch (parseErr) {
                    throw new Error(`JSON parsing failed: ${parseErr instanceof Error ? parseErr.message : 'Unknown parse error'} `);
                }

                if (!json.data) throw new Error("JSON missing 'data' property.");
                const metrics = json.data?.metrics || [];
                if (!Array.isArray(metrics)) throw new Error("'data.metrics' is not an array.");
                if (metrics.length === 0) throw new Error("No metrics found in file.");

                setUploadStatus("Parsing & Normalizing Data...");
                const recordsToInsert: any[] = [];

                metrics.forEach((m: any) => {
                    const metricName = normalizeMetricName(m.name);
                    const unit = m.units;

                    if (m.data && Array.isArray(m.data)) {
                        m.data.forEach((dp: any) => {
                            const value = dp.qty !== undefined && dp.qty !== null ? dp.qty : dp.value;
                            if (value === null || value === undefined || isNaN(Number(value))) return;

                            recordsToInsert.push({
                                metric_name: metricName,
                                value: Number(value),
                                unit: unit || "unit",
                                source: dp.source || "Auto Export Bulk",
                                recorded_at: cleanDate(dp.date)
                            });
                        });
                    }
                });

                if (recordsToInsert.length === 0) throw new Error("No valid data points found.");

                setUploadStatus(`Injecting ${recordsToInsert.length.toLocaleString()} records into Reservoir...`);

                await healthService.bulkInsert(recordsToInsert, (count) => {
                    setProcessedCount(count);
                    setUploadProgress(Math.floor((count / recordsToInsert.length) * 100));
                });

                setUploadStatus(`Ingest Complete: ${recordsToInsert.length.toLocaleString()} records synched.`);
                toast.success("Bulk Ingest Successful");

                refetchFeed();
                if (refetchAudit) refetchAudit();
            } catch (err) {
                console.error("[BULK_INGEST] Upload error:", err);
                setUploadStatus(`Error: ${err instanceof Error ? err.message : 'Invalid JSON structure'} `);
            } finally {
                setIsUploading(false);
            }
        };
        reader.onerror = () => {
            setUploadStatus("Error reading file.");
            setIsUploading(false);
        };
        reader.readAsText(file);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Manual Data Injection</h3>
                <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-mono bg-emerald-950/30 px-2 py-1 rounded border border-emerald-900">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    SYSTEM READY
                </div>
            </div>

            <div className="relative min-h-[300px] flex flex-col items-center justify-center p-10 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden transition-all duration-500 group hover:border-primary/50 hover:bg-white/5">
                <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="absolute inset-0 z-20 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <div className="absolute inset-4 border border-dashed border-white/20 rounded-2xl pointer-events-none transition-all duration-500 group-hover:border-primary/40 group-hover:scale-[0.98]" />

                <div className="relative z-10 p-6 rounded-full bg-black/50 border border-white/10 mb-6 group-hover:scale-110 transition-transform duration-500 shadow-2xl pointer-events-none">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <UploadCloud className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                </div>

                <div className="relative z-10 text-center space-y-2 pointer-events-none">
                    <h4 className="font-mono text-lg text-white font-medium tracking-tight group-hover:text-primary transition-colors">
                        Initiate Data Uplink
                    </h4>
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider group-hover:text-white/60 transition-colors">
                        Drop JSON Payload or Click to Browse
                    </p>
                </div>
            </div>

            {isUploading && (
                <div className="space-y-3 p-4 bg-black/60 rounded-lg border border-primary/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                    <div className="relative flex justify-between text-[10px] font-mono text-primary uppercase">
                        <span>{uploadStatus}</span>
                        <span>{uploadProgress}%</span>
                    </div>
                    <div className="relative h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.6)]"
                            animate={{ width: `${uploadProgress}% ` }}
                        />
                    </div>
                </div>
            )}

            {uploadStatus && !isUploading && (
                <div className={cn(
                    "p-3 rounded-lg border text-[10px] font-mono uppercase text-center flex items-center justify-center gap-2",
                    uploadStatus.includes("Error") ? "bg-destructive/10 border-destructive/20 text-destructive" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                )}>
                    {!uploadStatus.includes("Error") && <Check className="h-3 w-3" />}
                    {uploadStatus}
                </div>
            )}
        </motion.div>
    );
}
