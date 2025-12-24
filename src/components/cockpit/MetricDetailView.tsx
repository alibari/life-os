import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { healthService } from "@/services/health";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as ChartTooltip, CartesianGrid } from "recharts";
import { Loader2, AlertCircle, Calendar, Hash, Clock, Activity } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface MetricDetailViewProps {
    metricName: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    unit?: string;
}

export function MetricDetailView({ metricName, open, onOpenChange, unit: propUnit }: MetricDetailViewProps) {
    const [timeRange, setTimeRange] = useState(7); // Default 7d

    const { data: history, isLoading } = useQuery({
        queryKey: ["metric-history", metricName, timeRange],
        queryFn: () => metricName ? healthService.getMetricHistory(metricName, timeRange) : Promise.resolve([]),
        enabled: !!metricName && open,
        staleTime: 1000 * 60 * 5, // Cache for 5 mins
    });

    const chartData = useMemo(() => {
        if (!history || history.length === 0) return [];

        const processed = history
            .map(h => ({
                date: new Date(h.recorded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                value: Number(h.value),
                timestamp: new Date(h.recorded_at).getTime(),
                unit: h.unit
            }))
            .filter(h => !isNaN(h.value) && h.timestamp > 0)
            .sort((a, b) => a.timestamp - b.timestamp);

        return processed;
    }, [history]);

    const showDots = chartData.length < 2000;
    const unit = propUnit || (chartData.length > 0 ? chartData[0].unit : "");

    const stats = useMemo(() => {
        if (!chartData.length) return null;
        const values = chartData.map(d => d.value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const count = values.length;
        const last = values[values.length - 1];
        const first = values[0];

        // Bio-Hacker Stats
        const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / count;
        const stdDev = Math.sqrt(variance);
        const trend = first !== 0 ? ((last - first) / first) * 100 : 0;

        return {
            min,
            max,
            avg,
            count,
            last,
            firstDate: chartData[0].date,
            lastDate: chartData[chartData.length - 1].date,
            stdDev,
            trend
        };
    }, [chartData]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] bg-black/95 border-white/10 backdrop-blur-3xl flex flex-col p-0 outline-none">
                {/* HEAD: Title & Controls */}
                <div className="p-6 border-b border-white/10 flex flex-col gap-4 flex-shrink-0 z-20 bg-black/50 backdrop-blur-md">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <DialogTitle className="flex items-center gap-3 font-mono uppercase tracking-wider text-xl text-white">
                                {metricName?.replace(/_/g, " ")}
                                {unit && <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded lowercase">{unit}</span>}
                            </DialogTitle>
                            <DialogDescription className="font-mono text-xs text-muted-foreground mt-1">
                                Biometric Signal Analysis
                            </DialogDescription>
                        </div>

                        <div className="flex bg-white/5 p-1 rounded-lg border border-white/5">
                            {[7, 15, 30, 90].map((days) => (
                                <button
                                    key={days}
                                    onClick={() => setTimeRange(days)}
                                    className={cn(
                                        "px-4 py-1.5 text-xs font-mono rounded-md transition-all",
                                        timeRange === days
                                            ? "bg-primary text-black font-bold shadow-lg shadow-primary/20"
                                            : "text-muted-foreground hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {days}D
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Timeline Info Row (New Location - No Border) */}
                    {stats && (
                        <div className="flex items-center gap-6 text-[10px] font-mono pt-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>First Signal: <span className="text-white ml-1">{stats.firstDate}</span></span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>Latest Signal: <span className="text-emerald-400 ml-1">{stats.lastDate}</span></span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/40 relative z-10">
                    {isLoading ? (
                        <div className="h-[500px] flex flex-col items-center justify-center gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="font-mono text-xs text-muted-foreground animate-pulse">Syncing Retrieval Nodes ({timeRange} Days)...</p>
                        </div>
                    ) : chartData.length === 0 ? (
                        <div className="h-[500px] flex flex-col items-center justify-center gap-4 text-muted-foreground">
                            <AlertCircle className="h-8 w-8 opacity-50" />
                            <p className="font-mono text-xs">No signals found in the last {timeRange} days.</p>
                        </div>
                    ) : (
                        <div className="p-6 space-y-8">
                            {/* Stats Grid */}
                            <TooltipProvider>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <StatBox
                                        icon={Hash}
                                        label="Readings"
                                        value={stats?.count.toLocaleString()}
                                        subtext="Data Points"
                                        info="Total count of recorded data points within the selected timeframe."
                                    />
                                    <StatBox
                                        icon={Activity}
                                        label="Average"
                                        value={stats?.avg.toFixed(2)}
                                        subtext={unit}
                                        info={`The arithmetic mean of all ${stats?.count} readings, providing a baseline performance level.`}
                                    />
                                    <StatBox
                                        icon={Activity}
                                        label="Min / Max"
                                        value={`${stats?.min.toFixed(1)} / ${stats?.max.toFixed(1)}`}
                                        subtext="Range"
                                        info="The absolute floor and ceiling values recorded, showing the full amplitude of the signal."
                                    />
                                    <StatBox
                                        icon={Activity}
                                        label="Volatility"
                                        value={`±${stats?.stdDev.toFixed(2)}`}
                                        subtext="Std Dev"
                                        info="Standard Deviation (σ). Measures the dispersion of data points relative to the mean. High volatility indicates unstable or stress-reactive states."
                                    />
                                    <StatBox
                                        icon={Activity}
                                        label="Trend"
                                        value={`${stats?.trend && stats.trend > 0 ? "+" : ""}${stats?.trend.toFixed(1)}%`}
                                        subtext="Diff vs Start"
                                        valueClass={stats?.trend && stats.trend > 0 ? "text-emerald-400" : stats?.trend && stats.trend < 0 ? "text-rose-400" : "text-white"}
                                        info="Percentage change identifying the directional trajectory from the start of the period to the most recent reading."
                                    />
                                </div>
                            </TooltipProvider>

                            {/* Main Chart */}
                            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                                <div className="h-[450px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                stroke="rgba(255,255,255,0.3)"
                                                fontSize={10}
                                                tickMargin={15}
                                                minTickGap={40}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                stroke="rgba(255,255,255,0.3)"
                                                fontSize={10}
                                                domain={['dataMin', 'dataMax']}
                                                padding={{ top: 50, bottom: 50 }}
                                                axisLine={false}
                                                tickLine={false}
                                                tickFormatter={(val) => val.toFixed(1)}
                                            />
                                            <ChartTooltip
                                                contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", borderRadius: "12px", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)" }}
                                                itemStyle={{ color: "#22c55e", fontFamily: "monospace", fontSize: "12px" }}
                                                labelStyle={{ color: "#71717a", marginBottom: "8px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#22c55e"
                                                fillOpacity={1}
                                                fill="url(#colorMetric)"
                                                strokeWidth={2}
                                                dot={showDots ? { r: 3, fill: "#09090b", stroke: "#22c55e", strokeWidth: 2 } : false}
                                                activeDot={{ r: 6, fill: "#22c55e", stroke: "#fff", strokeWidth: 2 }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function StatBox({ icon: Icon, label, value, subtext, valueClass, info }: any) {
    return (
        <div className="relative p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-1.5">
                    <div className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">{label}</div>
                    {info && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="w-3.5 h-3.5 rounded-full border border-white/20 flex items-center justify-center text-[9px] text-white/50 cursor-help hover:bg-white/10 hover:text-white transition-colors">
                                    i
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-[220px] bg-zinc-900 border-white/20 text-zinc-300 text-[10px] font-mono leading-relaxed p-3 z-[100]">
                                {info}
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
                <Icon className="h-4 w-4 text-white/20 group-hover:text-primary transition-colors" />
            </div>
            <div className={cn("text-2xl font-bold font-mono mb-1", valueClass || "text-white")}>{value}</div>
            <div className="text-[10px] text-white/40 font-mono truncate">{subtext}</div>
        </div>
    );
}
