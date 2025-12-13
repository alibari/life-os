import { useState, useEffect } from "react";
import { Moon, AlertTriangle, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";

export const AdenosinePressure = () => {
  const [wakeTime] = useState(() => {
    const now = new Date();
    now.setHours(7, 0, 0, 0);
    return now;
  });
  
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock caffeine data - will be connected to other pages later
  const caffeineIntakes = [
    { time: new Date(new Date().setHours(8, 30, 0, 0)) },
    { time: new Date(new Date().setHours(14, 0, 0, 0)) },
  ];

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const hoursAwake = Math.max(0, (currentTime.getTime() - wakeTime.getTime()) / (1000 * 60 * 60));
  const maxPressure = 16;
  const pressure = Math.min(100, (hoursAwake / maxPressure) * 100);

  // Calculate active caffeine (6-hour half-life)
  const activeCaffeine = caffeineIntakes.filter(c => {
    const expiresAt = new Date(c.time.getTime() + 6 * 60 * 60 * 1000);
    return expiresAt > currentTime && c.time < currentTime;
  });
  const caffeineActive = activeCaffeine.length > 0;
  
  // Find crash time
  const crashTime = activeCaffeine.length > 0 
    ? new Date(Math.max(...activeCaffeine.map(c => c.time.getTime() + 6 * 60 * 60 * 1000)))
    : null;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getPressureColor = () => {
    if (pressure > 70) return { color: "text-red-400", bg: "from-red-500/30", glow: "#ef4444" };
    if (pressure > 40) return { color: "text-yellow-400", bg: "from-yellow-500/30", glow: "#eab308" };
    return { color: "text-emerald-400", bg: "from-emerald-500/30", glow: "#10b981" };
  };

  const pressureStyle = getPressureColor();

  return (
    <div className="h-full card-surface p-4 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <Moon className="h-4 w-4 text-purple-400" />
          </div>
          <h3 className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">Adenosine</h3>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground bg-card px-2 py-0.5 rounded-full border border-border">
          {hoursAwake.toFixed(1)}h awake
        </span>
      </div>

      {/* Wave Visualization */}
      <div 
        className="flex-1 relative bg-zinc-900/60 rounded-xl border border-border overflow-hidden min-h-0"
        style={{ boxShadow: `inset 0 -20px 40px ${pressureStyle.glow}10` }}
      >
        {/* Animated wave layers */}
        <div className="absolute inset-0">
          {/* Primary wave */}
          <svg className="absolute bottom-0 w-full" style={{ height: `${pressure}%` }} viewBox="0 0 200 50" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6b7280" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#6b7280" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path
              d="M0,25 Q25,10 50,25 T100,25 T150,25 T200,25 L200,50 L0,50 Z"
              fill="url(#waveGradient)"
              className="animate-pulse"
            />
          </svg>
          
          {/* Caffeine mask line */}
          {caffeineActive && (
            <div 
              className="absolute left-0 right-0 border-t-2 border-dashed border-blue-500 animate-pulse"
              style={{ top: '35%' }}
            >
              <div className="absolute -top-3 right-2 flex items-center gap-1 bg-blue-500/20 rounded px-1.5 py-0.5">
                <Coffee className="h-3 w-3 text-blue-400" />
                <span className="font-mono text-[8px] text-blue-400">MASKED</span>
              </div>
            </div>
          )}
        </div>

        {/* Pressure indicator */}
        <div className="absolute bottom-3 left-3 flex items-end gap-2">
          <span className={cn("font-mono text-2xl font-bold", pressureStyle.color)}>
            {Math.round(pressure)}%
          </span>
          <span className="font-mono text-[9px] text-muted-foreground mb-1">PRESSURE</span>
        </div>

        {/* Legend */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-zinc-500" />
            <span className="font-mono text-[8px] text-zinc-500">Sleep Debt</span>
          </div>
          {caffeineActive && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="font-mono text-[8px] text-blue-400">Caffeine</span>
            </div>
          )}
        </div>
      </div>

      {/* Crash Prediction */}
      {crashTime && crashTime > currentTime && (
        <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 shrink-0">
          <AlertTriangle className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
          <span className="font-mono text-[10px] text-yellow-400">
            CRASH: {formatTime(crashTime)}
          </span>
        </div>
      )}

      {/* Caffeine count */}
      {!crashTime && (
        <div className="flex items-center justify-center gap-2 mt-2 p-2 rounded-lg bg-zinc-800/50 border border-border shrink-0">
          <Coffee className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-mono text-[10px] text-muted-foreground">
            {caffeineIntakes.length} caffeine today
          </span>
        </div>
      )}
    </div>
  );
};
