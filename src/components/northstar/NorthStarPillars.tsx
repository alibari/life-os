import {
    Star,
    Flame,
    Trophy,
    Mountain,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const pillars = [
    {
        id: "health",
        name: "Health & Vitality",
        icon: Flame,
        color: "text-primary",
        bgColor: "bg-primary/20",
        progress: 85,
        tenYearGoal: "Peak physical condition at 45",
    },
    {
        id: "wealth",
        name: "Wealth & Freedom",
        icon: Trophy,
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/20",
        progress: 62,
        tenYearGoal: "$5M net worth",
    },
    {
        id: "growth",
        name: "Growth & Mastery",
        icon: Mountain,
        color: "text-accent",
        bgColor: "bg-accent/20",
        progress: 71,
        tenYearGoal: "World-class expertise",
    },
    {
        id: "relationships",
        name: "Relationships",
        icon: Star,
        color: "text-pink-500",
        bgColor: "bg-pink-500/20",
        progress: 88,
        tenYearGoal: "Deep tribe of 10",
    },
];

export function NorthStarPillars() {
    return (
        <div className="grid grid-cols-2 gap-3 h-full">
            {pillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                    <Card key={pillar.id} className="card-surface p-4 flex flex-col justify-between">
                        <div>
                            <div className={`p-2 rounded-lg ${pillar.bgColor} w-fit mb-3`}>
                                <Icon className={`w-4 h-4 ${pillar.color}`} />
                            </div>
                            <h3 className="text-sm font-medium text-foreground mb-1">
                                {pillar.name}
                            </h3>
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                                {pillar.tenYearGoal}
                            </p>
                        </div>
                        <div>
                            <Progress value={pillar.progress} className="h-1.5 mb-2" />
                            <span className="font-mono text-xs text-muted-foreground">
                                {pillar.progress}%
                            </span>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
