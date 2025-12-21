import { WidgetCanvas } from "@/components/layout/WidgetCanvas";
import { LabQuickStats } from "@/components/lab/LabQuickStats";
import { LabRecoveryVitals } from "@/components/lab/LabRecoveryVitals";
import { LabSleepAnalysis, LabHRVTrend } from "@/components/lab/LabAnalysis";
import { LabBodyMetrics } from "@/components/lab/LabBodyMetrics";
import { OmniGraph } from "@/components/lab/OmniGraph";
import { ExperimentLab } from "@/components/lab/ExperimentLab";
import { PageHeader } from "@/components/layout/PageHeader";
import { FlaskConical } from "lucide-react";

// Configuration
const widgetComponents: Record<string, React.FC<{ compact?: boolean }>> = {
  "omni-graph": OmniGraph,
  "experiment-lab": ExperimentLab,
  quickstats: LabQuickStats,
  recovery: LabRecoveryVitals,
  sleep: LabSleepAnalysis,
  hrv: LabHRVTrend,
  body: LabBodyMetrics,
};

const availableWidgets = [
  { type: "omni-graph", title: "Omni-Graph Explorer", category: "explorer" },
  { type: "experiment-lab", title: "N=1 Experiment Lab", category: "explorer" },
  { type: "quickstats", title: "Quick Stats Grid", category: "overview" },
  { type: "recovery", title: "Recovery Vitals", category: "vitals" },
  { type: "sleep", title: "Sleep Analysis", category: "analysis" },
  { type: "hrv", title: "HRV Trend", category: "analysis" },
  { type: "body", title: "Body Metrics", category: "vitals" },
];

const defaultLayouts = [
  // Omni-Graph at the top (Hero)
  { i: "omni-graph-1", x: 0, y: 0, w: 12, h: 5, minW: 6, maxW: 12, minH: 4 },

  // Experiment Lab
  { i: "experiment-lab-1", x: 0, y: 5, w: 12, h: 4, minW: 6, maxW: 12, minH: 3 },

  // Stats below
  { i: "quickstats-1", x: 0, y: 9, w: 6, h: 2, minW: 2, maxW: 6, minH: 2 },
  { i: "recovery-1", x: 6, y: 9, w: 6, h: 3, minW: 3, maxW: 6, minH: 2 },

  // Deep correlation row
  { i: "sleep-1", x: 0, y: 12, w: 3, h: 3, minW: 2, maxW: 6, minH: 2 },
  { i: "hrv-1", x: 3, y: 12, w: 3, h: 3, minW: 2, maxW: 6, minH: 2 },
  { i: "body-1", x: 6, y: 12, w: 6, h: 3, minW: 2, maxW: 6, minH: 2 },
];

const defaultWidgets = [
  { id: "omni-graph-1", type: "omni-graph", title: "Omni-Graph Explorer" },
  { id: "experiment-lab-1", type: "experiment-lab", title: "N=1 Experiment Lab" },
  { id: "quickstats-1", type: "quickstats", title: "Quick Stats Grid" },
  { id: "recovery-1", type: "recovery", title: "Recovery Vitals" },
  { id: "sleep-1", type: "sleep", title: "Sleep Analysis" },
  { id: "hrv-1", type: "hrv", title: "HRV Trend" },
  { id: "body-1", type: "body", title: "Body Metrics" },
];

export default function Lab() {
  return (
    <div className="min-h-screen pt-8 px-6 pb-20 cockpit-canvas flex flex-col items-center">
      <WidgetCanvas
        pageId="lab"
        availableWidgets={availableWidgets}
        widgetComponents={widgetComponents}
        defaultLayouts={defaultLayouts}
        defaultWidgets={defaultWidgets}
      >
        <PageHeader
          title="THE LAB"
          subtitle="BIO-DATA EXPLORATION"
          description="Correlation engine, hypothesis testing, and raw data access."
          icon={FlaskConical}
          className="w-full"
        />
      </WidgetCanvas>
    </div>
  );
}
