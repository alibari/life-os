import { Calendar, Flame } from "lucide-react";
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
  if (score >= 40) return "bg-yellow-500/70";
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

  const totalDays = data.filter(d => d.score !== null).length;
  const avgScore = Math.round(
    data.filter(d => d.score !== null).reduce((sum, d) => sum + (d.score || 0), 0) / totalDays
  );
  const streak = data.filter(d => d.score !== null && d.score >= 60).length;

  return (
    <div className="card-surface p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
            365 Days Tracker
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-500/10 rounded-md border border-orange-500/20">
          <Flame className="h-3.5 w-3.5 text-orange-500" />
          <span className="font-mono text-sm font-bold text-orange-500">{streak}</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex gap-6 mb-3 shrink-0">
        <div>
          <div className="font-mono text-xl lg:text-2xl font-bold text-foreground">{totalDays}</div>
          <div className="text-[10px] lg:text-xs text-muted-foreground">Days tracked</div>
        </div>
        <div>
          <div className="font-mono text-xl lg:text-2xl font-bold text-primary">{avgScore}</div>
          <div className="text-[10px] lg:text-xs text-muted-foreground">Avg score</div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Month Labels */}
        <div className="flex mb-1 pl-5 shrink-0">
          {months.map((month, i) => (
            <span 
              key={i} 
              className="flex-1 text-[8px] lg:text-[9px] text-muted-foreground/70 font-mono"
            >
              {month}
            </span>
          ))}
        </div>

        {/* Day Labels + Grid */}
        <div className="flex-1 flex gap-1 min-h-0 overflow-hidden">
          {/* Day Labels */}
          <div className="flex flex-col justify-around text-[7px] lg:text-[8px] text-muted-foreground/60 font-mono pr-0.5 shrink-0">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>

          {/* Contribution Grid */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden">
            <div className="flex gap-[2px] h-full min-w-max">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-[2px]">
                  {week.map((day, dayIdx) => (
                    <div
                      key={dayIdx}
                      className={`w-[8px] h-[8px] lg:w-[10px] lg:h-[10px] rounded-[2px] ${getScoreColor(day.score)} transition-all duration-150 hover:scale-125 hover:z-10 cursor-pointer hover:ring-1 hover:ring-foreground/30`}
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

      {/* Hover Info */}
      {hoveredDay && (
        <div className="mt-2 pt-2 border-t border-border text-center shrink-0">
          <span className="font-mono text-xs lg:text-sm text-foreground">
            {hoveredDay.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            <span className="text-primary font-bold ml-2">{hoveredDay.score}</span>
          </span>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-2 pt-2 border-t border-border shrink-0">
        <span className="text-[9px] lg:text-[10px] text-muted-foreground">Less</span>
        <div className="flex gap-[3px]">
          <div className="w-[8px] h-[8px] lg:w-[10px] lg:h-[10px] rounded-[2px] bg-destructive/70" />
          <div className="w-[8px] h-[8px] lg:w-[10px] lg:h-[10px] rounded-[2px] bg-orange-500/70" />
          <div className="w-[8px] h-[8px] lg:w-[10px] lg:h-[10px] rounded-[2px] bg-yellow-500/70" />
          <div className="w-[8px] h-[8px] lg:w-[10px] lg:h-[10px] rounded-[2px] bg-primary/50" />
          <div className="w-[8px] h-[8px] lg:w-[10px] lg:h-[10px] rounded-[2px] bg-primary" />
        </div>
        <span className="text-[9px] lg:text-[10px] text-muted-foreground">More</span>
      </div>
    </div>
  );
};
