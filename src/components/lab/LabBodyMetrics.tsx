import { Droplets, Brain, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const weeklyMetrics = {
    hydration: 78,
    recoveryScore: 85,
};

export function LabBodyMetrics() {
    return (
        <Card className="card-surface p-4 h-full flex flex-col justify-center">
            <div className="space-y-4">
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Droplets className="w-4 h-4 text-accent" />
                            <span className="text-sm text-foreground">Hydration</span>
                        </div>
                        <span className="font-mono text-sm text-foreground">{weeklyMetrics.hydration}%</span>
                    </div>
                    <Progress value={weeklyMetrics.hydration} className="h-2" />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4 text-primary" />
                            <span className="text-sm text-foreground">Recovery Score</span>
                        </div>
                        <span className="font-mono text-sm text-foreground">{weeklyMetrics.recoveryScore}%</span>
                    </div>
                    <Progress value={weeklyMetrics.recoveryScore} className="h-2" />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-destructive" />
                            <span className="text-sm text-foreground">Resting HR</span>
                        </div>
                        <span className="font-mono text-sm text-foreground">58 bpm</span>
                    </div>
                    <Progress value={58} max={100} className="h-2" />
                </div>
            </div>
        </Card>
    );
}
