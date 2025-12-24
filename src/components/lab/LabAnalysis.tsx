import { Moon, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { healthService } from "@/services/health";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from "recharts";

export function LabSleepAnalysis({ compact }: { compact?: boolean }) {
    const { data: history } = useQuery({
        queryKey: ['lab-sleep-history'],
        queryFn: () => healthService.getMetricHistory('sleep_duration', 7)
    });

    const chartData = (history || [])
        .slice()
        .reverse() // API returns desc, we want asc for chart
        .map(h => ({
            day: new Date(h.recorded_at).toLocaleDateString('en-US', { weekday: 'short' }),
            hours: h.value / 60, // convert min to hours
            date: h.recorded_at
        }));

    return (
        <Card className="card-surface p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-primary" />
                    <h2 className="font-mono text-sm text-foreground">Sleep Analysis</h2>
                </div>
                {!compact && (
                    <span className="text-xs font-mono text-muted-foreground">
                        Last 7 Days
                    </span>
                )}
            </div>
            <div className="flex-1 min-h-[120px]">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                                hide={compact}
                            />
                            <YAxis
                                domain={[0, 'auto']}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                                width={30}
                                hide={compact}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                }}
                                labelStyle={{ color: 'hsl(var(--foreground))' }}
                                formatter={(value: number) => [`${value.toFixed(1)}h`, 'Duration']}
                            />
                            <Area
                                type="monotone"
                                dataKey="hours"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                fill="url(#sleepGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground font-mono">
                        NO DATA AVAILABLE
                    </div>
                )}
            </div>
        </Card>
    );
}

export function LabHRVTrend({ compact }: { compact?: boolean }) {
    const { data: history } = useQuery({
        queryKey: ['lab-hrv-history'],
        queryFn: () => healthService.getMetricHistory('heart_rate_variability', 3) // Last 3 days high res
    });

    // We likely want to show just the last 24h or a trend.
    // Let's take the last 20 data points for clarity in "Trend"
    const chartData = (history || [])
        .slice(0, 20)
        .reverse()
        .map(h => ({
            time: new Date(h.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            value: h.value
        }));

    return (
        <Card className="card-surface p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-destructive" />
                    <h2 className="font-mono text-sm text-foreground">HRV Trend</h2>
                </div>
                {!compact && (
                    <span className="text-xs font-mono text-muted-foreground">
                        Recent
                    </span>
                )}
            </div>
            <div className="flex-1 min-h-[120px]">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <XAxis
                                dataKey="time"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                                hide={compact}
                            />
                            <YAxis
                                domain={['dataMin - 10', 'dataMax + 10']}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                                width={30}
                                hide={compact}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                }}
                                labelStyle={{ color: 'hsl(var(--foreground))' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="hsl(var(--destructive))"
                                strokeWidth={2}
                                dot={{ fill: 'hsl(var(--destructive))', strokeWidth: 0, r: 3 }}
                                activeDot={{ r: 5, fill: 'hsl(var(--destructive))' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground font-mono">
                        NO DATA AVAILABLE
                    </div>
                )}
            </div>
        </Card>
    );
}
