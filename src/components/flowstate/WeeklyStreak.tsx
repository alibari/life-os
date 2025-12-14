import { Flame, TrendingUp, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeeklyStreakProps {
  sessions: Array<{
    startTime: Date | string;
    focusMinutes: number;
    completed: boolean;
  }>;
}

export function WeeklyStreak({ sessions }: WeeklyStreakProps) {
  const today = new Date();
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];
  
  // Get last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - i));
    return date;
  });

  const getSessionsForDay = (date: Date) => {
    return sessions.filter((s) => {
      const sessionDate = new Date(s.startTime);
      return sessionDate.toDateString() === date.toDateString();
    });
  };

  const getDayScore = (date: Date) => {
    const daySessions = getSessionsForDay(date);
    const totalMinutes = daySessions.reduce((acc, s) => acc + s.focusMinutes, 0);
    if (totalMinutes >= 180) return 3; // 3+ hours
    if (totalMinutes >= 90) return 2; // 1.5+ hours
    if (totalMinutes > 0) return 1; // Some focus
    return 0;
  };

  const currentStreak = () => {
    let streak = 0;
    for (let i = last7Days.length - 1; i >= 0; i--) {
      if (getDayScore(last7Days[i]) > 0) streak++;
      else break;
    }
    return streak;
  };

  const totalWeekMinutes = last7Days.reduce((acc, day) => {
    return acc + getSessionsForDay(day).reduce((a, s) => a + s.focusMinutes, 0);
  }, 0);

  const totalWeekSessions = last7Days.reduce((acc, day) => {
    return acc + getSessionsForDay(day).length;
  }, 0);

  return (
    <div className="card-surface h-full p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-warning/10 border border-warning/20">
            <Flame className="h-3.5 w-3.5 text-warning" />
          </div>
          <h3 className="font-mono text-xs font-medium text-foreground">Weekly Streak</h3>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 bg-warning/10 rounded-full">
          <Flame className="h-3 w-3 text-warning" />
          <span className="font-mono text-xs font-bold text-warning">{currentStreak()}</span>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {last7Days.map((day, idx) => {
          const score = getDayScore(day);
          const isToday = day.toDateString() === today.toDateString();
          return (
            <div key={idx} className="flex flex-col items-center gap-1">
              <span className="font-mono text-[9px] text-muted-foreground">
                {weekDays[day.getDay()]}
              </span>
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                  score === 0 && "bg-muted/30 border border-border",
                  score === 1 && "bg-growth/20 border border-growth/30",
                  score === 2 && "bg-growth/40 border border-growth/50",
                  score === 3 && "bg-growth border border-growth shadow-[0_0_10px_hsl(var(--growth)/0.3)]",
                  isToday && "ring-2 ring-focus/50"
                )}
              >
                {score > 0 && (
                  <span className={cn(
                    "font-mono text-[10px] font-bold",
                    score === 3 ? "text-background" : "text-growth"
                  )}>
                    {score}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mt-auto">
        <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg">
          <TrendingUp className="h-3 w-3 text-focus" />
          <div>
            <p className="font-mono text-[10px] text-muted-foreground">This Week</p>
            <p className="font-mono text-xs font-bold text-foreground">
              {Math.floor(totalWeekMinutes / 60)}h {totalWeekMinutes % 60}m
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg">
          <Target className="h-3 w-3 text-growth" />
          <div>
            <p className="font-mono text-[10px] text-muted-foreground">Sessions</p>
            <p className="font-mono text-xs font-bold text-foreground">{totalWeekSessions}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
