import { useState, useEffect } from "react";
import {
    Play,
    Pause,
    RotateCcw,
    Zap,
    Maximize2,
    Minimize2,
    CheckCircle2,
    Timer,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UltradianArc } from "@/components/flowstate/UltradianArc";
import { NeuralTune } from "@/components/flowstate/NeuralTune";
import { SessionType, sessionTypes } from "@/components/flowstate/SessionTypeSelector";
import { VisualAnchor } from "@/components/flowstate/VisualAnchor";
import { RefractionBreak } from "@/components/flowstate/RefractionBreak";
import { EffortMonitor } from "@/components/flowstate/EffortMonitor";
import { useFlow, Session, ULTRADIAN_DURATION, BREAK_DURATION } from "@/context/FlowContext";

// Minimal Setup Steps
type SetupStep = "duration" | "type" | "ready";

export function FlowTimerWidget() {
    const {
        phase,
        setPhase,
        timeRemaining,
        setTimeRemaining,
        isRunning,
        setIsRunning,
        currentMission,
        setCurrentMission,
        sessionType,
        setSessionType,
        capturedThoughts,
        startSession,
        toggleTimer,
        resetTimer,
        currentSessionStart,
        setCurrentSessionStart,
        setSessions
    } = useFlow();

    const [setupStep, setSetupStep] = useState<SetupStep>("duration");
    const [selectedDuration, setSelectedDuration] = useState(ULTRADIAN_DURATION);
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Protocol Steps based on type
    const getProtocolSteps = (type: SessionType) => {
        const config = sessionTypes.find(t => t.id === type);
        return config?.protocols || ["Clear Distractions", "Set Goal", "Execute"];
    };

    const handleDurationSelect = (mins: number) => {
        setSelectedDuration(mins * 60);
        setTimeRemaining(mins * 60);
        setSetupStep("type");
    };

    const handleTypeSelect = (type: SessionType) => {
        setSessionType(type);
        setSetupStep("ready");
    };

    const handleStart = () => {
        startSession();
        setIsFullScreen(true); // Auto enter full screen for effectiveness
    };

    const handleExitFullScreen = () => {
        setIsFullScreen(false);
    };

    // Sub-component handlers (preserved logic)
    const handleAnchorComplete = () => {
        setPhase("focus");
        setTimeRemaining(selectedDuration); // Use selected duration
        setIsRunning(true);
        setCurrentSessionStart(new Date());
    };

    // ... (rest of handlers similar to before)
    const handleAnchorCancel = () => setPhase("idle");
    const handleRefractionComplete = () => {
        setPhase("break");
        setTimeRemaining(BREAK_DURATION);
        setIsRunning(true);
    };
    const handleEffortSubmit = (rpe: number, notes?: string) => {
        // ... (save session logic)
        const newSession: Session = {
            id: Date.now().toString(),
            startTime: currentSessionStart || new Date(),
            endTime: new Date(),
            focusMinutes: Math.floor(selectedDuration / 60),
            completed: true,
            rpe,
            notes,
            capturedThoughts,
            sessionType
        };
        setSessions(prev => [...prev, newSession]);
        setPhase("refraction");
        setIsFullScreen(false);
    };
    const handleEffortSkip = () => {
        // ... (save session logic)
        const newSession: Session = {
            id: Date.now().toString(),
            startTime: currentSessionStart || new Date(),
            endTime: new Date(),
            focusMinutes: Math.floor(selectedDuration / 60),
            completed: true,
            capturedThoughts,
            sessionType
        };
        setSessions(prev => [...prev, newSession]);
        setPhase("refraction");
        setIsFullScreen(false);
    };


    // Active Overlay View
    if (phase !== "idle") {
        const Content = () => {
            if (phase === "anchor") return <VisualAnchor onComplete={handleAnchorComplete} onCancel={handleAnchorCancel} />;
            if (phase === "effort") return <EffortMonitor onSubmit={handleEffortSubmit} onSkip={handleEffortSkip} sessionDuration={selectedDuration} />;
            if (phase === "refraction") return <RefractionBreak onComplete={handleRefractionComplete} />;

            // Running / Break / Complete State
            return (
                <div className="flex flex-col items-center justify-center h-full w-full relative">
                    {/* Header Controls */}
                    <div className="absolute top-6 right-6 flex items-center gap-4 z-50">
                        <NeuralTune isPlaying={isRunning && phase === "focus"} />
                        <Button variant="ghost" size="icon" onClick={() => setIsFullScreen(!isFullScreen)}>
                            {isFullScreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                        </Button>
                    </div>

                    {/* Central Arc */}
                    <div className={cn(
                        "relative flex items-center justify-center",
                        isFullScreen ? "w-[60vh] h-[60vh]" : "w-[300px] h-[300px]"
                    )}>
                        <UltradianArc
                            timeRemaining={timeRemaining}
                            totalDuration={phase === "break" ? BREAK_DURATION : selectedDuration}
                            isBreak={phase === "break"}
                        />
                    </div>

                    {/* Protocol Steps Display */}
                    <div className="mt-8 text-center max-w-md">
                        <p className="text-muted-foreground text-xs uppercase tracking-widest mb-2">Current Protocol</p>
                        <h3 className="text-xl font-mono font-bold text-foreground mb-4">{sessionTypes.find(t => t.id === sessionType)?.label}</h3>
                        <div className="flex flex-col gap-2 items-start text-left bg-card/50 p-4 rounded-xl border border-border/50">
                            {getProtocolSteps(sessionType).map((step, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm text-foreground/80">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    <span>{step}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="absolute bottom-10 flex items-center gap-4">
                        <Button
                            onClick={toggleTimer}
                            size="lg"
                            className="h-16 w-16 rounded-full bg-secondary hover:bg-secondary/90 text-white shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                        >
                            {isRunning ? <Pause className="h-8 w-8 fill-current" /> : <Play className="h-8 w-8 fill-current ml-1" />}
                        </Button>
                        <Button
                            onClick={resetTimer}
                            size="icon"
                            variant="ghost"
                            className="h-12 w-12 rounded-full text-muted-foreground hover:text-destructive"
                        >
                            <RotateCcw className="h-6 w-6" />
                        </Button>
                    </div>
                </div>
            );
        };

        if (isFullScreen) {
            return (
                <div className="fixed inset-0 z-[100] bg-background">
                    <Content />
                </div>
            );
        }

        return (
            <div className="h-full flex flex-col relative overflow-hidden">
                <Content />
            </div>
        );
    }

    // Setup Wizard (Idle State)
    return (
        <div className="h-full flex flex-col p-6 items-center justify-center relative overflow-hidden">

            {/* Step 1: Duration */}
            {setupStep === "duration" && (
                <div className="flex flex-col items-center gap-8 w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center">
                        <h2 className="text-2xl font-mono font-bold text-foreground mb-2">Select Duration</h2>
                        <p className="text-muted-foreground text-sm">How long is your focus block?</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full">
                        {[30, 45, 60, 90].map(mins => (
                            <button
                                key={mins}
                                onClick={() => handleDurationSelect(mins)}
                                className="group relative flex flex-col items-center justify-center p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                            >
                                <span className="text-3xl font-mono font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{mins}</span>
                                <span className="text-xs text-muted-foreground uppercase tracking-wider">Minutes</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 2: Type */}
            {setupStep === "type" && (
                <div className="flex flex-col items-center gap-8 w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center w-full justify-between mb-4">
                        <Button variant="ghost" size="sm" onClick={() => setSetupStep("duration")}>← Back</Button>
                        <div className="text-center">
                            <h2 className="text-2xl font-mono font-bold text-foreground mb-2">Session Type</h2>
                            <p className="text-muted-foreground text-sm">What is your objective?</p>
                        </div>
                        <div className="w-[60px]" /> {/* Spacer */}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
                        {sessionTypes.map(type => (
                            <button
                                key={type.id}
                                onClick={() => handleTypeSelect(type.id)}
                                className="flex flex-col items-center p-4 rounded-xl bg-card border border-border hover:border-secondary/50 hover:bg-secondary/5 transition-all text-center"
                            >
                                <div className="p-2 rounded-full bg-secondary/10 mb-3 text-secondary">
                                    <type.icon className="h-6 w-6" />
                                </div>
                                <span className="text-sm font-bold text-foreground mb-1">{type.label}</span>
                                <span className="text-[10px] text-muted-foreground">{type.description}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 3: Ready */}
            {setupStep === "ready" && (
                <div className="flex flex-col items-center gap-8 w-full max-w-md animate-in zoom-in-95 duration-500">
                    <div className="flex items-center w-full justify-between mb-4">
                        <Button variant="ghost" size="sm" onClick={() => setSetupStep("type")}>← Back</Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-secondary/20 blur-3xl rounded-full" />
                        <div className="relative flex flex-col items-center justify-center w-48 h-48 rounded-full border-4 border-secondary/30 bg-card/50 backdrop-blur-sm">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground uppercase tracking-widest mb-1">Target</p>
                                <p className="text-4xl font-mono font-bold text-foreground">{selectedDuration / 60}:00</p>
                                <p className="text-xs text-secondary mt-2 font-bold uppercase">{sessionTypes.find(t => t.id === sessionType)?.label}</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full">
                        <input
                            type="text"
                            value={currentMission}
                            onChange={(e) => setCurrentMission(e.target.value)}
                            placeholder="Enter main objective..."
                            className="w-full bg-transparent border-b border-border py-2 text-center font-mono text-lg focus:outline-none focus:border-secondary transition-colors mb-8"
                        />

                        <Button
                            onClick={handleStart}
                            className="w-full h-14 bg-secondary hover:bg-secondary/90 text-white font-mono text-lg tracking-widest uppercase shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all"
                        >
                            Initiate Protocol
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
