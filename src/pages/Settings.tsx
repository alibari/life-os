import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Shield, Activity, Database, Cpu, RefreshCw, Calculator, Info, UploadCloud, Save, Check } from "lucide-react";
import { healthService, HealthMetric } from "@/services/health";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Settings() {
    const { strictMode, setStrictMode } = useSystemSettings();

    // Auto Export State
    const [exportUrl, setExportUrl] = useState(() => localStorage.getItem("auto_export_url") || "");
    const [exportKey, setExportKey] = useState(() => localStorage.getItem("auto_export_key") || "");
    const [exportType, setExportType] = useState(() => localStorage.getItem("auto_export_type") || "rest_api");

    const saveExportSettings = () => {
        localStorage.setItem("auto_export_url", exportUrl);
        localStorage.setItem("auto_export_key", exportKey);
        localStorage.setItem("auto_export_type", exportType);
        toast.success("Auto-Export configuration saved locally.");
    };

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

    // Tab Components
    const TabButton = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={cn(
                "flex items-center gap-2 px-4 py-2 text-xs font-mono tracking-wider uppercase border-b-2 transition-colors",
                activeTab === id
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
        >
            <Icon className="h-3.5 w-3.5" />
            {label}
        </button>
    );

    return (
        <div className="min-h-screen pt-8 px-6 pb-20 cockpit-canvas flex flex-col gap-6">
            <PageHeader
                title="CONTROL CENTER"
                subtitle="SYSTEM INTEGRITY & AUTOMATION"
                icon={Shield}
                className="w-full"
            />

            {/* TABS HEADER */}
            <div className="flex border-b border-border/50">
                <TabButton id="automation" label="Automation" icon={UploadCloud} />
                <TabButton id="data-in" label="Data Sources" icon={RefreshCw} />
                <TabButton id="intelligence" label="Intelligence" icon={Calculator} />
                <TabButton id="system" label="System Health" icon={Database} />
            </div>

            {/* TAB CONTENT */}
            <div className="min-h-[400px]">

                {/* --- AUTOMATION TAB --- */}
                {activeTab === "automation" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl">
                        {/* AUTO EXPORT AUTOMATION */}
                        <div className="card-surface p-6 flex flex-col gap-4 border-blue-500/20 bg-blue-500/5">
                            <div className="flex items-center gap-3">
                                <UploadCloud className="h-5 w-5 text-blue-500" />
                                <h3 className="font-mono text-sm tracking-widest uppercase">Auto Export Automation</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-blue-500/10 p-3 rounded border border-blue-500/20 text-[10px] font-mono whitespace-pre-line text-blue-200">
                                    1. Open "Auto Export" on iPhone.{"\n"}
                                    2. Create new Automation &gt; "API Export".{"\n"}
                                    3. Copy the Endpoint URL below.{"\n"}
                                    4. **Critical**: In Supabase Dashboard > Settings > Edge Functions > Secrets, add `INGEST_SECRET`.{"\n"}
                                    5. In Auto Export, add Header: `x-life-os-key` : (your secret value).
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-mono text-muted-foreground">Endpoint URL (POST)</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            readOnly
                                            className="bg-black/40 border-white/10 font-mono text-xs h-9 text-blue-300"
                                            value="https://uimwgahuyddlscmwfdac.supabase.co/functions/v1/ingest-health-metrics"
                                        />
                                        <Button size="icon" variant="outline" className="h-9 w-9 shrink-0 border-white/10" onClick={() => {
                                            navigator.clipboard.writeText("https://uimwgahuyddlscmwfdac.supabase.co/functions/v1/ingest-health-metrics");
                                            toast.success("URL Copied");
                                        }}>
                                            <Save className="h-3.5 w-3.5 rotate-0 scale-100 transition-all" />
                                            <span className="sr-only">Copy</span>
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-mono text-muted-foreground">Authorization Header</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            readOnly
                                            type="text"
                                            className="bg-black/40 border-white/10 font-mono text-xs h-9 text-muted-foreground"
                                            value="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpbXdnYWh1eWRkbHNjbXdmZGFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDg3NjcsImV4cCI6MjA4MTgyNDc2N30.vx0ZV0DqY8grbAJ21RP3eTk88MKfHT2PkOVVThGfzRs"
                                        />
                                        <Button size="icon" variant="outline" className="h-9 w-9 shrink-0 border-white/10" onClick={() => {
                                            navigator.clipboard.writeText("Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpbXdnYWh1eWRkbHNjbXdmZGFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDg3NjcsImV4cCI6MjA4MTgyNDc2N30.vx0ZV0DqY8grbAJ21RP3eTk88MKfHT2PkOVVThGfzRs");
                                            toast.success("Header Copied");
                                        }}>
                                            <Save className="h-3.5 w-3.5 rotate-0 scale-100 transition-all" />
                                            <span className="sr-only">Copy</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* --- DATA SOURCES TAB --- */}
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
                                            <span className="text-primary uppercase shrink-0 w-24">
                                                {log.metric_name.replace(/_/g, ' ')}
                                            </span>
                                            <span className="text-white font-bold shrink-0 w-16">
                                                {Number(log.value).toFixed(2)}
                                            </span>
                                            <span className="text-muted-foreground/60 italic truncate">
                                                via {log.source === "Unknown Source" ? "Apple Watch" : log.source}
                                            </span>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
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
                                    <div key={i} className="flex justify-between items-center bg-black/40 p-3 rounded border border-white/5">
                                        <span className="text-[10px] font-mono text-muted-foreground uppercase">Device ID</span>
                                        <span className="text-xs font-mono text-primary truncate max-w-[150px]">{s}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center bg-black/40 p-3 rounded border border-white/5">
                                    <span className="text-[10px] font-mono text-muted-foreground uppercase">Status</span>
                                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-tighter">Verified & Linked</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* --- INTELLIGENCE TAB --- */}
                {activeTab === "intelligence" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
                        {/* BIO-LOGIC FORMULA (SCIENTIFIC VIEW) */}
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
                                    {/* Interactive Formula Representation */}
                                    <div className="text-xs font-mono leading-loose text-muted-foreground bg-white/5 p-4 rounded border border-white/5">
                                        <span className="text-white">recovery_score</span> = <br />
                                        &nbsp;&nbsp;((<span className="text-destructive">hrv</span> - 30) / 70) * <span className="bg-primary/20 text-white px-1.5 rounded mx-0.5">0.50</span> + <br />
                                        &nbsp;&nbsp;((80 - <span className="text-accent">rhr</span>) / 40) * <span className="bg-primary/20 text-white px-1.5 rounded mx-0.5">0.50</span>
                                    </div>
                                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                        <Info className="h-3.5 w-3.5 text-primary/40" />
                                        <span className="text-[10px] font-mono text-muted-foreground">
                                            Formula is hardcoded in `MetricRepository.ts`. To change weights, create a new PR.
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* --- SYSTEM HEALTH TAB --- */}
                {activeTab === "system" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* SYSTEM HEALTH / STRICT MODE */}
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
                                <p className="text-[10px] font-mono text-muted-foreground border-l-2 border-destructive/30 pl-3 py-1">
                                    [WARNING] ENABLING STRICT MODE WILL SHOW 'DATA GAP' IF SENSORS ARE DISCONNECTED.
                                </p>
                            </div>
                        </div>

                        {/* DATA RESERVOIR (FULL WIDTH) */}
                        <div className="card-surface p-6 border-primary/20 bg-black/40">
                            <div className="flex items-center gap-3 mb-6">
                                <Database className="h-5 w-5 text-primary" />
                                <h3 className="font-mono text-sm tracking-widest uppercase">Data Reservoir Visualization</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {audit?.map((item: any) => (
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
                                                animate={{ width: `${Math.min(100, (item.count / 100000) * 100)}%` }}
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
