import { Brain, TrendingUp, TrendingDown } from "lucide-react";

export const BrainScore = () => {
  const score = 78;
  const trend = 5;
  const isPositive = trend >= 0;

  return (
    <div className="card-surface p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="h-4 w-4 text-secondary" />
        <span className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
          Brain Score
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        <div className="relative">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="6"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="hsl(var(--secondary))"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 264} 264`}
              className="drop-shadow-[0_0_12px_hsl(var(--secondary)/0.5)]"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-3xl font-bold text-foreground">{score}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-primary" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
          <span className={`font-mono text-sm font-semibold ${isPositive ? "text-primary" : "text-destructive"}`}>
            {isPositive ? "+" : ""}{trend}%
          </span>
          <span className="text-xs text-muted-foreground">vs yesterday</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-auto pt-3 border-t border-border">
        <div className="text-center">
          <div className="font-mono text-lg font-bold text-foreground">92</div>
          <div className="text-xs text-muted-foreground">Focus</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-lg font-bold text-foreground">71</div>
          <div className="text-xs text-muted-foreground">Memory</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-lg font-bold text-foreground">68</div>
          <div className="text-xs text-muted-foreground">Clarity</div>
        </div>
      </div>
    </div>
  );
};
