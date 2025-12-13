import { ReadinessArc } from "@/components/cockpit/ReadinessArc";
import { CircadianClock } from "@/components/cockpit/CircadianClock";
import { TReadyScore } from "@/components/cockpit/TReadyScore";

export default function Dashboard() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="min-h-screen p-4 pt-20">
      {/* Header */}
      <header className="mb-6">
        <p className="font-mono text-xs text-muted-foreground tracking-wider">
          {today.toUpperCase()}
        </p>
        <h1 className="font-mono text-2xl font-bold text-foreground mt-1">
          COCKPIT
        </h1>
      </header>

      {/* Widgets */}
      <div className="space-y-4 max-w-lg mx-auto">
        <ReadinessArc />
        <CircadianClock />
        <TReadyScore />
      </div>
    </div>
  );
}
