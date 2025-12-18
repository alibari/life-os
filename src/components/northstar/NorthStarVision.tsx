import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Compass } from "lucide-react";

interface AlignmentRingProps {
    value: number;
}

function AlignmentRing({ value }: AlignmentRingProps) {
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

const lifeVision = {
    statement: "Build a legacy of innovation, health, and meaningful impact while achieving financial freedom and deep relationships.",
    yearsRemaining: 10,
    alignmentScore: 78,
};

export function NorthStarVision() {
    return (
        <Card className="card-surface p-5 h-full flex flex-col justify-center">
            <div className="flex items-start gap-4 h-full">
                <div className="flex-1 flex flex-col justify-center">
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
                <div className="hidden sm:block">
                    <AlignmentRing value={lifeVision.alignmentScore} />
                </div>
            </div>
        </Card>
    );
}
