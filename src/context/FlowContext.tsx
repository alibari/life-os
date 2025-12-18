import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { SessionType } from "@/components/flowstate/SessionTypeSelector";

export const ULTRADIAN_DURATION = 90 * 60;
export const BREAK_DURATION = 20 * 60;

export type SessionPhase = "idle" | "anchor" | "focus" | "effort" | "refraction" | "break" | "complete";

export interface Session {
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

interface FlowContextType {
    phase: SessionPhase;
    setPhase: (phase: SessionPhase) => void;
    timeRemaining: number;
    setTimeRemaining: (time: number) => void;
    isRunning: boolean;
    setIsRunning: (isRunning: boolean) => void;
    currentMission: string;
    setCurrentMission: (mission: string) => void;
    sessionType: SessionType;
    setSessionType: (type: SessionType) => void;
    capturedThoughts: string[];
    setCapturedThoughts: React.Dispatch<React.SetStateAction<string[]>>;
    sessions: Session[];
    setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
    currentSessionStart: Date | null;
    setCurrentSessionStart: (date: Date | null) => void;
    currentZone: number | null; // 0, 1, 2 for Friction, Flow, Decline
    startSession: () => void;
    toggleTimer: () => void;
    resetTimer: () => void;
    handleCapture: (thought: string) => void;
}

const FlowContext = createContext<FlowContextType | undefined>(undefined);

export function FlowProvider({ children }: { children: React.ReactNode }) {
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

    useEffect(() => {
        localStorage.setItem("flowstate-sessions", JSON.stringify(sessions));
    }, [sessions]);

    useEffect(() => {
        if (isRunning && timeRemaining > 0) {
            intervalRef.current = setInterval(() => {
                setTimeRemaining((prev) => prev - 1);
            }, 1000);
        } else if (timeRemaining === 0 && phase === "focus") {
            setIsRunning(false);
            setPhase("effort");
        } else if (timeRemaining === 0 && phase === "break") {
            setPhase("complete");
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning, timeRemaining, phase]);

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

    // Get current zone
    const elapsedTime = ULTRADIAN_DURATION - timeRemaining;
    const elapsedMinutes = Math.floor(elapsedTime / 60);
    const getCurrentZone = () => {
        if (phase !== "focus") return null;
        if (elapsedMinutes < 15) return 0;
        if (elapsedMinutes < 75) return 1;
        return 2;
    };
    const currentZone = getCurrentZone();

    return (
        <FlowContext.Provider
            value={{
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
                setCapturedThoughts,
                sessions,
                setSessions,
                currentSessionStart,
                setCurrentSessionStart,
                currentZone,
                startSession,
                toggleTimer,
                resetTimer,
                handleCapture,
            }}
        >
            {children}
        </FlowContext.Provider>
    );
}

export function useFlow() {
    const context = useContext(FlowContext);
    if (context === undefined) {
        throw new Error("useFlow must be used within a FlowProvider");
    }
    return context;
}
