import { useState, useEffect } from "react";
import { Moon, Coffee, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CaffeineLog {
  time: Date;
  expiresAt: Date;
}

export const AdenosinePressure = () => {
  const [wakeTime] = useState(() => {
    const now = new Date();
    now.setHours(7, 0, 0, 0);
    return now;
  });
  
  const [caffeineLog, setCaffeineLog] = useState<CaffeineLog[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const hoursAwake = Math.max(0, (currentTime.getTime() - wakeTime.getTime()) / (1000 * 60 * 60));
  const maxPressure = 16; // Hours to peak pressure
  const pressure = Math.min(100, (hoursAwake / maxPressure) * 100);

  // Check if caffeine is active
  const activeCaffeine = caffeineLog.filter(c => c.expiresAt > currentTime);
  const caffeineActive = activeCaffeine.length > 0;
  
  // Find crash time
  const crashTime = activeCaffeine.length > 0 
    ? new Date(Math.max(...activeCaffeine.map(c => c.expiresAt.getTime())))
    : null;

  const logCaffeine = () => {
    const now = new Date();
    const expires = new Date(now.getTime() + 6 * 60 * 60 * 1000); // 6 hour half-life
    setCaffeineLog(prev => [...prev, { time: now, expiresAt: expires }]);
  };

  // Generate wave points
  const generateWave = () => {
    const points: string[] = [];
    const width = 200;
    const height = 60;
    
    for (let x = 0; x <= width; x += 4) {
      const progress = x / width;
      const y = height - (progress * pressure * 0.6);
      points.push(`${x},${y}`);
    }
    
    return `M0,${height} L${points.join(' L')} L${width},${height} Z`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="h-full card-surface p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Moon className="h-5 w-5 text-purple-400" />
          <h3 className="font-mono text-sm font-bold text-foreground">ADENOSINE PRESSURE</h3>
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {hoursAwake.toFixed(1)}h awake
        </span>
      </div>

      {/* Wave Visualization */}
      <div className="flex-1 relative bg-zinc-900/50 rounded-lg border border-border overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
          {/* Pressure wave */}
          <path
            d={generateWave()}
            fill="url(#pressureGradient)"
            className="transition-all duration-1000"
          />
          
          {/* Caffeine mask line */}
          {caffeineActive && (
            <line
              x1="0"
              y1="30"
              x2="200"
              y2="30"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="4,4"
              className="animate-pulse"
            />
          )}
          
          <defs>
            <linearGradient id="pressureGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6b7280" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#6b7280" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>

        {/* Labels */}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <div className="w-3 h-0.5 bg-zinc-500" />
          <span className="font-mono text-[10px] text-zinc-500">Sleep Pressure</span>
        </div>
        
        {caffeineActive && (
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <div className="w-3 h-0.5 bg-blue-500" />
            <span className="font-mono text-[10px] text-blue-400">Caffeine Mask</span>
          </div>
        )}

        {/* Pressure percentage */}
        <div className="absolute bottom-2 left-2">
          <span className={cn(
            "font-mono text-lg font-bold",
            pressure > 70 ? "text-red-400" : pressure > 40 ? "text-yellow-400" : "text-emerald-400"
          )}>
            {Math.round(pressure)}%
          </span>
        </div>
      </div>

      {/* Crash Prediction */}
      {crashTime && (
        <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          <span className="font-mono text-[10px] text-yellow-400">
            CRASH PREDICTED: {formatTime(crashTime)}
          </span>
        </div>
      )}

      {/* Caffeine Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={logCaffeine}
        className={cn(
          "mt-2 btn-press font-mono text-xs gap-2",
          caffeineActive && "border-blue-500/50 text-blue-400"
        )}
      >
        <Coffee className="h-4 w-4" />
        LOG CAFFEINE
        {activeCaffeine.length > 0 && (
          <span className="ml-1 px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
            {activeCaffeine.length}
          </span>
        )}
      </Button>
    </div>
  );
};
