import { useState, useRef, useEffect } from "react";
import { Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface CapturedThought {
  id: string;
  text: string;
  timestamp: Date;
}

interface ZeigarnikDumpProps {
  onCapture?: (thought: string) => void;
}

export function ZeigarnikDump({ onCapture }: ZeigarnikDumpProps) {
  const [input, setInput] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [thoughts, setThoughts] = useState<CapturedThought[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newThought: CapturedThought = {
      id: Date.now().toString(),
      text: input.trim(),
      timestamp: new Date(),
    };

    setThoughts((prev) => [...prev, newThought]);
    onCapture?.(input.trim());
    setInput("");
    setShowConfirmation(true);

    setTimeout(() => {
      setShowConfirmation(false);
    }, 2000);
  };

  // Auto-focus when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="relative">
      {/* Confirmation overlay */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-background/95 rounded-lg border border-growth/30 transition-all duration-300 pointer-events-none z-10",
          showConfirmation ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="text-center">
          <p className="font-mono text-sm text-growth">Captured.</p>
          <p className="font-mono text-xs text-muted-foreground mt-1">
            Removed from RAM.
          </p>
        </div>
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2">
          <Terminal className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Intrusive thought? Dump it here..."
            className="flex-1 bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          />
          <span className="text-xs text-muted-foreground/30 font-mono">↵</span>
        </div>
      </form>

      {/* Thought count indicator */}
      {thoughts.length > 0 && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-focus rounded-full flex items-center justify-center">
          <span className="font-mono text-xs text-foreground">{thoughts.length}</span>
        </div>
      )}
    </div>
  );
}
