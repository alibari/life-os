import {
    Target,
    CheckCircle2,
    Circle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const dailyAlignmentActions = [
    { text: "Morning meditation", done: true, pillar: "growth" },
    { text: "Deep work block (4 hrs)", done: false, pillar: "growth" },
    { text: "Workout session", done: true, pillar: "health" },
    { text: "Call a friend", done: false, pillar: "relationships" },
    { text: "Review budget", done: false, pillar: "wealth" },
];

const pillarColors: Record<string, string> = {
    health: "text-primary",
    wealth: "text-yellow-500",
    growth: "text-accent",
    relationships: "text-pink-500"
};

const pillarNames: Record<string, string> = {
    health: "Health",
    wealth: "Wealth",
    growth: "Growth",
    relationships: "Rel..."
};

export function NorthStarAlignment() {
    const completedToday = dailyAlignmentActions.filter(a => a.done).length;
    const totalToday = dailyAlignmentActions.length;

    return (
        <Card className="card-surface p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                    Today's Alignment
                </h2>
                <span className="font-mono text-xs text-primary">
                    {completedToday}/{totalToday}
                </span>
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto">
                {dailyAlignmentActions.map((action, idx) => {
                    const color = pillarColors[action.pillar] || "text-primary";
                    const name = pillarNames[action.pillar] || "Other";
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
                            <span className={`text-sm flex-1 truncate ${action.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                {action.text}
                            </span>
                            <Badge
                                variant="outline"
                                className={`text-xs font-mono ml-auto shrink-0 ${color}`}
                            >
                                {name}
                            </Badge>
                        </div>
                    );
                })}
            </div>
            <Button className="w-full mt-4 shrink-0" variant="outline">
                <Target className="w-4 h-4 mr-2" />
                Add Action
            </Button>
        </Card>
    );
}
