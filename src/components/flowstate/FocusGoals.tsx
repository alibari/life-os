import { useState, useEffect } from "react";
import { Target, Plus, Check, X, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Goal {
  id: string;
  title: string;
  targetMinutes: number;
  completedMinutes: number;
}

interface FocusGoalsProps {
  todayFocusMinutes: number;
}

export function FocusGoals({ todayFocusMinutes }: FocusGoalsProps) {
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem("flowstate-goals");
    return saved ? JSON.parse(saved) : [
      { id: "1", title: "Deep Work", targetMinutes: 180, completedMinutes: 0 },
      { id: "2", title: "Learning", targetMinutes: 60, completedMinutes: 0 },
    ];
  });
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTarget, setNewTarget] = useState(90);

  useEffect(() => {
    localStorage.setItem("flowstate-goals", JSON.stringify(goals));
  }, [goals]);

  const dailyTarget = goals.reduce((acc, g) => acc + g.targetMinutes, 0);
  const dailyProgress = Math.min((todayFocusMinutes / dailyTarget) * 100, 100);

  const addGoal = () => {
    if (!newTitle.trim()) return;
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: newTitle,
      targetMinutes: newTarget,
      completedMinutes: 0,
    };
    setGoals([...goals, newGoal]);
    setNewTitle("");
    setNewTarget(90);
    setIsAdding(false);
  };

  const removeGoal = (id: string) => {
    setGoals(goals.filter((g) => g.id !== id));
  };

  return (
    <div className="card-surface h-full p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-growth/10 border border-growth/20">
            <Target className="h-3.5 w-3.5 text-growth" />
          </div>
          <h3 className="font-mono text-xs font-medium text-foreground">Focus Goals</h3>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-1 rounded hover:bg-muted/50 transition-colors"
        >
          <Plus className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Daily Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-[10px] text-muted-foreground">Daily Target</span>
          <span className="font-mono text-xs font-medium text-foreground">
            {Math.floor(todayFocusMinutes / 60)}h {todayFocusMinutes % 60}m / {Math.floor(dailyTarget / 60)}h
          </span>
        </div>
        <div className="h-2 bg-background rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              dailyProgress >= 100 ? "bg-growth" : "bg-focus"
            )}
            style={{ width: `${dailyProgress}%` }}
          />
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-2 flex-1 overflow-auto">
        {goals.map((goal) => {
          const progress = Math.min((todayFocusMinutes / goals.length / goal.targetMinutes) * 100, 100);
          return (
            <div
              key={goal.id}
              className="flex items-center gap-2 p-2 bg-background/50 rounded-lg group"
            >
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                progress >= 100 ? "bg-growth" : "border border-border"
              )}>
                {progress >= 100 && <Check className="h-3 w-3 text-background" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs text-foreground truncate">{goal.title}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-focus rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="font-mono text-[9px] text-muted-foreground">
                    {goal.targetMinutes}m
                  </span>
                </div>
              </div>
              <button
                onClick={() => removeGoal(goal.id)}
                className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/20 transition-all"
              >
                <X className="h-3 w-3 text-destructive" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Goal Form */}
      {isAdding && (
        <div className="mt-3 p-2 bg-background rounded-lg border border-border space-y-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Goal name..."
            className="w-full bg-transparent font-mono text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={newTarget}
              onChange={(e) => setNewTarget(Number(e.target.value))}
              className="flex-1 bg-muted/50 rounded px-2 py-1 font-mono text-xs text-foreground focus:outline-none"
              min={15}
              step={15}
            />
            <span className="font-mono text-[10px] text-muted-foreground">min</span>
            <Button size="sm" onClick={addGoal} className="h-6 px-2 text-xs">
              Add
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
