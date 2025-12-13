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
  
  // Future days are null
  const endOfYear = new Date(today.getFullYear(), 11, 31);
  for (let d = new Date(today); d <= endOfYear; d.setDate(d.getDate() + 1)) {
    if (d > today) {
      data.push({ date: new Date(d), score: null });
    }
  }
  
  return data;
};

const getScoreColor = (score: number | null) => {
  if (score === null) return "bg-muted/30";
  if (score >= 90) return "bg-primary";
  if (score >= 75) return "bg-primary/80";
  if (score >= 60) return "bg-primary/50";
  if (score >= 40) return "bg-yellow-500/60";
  if (score >= 20) return "bg-orange-500/60";
  return "bg-destructive/60";
};

export const YearTracker = () => {
  const data = useMemo(() => generateYearData(), []);
  const [hoveredDay, setHoveredDay] = useState<{ date: Date; score: number | null } | null>(null);
  
  const weeks = useMemo(() => {
    const result: { date: Date; score: number | null }[][] = [];
    let currentWeek: { date: Date; score: number | null }[] = [];
    
    // Pad the first week
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
    <div className="card-surface p-3 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
            365 DAYS
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Flame className="h-3 w-3 text-orange-500" />
          <span className="font-mono text-[10px] text-foreground">{streak}</span>
        </div>
      </div>

      <div className="flex gap-3 mb-2">
        <div>
          <div className="font-mono text-sm font-bold text-foreground">{totalDays}</div>
          <div className="text-[9px] text-muted-foreground">Days tracked</div>
        </div>
        <div>
          <div className="font-mono text-sm font-bold text-primary">{avgScore}</div>
          <div className="text-[9px] text-muted-foreground">Avg score</div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="flex gap-[2px] h-full overflow-x-auto pb-1">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-[2px]">
              {week.map((day, dayIdx) => (
                <div
                  key={dayIdx}
                  className={`w-[6px] h-[6px] rounded-[1px] ${getScoreColor(day.score)} transition-all hover:scale-150 hover:z-10 cursor-pointer`}
                  onMouseEnter={() => day.score !== null && setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  title={day.score !== null ? `${day.date.toLocaleDateString()}: ${day.score}` : ""}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {hoveredDay && (
        <div className="mt-1 pt-1 border-t border-border text-center">
          <span className="font-mono text-[10px] text-foreground">
            {hoveredDay.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}: 
            <span className="text-primary ml-1">{hoveredDay.score}</span>
          </span>
        </div>
      )}

      <div className="flex items-center justify-center gap-1 mt-1 pt-1 border-t border-border">
        <span className="text-[8px] text-muted-foreground">Less</span>
        <div className="flex gap-[2px]">
          <div className="w-[6px] h-[6px] rounded-[1px] bg-destructive/60" />
          <div className="w-[6px] h-[6px] rounded-[1px] bg-orange-500/60" />
          <div className="w-[6px] h-[6px] rounded-[1px] bg-yellow-500/60" />
          <div className="w-[6px] h-[6px] rounded-[1px] bg-primary/50" />
          <div className="w-[6px] h-[6px] rounded-[1px] bg-primary" />
        </div>
        <span className="text-[8px] text-muted-foreground">More</span>
      </div>
    </div>
  );
};
