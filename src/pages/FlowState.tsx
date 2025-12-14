import { useState, useEffect, useRef, ComponentType } from "react";
import RGL from "react-grid-layout";
import { Play, Pause, RotateCcw, Target, Clock, Zap, Brain, Eye, Sparkles, Activity, Timer, LayoutGrid, LineChart, Settings2, Monitor, GripVertical, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { VisualAnchor } from "@/components/flowstate/VisualAnchor";
import { UltradianArc } from "@/components/flowstate/UltradianArc";
import { ZeigarnikDump } from "@/components/flowstate/ZeigarnikDump";
import { NeuralTune } from "@/components/flowstate/NeuralTune";
import { RefractionBreak } from "@/components/flowstate/RefractionBreak";
import { EffortMonitor } from "@/components/flowstate/EffortMonitor";
import { WeeklyStreak } from "@/components/flowstate/WeeklyStreak";
import { FocusGoals } from "@/components/flowstate/FocusGoals";
import { SessionTypeSelector, SessionType } from "@/components/flowstate/SessionTypeSelector";
import { FlowAIInsights } from "@/components/flowstate/FlowAIInsights";
import { AppTracker } from "@/components/flowstate/AppTracker";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import "react-grid-layout/css/styles.css";

const ReactGridLayout = RGL as ComponentType<any>;

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
  sessionType?: SessionType;
}

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
}

interface WidgetConfig {
  id: string;
  type: string;
  title: string;
}

const PROTOCOL_STEPS = [
  { icon: Eye, label: "Visual Anchor", desc: "30s focus prime", color: "warning" },
  { icon: Activity, label: "Friction", desc: "0-15min load", color: "warning" },
  { icon: Sparkles, label: "Flow", desc: "15-75min peak", color: "focus" },
  { icon: Timer, label: "Decline", desc: "75-90min wrap", color: "destructive" },
];

const availableFlowWidgets = [
  { type: "weeklystreak", title: "Weekly Streak" },
  { type: "focusgoals", title: "Focus Goals" },
  { type: "aiinsights", title: "AI Insights" },
  { type: "apptracker", title: "App Tracker" },
];

export default function FlowState() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [phase, setPhase] = useState<SessionPhase>("idle");
  const [timeRemaining, setTimeRemaining] = useState(ULTRADIAN_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [currentMission, setCurrentMission] = useState("");
  const [sessionType, setSessionType] = useState<SessionType>("deep-work");
  const [capturedThoughts, setCapturedThoughts] = useState<string[]>([]);
  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem("flowstate-sessions");
    return saved ? JSON.parse(saved) : [];
  });
  const [currentSessionStart, setCurrentSessionStart] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { user } = useAuth();
  const { 
    flowLayouts, 
    flowWidgets, 
    updateFlowLayouts, 
    updateFlowWidgets,
    setFlowLayouts,
    setFlowWidgets,
    loading 
  } = useUserSettings();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  // Measure container width
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

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
      sessionType,
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
      sessionType,
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

  const handleLayoutChange = (newLayout: LayoutItem[]) => {
    const updatedLayout = flowLayouts.map((existing) => {
      const changed = newLayout.find((l) => l.i === existing.i);
      if (changed) {
        return {
          ...changed,
          minW: existing.minW ?? 1,
          maxW: existing.maxW ?? 6,
          minH: existing.minH ?? 1,
          maxH: existing.maxH ?? 8,
        };
      }
      return existing;
    });
    updateFlowLayouts(updatedLayout);
  };

  const addWidget = (type: string, title: string) => {
    const newId = `flow-${type}-${Date.now()}`;
    const newWidget: WidgetConfig = { id: newId, type, title };
    
    const maxY = flowLayouts.reduce((max, l) => Math.max(max, l.y + l.h), 0);
    
    const widgetSizes: Record<string, { w: number; h: number; minW: number; minH: number }> = {
      apptracker: { w: 4, h: 3, minW: 2, minH: 2 },
      weeklystreak: { w: 2, h: 2, minW: 1, minH: 2 },
      focusgoals: { w: 2, h: 2, minW: 1, minH: 2 },
      aiinsights: { w: 2, h: 2, minW: 1, minH: 2 },
    };
    
    const size = widgetSizes[type] || { w: 2, h: 2, minW: 1, minH: 1 };
    
    const newLayout: LayoutItem = { 
      i: newId, 
      x: 0, 
      y: maxY, 
      w: size.w, 
      h: size.h, 
      minW: size.minW, 
      maxW: 6, 
      minH: size.minH, 
      maxH: 8 
    };
    
    const newWidgets = [...flowWidgets, newWidget];
    const newLayouts = [...flowLayouts, newLayout];
    
    setFlowWidgets(newWidgets);
    setFlowLayouts(newLayouts);
    updateFlowWidgets(newWidgets);
    updateFlowLayouts(newLayouts);
  };

  const removeWidget = (id: string) => {
    const newWidgets = flowWidgets.filter((w) => w.id !== id);
    const newLayouts = flowLayouts.filter((l) => l.i !== id);
    
    setFlowWidgets(newWidgets);
    setFlowLayouts(newLayouts);
    updateFlowWidgets(newWidgets);
    updateFlowLayouts(newLayouts);
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

  // Render widget by type
  const renderWidget = (widget: WidgetConfig) => {
    switch (widget.type) {
      case "weeklystreak":
        return <WeeklyStreak sessions={sessions} />;
      case "focusgoals":
        return <FocusGoals todayFocusMinutes={totalFocusToday} />;
      case "aiinsights":
        return <FlowAIInsights sessions={sessions} todayFocusMinutes={totalFocusToday} avgRPE={avgRPE} />;
      case "apptracker":
        return <AppTracker isVisible={true} onToggleVisibility={() => {}} />;
      default:
        return null;
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center cockpit-canvas">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 cockpit-canvas" ref={containerRef}>
      {/* Compact Header */}
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-secondary/10 border border-secondary/20">
            <Brain className="h-5 w-5 text-secondary" />
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
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="font-mono text-[10px] text-muted-foreground">Sessions</p>
            <p className="font-mono text-sm font-bold text-foreground">{todaySessions.length}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] text-muted-foreground">Focus Time</p>
            <p className="font-mono text-sm font-bold text-growth">
              {Math.floor(totalFocusToday / 60)}h {totalFocusToday % 60}m
            </p>
          </div>
          {avgRPE !== null && (
            <div className="text-right hidden md:block">
              <p className="font-mono text-[10px] text-muted-foreground">Avg RPE</p>
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

      <Tabs defaultValue="session" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-card border border-border">
            <TabsTrigger value="session" className="font-mono text-xs data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary">
              <Zap className="h-3 w-3 mr-1.5" />
              Session
            </TabsTrigger>
            <TabsTrigger value="analytics" className="font-mono text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <LineChart className="h-3 w-3 mr-1.5" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="widgets" className="font-mono text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <LayoutGrid className="h-3 w-3 mr-1.5" />
              Widgets
            </TabsTrigger>
          </TabsList>

          {/* Add Widget Button - Only shown on analytics/widgets tabs */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="btn-press gap-2 border-secondary/30 hover:border-secondary/60">
                <Plus className="h-4 w-4 text-secondary" />
                <span className="hidden sm:inline">Add Widget</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-border bg-card/95 backdrop-blur-xl">
              {availableFlowWidgets.map((widget) => (
                <DropdownMenuItem
                  key={widget.type}
                  onClick={() => addWidget(widget.type, widget.title)}
                  className="font-mono text-xs cursor-pointer"
                >
                  {widget.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Session Tab */}
        <TabsContent value="session" className="mt-0">
          <div className="grid gap-4 lg:grid-cols-12">
            {/* Main Timer Section */}
            <div className="lg:col-span-8 space-y-4">
              {/* Timer Card */}
              <div className="card-surface p-5">
                <div className="flex flex-col items-center">
                  {/* Phase & Controls Row */}
                  <div className="w-full flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          phase === "focus" && "bg-secondary animate-pulse",
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
                    <NeuralTune isPlaying={phase === "focus" && isRunning} />
                  </div>

                  {/* Arc Timer */}
                  <div className="relative mb-4">
                    <UltradianArc
                      timeRemaining={timeRemaining}
                      totalDuration={phase === "break" ? BREAK_DURATION : ULTRADIAN_DURATION}
                      isBreak={phase === "break"}
                    />
                  </div>

                  {/* Session Type Selector - only in idle */}
                  {phase === "idle" && (
                    <div className="w-full max-w-lg mb-4">
                      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                        Session Type
                      </p>
                      <SessionTypeSelector selected={sessionType} onSelect={setSessionType} />
                    </div>
                  )}

                  {/* Mission Input / Display */}
                  {phase === "idle" ? (
                    <div className="w-full max-w-md mb-4">
                      <input
                        type="text"
                        value={currentMission}
                        onChange={(e) => setCurrentMission(e.target.value)}
                        placeholder="What's your focus for this session?"
                        className="w-full bg-background border border-border rounded-lg px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-secondary/50 text-center"
                      />
                    </div>
                  ) : currentMission && (
                    <div className="flex items-center gap-2 mb-4 px-3 py-1.5 bg-background/50 rounded-lg border border-border">
                      <Target className="h-3 w-3 text-secondary shrink-0" />
                      <p className="font-mono text-xs text-foreground truncate">{currentMission}</p>
                    </div>
                  )}

                  {/* Controls */}
                  <div className="flex items-center gap-3">
                    {phase === "idle" ? (
                      <Button
                        onClick={startSession}
                        size="lg"
                        className="btn-press gap-2 bg-secondary hover:bg-secondary/90 text-white font-mono px-8"
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
              {/* Protocol Steps - Compact */}
              <div className="card-surface p-3">
                <h3 className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-2">
                  Protocol
                </h3>
                <div className="grid grid-cols-4 gap-1">
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
                          "flex flex-col items-center gap-1 p-2 rounded-lg transition-all text-center",
                          isActive ? `bg-${step.color}/10 border border-${step.color}/30` : "opacity-40"
                        )}
                      >
                        <Icon className={cn("h-3.5 w-3.5", isActive ? `text-${step.color}` : "text-muted-foreground")} />
                        <p className="font-mono text-[8px] text-muted-foreground leading-tight">
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Session History */}
              <div className="card-surface p-3">
                <h3 className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  Recent
                </h3>
                {todaySessions.length === 0 ? (
                  <p className="font-mono text-[10px] text-muted-foreground/50">No sessions today</p>
                ) : (
                  <div className="space-y-1.5">
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
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-foreground">{session.focusMinutes}m</span>
                          {session.rpe && (
                            <span className={cn(
                              "font-mono text-[9px] px-1 py-0.5 rounded",
                              session.rpe <= 4 && "bg-primary/20 text-primary",
                              session.rpe > 4 && session.rpe <= 7 && "bg-warning/20 text-warning",
                              session.rpe > 7 && "bg-destructive/20 text-destructive"
                            )}>
                              {session.rpe}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tip */}
              <div className="card-surface p-3 border-secondary/20">
                <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
                  <span className="text-secondary font-medium">Pro Tip:</span> The first 15 minutes feel hard—that's norepinephrine loading. Flow starts after the friction zone.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab - Grid Layout */}
        <TabsContent value="analytics" className="mt-0">
          {flowWidgets.length > 0 ? (
            <ReactGridLayout
              className="layout"
              layout={flowLayouts}
              cols={6}
              rowHeight={140}
              width={containerWidth - 48}
              onLayoutChange={handleLayoutChange}
              draggableHandle=".drag-handle"
              margin={[16, 16]}
              containerPadding={[0, 0]}
              isResizable={true}
              isDraggable={true}
              resizeHandles={["s", "e", "se", "sw", "n", "w", "nw", "ne"]}
            >
              {flowWidgets.map((widget) => (
                <div key={widget.id} className="relative group">
                  {/* Widget Controls */}
                  <div className="absolute top-2 right-2 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <button
                      className="drag-handle p-1.5 rounded-md bg-background/90 backdrop-blur-sm border border-border/80 hover:border-secondary/50 hover:bg-secondary/10 cursor-grab active:cursor-grabbing transition-all shadow-sm"
                      title="Drag to move"
                    >
                      <GripVertical className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
                    </button>
                    <button
                      onClick={() => removeWidget(widget.id)}
                      className="p-1.5 rounded-md bg-background/90 backdrop-blur-sm border border-border/80 hover:bg-destructive/20 hover:border-destructive/50 transition-all shadow-sm"
                      title="Remove widget"
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>

                  {/* Widget Content */}
                  <div className="h-full overflow-hidden">
                    {renderWidget(widget)}
                  </div>
                </div>
              ))}
            </ReactGridLayout>
          ) : (
            <div className="card-surface p-12 text-center">
              <p className="text-muted-foreground mb-4">No widgets added yet</p>
              <Button
                variant="outline"
                onClick={() => addWidget("weeklystreak", "Weekly Streak")}
                className="btn-press"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add your first widget
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Widgets Tab - Same Grid Layout */}
        <TabsContent value="widgets" className="mt-0">
          {flowWidgets.length > 0 ? (
            <ReactGridLayout
              className="layout"
              layout={flowLayouts}
              cols={6}
              rowHeight={140}
              width={containerWidth - 48}
              onLayoutChange={handleLayoutChange}
              draggableHandle=".drag-handle"
              margin={[16, 16]}
              containerPadding={[0, 0]}
              isResizable={true}
              isDraggable={true}
              resizeHandles={["s", "e", "se", "sw", "n", "w", "nw", "ne"]}
            >
              {flowWidgets.map((widget) => (
                <div key={widget.id} className="relative group">
                  {/* Widget Controls */}
                  <div className="absolute top-2 right-2 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <button
                      className="drag-handle p-1.5 rounded-md bg-background/90 backdrop-blur-sm border border-border/80 hover:border-secondary/50 hover:bg-secondary/10 cursor-grab active:cursor-grabbing transition-all shadow-sm"
                      title="Drag to move"
                    >
                      <GripVertical className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
                    </button>
                    <button
                      onClick={() => removeWidget(widget.id)}
                      className="p-1.5 rounded-md bg-background/90 backdrop-blur-sm border border-border/80 hover:bg-destructive/20 hover:border-destructive/50 transition-all shadow-sm"
                      title="Remove widget"
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>

                  {/* Widget Content */}
                  <div className="h-full overflow-hidden">
                    {renderWidget(widget)}
                  </div>
                </div>
              ))}
            </ReactGridLayout>
          ) : (
            <div className="card-surface p-12 text-center">
              <p className="text-muted-foreground mb-4">No widgets added yet</p>
              <Button
                variant="outline"
                onClick={() => addWidget("weeklystreak", "Weekly Streak")}
                className="btn-press"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add your first widget
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
