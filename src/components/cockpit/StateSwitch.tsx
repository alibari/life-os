import { useState, useEffect, useRef } from "react";
import { Zap, Heart, Brain, X, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

type ActiveState = null | "focus" | "calm" | "reset";

export const StateSwitch = () => {
  const [activeState, setActiveState] = useState<ActiveState>(null);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"inhale1" | "inhale2" | "exhale">("inhale1");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const states = [
    {
      id: "focus" as const,
      label: "FOCUS",
      icon: <Zap className="h-5 w-5" />,
      gradient: "from-amber-500 to-orange-600",
      borderColor: "border-amber-500/30",
      bgColor: "bg-amber-500/10",
      textColor: "text-amber-400",
      glow: "#f59e0b",
      duration: 30,
      desc: "Rapid breathing"
    },
    {
      id: "calm" as const,
      label: "CALM",
      icon: <Heart className="h-5 w-5" />,
      gradient: "from-blue-500 to-cyan-500",
      borderColor: "border-blue-500/30",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-400",
      glow: "#3b82f6",
      duration: 60,
      desc: "Physiological sigh"
    },
    {
      id: "reset" as const,
      label: "NSDR",
      icon: <Brain className="h-5 w-5" />,
      gradient: "from-purple-500 to-pink-500",
      borderColor: "border-purple-500/30",
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-400",
      glow: "#a855f7",
      duration: 600,
      desc: "Deep rest 10m"
    }
  ];

  const activeConfig = states.find(s => s.id === activeState);

  useEffect(() => {
    if (isRunning && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer(t => {
          if (t <= 1) {
            setIsRunning(false);
            setActiveState(null);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  useEffect(() => {
    if (activeState === "calm" && isRunning) {
      const phases: ("inhale1" | "inhale2" | "exhale")[] = ["inhale1", "inhale2", "exhale"];
      const durations = [2000, 1000, 6000];
      let phaseIndex = 0;

      const cycleBreath = () => {
        setBreathPhase(phases[phaseIndex]);
        phaseIndex = (phaseIndex + 1) % phases.length;
      };

      cycleBreath();
      const breathInterval = setInterval(cycleBreath, durations[phaseIndex % 3]);
      return () => clearInterval(breathInterval);
    }
  }, [activeState, isRunning]);

  const startState = (stateId: ActiveState) => {
    const config = states.find(s => s.id === stateId);
    if (config) {
      setActiveState(stateId);
      setTimer(config.duration);
      setIsRunning(true);
    }
  };

  const stopState = () => {
    setIsRunning(false);
    setActiveState(null);
    setTimer(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Active state view
  if (activeState && activeConfig) {
    return (
      <div className="h-full card-surface p-4 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background glow */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{ background: `radial-gradient(circle at center, ${activeConfig.glow}, transparent 70%)` }}
        />

        <button
          onClick={stopState}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 transition-colors z-10"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Breathing orb */}
        <div 
          className={cn(
            "w-28 h-28 rounded-full flex items-center justify-center mb-4 transition-all duration-1000 relative",
            activeConfig.bgColor,
            "border-2",
            activeConfig.borderColor,
            activeState === "focus" && isRunning && "animate-pulse",
            activeState === "calm" && isRunning && (breathPhase === "exhale" ? "scale-75" : "scale-100"),
            activeState === "reset" && isRunning && "animate-pulse"
          )}
          style={{ boxShadow: `0 0 60px ${activeConfig.glow}50` }}
        >
          {/* Inner glow ring */}
          <div className={cn(
            "absolute inset-2 rounded-full border",
            activeConfig.borderColor,
            "opacity-50"
          )} />
          
          <div className={cn("z-10", activeConfig.textColor)}>
            {activeConfig.icon}
          </div>
        </div>

        <h4 className={cn("font-mono text-lg font-bold mb-1", activeConfig.textColor)}>
          {activeConfig.label}
        </h4>

        {activeState === "calm" && (
          <p className={cn("font-mono text-xs mb-2 transition-opacity", activeConfig.textColor)}>
            {breathPhase === "inhale1" && "INHALE..."}
            {breathPhase === "inhale2" && "INHALE AGAIN..."}
            {breathPhase === "exhale" && "EXHALE SLOWLY..."}
          </p>
        )}

        <span className="font-mono text-4xl font-bold text-foreground mb-4 tabular-nums">
          {formatTime(timer)}
        </span>

        <button
          onClick={() => setIsRunning(!isRunning)}
          className={cn(
            "p-3 rounded-full transition-all btn-press",
            activeConfig.bgColor,
            activeConfig.borderColor,
            "border-2"
          )}
        >
          {isRunning ? (
            <Pause className={cn("h-5 w-5", activeConfig.textColor)} />
          ) : (
            <Play className={cn("h-5 w-5", activeConfig.textColor)} />
          )}
        </button>
      </div>
    );
  }

  // Default selection view
  return (
    <div className="h-full card-surface p-4 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2 shrink-0">
        <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <Zap className="h-4 w-4 text-emerald-400" />
        </div>
        <h3 className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">State Switch</h3>
      </div>

      <p className="font-mono text-[9px] text-muted-foreground mb-3 shrink-0">
        Instant nervous system control
      </p>

      {/* State buttons */}
      <div className="flex-1 flex flex-col gap-2 min-h-0">
        {states.map((state) => (
          <button
            key={state.id}
            onClick={() => startState(state.id)}
            className={cn(
              "flex-1 min-h-0 rounded-xl border transition-all duration-300 btn-press",
              "flex items-center gap-3 px-4",
              "hover:scale-[1.02] active:scale-[0.98]",
              state.borderColor,
              state.bgColor,
              "relative overflow-hidden group"
            )}
          >
            {/* Hover glow */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `radial-gradient(circle at center, ${state.glow}15, transparent 70%)` }}
            />
            
            <div className={cn("shrink-0 relative z-10", state.textColor)}>{state.icon}</div>
            <div className="text-left relative z-10 min-w-0">
              <h4 className={cn("font-mono text-sm font-bold", state.textColor)}>
                {state.label}
              </h4>
              <p className="font-mono text-[9px] text-muted-foreground truncate">
                {state.desc}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
