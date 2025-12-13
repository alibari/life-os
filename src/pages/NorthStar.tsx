import { useState } from "react";
import { 
  Star, 
  Target, 
  Calendar,
  CheckCircle2,
  Circle,
  ChevronRight,
  Flame,
  Trophy,
  Mountain,
  Compass
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mock data for vision and goals
const lifeVision = {
  statement: "Build a legacy of innovation, health, and meaningful impact while achieving financial freedom and deep relationships.",
  yearsRemaining: 10,
  alignmentScore: 78,
};

const pillars = [
  {
    id: "health",
    name: "Health & Vitality",
    icon: Flame,
    color: "text-primary",
    bgColor: "bg-primary/20",
    progress: 85,
    tenYearGoal: "Peak physical condition at 45",
    currentMilestone: "Sub 15% body fat",
  },
  {
    id: "wealth",
    name: "Wealth & Freedom",
    icon: Trophy,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/20",
    progress: 62,
    tenYearGoal: "$5M net worth",
    currentMilestone: "$500K invested",
  },
  {
    id: "growth",
    name: "Growth & Mastery",
    icon: Mountain,
    color: "text-accent",
    bgColor: "bg-accent/20",
    progress: 71,
    tenYearGoal: "World-class expertise",
    currentMilestone: "Launch second product",
  },
  {
    id: "relationships",
    name: "Relationships",
    icon: Star,
    color: "text-pink-500",
    bgColor: "bg-pink-500/20",
    progress: 88,
    tenYearGoal: "Deep tribe of 10",
    currentMilestone: "Weekly connection rituals",
  },
];

const quarterlyObjectives = [
  {
    id: "q1",
    title: "Ship MVP by March",
    pillar: "growth",
    progress: 45,
    dueDate: "Mar 31",
    keyResults: [
      { text: "Complete core features", done: true },
      { text: "User testing with 20 users", done: false },
      { text: "Launch beta publicly", done: false },
    ],
  },
  {
    id: "q2",
    title: "Hit 180 lbs lean mass",
    pillar: "health",
    progress: 72,
    dueDate: "Mar 31",
    keyResults: [
      { text: "4x strength training weekly", done: true },
      { text: "Track macros daily", done: true },
      { text: "8 hours sleep average", done: false },
    ],
  },
  {
    id: "q3",
    title: "Max out 401k + Roth",
    pillar: "wealth",
    progress: 33,
    dueDate: "Dec 31",
    keyResults: [
      { text: "$23k to 401k", done: false },
      { text: "$7k to Roth IRA", done: true },
      { text: "Automate investments", done: true },
    ],
  },
];

const dailyAlignmentActions = [
  { text: "Morning meditation", done: true, pillar: "growth" },
  { text: "Deep work block (4 hrs)", done: false, pillar: "growth" },
  { text: "Workout session", done: true, pillar: "health" },
  { text: "Call a friend", done: false, pillar: "relationships" },
  { text: "Review budget", done: false, pillar: "wealth" },
];

function AlignmentRing({ value }: { value: number }) {
  const size = 140;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(value / 100, 1);
  const offset = circumference - progress * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Compass className="w-5 h-5 text-primary mb-1" />
        <span className="font-mono text-2xl font-bold text-foreground">{value}%</span>
        <span className="text-xs text-muted-foreground">aligned</span>
      </div>
    </div>
  );
}

export default function NorthStar() {
  const [expandedObjective, setExpandedObjective] = useState<string | null>(null);

  const completedToday = dailyAlignmentActions.filter(a => a.done).length;
  const totalToday = dailyAlignmentActions.length;

  return (
    <div className="min-h-screen p-4 pt-20 pb-8">
      {/* Header */}
      <header className="mb-6">
        <p className="font-mono text-xs text-muted-foreground tracking-wider">
          10-YEAR VISION
        </p>
        <h1 className="font-mono text-2xl font-bold text-foreground mt-1">
          NORTH STAR
        </h1>
      </header>

      {/* Vision Statement */}
      <Card className="card-surface p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-primary" />
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                Life Vision
              </span>
            </div>
            <p className="text-sm text-foreground leading-relaxed mb-4">
              "{lifeVision.statement}"
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="font-mono">{lifeVision.yearsRemaining} years left</span>
              <span>•</span>
              <span className="text-primary font-mono">{lifeVision.alignmentScore}% on track</span>
            </div>
          </div>
          <AlignmentRing value={lifeVision.alignmentScore} />
        </div>
      </Card>

      {/* Life Pillars */}
      <div className="mb-6">
        <h2 className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-3">
          Life Pillars
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Card key={pillar.id} className="card-surface p-4">
                <div className={`p-2 rounded-lg ${pillar.bgColor} w-fit mb-3`}>
                  <Icon className={`w-4 h-4 ${pillar.color}`} />
                </div>
                <h3 className="text-sm font-medium text-foreground mb-1">
                  {pillar.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                  {pillar.tenYearGoal}
                </p>
                <Progress value={pillar.progress} className="h-1.5 mb-2" />
                <span className="font-mono text-xs text-muted-foreground">
                  {pillar.progress}%
                </span>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quarterly Objectives */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
            Quarterly Objectives
          </h2>
          <Badge variant="outline" className="font-mono text-xs">
            Q1 2024
          </Badge>
        </div>
        <div className="space-y-3">
          {quarterlyObjectives.map((objective) => {
            const isExpanded = expandedObjective === objective.id;
            const pillar = pillars.find(p => p.id === objective.pillar);
            
            return (
              <Card 
                key={objective.id} 
                className="card-surface overflow-hidden"
              >
                <button
                  className="w-full p-4 text-left"
                  onClick={() => setExpandedObjective(isExpanded ? null : objective.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target className={`w-4 h-4 ${pillar?.color || 'text-primary'}`} />
                      <span className="text-sm font-medium text-foreground">
                        {objective.title}
                      </span>
                    </div>
                    <ChevronRight 
                      className={`w-4 h-4 text-muted-foreground transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`} 
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={objective.progress} className="h-1.5 flex-1" />
                    <span className="font-mono text-xs text-muted-foreground">
                      {objective.progress}%
                    </span>
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-border/50">
                    <div className="pt-3 space-y-2">
                      {objective.keyResults.map((kr, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center gap-2 text-sm"
                        >
                          {kr.done ? (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className={kr.done ? 'text-muted-foreground line-through' : 'text-foreground'}>
                            {kr.text}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground font-mono">
                        Due {objective.dueDate}
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Daily Alignment */}
      <Card className="card-surface p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
            Today's Alignment
          </h2>
          <span className="font-mono text-xs text-primary">
            {completedToday}/{totalToday}
          </span>
        </div>
        <div className="space-y-3">
          {dailyAlignmentActions.map((action, idx) => {
            const pillar = pillars.find(p => p.id === action.pillar);
            return (
              <div 
                key={idx}
                className="flex items-center gap-3"
              >
                {action.done ? (
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
                <span className={`text-sm flex-1 ${action.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                  {action.text}
                </span>
                <Badge 
                  variant="outline" 
                  className={`text-xs font-mono ${pillar?.color}`}
                >
                  {pillar?.name.split(' ')[0]}
                </Badge>
              </div>
            );
          })}
        </div>
        <Button className="w-full mt-4" variant="outline">
          <Target className="w-4 h-4 mr-2" />
          Add Alignment Action
        </Button>
      </Card>
    </div>
  );
}
