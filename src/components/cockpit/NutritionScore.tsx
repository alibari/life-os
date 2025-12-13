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
    <div className="card-surface p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Apple className="h-4 w-4 text-primary" />
          <span className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
            Nutrition
          </span>
        </div>
        <span className={`font-mono text-lg font-bold ${getScoreColor(score)}`}>
          {score}/100
        </span>
      </div>

      <div className="flex-1 space-y-4 min-h-0">
        {/* Hydration */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-secondary" />
              <span className="text-sm text-muted-foreground">Hydration</span>
            </div>
            <span className="font-mono text-sm font-semibold text-foreground">{hydration}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary rounded-full transition-all"
              style={{ width: `${hydration}%` }}
            />
          </div>
        </div>

        {/* Calories */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">Calories</span>
            </div>
            <span className="font-mono text-sm font-semibold text-foreground">
              {calories}/{calorieGoal}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all"
              style={{ width: `${Math.min((calories / calorieGoal) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Supplements */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pill className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Supplements</span>
            </div>
            <span className="font-mono text-sm font-semibold text-foreground">
              {supplements}/{supplementGoal}
            </span>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: supplementGoal }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full ${
                  i < supplements ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto pt-3 border-t border-border">
        <div className="text-sm text-muted-foreground text-center">
          Next meal in <span className="text-foreground font-mono font-semibold">2h 15m</span>
        </div>
      </div>
    </div>
  );
};
