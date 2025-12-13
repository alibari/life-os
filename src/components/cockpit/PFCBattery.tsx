import { useState, useEffect } from "react";
import { Brain, Zap, Coffee, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const PFCBattery = () => {
  const [wakeTime] = useState(() => {
    const now = new Date();
    now.setHours(7, 0, 0, 0); // Assume 7 AM wake
    return now;
  });
  
  const [deepWorkSessions, setDeepWorkSessions] = useState(1);
  const [nsdrSessions, setNsdrSessions] = useState(0);

  const calculateBattery = () => {
    const now = new Date();
    const hoursAwake = (now.getTime() - wakeTime.getTime()) / (1000 * 60 * 60);
    
    // Base decay: -5% per hour
    const baseDecay = hoursAwake * 5;
    // Deep work decay: -10% per session
    const deepWorkDecay = deepWorkSessions * 10;
    // NSDR recharge: +15% per session
    const nsdrRecharge = nsdrSessions * 15;
    
    return Math.max(0, Math.min(100, 100 - baseDecay - deepWorkDecay + nsdrRecharge));
  };

  const [battery, setBattery] = useState(calculateBattery);

  useEffect(() => {
    const interval = setInterval(() => {
      setBattery(calculateBattery());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [deepWorkSessions, nsdrSessions]);

  const getZone = () => {
    if (battery >= 70) return { label: "DEEP WORK", color: "text-emerald-400", bg: "bg-emerald-500" };
    if (battery >= 30) return { label: "ADMIN MODE", color: "text-yellow-400", bg: "bg-yellow-500" };
    return { label: "ZOMBIE MODE", color: "text-red-400", bg: "bg-red-500" };
  };

  const zone = getZone();

  const batterySegments = 10;
  const filledSegments = Math.ceil((battery / 100) * batterySegments);

  return (
    <div className="h-full card-surface p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-400" />
          <h3 className="font-mono text-sm font-bold text-foreground">PFC BATTERY</h3>
        </div>
        <span className={cn("font-mono text-xs font-bold", zone.color)}>
          {zone.label}
        </span>
      </div>

      {/* Battery Visual */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          {/* Battery body */}
          <div className="w-24 h-40 rounded-lg border-2 border-zinc-600 bg-zinc-900 p-1.5 flex flex-col-reverse gap-1">
            {Array.from({ length: batterySegments }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 rounded-sm transition-all duration-300",
                  i < filledSegments
                    ? battery >= 70
                      ? "bg-emerald-500 shadow-[0_0_8px_#10b981]"
                      : battery >= 30
                        ? "bg-yellow-500 shadow-[0_0_8px_#eab308]"
                        : "bg-red-500 shadow-[0_0_8px_#ef4444]"
                    : "bg-zinc-800"
                )}
              />
            ))}
          </div>
          
          {/* Battery cap */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3 rounded-t-md bg-zinc-600" />
          
          {/* Percentage overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-2xl font-bold text-foreground drop-shadow-lg">
              {Math.round(battery)}%
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDeepWorkSessions(s => s + 1)}
          className="btn-press font-mono text-[10px] gap-1 h-8"
        >
          <Zap className="h-3 w-3 text-yellow-400" />
          DEEP WORK
          <span className="text-red-400">-10%</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setNsdrSessions(s => s + 1)}
          className="btn-press font-mono text-[10px] gap-1 h-8"
        >
          <Moon className="h-3 w-3 text-blue-400" />
          NSDR
          <span className="text-emerald-400">+15%</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="flex justify-between mt-2 text-[10px] font-mono text-muted-foreground">
        <span>Deep Work: {deepWorkSessions}</span>
        <span>NSDR: {nsdrSessions}</span>
      </div>
    </div>
  );
};
