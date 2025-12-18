import { Zap, TrendingUp } from "lucide-react";
import { mockVoltage } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export function TReadyScore() {
  const { current, trend, status } = mockVoltage;

  return (
    <div className="h-full flex flex-col">


      <div className="flex-1 flex flex-col justify-center min-h-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 lg:p-3 rounded-lg shrink-0",
                status === "optimal" && "bg-primary/10 glow-anabolic"
              )}
            >
              <Zap
                className={cn(
                  "h-6 w-6 lg:h-8 lg:w-8",
                  status === "optimal" ? "text-primary" : "text-muted-foreground"
                )}
              />
            </div>

            <div>
              <p className="font-mono text-3xl lg:text-4xl font-bold text-foreground">
                {current}
                <span className="text-base lg:text-lg text-muted-foreground ml-1">%</span>
              </p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                <span className="font-mono text-sm text-primary">{trend}</span>
                <span className="text-xs text-muted-foreground ml-1">
                  vs yesterday
                </span>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p
              className={cn(
                "font-mono text-sm tracking-wider",
                status === "optimal" && "text-primary"
              )}
            >
              {status.toUpperCase()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Based on habits
            </p>
          </div>
        </div>
      </div>

      {/* Mini bars */}
      <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-border shrink-0">
        {["Sleep", "HRV", "Activity", "Recovery"].map((metric, i) => (
          <div key={metric} className="text-center">
            <div className="h-10 lg:h-14 bg-muted rounded-sm overflow-hidden flex flex-col justify-end">
              <div
                className="bg-primary/60 rounded-t-sm transition-all"
                style={{ height: `${70 + i * 8}%` }}
              />
            </div>
            <p className="text-[10px] lg:text-xs text-muted-foreground mt-1.5">{metric}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
