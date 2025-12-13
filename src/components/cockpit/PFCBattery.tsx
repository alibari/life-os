import { useState, useEffect } from "react";
import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";

export const PFCBattery = () => {
  const [wakeTime] = useState(() => {
    const now = new Date();
    now.setHours(7, 0, 0, 0);
    return now;
  });

  const deepWorkSessions = 2;
  const nsdrSessions = 1;

  const calculateBattery = () => {
    const now = new Date();
    const hoursAwake = (now.getTime() - wakeTime.getTime()) / (1000 * 60 * 60);
    
    const baseDecay = hoursAwake * 5;
    const deepWorkDecay = deepWorkSessions * 10;
    const nsdrRecharge = nsdrSessions * 15;
    
    return Math.max(0, Math.min(100, 100 - baseDecay - deepWorkDecay + nsdrRecharge));
  };

  const [battery, setBattery] = useState(calculateBattery);

  useEffect(() => {
    setBattery(calculateBattery());
    const interval = setInterval(() => {
      setBattery(calculateBattery());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const getZone = () => {
    if (battery >= 70) return { label: "DEEP WORK", color: "text-emerald-400", bg: "bg-emerald-500", glow: "#10b981" };
    if (battery >= 30) return { label: "ADMIN", color: "text-yellow-400", bg: "bg-yellow-500", glow: "#eab308" };
    return { label: "ZOMBIE", color: "text-red-400", bg: "bg-red-500", glow: "#ef4444" };
  };

  const zone = getZone();
  const batterySegments = 6;
  const filledSegments = Math.ceil((battery / 100) * batterySegments);

  return (
    <div className="h-full card-surface p-4 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Brain className="h-4 w-4 text-blue-400" />
          </div>
          <h3 className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">PFC Battery</h3>
        </div>
        <span className={cn("font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-card border border-border", zone.color)}>
          {zone.label}
        </span>
      </div>

      {/* Main Visual - Horizontal Battery for better width usage */}
      <div className="flex-1 flex flex-col justify-center min-h-0 py-2">
        <div className="relative">
          {/* Battery body - horizontal */}
          <div 
            className="h-14 lg:h-20 rounded-xl border-2 border-zinc-700 bg-zinc-900/80 p-1.5 flex gap-1 transition-shadow duration-500"
            style={{ boxShadow: `0 0 30px ${zone.glow}30` }}
          >
            {Array.from({ length: batterySegments }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 rounded-md transition-all duration-500",
                  i < filledSegments
                    ? battery >= 70
                      ? "bg-gradient-to-t from-emerald-600 to-emerald-400"
                      : battery >= 30
                        ? "bg-gradient-to-t from-yellow-600 to-yellow-400"
                        : "bg-gradient-to-t from-red-600 to-red-400"
                    : "bg-zinc-800/50"
                )}
                style={{
                  boxShadow: i < filledSegments ? `0 0 10px ${zone.glow}60` : 'none'
                }}
              />
            ))}
          </div>
          
          {/* Battery cap */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[6px] w-2 h-6 lg:h-8 rounded-r-md bg-zinc-700 border-2 border-l-0 border-zinc-600" />
          
          {/* Percentage overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1">
              <span className="font-mono text-xl lg:text-2xl font-bold text-foreground">
                {Math.round(battery)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-2 shrink-0 mt-2">
        <div className="text-center p-2 lg:p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
          <p className="font-mono text-[9px] lg:text-[10px] text-muted-foreground">DEEP WORK</p>
          <p className="font-mono text-sm lg:text-base font-bold text-yellow-400">{deepWorkSessions}x</p>
        </div>
        <div className="text-center p-2 lg:p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
          <p className="font-mono text-[9px] lg:text-[10px] text-muted-foreground">NSDR</p>
          <p className="font-mono text-sm lg:text-base font-bold text-blue-400">{nsdrSessions}x</p>
        </div>
      </div>
    </div>
  );
};
