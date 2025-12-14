import { useState } from "react";
import { Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EffortMonitorProps {
  onSubmit: (rating: number, notes?: string) => void;
  onSkip: () => void;
  sessionDuration: number;
}

export function EffortMonitor({ onSubmit, onSkip, sessionDuration }: EffortMonitorProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const getRatingColor = (value: number) => {
    if (value <= 3) return "growth";
    if (value <= 6) return "warning";
    return "destructive";
  };

  const getRatingLabel = (value: number) => {
    if (value <= 2) return "Effortless";
    if (value <= 4) return "Light";
    if (value <= 6) return "Moderate";
    if (value <= 8) return "Hard";
    return "Maximum";
  };

  const handleSubmit = () => {
    if (rating !== null) {
      onSubmit(rating, notes || undefined);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
      <div className="card-surface p-8 max-w-md w-full mx-4">
        <div className="flex items-center gap-2 mb-6">
          <Gauge className="h-5 w-5 text-focus" />
          <h2 className="font-mono text-lg text-foreground">EFFORT MONITOR</h2>
        </div>

        <p className="font-mono text-sm text-muted-foreground mb-6">
          Rate your perceived mental exertion for this {Math.round(sessionDuration / 60)} minute session
        </p>

        {/* RPE Scale */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="font-mono text-xs text-muted-foreground">Easy</span>
            <span className="font-mono text-xs text-muted-foreground">Maximum</span>
          </div>
          
          <div className="grid grid-cols-10 gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => {
              const color = getRatingColor(value);
              return (
                <button
                  key={value}
                  onClick={() => setRating(value)}
                  className={cn(
                    "aspect-square rounded-lg border font-mono text-sm transition-all",
                    rating === value
                      ? `border-${color} bg-${color}/20 text-${color}`
                      : "border-border bg-background/50 text-muted-foreground hover:border-muted-foreground"
                  )}
                >
                  {value}
                </button>
              );
            })}
          </div>

          {rating !== null && (
            <div className="mt-3 text-center">
              <span className={cn(
                "font-mono text-sm",
                `text-${getRatingColor(rating)}`
              )}>
                {getRatingLabel(rating)}
              </span>
            </div>
          )}
        </div>

        {/* Optional notes */}
        <div className="mb-6">
          <label className="block font-mono text-xs text-muted-foreground mb-2 uppercase tracking-wider">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any distractions or blockers?"
            className="w-full bg-background border border-border rounded-lg px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-focus/50 resize-none h-20"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={onSkip}
            className="flex-1 font-mono text-muted-foreground"
          >
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === null}
            className="flex-1 font-mono bg-focus hover:bg-focus/90"
          >
            Log Session
          </Button>
        </div>
      </div>
    </div>
  );
}
