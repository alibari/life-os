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
      icon: <Zap className="h-6 w-6" />,
      color: "from-yellow-500 to-orange-500",
      borderColor: "border-yellow-500/50",
      bgColor: "bg-yellow-500/20",
      textColor: "text-yellow-400",
      duration: 30,
      description: "Rapid breathing for adrenaline"
    },
    {
      id: "calm" as const,
      label: "CALM",
      icon: <Heart className="h-6 w-6" />,
      color: "from-blue-500 to-cyan-500",
      borderColor: "border-blue-500/50",
      bgColor: "bg-blue-500/20",
      textColor: "text-blue-400",
      duration: 60,
      description: "Physiological sigh protocol"
    },
    {
      id: "reset" as const,
      label: "NSDR",
      icon: <Brain className="h-6 w-6" />,
      color: "from-purple-500 to-pink-500",
      borderColor: "border-purple-500/50",
      bgColor: "bg-purple-500/20",
      textColor: "text-purple-400",
      duration: 600,
      description: "10-min deep rest session"
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

  // Breath phase cycling for calm state
  useEffect(() => {
    if (activeState === "calm" && isRunning) {
      const phases: ("inhale1" | "inhale2" | "exhale")[] = ["inhale1", "inhale2", "exhale"];
      const durations = [2000, 1000, 6000]; // Double inhale, long exhale
      let phaseIndex = 0;

      const cycleBreath = () => {
        setBreathPhase(phases[phaseIndex]);
        phaseIndex = (phaseIndex + 1) % phases.length;
      };

      cycleBreath();
      const breathInterval = setInterval(() => {
        cycleBreath();
      }, durations[phaseIndex % 3]);

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

  if (activeState && activeConfig) {
    return (
      <div className="h-full card-surface p-4 flex flex-col items-center justify-center relative">
        <button
          onClick={stopState}
          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className={cn(
          "w-32 h-32 rounded-full flex items-center justify-center mb-4 transition-all duration-1000",
          activeConfig.bgColor,
          "border-2",
          activeConfig.borderColor,
          activeState === "focus" && isRunning && "animate-pulse scale-110",
          activeState === "calm" && isRunning && (
            breathPhase === "exhale" ? "scale-90" : "scale-110"
          ),
          activeState === "reset" && isRunning && "animate-pulse"
        )}
        style={{
          boxShadow: `0 0 40px ${activeState === "focus" ? "#eab308" : activeState === "calm" ? "#3b82f6" : "#a855f7"}40`
        }}
        >
          <div className={cn("transition-transform duration-500", activeConfig.textColor)}>
            {activeConfig.icon}
          </div>
        </div>

        <h4 className={cn("font-mono text-lg font-bold mb-1", activeConfig.textColor)}>
          {activeConfig.label}
        </h4>

        {activeState === "calm" && (
          <p className="font-mono text-sm text-muted-foreground mb-2 animate-pulse">
            {breathPhase === "inhale1" && "INHALE..."}
            {breathPhase === "inhale2" && "INHALE AGAIN..."}
            {breathPhase === "exhale" && "LONG EXHALE..."}
          </p>
        )}

        <span className="font-mono text-3xl font-bold text-foreground mb-4">
          {formatTime(timer)}
        </span>

        <button
          onClick={() => setIsRunning(!isRunning)}
          className={cn(
            "p-3 rounded-full transition-all btn-press",
            activeConfig.bgColor,
            activeConfig.borderColor,
            "border"
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

  return (
    <div className="h-full card-surface p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-emerald-400" />
        <h3 className="font-mono text-sm font-bold text-foreground">STATE SWITCH</h3>
      </div>

      <p className="font-mono text-[10px] text-muted-foreground mb-4">
        Instant nervous system control. Tap to activate.
      </p>

      <div className="flex-1 flex flex-col gap-3">
        {states.map((state) => (
          <button
            key={state.id}
            onClick={() => startState(state.id)}
            className={cn(
              "flex-1 rounded-xl border-2 transition-all duration-300 btn-press",
              "flex items-center justify-center gap-3",
              "hover:scale-[1.02]",
              state.borderColor,
              state.bgColor,
              "hover:shadow-lg"
            )}
            style={{
              background: `linear-gradient(135deg, ${state.id === "focus" ? "#eab30810" : state.id === "calm" ? "#3b82f610" : "#a855f710"}, transparent)`
            }}
          >
            <div className={state.textColor}>{state.icon}</div>
            <div className="text-left">
              <h4 className={cn("font-mono text-sm font-bold", state.textColor)}>
                {state.label}
              </h4>
              <p className="font-mono text-[9px] text-muted-foreground">
                {state.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
