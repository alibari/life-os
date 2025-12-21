import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Shield, Activity, Database, Cpu, RefreshCw, Calculator, Info, UploadCloud, Copy, FileJson, Check } from "lucide-react";
import { healthService } from "@/services/health";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Settings() {
    const { strictMode, setStrictMode } = useSystemSettings();

    // 1. Hardware Metadata
    const { data: sources } = useQuery({
        queryKey: ["health-hardware"],
        queryFn: () => healthService.getHardwareMetadata(),
    });

    // 2. Data Reservoir (Audit)
    const { data: audit, isLoading: auditLoading } = useQuery({
        queryKey: ["health-audit"],
        queryFn: () => healthService.getSystemAudit(),
    });

    // 3. Activity Feed (Heartbeat) - Refetch every 30s
    const { data: feed, refetch: refetchFeed } = useQuery({
        queryKey: ["health-feed"],
        queryFn: () => healthService.getRecentActivityFeed(),
        refetchInterval: 30000,
    });

    const [activeTab, setActiveTab] = useState("automation");

    // Bulk Ingest State
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [processedCount, setProcessedCount] = useState(0);
    const [uploadStatus, setUploadStatus] = useState<string | null>(null);

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
                const json = JSON.parse(e.target?.result as string);
                const metrics = json.data?.metrics || [];

                if (metrics.length === 0) {
                    setUploadStatus("Error: No metrics found in file.");
                    setIsUploading(false);
                    return;
                }

                setUploadStatus("Parsing & Normalizing Data...");
                const recordsToInsert: any[] = [];

                metrics.forEach((m: any) => {
                    const metricName = normalizeMetricName(m.name);
                    const unit = m.units;

                    if (m.data && Array.isArray(m.data)) {
                        m.data.forEach((dp: any) => {
                            recordsToInsert.push({
                                metric_name: metricName,
                                value: dp.qty !== undefined ? dp.qty : dp.value,
                                unit: unit || "unit",
                                source: dp.source || "Auto Export Bulk",
                                recorded_at: cleanDate(dp.date)
                            });
                        });
                    }
                });

                if (recordsToInsert.length === 0) {
                    throw new Error("No data points found in metrics.");
                }

                setUploadStatus(`Injecting ${recordsToInsert.length.toLocaleString()} records into Reservoir...`);

                await healthService.bulkInsert(recordsToInsert, (count) => {
                    setProcessedCount(count);
                    setUploadProgress(Math.floor((count / recordsToInsert.length) * 100));
                });

                setUploadStatus(`Ingest Complete: ${recordsToInsert.length.toLocaleString()} records synched.`);
                toast.success("Bulk Ingest Successful");
                refetchFeed();
            } catch (err) {
                console.error("Upload error:", err);
                setUploadStatus(`Error: ${err instanceof Error ? err.message : 'Invalid JSON structure'}`);
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
        // Handle "2025-09-23 6:12:00 PM +0200"
        const sanitized = dateStr.replace(/\u202F/g, ' ');
        const date = new Date(sanitized);
        return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
    };

    // Tab Components
    const TabButton = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={cn(
                "flex items-center gap-2 px-4 py-2 text-[10px] font-mono tracking-widest uppercase border-b-2 transition-all duration-300",
                activeTab === id
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
        >
            <Icon className={cn("h-3.5 w-3.5", activeTab === id ? "animate-pulse" : "")} />
            {label}
        </button>
    );

    return (
        <div className="min-h-screen pt-8 px-6 pb-20 cockpit-canvas flex flex-col gap-6">
            <PageHeader
                title="CONTROL CENTER"
                subtitle="SYSTEM INTEGRITY & DATA INTAKE"
                icon={Shield}
                className="w-full"
            />

            {/* TABS HEADER */}
            <div className="flex border-b border-white/10">
                <TabButton id="automation" label="Ingest" icon={UploadCloud} />
                <TabButton id="data-in" label="Sources" icon={RefreshCw} />
                <TabButton id="intelligence" label="Intelligence" icon={Calculator} />
                <TabButton id="system" label="Integrity" icon={Database} />
            </div>

            {/* TAB CONTENT */}
            <div className="min-h-[500px]">

                {/* --- INGEST TAB --- */}
                {activeTab === "automation" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl">
                        <div className="card-surface p-6 flex flex-col gap-6 border-primary/20 bg-primary/5">
                            <div className="flex items-center gap-3">
                                <FileJson className="h-5 w-5 text-primary" />
                                <h3 className="font-mono text-sm tracking-widest uppercase">Manual Data Reservoir Bulk Ingest</h3>
                            </div>

                            <div className="space-y-4">
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Import comprehensive health data from the <strong>Auto Export</strong> iOS app.
                                    Upload the generated JSON file here to populate your Reservoir.
                                </p>

                                <div className="p-8 border-2 border-dashed border-white/10 rounded-xl bg-black/40 flex flex-col items-center justify-center gap-4 group hover:border-primary/40 transition-colors relative transition-all">
                                    <input
                                        type="file"
                                        accept=".json"
                                        onChange={handleFileUpload}
                                        disabled={isUploading}
                                        className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                    />
                                    <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                        <UploadCloud className="h-8 w-8 text-primary" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-mono text-xs uppercase tracking-wider text-white">
                                            {isUploading ? "Processing..." : "Select JSON Export"}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            Maximum handled: 100,000+ records per file
                                        </p>
                                    </div>
                                </div>

                                {isUploading && (
                                    <div className="space-y-3 p-4 bg-black/60 rounded-lg border border-primary/20">
                                        <div className="flex justify-between text-[10px] font-mono text-primary uppercase">
                                            <span>{uploadStatus}</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.6)]"
                                                animate={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[9px] font-mono text-muted-foreground">
                                            <span>BATCH PROCESSING MODE</span>
                                            <span>{processedCount.toLocaleString()} Pts</span>
                                        </div>
                                    </div>
                                )}

                                {uploadStatus && !isUploading && (
                                    <div className={cn(
                                        "p-3 rounded-lg border text-[10px] font-mono uppercase text-center flex items-center justify-center gap-2",
                                        uploadStatus.includes("Error")
                                            ? "bg-destructive/10 border-destructive/20 text-destructive"
                                            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                    )}>
                                        {!uploadStatus.includes("Error") && <Check className="h-3 w-3" />}
                                        {uploadStatus}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 bg-white/5 rounded-lg border border-white/10 opacity-60">
                            <h4 className="text-[10px] font-mono uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Info className="h-3 w-3" /> Requirements
                            </h4>
                            <ul className="text-[10px] text-muted-foreground space-y-1 list-disc pl-4">
                                <li>File must be in .json format</li>
                                <li>Exported from "Auto Export" via "Export data as JSON"</li>
                                <li>System handles automated normalization to Scientific Registry</li>
                            </ul>
                        </div>
                    </motion.div>
                )}

                {/* --- DATA SOURCES (SOURCES) TAB --- */}
                {activeTab === "data-in" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* BIO-SYNC FEED */}
                        <div className="card-surface p-0 flex flex-col border-primary/30 flex-1 overflow-hidden bg-black/60 relative h-[500px]">
                            <div className="p-4 border-b border-primary/20 flex items-center justify-between bg-primary/5">
                                <div className="flex items-center gap-3">
                                    <Activity className="h-5 w-5 text-primary" />
                                    <h3 className="font-mono text-sm tracking-widest uppercase">Bio-Sync Heartbeat</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                                    <span className="text-[9px] font-mono text-primary uppercase tracking-widest">Live Stream</span>
                                    <button onClick={() => refetchFeed()} className="ml-2 hover:rotate-180 transition-transform duration-500">
                                        <RefreshCw className="h-3 w-3 text-muted-foreground" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 p-4 font-mono text-[11px] overflow-y-auto space-y-2 custom-scrollbar">
                                <AnimatePresence mode="popLayout">
                                    {feed?.map((log) => (
                                        <motion.div
                                            key={log.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex gap-4 border-b border-white/5 pb-1 group hover:bg-white/5"
                                        >
                                            <span className="text-muted-foreground/40 shrink-0">
                                                [{new Date(log.recorded_at).toLocaleTimeString([], { hour12: false })}]
                                            </span>
                                            <span className="text-primary uppercase shrink-0 w-24 truncate">
                                                {log.metric_name.replace(/_/g, ' ')}
                                            </span>
                                            <span className="text-white font-bold shrink-0 w-16">
                                                {Number(log.value).toFixed(2)}
                                            </span>
                                            <span className="text-muted-foreground/60 italic truncate">
                                                via {log.source}
                                            </span>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {(!feed || feed.length === 0) && (
                                    <div className="h-full flex flex-col items-center justify-center gap-2 opacity-30">
                                        <Database className="h-8 w-8" />
                                        <span className="text-[10px] uppercase tracking-widest">No Pulse Detected</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* HARDWARE IDENTITY */}
                        <div className="card-surface p-6 flex flex-col gap-4 border-primary/20 bg-primary/5 h-fit">
                            <div className="flex items-center gap-3">
                                <Cpu className="h-5 w-5 text-primary animate-pulse" />
                                <h3 className="font-mono text-sm tracking-widest uppercase">Hardware Identity</h3>
                            </div>
                            <div className="space-y-3">
                                {sources?.map((s, i) => (
                                    <div key={i} className="flex justify-between items-center bg-black/40 p-3 rounded border border-white/5 group hover:border-primary/30 transition-colors">
                                        <span className="text-[10px] font-mono text-muted-foreground uppercase">Device ID</span>
                                        <span className="text-xs font-mono text-primary truncate max-w-[150px]">{s}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center bg-black/40 p-3 rounded border border-white/5">
                                    <span className="text-[10px] font-mono text-muted-foreground uppercase">Status</span>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-tighter">Verified & Linked</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* --- INTELLIGENCE TAB --- */}
                {activeTab === "intelligence" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
                        <div className="card-surface p-6 flex flex-col gap-4 border-white/10 bg-white/5">
                            <div className="flex items-center gap-3">
                                <Calculator className="h-5 w-5 text-muted-foreground" />
                                <h3 className="font-mono text-sm tracking-widest uppercase">Bio-Logic Formula</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-black/40 p-4 rounded border border-white/5 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-mono text-primary uppercase tracking-wider">Readiness Score</span>
                                        <span className="text-[10px] font-mono text-muted-foreground">V 2.1</span>
                                    </div>
                                    <div className="text-xs font-mono leading-loose text-muted-foreground bg-white/5 p-4 rounded border border-white/5">
                                        <span className="text-white">recovery_score</span> = <br />
                                        &nbsp;&nbsp;((<span className="text-destructive">hrv</span> - 30) / 70) * <span className="bg-primary/20 text-white px-1.5 rounded mx-0.5">0.50</span> + <br />
                                        &nbsp;&nbsp;((80 - <span className="text-accent">rhr</span>) / 40) * <span className="bg-primary/20 text-white px-1.5 rounded mx-0.5">0.50</span>
                                    </div>
                                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                        <Info className="h-3.5 w-3.5 text-primary/40" />
                                        <span className="text-[10px] font-mono text-muted-foreground">
                                            Formula constants are governed by the Scientific Registry found in the source code.
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* --- INTEGRITY TAB --- */}
                {activeTab === "system" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="card-surface p-6 flex flex-col gap-4 border-destructive/20 bg-destructive/5 max-w-2xl">
                            <div className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-destructive" />
                                <h3 className="font-mono text-sm tracking-widest uppercase">System Integrity</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-mono">Strict Data Mode</span>
                                        <span className="text-[10px] text-muted-foreground uppercase leading-tight">Disable all fallback/mock values</span>
                                    </div>
                                    <button
                                        onClick={() => setStrictMode(!strictMode)}
                                        className={cn(
                                            "w-10 h-5 rounded-full relative transition-colors duration-300",
                                            strictMode ? "bg-primary" : "bg-muted-foreground/20"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300",
                                            strictMode ? "left-6" : "left-1"
                                        )} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="card-surface p-6 border-primary/20 bg-black/40">
                            <div className="flex items-center gap-3 mb-6">
                                <Database className="h-5 w-5 text-primary" />
                                <h3 className="font-mono text-sm tracking-widest uppercase">Data Reservoir Visualization</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {auditLoading ? (
                                    <div className="col-span-full h-32 flex items-center justify-center font-mono text-xs animate-pulse opacity-50">
                                        Analyzing Reservoir...
                                    </div>
                                ) : audit?.map((item: any) => (
                                    <div key={item.name} className="flex flex-col gap-3 p-4 bg-white/5 rounded-lg border border-white/5 group hover:border-primary/40 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <span className="text-[10px] font-mono text-muted-foreground uppercase truncate pr-2">
                                                {item.name.replace(/_/g, ' ')}
                                            </span>
                                            <div className="text-right">
                                                <span className="text-xs font-mono font-bold text-white block leading-none">
                                                    {item.count.toLocaleString()}
                                                </span>
                                                <span className="text-[8px] font-mono text-primary/60 uppercase">pts stored</span>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 border-t border-white/5 pt-2">
                                            <div className="flex justify-between text-[8px] font-mono text-muted-foreground">
                                                <span className="uppercase">First Record</span>
                                                <span className="text-white">{item.firstSeen ? new Date(item.firstSeen).toLocaleDateString() : '—'}</span>
                                            </div>
                                            <div className="flex justify-between text-[8px] font-mono text-muted-foreground">
                                                <span className="uppercase">Latest Sync</span>
                                                <span className="text-primary">{item.latestSync ? new Date(item.latestSync).toLocaleDateString() : '—'}</span>
                                            </div>
                                        </div>

                                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(100, (item.count / 10000) * 100)}%` }}
                                                className="h-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
