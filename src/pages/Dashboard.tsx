import { ComponentType } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WidgetCanvas } from "@/components/layout/WidgetCanvas";

// Widgets
import { ReadinessArc } from "@/components/cockpit/ReadinessArc";
import { CircadianClock } from "@/components/cockpit/CircadianClock";
import { TReadyScore } from "@/components/cockpit/TReadyScore";
import { DopamineDelta } from "@/components/cockpit/DopamineDelta";
import { PFCBattery } from "@/components/cockpit/PFCBattery";
import { AdenosinePressure } from "@/components/cockpit/AdenosinePressure";
import { StateSwitch } from "@/components/cockpit/StateSwitch";
import { BrainScore } from "@/components/cockpit/BrainScore";
import { NutritionScore } from "@/components/cockpit/NutritionScore";
import { AdvancedGraph } from "@/components/cockpit/AdvancedGraph";
import { YearTracker } from "@/components/cockpit/YearTracker";
import { BiohackTracker } from "@/components/cockpit/BiohackTracker";
import { AISummary } from "@/components/cockpit/AISummary";

// Configuration
const widgetComponents: Record<string, React.FC<{ compact?: boolean }>> = {
  readiness: ReadinessArc,
  circadian: CircadianClock,
  voltage: TReadyScore,
  dopamine: DopamineDelta,
  pfc: PFCBattery,
  adenosine: AdenosinePressure,
  stateswitch: StateSwitch,
  brain: BrainScore,
  nutrition: NutritionScore,
  graph: AdvancedGraph,
  yeartracker: YearTracker,
  biohack: BiohackTracker,
  aisummary: AISummary,
};

const availableWidgets = [
  { type: "readiness", title: "Readiness Index", category: "readiness" },
  { type: "circadian", title: "Circadian Rhythm", category: "readiness" },
  { type: "voltage", title: "System Voltage", category: "readiness" },
  { type: "dopamine", title: "Dopamine Delta", category: "neuro" },
  { type: "pfc", title: "PFC Battery", category: "neuro" },
  { type: "adenosine", title: "Adenosine Pressure", category: "neuro" },
  { type: "stateswitch", title: "State Switch", category: "readiness" },
  { type: "brain", title: "Brain Score", category: "neuro" },
  { type: "nutrition", title: "Nutrition Score", category: "health" },
  { type: "graph", title: "Performance Trend", category: "analytics" },
  { type: "yeartracker", title: "365 Days Tracker", category: "analytics" },
  { type: "biohack", title: "Biohack Tracker", category: "health" },
  { type: "aisummary", title: "AI Insights", category: "analytics" },
];

import { PageHeader } from "@/components/layout/PageHeader";

// ... (existing imports)

export default function Dashboard() {
  const { user } = useAuth(); // Removed signOut

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const defaultLayouts = [/* ... */];

  return (
    <div className="min-h-screen pt-8 px-6 pb-20 cockpit-canvas flex flex-col items-center">
      <WidgetCanvas
        pageId="dashboard"
        availableWidgets={availableWidgets}
        widgetComponents={widgetComponents}
        defaultLayouts={defaultLayouts}
      >
        <PageHeader
          title="COCKPIT"
          subtitle={today.toUpperCase()}
          icon={Gauge}
          className="w-full"
        />
      </WidgetCanvas>
    </div>
  );
}
