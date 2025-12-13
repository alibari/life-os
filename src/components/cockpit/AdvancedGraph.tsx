import { TrendingUp, Calendar } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

const generateData = () => {
  const data = [];
  const today = new Date();
  
  // Past 15 days
  for (let i = 14; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score: Math.floor(60 + Math.random() * 35),
      type: "actual",
    });
  }
  
  // 7 day prediction
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const lastScore = data[data.length - 1].score;
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score: null,
      predicted: Math.min(100, Math.max(50, lastScore + (Math.random() - 0.3) * 10)),
      type: "predicted",
    });
  }
  
  return data;
};

export const AdvancedGraph = () => {
  const data = generateData();
  const currentScore = data.find(d => d.type === "actual" && d.score)?.score || 0;
  const avgScore = Math.round(
    data.filter(d => d.score).reduce((sum, d) => sum + (d.score || 0), 0) / 
    data.filter(d => d.score).length
  );

  return (
    <div className="card-surface p-3 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
            PERFORMANCE TREND
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">15D + 7D</span>
        </div>
      </div>

      <div className="flex gap-4 mb-2">
        <div>
          <div className="font-mono text-lg font-bold text-foreground">{currentScore}</div>
          <div className="text-[9px] text-muted-foreground">Today</div>
        </div>
        <div>
          <div className="font-mono text-lg font-bold text-muted-foreground">{avgScore}</div>
          <div className="text-[9px] text-muted-foreground">15D Avg</div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={[40, 100]}
              tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#scoreGradient)"
              connectNulls={false}
            />
            <Area
              type="monotone"
              dataKey="predicted"
              stroke="hsl(var(--secondary))"
              strokeWidth={2}
              strokeDasharray="4 4"
              fill="url(#predictedGradient)"
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-3 mt-1 pt-1 border-t border-border">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-[9px] text-muted-foreground">Actual</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-0.5 bg-secondary" style={{ borderBottom: "2px dashed" }} />
          <span className="text-[9px] text-muted-foreground">Predicted</span>
        </div>
      </div>
    </div>
  );
};
