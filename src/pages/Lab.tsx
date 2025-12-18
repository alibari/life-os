import { WidgetCanvas } from "@/components/layout/WidgetCanvas";
import { LabQuickStats } from "@/components/lab/LabQuickStats";
import { LabRecoveryVitals } from "@/components/lab/LabRecoveryVitals";
import { LabSleepAnalysis, LabHRVTrend } from "@/components/lab/LabAnalysis";
import { LabBodyMetrics } from "@/components/lab/LabBodyMetrics";

// Configuration
const widgetComponents: Record<string, React.FC<{ compact?: boolean }>> = {
  quickstats: LabQuickStats,
  recovery: LabRecoveryVitals,
  sleep: LabSleepAnalysis,
  hrv: LabHRVTrend,
  body: LabBodyMetrics,
};

const availableWidgets = [
  { type: "quickstats", title: "Quick Stats Grid", category: "overview" },
  { type: "recovery", title: "Recovery Vitals", category: "vitals" },
  { type: "sleep", title: "Sleep Analysis", category: "analysis" },
  { type: "hrv", title: "HRV Trend", category: "analysis" },
  { type: "body", title: "Body Metrics", category: "vitals" },
];

const defaultLayouts = [
  { i: "quickstats-1", x: 0, y: 0, w: 6, h: 2, minW: 2, maxW: 6, minH: 2 },
  { i: "recovery-1", x: 0, y: 2, w: 6, h: 3, minW: 3, maxW: 6, minH: 2 },
  { i: "sleep-1", x: 0, y: 5, w: 3, h: 3, minW: 2, maxW: 6, minH: 2 },
  { i: "hrv-1", x: 3, y: 5, w: 3, h: 3, minW: 2, maxW: 6, minH: 2 },
  { i: "body-1", x: 0, y: 8, w: 6, h: 3, minW: 2, maxW: 6, minH: 2 },
];

const defaultWidgets = [
  { id: "quickstats-1", type: "quickstats", title: "Quick Stats Grid" },
  { id: "recovery-1", type: "recovery", title: "Recovery Vitals" },
  { id: "sleep-1", type: "sleep", title: "Sleep Analysis" },
  { id: "hrv-1", type: "hrv", title: "HRV Trend" },
  { id: "body-1", type: "body", title: "Body Metrics" },
];

import { PageHeader } from "@/components/layout/PageHeader";
import { FlaskConical } from "lucide-react";

// ...

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
          subtitle="BIO-DATA"
          icon={FlaskConical}
          className="w-full"
        />
      </WidgetCanvas>
    </div>
  );
}
