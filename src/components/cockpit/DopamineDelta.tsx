import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data - will be connected to other pages/widgets later
const mockData = {
  earnedDopamine: 55, // From workouts, cold plunges, deep work
  cheapDopamine: 20,  // From social media, sugar, etc.
};

export const DopamineDelta = () => {
  const totalDelta = mockData.earnedDopamine - mockData.cheapDopamine;
  
  // Normalize to -100 to +100 range, then to 0-100 for display
  const normalizedDelta = Math.max(-100, Math.min(100, totalDelta));
  const barPosition = ((normalizedDelta + 100) / 200) * 100;

  const getStatus = () => {
    if (normalizedDelta > 20) return { label: "PRIMED", color: "text-emerald-400", glow: "shadow-[0_0_20px_rgba(16,185,129,0.4)]" };
    if (normalizedDelta > -20) return { label: "BALANCED", color: "text-blue-400", glow: "shadow-[0_0_20px_rgba(59,130,246,0.4)]" };
    return { label: "DEPLETED", color: "text-red-400", glow: "shadow-[0_0_20px_rgba(239,68,68,0.4)]" };
  };

  const status = getStatus();

  return (
    <div className="h-full card-surface p-4 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Zap className="h-4 w-4 text-emerald-400" />
          </div>
          <h3 className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">Dopamine Delta</h3>
        </div>
        <span className={cn("font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-card border border-border", status.color)}>
          {status.label}
        </span>
      </div>

      {/* Main Visual - Responsive */}
      <div className="flex-1 flex flex-col justify-center min-h-0">
        {/* Balance Bar */}
        <div className="relative mb-3">
          <div className={cn(
            "h-12 rounded-2xl bg-zinc-900/80 border border-border overflow-hidden relative transition-shadow duration-500",
            status.glow
          )}>
            {/* Gradient background */}
            <div className="absolute inset-0 flex">
              <div className="w-1/2 bg-gradient-to-r from-red-500/20 via-red-500/10 to-transparent" />
              <div className="w-1/2 bg-gradient-to-l from-emerald-500/20 via-emerald-500/10 to-transparent" />
            </div>
            
            {/* Center marker */}
            <div className="absolute left-1/2 top-2 bottom-2 w-px bg-zinc-600" />
            
            {/* Delta indicator orb */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full transition-all duration-700 ease-out flex items-center justify-center"
              style={{ 
                left: `calc(${barPosition}% - 16px)`,
                background: normalizedDelta >= 0 
                  ? 'linear-gradient(135deg, #10b981, #059669)' 
                  : 'linear-gradient(135deg, #ef4444, #dc2626)',
                boxShadow: normalizedDelta >= 0 
                  ? '0 0 20px #10b981, inset 0 1px 0 rgba(255,255,255,0.2)' 
                  : '0 0 20px #ef4444, inset 0 1px 0 rgba(255,255,255,0.2)'
              }}
            >
              <span className="font-mono text-[10px] font-bold text-white drop-shadow-lg">
                {normalizedDelta >= 0 ? '+' : ''}{normalizedDelta}
              </span>
            </div>
          </div>
          
          {/* Scale labels */}
          <div className="flex justify-between mt-2 px-1">
            <span className="font-mono text-[9px] text-red-400/60 uppercase tracking-wider">Deficit</span>
            <span className="font-mono text-[9px] text-muted-foreground">0</span>
            <span className="font-mono text-[9px] text-emerald-400/60 uppercase tracking-wider">Surplus</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-2 shrink-0">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[9px] text-muted-foreground">EARNED</p>
              <p className="font-mono text-sm font-bold text-emerald-400">+{mockData.earnedDopamine}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/10">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[9px] text-muted-foreground">CHEAP</p>
              <p className="font-mono text-sm font-bold text-red-400">-{mockData.cheapDopamine}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
