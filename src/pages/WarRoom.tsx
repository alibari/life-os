import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Target, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ULTRADIAN_DURATION = 90 * 60; // 90 minutes in seconds
const BREAK_DURATION = 20 * 60; // 20 minutes break

type SessionPhase = "idle" | "focus" | "break" | "complete";

interface Session {
  id: string;
  startTime: Date;
  endTime?: Date;
  focusMinutes: number;
  completed: boolean;
}

export default function WarRoom() {
  const [phase, setPhase] = useState<SessionPhase>("idle");
  const [timeRemaining, setTimeRemaining] = useState(ULTRADIAN_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [currentMission, setCurrentMission] = useState("");
  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem("warroom-sessions");
    return saved ? JSON.parse(saved) : [];
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  // Persist sessions
  useEffect(() => {
    localStorage.setItem("warroom-sessions", JSON.stringify(sessions));
  }, [sessions]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      handlePhaseComplete();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeRemaining]);

  const handlePhaseComplete = useCallback(() => {
    setIsRunning(false);
    if (phase === "focus") {
      // Complete focus session
      const newSession: Session = {
        id: Date.now().toString(),
        startTime: new Date(Date.now() - ULTRADIAN_DURATION * 1000),
        endTime: new Date(),
        focusMinutes: 90,
        completed: true,
      };
      setSessions((prev) => [...prev, newSession]);
      setPhase("break");
      setTimeRemaining(BREAK_DURATION);
    } else if (phase === "break") {
      setPhase("complete");
    }
  }, [phase]);

  const startFocus = () => {
    setPhase("focus");
    setTimeRemaining(ULTRADIAN_DURATION);
    setIsRunning(true);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setPhase("idle");
    setTimeRemaining(ULTRADIAN_DURATION);
    setCurrentMission("");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = phase === "focus" 
    ? ((ULTRADIAN_DURATION - timeRemaining) / ULTRADIAN_DURATION) * 100
    : phase === "break"
    ? ((BREAK_DURATION - timeRemaining) / BREAK_DURATION) * 100
    : 0;

  const todaySessions = sessions.filter(
    (s) => new Date(s.startTime).toDateString() === new Date().toDateString()
  );
  const totalFocusToday = todaySessions.reduce((acc, s) => acc + s.focusMinutes, 0);

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <header className="mb-8">
        <p className="font-mono text-xs text-muted-foreground tracking-wider">
          {today.toUpperCase()}
        </p>
        <h1 className="font-mono text-2xl font-bold text-foreground mt-1">
          WAR ROOM
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          90-minute ultradian focus blocks
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Timer */}
        <div className="lg:col-span-2">
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
                {phase === "idle" && "Ready to deploy"}
                {phase === "focus" && "Deep focus active"}
                {phase === "break" && "Recovery phase"}
                {phase === "complete" && "Mission complete"}
              </span>
            </div>

            {/* Timer Display */}
            <div className="relative flex items-center justify-center mb-8">
              {/* Progress Ring */}
              <svg className="w-64 h-64 -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="4"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  fill="none"
                  stroke={phase === "focus" ? "hsl(var(--focus))" : "hsl(var(--growth))"}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 120}
                  strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                  className="transition-all duration-1000"
                />
              </svg>
              
              {/* Time Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-6xl font-bold text-foreground">
                  {formatTime(timeRemaining)}
                </span>
                <span className="font-mono text-xs text-muted-foreground mt-2">
                  {phase === "focus" ? "REMAINING" : phase === "break" ? "BREAK TIME" : "READY"}
                </span>
              </div>
            </div>

            {/* Mission Input */}
            {phase === "idle" && (
              <div className="mb-6">
                <label className="block font-mono text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                  Mission Objective
                </label>
                <input
                  type="text"
                  value={currentMission}
                  onChange={(e) => setCurrentMission(e.target.value)}
                  placeholder="What will you conquer in this session?"
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
                    Current Mission
                  </span>
                </div>
                <p className="font-mono text-sm text-foreground">{currentMission}</p>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              {phase === "idle" ? (
                <Button
                  onClick={startFocus}
                  size="lg"
                  className="btn-press gap-2 bg-focus hover:bg-focus/90 text-foreground font-mono"
                >
                  <Zap className="h-5 w-5" />
                  DEPLOY
                </Button>
              ) : (
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
              )}
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Today's Stats */}
          <div className="card-surface p-6">
            <h3 className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-4">
              Today's Operations
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
                    className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border"
                  >
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
                ))}
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="card-surface p-6 border-focus/30">
            <h3 className="font-mono text-xs text-focus uppercase tracking-wider mb-3">
              Protocol
            </h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-focus">•</span>
                90 minutes aligns with your ultradian rhythm
              </li>
              <li className="flex items-start gap-2">
                <span className="text-focus">•</span>
                20 minute breaks restore cognitive capacity
              </li>
              <li className="flex items-start gap-2">
                <span className="text-focus">•</span>
                Maximum 4 deep work blocks per day
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
