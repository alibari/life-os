import { Pill, Plus, Check, Clock, Zap, TrendingUp, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Supplement {
  id: string;
  name: string;
  dosage: string;
  timing: string;
  taken: boolean;
  effect: "energy" | "focus" | "recovery" | "sleep" | "mood";
  streak: number;
}

const mockSupplements: Supplement[] = [
  { id: "1", name: "Omega-3", dosage: "2g", timing: "Morning", taken: true, effect: "focus", streak: 45 },
  { id: "2", name: "Vitamin D3", dosage: "5000 IU", timing: "Morning", taken: true, effect: "mood", streak: 90 },
  { id: "3", name: "Magnesium L-Threonate", dosage: "144mg", timing: "Evening", taken: false, effect: "sleep", streak: 30 },
  { id: "4", name: "Creatine", dosage: "5g", timing: "Post-workout", taken: true, effect: "energy", streak: 60 },
  { id: "5", name: "Lion's Mane", dosage: "1g", timing: "Morning", taken: false, effect: "focus", streak: 14 },
  { id: "6", name: "Ashwagandha KSM-66", dosage: "600mg", timing: "Evening", taken: false, effect: "recovery", streak: 21 },
];

const effectColors: Record<string, string> = {
  energy: "text-primary bg-primary/10 border-primary/20",
  focus: "text-secondary bg-secondary/10 border-secondary/20",
  recovery: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  sleep: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
  mood: "text-amber-400 bg-amber-400/10 border-amber-400/20",
};

const effectIcons: Record<string, React.FC<{ className?: string }>> = {
  energy: Zap,
  focus: TrendingUp,
  recovery: Clock,
  sleep: Clock,
  mood: Zap,
};

export const BiohackTracker = () => {
  const [supplements, setSupplements] = useState(mockSupplements);
  
  const takenCount = supplements.filter(s => s.taken).length;
  const totalCount = supplements.length;
  const completionRate = Math.round((takenCount / totalCount) * 100);
  
  const toggleTaken = (id: string) => {
    setSupplements(prev => 
      prev.map(s => s.id === id ? { ...s, taken: !s.taken } : s)
    );
  };

  const longestStreak = Math.max(...supplements.map(s => s.streak));
  const avgStreak = Math.round(supplements.reduce((sum, s) => sum + s.streak, 0) / totalCount);

  return (
    <div className="card-surface p-4 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Pill className="h-4 w-4 text-purple-400" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
          </div>
          <span className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
            Biohack Tracker
          </span>
        </div>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-muted">
          <Plus className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-3 shrink-0">
        <div className="text-center p-2 bg-muted/30 rounded-md border border-border/50">
          <div className="font-mono text-lg font-bold text-primary">{takenCount}/{totalCount}</div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Today</div>
        </div>
        <div className="text-center p-2 bg-muted/30 rounded-md border border-border/50">
          <div className="font-mono text-lg font-bold text-foreground">{longestStreak}d</div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Best Streak</div>
        </div>
        <div className="text-center p-2 bg-muted/30 rounded-md border border-border/50">
          <div className="font-mono text-lg font-bold text-secondary">{completionRate}%</div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Compliance</div>
        </div>
      </div>

      {/* Completion Bar */}
      <div className="relative h-2 bg-muted rounded-full mb-3 shrink-0 overflow-hidden">
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
          style={{ width: `${completionRate}%` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
      </div>

      {/* Supplements List */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0 pr-1">
        {supplements.map((supp) => {
          const EffectIcon = effectIcons[supp.effect];
          return (
            <div 
              key={supp.id}
              onClick={() => toggleTaken(supp.id)}
              className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                supp.taken 
                  ? "bg-primary/5 border-primary/30" 
                  : "bg-muted/20 border-border/50 hover:border-muted-foreground/30"
              }`}
            >
              <button
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                  supp.taken 
                    ? "bg-primary border-primary" 
                    : "border-muted-foreground/40 hover:border-primary/50"
                }`}
              >
                {supp.taken && <Check className="h-3 w-3 text-primary-foreground" />}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-sm font-medium truncate ${
                    supp.taken ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {supp.name}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${effectColors[supp.effect]}`}>
                    {supp.effect}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">{supp.dosage}</span>
                  <span className="text-[8px] text-muted-foreground/50">•</span>
                  <span className="text-[10px] text-muted-foreground">{supp.timing}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 shrink-0">
                <div className="text-[10px] font-mono text-muted-foreground">{supp.streak}d</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stack Effects Summary */}
      <div className="mt-3 pt-3 border-t border-border shrink-0">
        <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-2">Stack Effects</div>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(
            supplements.filter(s => s.taken).reduce((acc, s) => {
              acc[s.effect] = (acc[s.effect] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          ).map(([effect, count]) => (
            <div 
              key={effect}
              className={`flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] ${effectColors[effect]}`}
            >
              <span className="capitalize">{effect}</span>
              <span className="font-mono font-bold">×{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
