import { Book, Briefcase, GraduationCap, Code, Palette, Dumbbell, Music, PenTool, Calculator, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

export type SessionType = 
  | "deep-work" 
  | "reading" 
  | "learning" 
  | "coding" 
  | "creative" 
  | "exercise" 
  | "practice" 
  | "writing" 
  | "analysis" 
  | "meeting";

interface SessionTypeSelectorProps {
  selected: SessionType;
  onSelect: (type: SessionType) => void;
}

const SESSION_TYPES = [
  { type: "deep-work" as const, icon: Briefcase, label: "Deep Work", color: "focus" },
  { type: "reading" as const, icon: Book, label: "Reading", color: "growth" },
  { type: "learning" as const, icon: GraduationCap, label: "Learning", color: "warning" },
  { type: "coding" as const, icon: Code, label: "Coding", color: "focus" },
  { type: "creative" as const, icon: Palette, label: "Creative", color: "primary" },
  { type: "exercise" as const, icon: Dumbbell, label: "Exercise", color: "growth" },
  { type: "practice" as const, icon: Music, label: "Practice", color: "warning" },
  { type: "writing" as const, icon: PenTool, label: "Writing", color: "focus" },
  { type: "analysis" as const, icon: Calculator, label: "Analysis", color: "primary" },
  { type: "meeting" as const, icon: Mic, label: "Meeting", color: "muted-foreground" },
];

export function SessionTypeSelector({ selected, onSelect }: SessionTypeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {SESSION_TYPES.map(({ type, icon: Icon, label, color }) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-mono text-[10px] transition-all btn-press",
            selected === type
              ? `bg-${color}/20 border border-${color}/40 text-${color}`
              : "bg-background/50 border border-border text-muted-foreground hover:border-border/80"
          )}
        >
          <Icon className="h-3 w-3" />
          {label}
        </button>
      ))}
    </div>
  );
}
