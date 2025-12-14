import { cn } from "@/lib/utils";

interface UltradianArcProps {
  timeRemaining: number;
  totalDuration: number;
  isBreak?: boolean;
}

const ULTRADIAN_DURATION = 90 * 60; // 90 minutes

export function UltradianArc({ timeRemaining, totalDuration, isBreak }: UltradianArcProps) {
  const elapsed = totalDuration - timeRemaining;
  const progress = (elapsed / totalDuration) * 100;
  
  // Calculate which zone we're in (for focus sessions)
  const getZone = () => {
    if (isBreak) return { name: "RECOVERY", color: "growth" };
    
    const elapsedMinutes = elapsed / 60;
    
    if (elapsedMinutes < 15) {
      return { name: "FRICTION", color: "warning", description: "Agitation is normal. Don't quit." };
    } else if (elapsedMinutes < 75) {
      return { name: "FLOW TUNNEL", color: "focus", description: "Peak performance window." };
    } else {
      return { name: "DECLINE", color: "destructive", description: "Wrap up. Prepare for break." };
    }
  };

  const zone = getZone();

  // Calculate arc segments
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  
  // Zone boundaries as percentages
  const zone1End = 15 / 90 * 100; // 0-15 min
  const zone2End = 75 / 90 * 100; // 15-75 min
  // zone3 is 75-90 min (rest)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (isBreak) {
    return (
      <div className="relative flex items-center justify-center">
        <svg className="w-80 h-80 -rotate-90">
          <circle
            cx="160"
            cy="160"
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
            opacity="0.2"
          />
          <circle
            cx="160"
            cy="160"
            r={radius}
            fill="none"
            stroke="hsl(var(--growth))"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress / 100)}
            className="transition-all duration-1000"
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-xs text-growth tracking-widest mb-2">
            RECOVERY PHASE
          </span>
          <span className="font-mono text-6xl font-bold text-foreground">
            {formatTime(timeRemaining)}
          </span>
          <span className="font-mono text-xs text-muted-foreground mt-2">
            DILATE GAZE
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-80 h-80 -rotate-90">
        {/* Background zones */}
        {/* Zone 1: Friction (0-15 min) - Amber */}
        <circle
          cx="160"
          cy="160"
          r={radius}
          fill="none"
          stroke="hsl(var(--warning))"
          strokeWidth="8"
          opacity="0.15"
          strokeDasharray={`${circumference * zone1End / 100} ${circumference}`}
          strokeDashoffset={0}
        />
        {/* Zone 2: Flow Tunnel (15-75 min) - Cyan */}
        <circle
          cx="160"
          cy="160"
          r={radius}
          fill="none"
          stroke="hsl(var(--focus))"
          strokeWidth="8"
          opacity="0.15"
          strokeDasharray={`${circumference * (zone2End - zone1End) / 100} ${circumference}`}
          strokeDashoffset={-circumference * zone1End / 100}
        />
        {/* Zone 3: Decline (75-90 min) - Red */}
        <circle
          cx="160"
          cy="160"
          r={radius}
          fill="none"
          stroke="hsl(var(--destructive))"
          strokeWidth="8"
          opacity="0.15"
          strokeDasharray={`${circumference * (100 - zone2End) / 100} ${circumference}`}
          strokeDashoffset={-circumference * zone2End / 100}
        />

        {/* Progress arc */}
        <circle
          cx="160"
          cy="160"
          r={radius}
          fill="none"
          stroke={`hsl(var(--${zone.color}))`}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress / 100)}
          className="transition-all duration-500"
          style={{
            filter: `drop-shadow(0 0 10px hsl(var(--${zone.color})))`
          }}
        />

        {/* Zone markers */}
        {[zone1End, zone2End].map((pct, i) => {
          const angle = (pct / 100) * 2 * Math.PI - Math.PI / 2;
          const x = 160 + radius * Math.cos(angle);
          const y = 160 + radius * Math.sin(angle);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              fill="hsl(var(--background))"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="1"
            />
          );
        })}
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn(
          "font-mono text-xs tracking-widest mb-2",
          zone.color === "warning" && "text-warning",
          zone.color === "focus" && "text-focus",
          zone.color === "destructive" && "text-destructive",
        )}>
          {zone.name}
        </span>
        <span className="font-mono text-6xl font-bold text-foreground">
          {formatTime(timeRemaining)}
        </span>
        {zone.description && (
          <span className="font-mono text-xs text-muted-foreground mt-2 max-w-32 text-center">
            {zone.description}
          </span>
        )}
      </div>
    </div>
  );
}
