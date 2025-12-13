import { useState } from "react";
import { Zap, Coffee, Smartphone, Dumbbell, Brain, Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";

interface DopamineInput {
  id: string;
  name: string;
  icon: React.ReactNode;
  value: number;
  type: "earned" | "cheap";
  logged: boolean;
}

const defaultInputs: DopamineInput[] = [
  { id: "cold", name: "Cold Plunge", icon: <Snowflake className="h-4 w-4" />, value: 25, type: "earned", logged: false },
  { id: "workout", name: "Workout", icon: <Dumbbell className="h-4 w-4" />, value: 30, type: "earned", logged: false },
  { id: "deepwork", name: "Deep Work", icon: <Brain className="h-4 w-4" />, value: 20, type: "earned", logged: false },
  { id: "social", name: "Social Media", icon: <Smartphone className="h-4 w-4" />, value: -20, type: "cheap", logged: false },
  { id: "sugar", name: "Sugar", icon: <Coffee className="h-4 w-4" />, value: -15, type: "cheap", logged: false },
];

export const DopamineDelta = () => {
  const [inputs, setInputs] = useState<DopamineInput[]>(defaultInputs);

  const toggleInput = (id: string) => {
    setInputs(prev => prev.map(input => 
      input.id === id ? { ...input, logged: !input.logged } : input
    ));
  };

  const totalDelta = inputs.reduce((acc, input) => 
    input.logged ? acc + input.value : acc, 0
  );

  // Normalize to -100 to +100 range, then to 0-100 for display
  const normalizedDelta = Math.max(-100, Math.min(100, totalDelta));
  const barPosition = ((normalizedDelta + 100) / 200) * 100;

  const getStatus = () => {
    if (normalizedDelta > 20) return { label: "PRIMED", color: "text-emerald-400" };
    if (normalizedDelta > -20) return { label: "BALANCED", color: "text-blue-400" };
    return { label: "DEPLETED", color: "text-red-400" };
  };

  const status = getStatus();

  return (
    <div className="h-full card-surface p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-emerald-400" />
          <h3 className="font-mono text-sm font-bold text-foreground">DOPAMINE DELTA</h3>
        </div>
        <span className={cn("font-mono text-xs font-bold", status.color)}>
          {status.label}
        </span>
      </div>

      {/* Balance Bar */}
      <div className="relative mb-4">
        <div className="h-8 rounded-full bg-zinc-900 border border-border overflow-hidden relative">
          {/* Gradient background */}
          <div className="absolute inset-0 flex">
            <div className="w-1/2 bg-gradient-to-r from-red-500/30 to-zinc-800" />
            <div className="w-1/2 bg-gradient-to-r from-zinc-800 to-emerald-500/30" />
          </div>
          
          {/* Center marker */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-zinc-500 z-10" />
          
          {/* Delta indicator */}
          <div 
            className="absolute top-1 bottom-1 w-4 rounded-full transition-all duration-500 ease-out z-20"
            style={{ 
              left: `calc(${barPosition}% - 8px)`,
              background: normalizedDelta >= 0 
                ? 'linear-gradient(180deg, #10b981, #059669)' 
                : 'linear-gradient(180deg, #ef4444, #dc2626)',
              boxShadow: normalizedDelta >= 0 
                ? '0 0 12px #10b981' 
                : '0 0 12px #ef4444'
            }}
          />
        </div>
        
        {/* Labels */}
        <div className="flex justify-between mt-1">
          <span className="font-mono text-[10px] text-red-400/70">DEFICIT</span>
          <span className="font-mono text-[10px] text-muted-foreground">
            {normalizedDelta >= 0 ? '+' : ''}{normalizedDelta}
          </span>
          <span className="font-mono text-[10px] text-emerald-400/70">SURPLUS</span>
        </div>
      </div>

      {/* Input Buttons */}
      <div className="flex-1 grid grid-cols-2 gap-2">
        {inputs.map((input) => (
          <button
            key={input.id}
            onClick={() => toggleInput(input.id)}
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg border transition-all duration-200 btn-press",
              input.logged
                ? input.type === "earned"
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                  : "bg-red-500/20 border-red-500/50 text-red-400"
                : "bg-zinc-900/50 border-border text-muted-foreground hover:border-zinc-600"
            )}
          >
            {input.icon}
            <span className="font-mono text-[10px] truncate">{input.name}</span>
            <span className={cn(
              "ml-auto font-mono text-[10px]",
              input.value > 0 ? "text-emerald-400" : "text-red-400"
            )}>
              {input.value > 0 ? '+' : ''}{input.value}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
