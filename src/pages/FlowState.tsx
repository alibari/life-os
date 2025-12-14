import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Target, Clock, Zap, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VisualAnchor } from "@/components/flowstate/VisualAnchor";
import { UltradianArc } from "@/components/flowstate/UltradianArc";
import { ZeigarnikDump } from "@/components/flowstate/ZeigarnikDump";
import { NeuralTune } from "@/components/flowstate/NeuralTune";
import { RefractionBreak } from "@/components/flowstate/RefractionBreak";
import { EffortMonitor } from "@/components/flowstate/EffortMonitor";

const ULTRADIAN_DURATION = 90 * 60; // 90 minutes
const BREAK_DURATION = 20 * 60; // 20 minutes

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
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  // Persist sessions
  useEffect(() => {
    localStorage.setItem("flowstate-sessions", JSON.stringify(sessions));
  }, [sessions]);

  // Timer logic
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

  // Render overlays
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
    <div className="min-h-screen p-6">
      {/* Header */}
      <header className="mb-8">
        <p className="font-mono text-xs text-muted-foreground tracking-wider">
          {today.toUpperCase()}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <Brain className="h-6 w-6 text-focus" />
          <h1 className="font-mono text-2xl font-bold text-foreground">
            FLOW STATE
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          90-minute ultradian focus protocol with neuroscience-backed rituals
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Timer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-surface p-8">
            {/* Phase Indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  phase === "focus" && "bg-focus animate-pulse",
                  phase === "break" && "bg-growth animate-pulse",
                  phase === "idle" && "bg-muted-foreground",
                  phase === "complete" && "bg-growth"
                )}
              />
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                {phase === "idle" && "Ready to initiate"}
                {phase === "focus" && "Deep focus active"}
                {phase === "break" && "Recovery phase"}
                {phase === "complete" && "Protocol complete"}
              </span>
            </div>

            {/* Ultradian Arc Timer */}
            <div className="flex items-center justify-center mb-8">
              <UltradianArc
                timeRemaining={timeRemaining}
                totalDuration={phase === "break" ? BREAK_DURATION : ULTRADIAN_DURATION}
                isBreak={phase === "break"}
              />
            </div>

            {/* Mission Input */}
            {phase === "idle" && (
              <div className="mb-6">
                <label className="block font-mono text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                  Session Intent
                </label>
                <input
                  type="text"
                  value={currentMission}
                  onChange={(e) => setCurrentMission(e.target.value)}
                  placeholder="What will you accomplish in this 90-minute block?"
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-focus/50"
                />
              </div>
            )}

            {/* Current Mission Display */}
            {phase !== "idle" && currentMission && (
              <div className="mb-6 p-4 bg-background/50 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-focus" />
                  <span className="font-mono text-xs text-muted-foreground uppercase">
                    Session Intent
                  </span>
                </div>
                <p className="font-mono text-sm text-foreground">{currentMission}</p>
              </div>
            )}

            {/* Zeigarnik Dump - only during focus */}
            {phase === "focus" && (
              <div className="mb-6">
                <ZeigarnikDump onCapture={handleCapture} />
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              {phase === "idle" ? (
                <Button
                  onClick={startSession}
                  size="lg"
                  className="btn-press gap-2 bg-focus hover:bg-focus/90 text-foreground font-mono"
                >
                  <Zap className="h-5 w-5" />
                  INITIATE
                </Button>
              ) : phase !== "complete" ? (
                <>
                  <Button
                    onClick={toggleTimer}
                    size="lg"
                    variant="outline"
                    className="btn-press gap-2 font-mono"
                  >
                    {isRunning ? (
                      <>
                        <Pause className="h-5 w-5" />
                        PAUSE
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5" />
                        RESUME
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={resetTimer}
                    size="lg"
                    variant="ghost"
                    className="btn-press gap-2 font-mono text-muted-foreground"
                  >
                    <RotateCcw className="h-5 w-5" />
                    ABORT
                  </Button>
                </>
              ) : (
                <Button
                  onClick={resetTimer}
                  size="lg"
                  className="btn-press gap-2 bg-growth hover:bg-growth/90 text-foreground font-mono"
                >
                  <Zap className="h-5 w-5" />
                  NEW SESSION
                </Button>
              )}
            </div>
          </div>

          {/* Neural Tune */}
          <div className="card-surface p-6">
            <NeuralTune isPlaying={phase === "focus" && isRunning} />
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Today's Stats */}
          <div className="card-surface p-6">
            <h3 className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-4">
              Today's Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-focus" />
                  <span className="font-mono text-sm text-muted-foreground">Sessions</span>
                </div>
                <span className="font-mono text-xl font-bold text-foreground">
                  {todaySessions.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-growth" />
                  <span className="font-mono text-sm text-muted-foreground">Focus Time</span>
                </div>
                <span className="font-mono text-xl font-bold text-foreground">
                  {Math.floor(totalFocusToday / 60)}h {totalFocusToday % 60}m
                </span>
              </div>
              {avgRPE !== null && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-warning" />
                    <span className="font-mono text-sm text-muted-foreground">Avg RPE</span>
                  </div>
                  <span className="font-mono text-xl font-bold text-foreground">
                    {avgRPE.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Session History */}
          <div className="card-surface p-6">
            <h3 className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-4">
              Recent Sessions
            </h3>
            {todaySessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sessions today</p>
            ) : (
              <div className="space-y-3">
                {todaySessions.slice(-5).reverse().map((session) => (
                  <div
                    key={session.id}
                    className="p-3 bg-background/50 rounded-lg border border-border"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-growth" />
                        <span className="font-mono text-xs text-muted-foreground">
                          {new Date(session.startTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <span className="font-mono text-sm text-foreground">
                        {session.focusMinutes}m
                      </span>
                    </div>
                    {session.rpe && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs text-muted-foreground">RPE:</span>
                        <span className={cn(
                          "font-mono text-xs",
                          session.rpe <= 3 && "text-growth",
                          session.rpe > 3 && session.rpe <= 6 && "text-warning",
                          session.rpe > 6 && "text-destructive"
                        )}>
                          {session.rpe}/10
                        </span>
                      </div>
                    )}
                    {session.capturedThoughts.length > 0 && (
                      <div className="mt-1">
                        <span className="font-mono text-xs text-muted-foreground">
                          {session.capturedThoughts.length} thoughts captured
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Protocol Guide */}
          <div className="card-surface p-6 border-focus/30">
            <h3 className="font-mono text-xs text-focus uppercase tracking-wider mb-3">
              Protocol
            </h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-warning">1.</span>
                Visual anchor primes your nervous system
              </li>
              <li className="flex items-start gap-2">
                <span className="text-focus">2.</span>
                First 15 min friction is normal (norepinephrine loading)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-growth">3.</span>
                Dump intrusive thoughts to clear cognitive RAM
              </li>
              <li className="flex items-start gap-2">
                <span className="text-focus">4.</span>
                Panoramic vision breaks reset ciliary muscles
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
