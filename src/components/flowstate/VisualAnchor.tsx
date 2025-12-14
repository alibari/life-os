import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { FastForward } from "lucide-react";

interface VisualAnchorProps {
  onComplete: () => void;
  onCancel: () => void;
}

const ANCHOR_DURATION = 30; // 30 seconds

export function VisualAnchor({ onComplete, onCancel }: VisualAnchorProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(false);
  const [showBypass, setShowBypass] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(() => {
    if (isHolding && progress > 0) {
      setFailed(true);
      setIsHolding(false);
      setProgress(0);
      setShowBypass(true);
      setTimeout(() => setFailed(false), 2000);
    }
  }, [isHolding, progress]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        setIsHolding(true);
        setFailed(false);
      }
      if (e.code === "Escape") {
        onCancel();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (progress < 100) {
          setFailed(true);
          setShowBypass(true);
          setTimeout(() => setFailed(false), 2000);
        }
        setIsHolding(false);
        setProgress(0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [progress, onCancel]);

  useEffect(() => {
    if (isHolding) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + (100 / ANCHOR_DURATION / 10);
          if (newProgress >= 100) {
            setIsHolding(false);
            onComplete();
            return 100;
          }
          return newProgress;
        });
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHolding, onComplete]);

  const handleBypass = () => {
    onComplete();
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center cursor-none"
    >
      {/* Central Focus Dot */}
      <div className="relative">
        {/* Outer ring progress */}
        <svg className="w-32 h-32 -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="60"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="2"
            opacity="0.2"
          />
          <circle
            cx="64"
            cy="64"
            r="60"
            fill="none"
            stroke="hsl(var(--focus))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 60}
            strokeDashoffset={2 * Math.PI * 60 * (1 - progress / 100)}
            className="transition-all duration-100"
          />
        </svg>

        {/* Center dot */}
        <div
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300",
            isHolding
              ? "w-4 h-4 bg-focus shadow-[0_0_30px_hsl(var(--focus))]"
              : "w-2 h-2 bg-foreground/50"
          )}
        />
      </div>

      {/* Instructions */}
      <div className="mt-12 text-center space-y-3">
        {failed ? (
          <p className="font-mono text-sm text-destructive animate-pulse">
            SEQUENCE FAILED — FOCUS BROKEN
          </p>
        ) : (
          <>
            <p className="font-mono text-xs text-muted-foreground tracking-widest">
              {isHolding ? "NARROWING VISUAL FIELD" : "INITIATING VERGENCE PROTOCOL"}
            </p>
            <p className="font-mono text-sm text-foreground/70">
              Hold <span className="text-focus px-2 py-1 bg-focus/10 rounded">SPACEBAR</span> and stare at the dot
            </p>
            <p className="font-mono text-xs text-muted-foreground/50">
              Do not move the mouse • Release resets sequence
            </p>
          </>
        )}
      </div>

      {/* Progress indicator */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
        <p className="font-mono text-2xl text-foreground/30">
          {Math.floor(progress * ANCHOR_DURATION / 100)}s / {ANCHOR_DURATION}s
        </p>
      </div>

      {/* Bypass Option - appears after a fail */}
      {showBypass && (
        <button
          onClick={handleBypass}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-muted/10 border border-muted/20 rounded-lg text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/20 transition-all font-mono text-xs"
        >
          <FastForward className="h-3 w-3" />
          Skip Protocol
        </button>
      )}

      {/* Cancel button */}
      <button
        onClick={onCancel}
        className="absolute top-6 right-6 font-mono text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
      >
        ESC TO EXIT
      </button>
    </div>
  );
}
