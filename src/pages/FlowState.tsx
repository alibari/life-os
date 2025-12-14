import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Target, Clock, Zap, Brain, Eye, Sparkles, Activity, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VisualAnchor } from "@/components/flowstate/VisualAnchor";
import { UltradianArc } from "@/components/flowstate/UltradianArc";
import { ZeigarnikDump } from "@/components/flowstate/ZeigarnikDump";
import { NeuralTune } from "@/components/flowstate/NeuralTune";
import { RefractionBreak } from "@/components/flowstate/RefractionBreak";
import { EffortMonitor } from "@/components/flowstate/EffortMonitor";

const ULTRADIAN_DURATION = 90 * 60;
const BREAK_DURATION = 20 * 60;

type SessionPhase = "idle" | "anchor" | "focus" | "effort" | "refraction" | "break" | "complete";

interface Session {
  id: string;
  startTime: Date;
  endTime?: Date;
  focusMinutes: number;
  completed: boolean;
  rpe?: number;
  notes?: string;
  capturedThoughts: string[];
}

const PROTOCOL_STEPS = [
  { icon: Eye, label: "Visual Anchor", desc: "Prime nervous system", color: "warning" },
  { icon: Activity, label: "Friction Zone", desc: "15min norepinephrine load", color: "warning" },
  { icon: Sparkles, label: "Flow Tunnel", desc: "Peak focus 15-75min", color: "focus" },
  { icon: Timer, label: "Decline", desc: "Wrap up 75-90min", color: "destructive" },
];

export default function FlowState() {
  const [phase, setPhase] = useState<SessionPhase>("idle");
  const [timeRemaining, setTimeRemaining] = useState(ULTRADIAN_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [currentMission, setCurrentMission] = useState("");
  const [capturedThoughts, setCapturedThoughts] = useState<string[]>([]);
  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem("flowstate-sessions");
    return saved ? JSON.parse(saved) : [];
  });
  const [currentSessionStart, setCurrentSessionStart] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  useEffect(() => {
    localStorage.setItem("flowstate-sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && phase === "focus") {
      handleFocusComplete();
    } else if (timeRemaining === 0 && phase === "break") {
      setPhase("complete");
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeRemaining, phase]);

  const handleFocusComplete = () => {
    setIsRunning(false);
    setPhase("effort");
  };

  const handleAnchorComplete = () => {
    setPhase("focus");
    setTimeRemaining(ULTRADIAN_DURATION);
    setIsRunning(true);
    setCurrentSessionStart(new Date());
    setCapturedThoughts([]);
  };

  const handleAnchorCancel = () => {
    setPhase("idle");
  };

  const handleEffortSubmit = (rpe: number, notes?: string) => {
    const newSession: Session = {
      id: Date.now().toString(),
      startTime: currentSessionStart || new Date(Date.now() - ULTRADIAN_DURATION * 1000),
      endTime: new Date(),
      focusMinutes: 90,
      completed: true,
      rpe,
      notes,
      capturedThoughts,
    };
    setSessions((prev) => [...prev, newSession]);
    setPhase("refraction");
  };

  const handleEffortSkip = () => {
    const newSession: Session = {
      id: Date.now().toString(),
      startTime: currentSessionStart || new Date(Date.now() - ULTRADIAN_DURATION * 1000),
      endTime: new Date(),
      focusMinutes: 90,
      completed: true,
      capturedThoughts,
    };
    setSessions((prev) => [...prev, newSession]);
    setPhase("refraction");
  };

  const handleRefractionComplete = () => {
    setPhase("break");
    setTimeRemaining(BREAK_DURATION);
    setIsRunning(true);
  };

  const startSession = () => {
    setPhase("anchor");
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setPhase("idle");
    setTimeRemaining(ULTRADIAN_DURATION);
    setCurrentMission("");
    setCapturedThoughts([]);
  };

  const handleCapture = (thought: string) => {
    setCapturedThoughts((prev) => [...prev, thought]);
  };

  const todaySessions = sessions.filter(
    (s) => new Date(s.startTime).toDateString() === new Date().toDateString()
  );
  const totalFocusToday = todaySessions.reduce((acc, s) => acc + s.focusMinutes, 0);
  const avgRPE = todaySessions.filter(s => s.rpe).length > 0
    ? todaySessions.filter(s => s.rpe).reduce((acc, s) => acc + (s.rpe || 0), 0) / todaySessions.filter(s => s.rpe).length
    : null;

  // Get current zone based on elapsed time
  const elapsedTime = ULTRADIAN_DURATION - timeRemaining;
  const elapsedMinutes = Math.floor(elapsedTime / 60);
  const getCurrentZone = () => {
    if (phase !== "focus") return null;
    if (elapsedMinutes < 15) return 0;
    if (elapsedMinutes < 75) return 1;
    return 2;
  };
  const currentZone = getCurrentZone();

  if (phase === "anchor") {
    return <VisualAnchor onComplete={handleAnchorComplete} onCancel={handleAnchorCancel} />;
  }

  if (phase === "effort") {
    return (
      <EffortMonitor
        onSubmit={handleEffortSubmit}
        onSkip={handleEffortSkip}
        sessionDuration={ULTRADIAN_DURATION}
      />
    );
  }

  if (phase === "refraction") {
    return <RefractionBreak onComplete={handleRefractionComplete} />;
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Compact Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-focus/10 border border-focus/20">
            <Brain className="h-5 w-5 text-focus" />
          </div>
          <div>
            <h1 className="font-mono text-lg font-bold text-foreground tracking-tight">
              FLOW STATE
            </h1>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
              {today} • 90-MIN PROTOCOL
            </p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-mono text-xs text-muted-foreground">Today</p>
            <p className="font-mono text-sm font-bold text-foreground">
              {todaySessions.length} <span className="text-muted-foreground font-normal">sessions</span>
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs text-muted-foreground">Focus</p>
            <p className="font-mono text-sm font-bold text-growth">
              {Math.floor(totalFocusToday / 60)}h {totalFocusToday % 60}m
            </p>
          </div>
          {avgRPE !== null && (
            <div className="text-right">
              <p className="font-mono text-xs text-muted-foreground">RPE</p>
              <p className={cn(
                "font-mono text-sm font-bold",
                avgRPE <= 4 && "text-growth",
                avgRPE > 4 && avgRPE <= 7 && "text-warning",
                avgRPE > 7 && "text-destructive"
              )}>
                {avgRPE.toFixed(1)}
              </p>
            </div>
          )}
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-12">
        {/* Main Timer Section */}
        <div className="lg:col-span-8 space-y-4">
          {/* Timer Card */}
          <div className="card-surface p-6">
            <div className="flex flex-col items-center">
              {/* Phase & Controls Row */}
              <div className="w-full flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      phase === "focus" && "bg-focus animate-pulse",
                      phase === "break" && "bg-growth animate-pulse",
                      phase === "idle" && "bg-muted-foreground",
                      phase === "complete" && "bg-growth"
                    )}
                  />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {phase === "idle" && "Ready"}
                    {phase === "focus" && (currentZone === 0 ? "Friction Zone" : currentZone === 1 ? "Flow Tunnel" : "Decline Phase")}
                    {phase === "break" && "Recovery"}
                    {phase === "complete" && "Complete"}
                  </span>
                </div>
                
                {/* Audio Control */}
                <NeuralTune isPlaying={phase === "focus" && isRunning} />
              </div>

              {/* Arc Timer */}
              <div className="relative mb-6">
                <UltradianArc
                  timeRemaining={timeRemaining}
                  totalDuration={phase === "break" ? BREAK_DURATION : ULTRADIAN_DURATION}
                  isBreak={phase === "break"}
                />
              </div>

              {/* Mission Input / Display */}
              {phase === "idle" ? (
                <div className="w-full max-w-md mb-4">
                  <input
                    type="text"
                    value={currentMission}
                    onChange={(e) => setCurrentMission(e.target.value)}
                    placeholder="What's your focus for this session?"
                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-focus/50 text-center"
                  />
                </div>
              ) : currentMission && (
                <div className="flex items-center gap-2 mb-4 px-4 py-2 bg-background/50 rounded-lg border border-border">
                  <Target className="h-3 w-3 text-focus shrink-0" />
                  <p className="font-mono text-xs text-foreground truncate">{currentMission}</p>
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center gap-3">
                {phase === "idle" ? (
                  <Button
                    onClick={startSession}
                    size="lg"
                    className="btn-press gap-2 bg-focus hover:bg-focus/90 text-white font-mono px-8"
                  >
                    <Zap className="h-4 w-4" />
                    INITIATE
                  </Button>
                ) : phase !== "complete" ? (
                  <>
                    <Button
                      onClick={toggleTimer}
                      size="default"
                      variant="outline"
                      className="btn-press gap-2 font-mono"
                    >
                      {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {isRunning ? "PAUSE" : "RESUME"}
                    </Button>
                    <Button
                      onClick={resetTimer}
                      size="default"
                      variant="ghost"
                      className="btn-press gap-2 font-mono text-muted-foreground"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={resetTimer}
                    size="lg"
                    className="btn-press gap-2 bg-growth hover:bg-growth/90 text-white font-mono px-8"
                  >
                    <Zap className="h-4 w-4" />
                    NEW SESSION
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Zeigarnik Dump - only during focus */}
          {phase === "focus" && (
            <div className="card-surface p-4">
              <ZeigarnikDump onCapture={handleCapture} />
              {capturedThoughts.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {capturedThoughts.length} thought{capturedThoughts.length > 1 ? 's' : ''} captured
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          {/* Protocol Steps */}
          <div className="card-surface p-4">
            <h3 className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="h-3 w-3" />
              Protocol Phases
            </h3>
            <div className="space-y-2">
              {PROTOCOL_STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isActive = phase === "focus" && (
                  (idx === 0 && currentZone === null) ||
                  (idx === 1 && currentZone === 0) ||
                  (idx === 2 && currentZone === 1) ||
                  (idx === 3 && currentZone === 2)
                );
                return (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg transition-all",
                      isActive ? `bg-${step.color}/10 border border-${step.color}/30` : "opacity-50"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", isActive ? `text-${step.color}` : "text-muted-foreground")} />
                    <div className="flex-1 min-w-0">
                      <p className={cn("font-mono text-xs", isActive ? "text-foreground" : "text-muted-foreground")}>
                        {step.label}
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground truncate">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Session History */}
          <div className="card-surface p-4">
            <h3 className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock className="h-3 w-3" />
              Recent Sessions
            </h3>
            {todaySessions.length === 0 ? (
              <p className="font-mono text-xs text-muted-foreground/50">No sessions today</p>
            ) : (
              <div className="space-y-2">
                {todaySessions.slice(-4).reverse().map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-2 bg-background/50 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-growth" />
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {new Date(session.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-foreground">
                        {session.focusMinutes}m
                      </span>
                      {session.rpe && (
                        <span className={cn(
                          "font-mono text-[10px] px-1.5 py-0.5 rounded",
                          session.rpe <= 4 && "bg-growth/20 text-growth",
                          session.rpe > 4 && session.rpe <= 7 && "bg-warning/20 text-warning",
                          session.rpe > 7 && "bg-destructive/20 text-destructive"
                        )}>
                          RPE {session.rpe}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="card-surface p-4 border-focus/20">
            <h3 className="font-mono text-[10px] text-focus uppercase tracking-wider mb-2">
              Pro Tip
            </h3>
            <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
              The first 15 minutes feel hard—that's norepinephrine loading. Don't quit. 
              Flow starts after the friction zone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
