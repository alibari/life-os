import { Calendar, Flame, TrendingUp, Target, Zap } from "lucide-react";
import { useMemo, useState } from "react";

const generateYearData = () => {
  const data: { date: Date; score: number | null }[] = [];
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  
  for (let d = new Date(startOfYear); d <= today; d.setDate(d.getDate() + 1)) {
    data.push({
      date: new Date(d),
      score: Math.random() > 0.1 ? Math.floor(Math.random() * 100) : null,
    });
  }
  
  const endOfYear = new Date(today.getFullYear(), 11, 31);
  for (let d = new Date(today); d <= endOfYear; d.setDate(d.getDate() + 1)) {
    if (d > today) {
      data.push({ date: new Date(d), score: null });
    }
  }
  
  return data;
};

const getScoreColor = (score: number | null) => {
  if (score === null) return "bg-muted/20";
  if (score >= 90) return "bg-primary";
  if (score >= 75) return "bg-primary/75";
  if (score >= 60) return "bg-primary/50";
  if (score >= 40) return "bg-amber-500/70";
  if (score >= 20) return "bg-orange-500/70";
  return "bg-destructive/70";
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const YearTracker = () => {
  const data = useMemo(() => generateYearData(), []);
  const [hoveredDay, setHoveredDay] = useState<{ date: Date; score: number | null } | null>(null);
  
  const weeks = useMemo(() => {
    const result: { date: Date; score: number | null }[][] = [];
    let currentWeek: { date: Date; score: number | null }[] = [];
    
    const firstDay = data[0]?.date.getDay() || 0;
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push({ date: new Date(), score: null });
    }
    
    data.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });
    
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: new Date(), score: null });
      }
      result.push(currentWeek);
    }
    
    return result;
  }, [data]);

  // Enhanced metrics
  const trackedDays = data.filter(d => d.score !== null);
  const totalDays = trackedDays.length;
  const avgScore = Math.round(trackedDays.reduce((sum, d) => sum + (d.score || 0), 0) / totalDays);
  const streak = trackedDays.filter(d => d.score !== null && d.score >= 60).length;
  const perfectDays = trackedDays.filter(d => d.score !== null && d.score >= 90).length;
  const daysRemaining = 365 - totalDays;
  
  // Monthly averages
  const monthlyAvgs = useMemo(() => {
    const monthData: Record<number, number[]> = {};
    trackedDays.forEach(d => {
      const month = d.date.getMonth();
      if (!monthData[month]) monthData[month] = [];
      if (d.score !== null) monthData[month].push(d.score);
    });
    return Object.entries(monthData).map(([month, scores]) => ({
      month: parseInt(month),
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    }));
  }, [trackedDays]);

  const bestMonth = monthlyAvgs.reduce((best, m) => m.avg > best.avg ? m : best, { month: 0, avg: 0 });

  return (
    <div className="card-surface p-4 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Calendar className="h-5 w-5 text-primary" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-secondary rounded-full animate-pulse" />
          </div>
          <span className="font-mono text-sm tracking-wider text-muted-foreground uppercase">
            365 Days Tracker
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-500/10 rounded-md border border-orange-500/20">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="font-mono text-base font-bold text-orange-500">{streak}</span>
            <span className="text-[10px] text-orange-500/70">days</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-5 gap-3 mb-4 shrink-0">
        <div className="p-3 bg-muted/20 rounded-lg border border-border/50">
          <div className="flex items-center gap-1.5 mb-1">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Tracked</span>
          </div>
          <div className="font-mono text-2xl font-bold text-foreground">{totalDays}</div>
          <div className="text-[10px] text-muted-foreground">{daysRemaining} remaining</div>
        </div>
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Average</span>
          </div>
          <div className="font-mono text-2xl font-bold text-primary">{avgScore}</div>
          <div className="text-[10px] text-primary/70">performance</div>
        </div>
        <div className="p-3 bg-secondary/5 rounded-lg border border-secondary/20">
          <div className="flex items-center gap-1.5 mb-1">
            <Target className="h-3.5 w-3.5 text-secondary" />
            <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Perfect</span>
          </div>
          <div className="font-mono text-2xl font-bold text-secondary">{perfectDays}</div>
          <div className="text-[10px] text-secondary/70">90+ days</div>
        </div>
        <div className="p-3 bg-purple-500/5 rounded-lg border border-purple-500/20">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap className="h-3.5 w-3.5 text-purple-400" />
            <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Best Month</span>
          </div>
          <div className="font-mono text-2xl font-bold text-purple-400">{bestMonth.avg}</div>
          <div className="text-[10px] text-purple-400/70">{months[bestMonth.month]}</div>
        </div>
        <div className="p-3 bg-muted/20 rounded-lg border border-border/50">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-3.5 h-3.5 rounded-sm bg-gradient-to-br from-primary to-secondary" />
            <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Rate</span>
          </div>
          <div className="font-mono text-2xl font-bold text-foreground">{Math.round((totalDays / 365) * 100)}%</div>
          <div className="text-[10px] text-muted-foreground">completion</div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Month Labels */}
        <div className="flex mb-1.5 pl-8 shrink-0">
          {months.map((month, i) => (
            <div 
              key={i} 
              className="flex-1 text-center"
            >
              <span className="text-[10px] text-muted-foreground/80 font-mono font-medium">
                {month}
              </span>
            </div>
          ))}
        </div>

        {/* Day Labels + Grid */}
        <div className="flex-1 flex gap-2 min-h-0 overflow-hidden">
          {/* Day Labels */}
          <div className="flex flex-col justify-around text-[9px] text-muted-foreground/70 font-mono pr-1 shrink-0 w-6">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>

          {/* Contribution Grid */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden">
            <div className="flex gap-[3px] h-full">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-[3px] flex-1">
                  {week.map((day, dayIdx) => (
                    <div
                      key={dayIdx}
                      className={`flex-1 min-w-[10px] max-w-[14px] aspect-square rounded-[3px] ${getScoreColor(day.score)} transition-all duration-150 hover:scale-110 hover:z-10 cursor-pointer hover:ring-2 hover:ring-foreground/40`}
                      onMouseEnter={() => day.score !== null && setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-3 pt-3 border-t border-border shrink-0 flex items-center justify-between">
        {/* Hover Info */}
        <div className="flex-1">
          {hoveredDay ? (
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-foreground">
                {hoveredDay.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </span>
              <div className={`px-2 py-0.5 rounded-md ${
                (hoveredDay.score || 0) >= 90 ? "bg-primary/20 text-primary" :
                (hoveredDay.score || 0) >= 60 ? "bg-primary/10 text-primary/80" :
                (hoveredDay.score || 0) >= 40 ? "bg-amber-500/20 text-amber-400" :
                "bg-destructive/20 text-destructive"
              }`}>
                <span className="font-mono text-sm font-bold">{hoveredDay.score}</span>
              </div>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">Hover over a day to see details</span>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">Less</span>
          <div className="flex gap-[4px]">
            <div className="w-[12px] h-[12px] rounded-[3px] bg-destructive/70" />
            <div className="w-[12px] h-[12px] rounded-[3px] bg-orange-500/70" />
            <div className="w-[12px] h-[12px] rounded-[3px] bg-amber-500/70" />
            <div className="w-[12px] h-[12px] rounded-[3px] bg-primary/50" />
            <div className="w-[12px] h-[12px] rounded-[3px] bg-primary" />
          </div>
          <span className="text-[10px] text-muted-foreground">More</span>
        </div>
      </div>
    </div>
  );
};