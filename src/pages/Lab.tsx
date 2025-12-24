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
const widgetComponents: Record<string, React.FC<{ compact?: boolean }>> = {};

const availableWidgets: any[] = [];

const defaultLayouts: any[] = [];

const defaultWidgets: any[] = [];

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
