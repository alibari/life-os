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

export const sessionTypes = [
  {
    id: "deep-work" as const,
    icon: Briefcase,
    label: "Deep Work",
    color: "focus",
    description: "High cognitive intensity",
    protocols: ["Phone away", "Clear desk", "Define single output", "90min block"]
  },
  {
    id: "reading" as const,
    icon: Book,
    label: "Reading",
    color: "growth",
    description: "Active information intake",
    protocols: ["Highlight active concepts", "Summarize after each chapter", "No digital interruptions"]
  },
  {
    id: "learning" as const,
    icon: GraduationCap,
    label: "Learning",
    color: "warning",
    description: "Skill acquisition",
    protocols: ["Review previous session", "Practice new concept", "Test recall"]
  },
  {
    id: "coding" as const,
    icon: Code,
    label: "Coding",
    color: "focus",
    description: "Development & Logic",
    protocols: ["Define architecture", "Write tests first", "Commit often"]
  },
  {
    id: "creative" as const,
    icon: Palette,
    label: "Creative",
    color: "primary",
    description: "Divergent thinking",
    protocols: ["No judgement phase", "Quantity over quality", "Visual references ready"]
  },
  {
    id: "exercise" as const,
    icon: Dumbbell,
    label: "Exercise",
    color: "growth",
    description: "Physical training",
    protocols: ["Warm up 5min", "Track sets/reps", "Hydrate"]
  },
  {
    id: "practice" as const,
    icon: Music,
    label: "Practice",
    color: "warning",
    description: "Deliberate rehearsal",
    protocols: ["Focus on weak points", "Slow repetition", "Record feedback"]
  },
  {
    id: "writing" as const,
    icon: PenTool,
    label: "Writing",
    color: "focus",
    description: "Content creation",
    protocols: ["Outline first", "Write without editing", "Edit in passes"]
  },
  {
    id: "analysis" as const,
    icon: Calculator,
    label: "Analysis",
    color: "primary",
    description: "Data & Systems review",
    protocols: ["Check data sources", "Identify patterns", "Document insights"]
  },
  {
    id: "meeting" as const,
    icon: Mic,
    label: "Meeting",
    color: "muted-foreground",
    description: "Collaboration",
    protocols: ["Set agenda", "Record action items", "Hard stop on time"]
  },
];

export function SessionTypeSelector({ selected, onSelect }: SessionTypeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {sessionTypes.map(({ id, icon: Icon, label, color }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-mono text-[10px] transition-all btn-press",
            selected === id
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
