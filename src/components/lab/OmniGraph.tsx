import { useState, useEffect, useMemo } from "react";
import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area
} from "recharts";
import { format } from "date-fns";
import { MetricID } from "@/services/registry/types";
import { METRIC_REGISTRY } from "@/services/registry/metrics";
import { metricRepository, MetricResult } from "@/services/repository/MetricRepository";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ChevronDown, RefreshCw, X } from "lucide-react";

const COLORS = [
    "#3b82f6", // blue-500
    "#10b981", // emerald-500
    "#f59e0b", // amber-500
    "#ef4444", // red-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
];

export function OmniGraph() {
    const [selectedMetrics, setSelectedMetrics] = useState<MetricID[]>(["heart_rate_variability", "sleep_duration"]);
    const [days, setDays] = useState(14);
    const [data, setData] = useState<Record<string, MetricResult[]>>({});
    const [loading, setLoading] = useState(false);

    // Fetch data when selection or range changes
    useEffect(() => {
        const fetchData = async () => {
            if (selectedMetrics.length === 0) {
                setData({});
                return;
            }

            setLoading(true);
            try {
                const result = await metricRepository.getMultiTrend(selectedMetrics, days);
                setData(result);
            } catch (error) {
                console.error("Failed to fetch graph data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedMetrics, days]);

    // Transform data for Recharts
    const chartData = useMemo(() => {
        const allTimestamps = new Set<string>();
        Object.values(data).forEach(list => list.forEach(item => allTimestamps.add(item.timestamp)));
        const sortedTimestamps = Array.from(allTimestamps).sort();

        return sortedTimestamps.map(time => {
            const point: any = { timestamp: time };
            selectedMetrics.forEach(id => {
                const val = data[id]?.find(d => d.timestamp === time)?.value;
                if (val !== undefined) point[id] = val;
            });
            return point;
        });
    }, [data, selectedMetrics]);

    // Available metrics list
    const availableMetrics = Object.keys(METRIC_REGISTRY) as MetricID[];

    const toggleMetric = (id: MetricID) => {
        if (selectedMetrics.includes(id)) {
            setSelectedMetrics(prev => prev.filter(m => m !== id));
        } else {
            if (selectedMetrics.length >= 4) return; // Limit to 4 for sanity
            setSelectedMetrics(prev => [...prev, id]);
        }
    };

    return (
        <Card className="col-span-12 border-white/5 bg-black/40 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-mono tracking-tight text-primary">OMNI-GRAPH EXPLORER</CardTitle>
                    <CardDescription className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Time-Series Correlation Engine
                    </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                    {/* Time Range Selector */}
                    <div className="flex bg-muted/20 rounded-lg p-1">
                        {[7, 14, 30, 90].map(d => (
                            <button
                                key={d}
                                onClick={() => setDays(d)}
                                className={`px-3 py-1 text-[10px] font-mono rounded-md transition-all ${days === d ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {d}D
                            </button>
                        ))}
                    </div>

                    {/* Metric Selector */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10">
                                <span>Add Metric</span>
                                <ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-y-auto">
                            {availableMetrics.map(id => (
                                <DropdownMenuCheckboxItem
                                    key={id}
                                    checked={selectedMetrics.includes(id)}
                                    // @ts-ignore
                                    onCheckedChange={() => toggleMetric(id)}
                                    disabled={!selectedMetrics.includes(id) && selectedMetrics.length >= 4}
                                >
                                    <span className="font-mono text-xs">{METRIC_REGISTRY[id].name}</span>
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            <CardContent>
                {/* Active Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {selectedMetrics.map((id, index) => (
                        <Badge
                            key={id}
                            variant="outline"
                            className="bg-transparent gap-1 pl-1 pr-2 py-1 h-6 transition-colors"
                            style={{ borderColor: COLORS[index % COLORS.length] }}
                        >
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span className="font-mono text-[10px] uppercase">{METRIC_REGISTRY[id].name}</span>
                            <button onClick={() => toggleMetric(id)} className="ml-1 hover:text-white group">
                                <X className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                            </button>
                        </Badge>
                    ))}
                </div>

                <div className="h-[350px] w-full">
                    {loading && chartData.length === 0 ? (
                        <div className="flex h-full items-center justify-center">
                            <RefreshCw className="h-8 w-8 animate-spin text-primary/30" />
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    {selectedMetrics.map((id, index) => (
                                        <linearGradient key={id} id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="timestamp"
                                    stroke="#525252"
                                    fontSize={10}
                                    tickFormatter={(val) => format(new Date(val), "MMM dd")}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#525252"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#09090b", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                                    itemStyle={{ fontSize: "12px", fontFamily: "monospace" }}
                                    labelStyle={{ color: "#a1a1aa", fontSize: "10px", marginBottom: "4px" }}
                                    labelFormatter={(val) => format(new Date(val), "MMM dd, yyyy HH:mm")}
                                    formatter={(value: number, name: string) => [
                                        value.toFixed(1) + " " + (METRIC_REGISTRY[String(name) as MetricID]?.unit || ""),
                                        METRIC_REGISTRY[String(name) as MetricID]?.name
                                    ]}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />

                                {selectedMetrics.map((id, index) => (
                                    <Area
                                        key={id}
                                        type="monotone"
                                        dataKey={id}
                                        stroke={COLORS[index % COLORS.length]}
                                        fill={`url(#grad-${id})`}
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 4, strokeWidth: 0 }}
                                    />
                                ))}
                            </ComposedChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
