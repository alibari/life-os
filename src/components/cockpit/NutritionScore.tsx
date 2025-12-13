import { Apple, Droplets, Flame, Pill } from "lucide-react";

export const NutritionScore = () => {
  const score = 72;
  const hydration = 65;
  const calories = 1850;
  const calorieGoal = 2200;
  const supplements = 3;
  const supplementGoal = 5;

  const getScoreColor = (val: number) => {
    if (val >= 80) return "text-primary";
    if (val >= 60) return "text-yellow-500";
    return "text-destructive";
  };

  return (
    <div className="card-surface p-3 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Apple className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
            NUTRITION
          </span>
        </div>
        <span className={`font-mono text-sm font-bold ${getScoreColor(score)}`}>
          {score}/100
        </span>
      </div>

      <div className="flex-1 space-y-2 min-h-0">
        {/* Hydration */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Droplets className="h-3 w-3 text-secondary" />
              <span className="text-[10px] text-muted-foreground">Hydration</span>
            </div>
            <span className="font-mono text-[10px] text-foreground">{hydration}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary rounded-full transition-all"
              style={{ width: `${hydration}%` }}
            />
          </div>
        </div>

        {/* Calories */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Flame className="h-3 w-3 text-orange-500" />
              <span className="text-[10px] text-muted-foreground">Calories</span>
            </div>
            <span className="font-mono text-[10px] text-foreground">
              {calories}/{calorieGoal}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all"
              style={{ width: `${Math.min((calories / calorieGoal) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Supplements */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Pill className="h-3 w-3 text-primary" />
              <span className="text-[10px] text-muted-foreground">Supplements</span>
            </div>
            <span className="font-mono text-[10px] text-foreground">
              {supplements}/{supplementGoal}
            </span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: supplementGoal }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded-full ${
                  i < supplements ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto pt-2 border-t border-border">
        <div className="text-[9px] text-muted-foreground text-center">
          Next meal in <span className="text-foreground font-mono">2h 15m</span>
        </div>
      </div>
    </div>
  );
};
