import { Zap, TrendingUp } from "lucide-react";
import { mockVoltage } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export function TReadyScore() {
  const { current, trend, status } = mockVoltage;

  return (
    <div className="card-surface p-4 h-full flex flex-col">
      <h2 className="font-mono text-xs text-muted-foreground tracking-wider mb-2">
        SYSTEM VOLTAGE
      </h2>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "p-3 rounded-lg",
              status === "optimal" && "bg-primary/10 glow-anabolic"
            )}
          >
            <Zap
              className={cn(
                "h-8 w-8",
                status === "optimal" ? "text-primary" : "text-muted-foreground"
              )}
            />
          </div>

          <div>
            <p className="font-mono text-4xl font-bold text-foreground">
              {current}
              <span className="text-lg text-muted-foreground ml-1">%</span>
            </p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="font-mono text-sm text-primary">{trend}</span>
              <span className="text-xs text-muted-foreground ml-1">
                vs yesterday
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p
            className={cn(
              "font-mono text-sm tracking-wider",
              status === "optimal" && "text-primary"
            )}
          >
            {status.toUpperCase()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Based on yesterday's habits
          </p>
        </div>
      </div>

      {/* Mini bars */}
      <div className="grid grid-cols-4 gap-2 mt-6 pt-4 border-t border-border">
        {["Sleep", "HRV", "Activity", "Recovery"].map((metric, i) => (
          <div key={metric} className="text-center">
            <div className="h-12 bg-muted rounded-sm overflow-hidden flex flex-col justify-end">
              <div
                className="bg-primary/60 rounded-t-sm transition-all"
                style={{ height: `${70 + i * 8}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{metric}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
