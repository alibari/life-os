import { Moon, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
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

const sleepData = [
    { day: "Mon", hours: 7.2, quality: 82 },
    { day: "Tue", hours: 6.5, quality: 68 },
    { day: "Wed", hours: 8.1, quality: 91 },
    { day: "Thu", hours: 7.0, quality: 75 },
    { day: "Fri", hours: 6.8, quality: 70 },
    { day: "Sat", hours: 8.5, quality: 95 },
    { day: "Sun", hours: 7.8, quality: 88 },
];

const hrvData = [
    { time: "6AM", value: 45 },
    { time: "9AM", value: 52 },
    { time: "12PM", value: 48 },
    { time: "3PM", value: 55 },
    { time: "6PM", value: 42 },
    { time: "9PM", value: 58 },
];

export function LabSleepAnalysis({ compact }: { compact?: boolean }) {
    return (
        <Card className="card-surface p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-primary" />
                    <h2 className="font-mono text-sm text-foreground">Sleep Analysis</h2>
                </div>
                {!compact && (
                    <span className="text-xs font-mono text-muted-foreground">
                        This Week
                    </span>
                )}
            </div>
            <div className="flex-1 min-h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sleepData}>
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
                            domain={[0, 10]}
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
                        <Area
                            type="monotone"
                            dataKey="hours"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            fill="url(#sleepGradient)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}

export function LabHRVTrend({ compact }: { compact?: boolean }) {
    return (
        <Card className="card-surface p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-destructive" />
                    <h2 className="font-mono text-sm text-foreground">HRV Trend</h2>
                </div>
                {!compact && (
                    <span className="text-xs font-mono text-muted-foreground">
                        Today
                    </span>
                )}
            </div>
            <div className="flex-1 min-h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={hrvData}>
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                            hide={compact}
                        />
                        <YAxis
                            domain={[30, 70]}
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
            </div>
        </Card>
    );
}
