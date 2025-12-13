import { Brain, TrendingUp, TrendingDown } from "lucide-react";

export const BrainScore = () => {
  const score = 78;
  const trend = 5;
  const isPositive = trend >= 0;

  return (
    <div className="card-surface p-3 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <Brain className="h-3.5 w-3.5 text-secondary" />
        <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
          BRAIN SCORE
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        <div className="relative">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="hsl(var(--secondary))"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 264} 264`}
              className="drop-shadow-[0_0_8px_hsl(var(--secondary)/0.5)]"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-xl font-bold text-foreground">{score}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-2">
          {isPositive ? (
            <TrendingUp className="h-3 w-3 text-primary" />
          ) : (
            <TrendingDown className="h-3 w-3 text-destructive" />
          )}
          <span className={`font-mono text-xs ${isPositive ? "text-primary" : "text-destructive"}`}>
            {isPositive ? "+" : ""}{trend}%
          </span>
          <span className="text-[10px] text-muted-foreground">vs yesterday</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1 mt-auto pt-2 border-t border-border">
        <div className="text-center">
          <div className="font-mono text-xs font-semibold text-foreground">92</div>
          <div className="text-[9px] text-muted-foreground">Focus</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-xs font-semibold text-foreground">71</div>
          <div className="text-[9px] text-muted-foreground">Memory</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-xs font-semibold text-foreground">68</div>
          <div className="text-[9px] text-muted-foreground">Clarity</div>
        </div>
      </div>
    </div>
  );
};
