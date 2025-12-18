import { useState } from "react";
import {
    Target,
    Calendar,
    CheckCircle2,
    Circle,
    ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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

// Simplified pillar color mapping
const pillarColors: Record<string, string> = {
    health: "text-primary",
    wealth: "text-yellow-500",
    growth: "text-accent",
    relationships: "text-pink-500"
};

export function NorthStarObjectives() {
    const [expandedObjective, setExpandedObjective] = useState<string | null>(null);

    return (
        <div className="h-full flex flex-col gap-3 overflow-y-auto pr-1">
            <div className="flex items-center justify-between mb-1">
                <h2 className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                    Quarterly Objectives
                </h2>
                <Badge variant="outline" className="font-mono text-xs">
                    Q1 2024
                </Badge>
            </div>
            {quarterlyObjectives.map((objective) => {
                const isExpanded = expandedObjective === objective.id;
                const color = pillarColors[objective.pillar] || "text-primary";

                return (
                    <Card
                        key={objective.id}
                        className="card-surface overflow-hidden shrink-0"
                    >
                        <button
                            className="w-full p-4 text-left"
                            onClick={() => setExpandedObjective(isExpanded ? null : objective.id)}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Target className={`w-4 h-4 ${color}`} />
                                    <span className="text-sm font-medium text-foreground">
                                        {objective.title}
                                    </span>
                                </div>
                                <ChevronRight
                                    className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''
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
    );
}
