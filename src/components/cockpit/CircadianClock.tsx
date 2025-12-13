import { useMemo } from "react";
import { circadianMarkers } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export function CircadianClock() {
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();
  const currentTimePercent = ((currentHour * 60 + currentMinute) / (24 * 60)) * 100;

  const timelineSegments = useMemo(() => {
    return [
      { start: 0, end: 25, type: "sleep", label: "SLEEP" },
      { start: 25, end: 29, type: "cortisol", label: "CORTISOL WINDOW" },
      { start: 29, end: 41.7, type: "ramp", label: "RAMP" },
      { start: 41.7, end: 58.3, type: "focus", label: "PEAK FOCUS" },
      { start: 58.3, end: 75, type: "afternoon", label: "AFTERNOON" },
      { start: 75, end: 87.5, type: "wind-down", label: "WIND DOWN" },
      { start: 87.5, end: 100, type: "sleep", label: "SLEEP" },
    ];
  }, []);

  const getSegmentColor = (type: string) => {
    switch (type) {
      case "cortisol":
        return "bg-amber-500/30";
      case "focus":
        return "bg-secondary/30";
      case "wind-down":
        return "bg-purple-500/30";
      case "sleep":
        return "bg-muted";
      default:
        return "bg-muted";
    }
  };

  const hours = [0, 6, 12, 18, 24];

  return (
    <div className="card-surface p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
      <h2 className="font-mono text-xs text-muted-foreground tracking-wider mb-4">
        CIRCADIAN RHYTHM
      </h2>

      {/* Timeline */}
      <div className="relative">
        {/* Background segments */}
        <div className="h-12 rounded-lg overflow-hidden flex">
          {timelineSegments.map((segment, i) => (
            <div
              key={i}
              className={cn("h-full", getSegmentColor(segment.type))}
              style={{ width: `${segment.end - segment.start}%` }}
            />
          ))}
        </div>

        {/* Current time indicator */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
          style={{ left: `${currentTimePercent}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full animate-pulse-glow" />
        </div>

        {/* Hour markers */}
        <div className="flex justify-between mt-2">
          {hours.map((hour) => (
            <span key={hour} className="font-mono text-xs text-muted-foreground">
              {hour.toString().padStart(2, "0")}:00
            </span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-amber-500/30" />
          <span className="text-xs text-muted-foreground">Cortisol</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-secondary/30" />
          <span className="text-xs text-muted-foreground">Peak Focus</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-purple-500/30" />
          <span className="text-xs text-muted-foreground">Wind Down</span>
        </div>
      </div>

      {/* Current Phase */}
      <div className="mt-4 p-3 rounded-lg bg-card border border-border">
        <p className="font-mono text-xs text-muted-foreground">CURRENT PHASE</p>
        <p className="font-mono text-lg text-secondary mt-1">
          {currentHour >= 10 && currentHour < 14
            ? "PEAK FOCUS // EXECUTE"
            : currentHour >= 6 && currentHour < 7
            ? "CORTISOL WINDOW // MOVE"
            : currentHour >= 21
            ? "WIND DOWN // RECOVER"
            : "STANDARD OPERATION"}
        </p>
      </div>
    </div>
  );
}
