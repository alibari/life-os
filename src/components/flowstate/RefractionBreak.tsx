import { useState, useEffect } from "react";
import { Eye } from "lucide-react";

interface RefractionBreakProps {
  onComplete: () => void;
  duration?: number;
}

const BREAK_DURATION = 120; // 2 minutes

export function RefractionBreak({ onComplete, duration = BREAK_DURATION }: RefractionBreakProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
      {/* Pulsing eye icon */}
      <div className="relative mb-8">
        <div className="absolute inset-0 w-24 h-24 bg-growth/20 rounded-full animate-ping" />
        <div className="relative w-24 h-24 bg-growth/10 rounded-full flex items-center justify-center">
          <Eye className="h-12 w-12 text-growth" />
        </div>
      </div>

      {/* Instructions */}
      <h2 className="font-mono text-2xl text-foreground mb-2 tracking-wider">
        DILATE GAZE
      </h2>
      <p className="font-mono text-sm text-muted-foreground mb-8 max-w-sm text-center">
        Look at the horizon or 20ft away.
        <br />
        This resets your ciliary muscles.
      </p>

      {/* Timer */}
      <div className="relative">
        <svg className="w-32 h-32 -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="58"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="2"
            opacity="0.2"
          />
          <circle
            cx="64"
            cy="64"
            r="58"
            fill="none"
            stroke="hsl(var(--growth))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 58}
            strokeDashoffset={2 * Math.PI * 58 * (timeRemaining / duration)}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-3xl text-foreground">
            {formatTime(timeRemaining)}
          </span>
        </div>
      </div>

      {/* Subtitle */}
      <p className="font-mono text-xs text-muted-foreground/50 mt-8">
        Screen locked until recovery complete
      </p>
    </div>
  );
}
