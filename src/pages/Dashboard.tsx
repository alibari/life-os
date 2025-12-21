import { useState, useRef, useEffect } from "react";
import { WidgetCanvas } from "@/components/layout/WidgetCanvas";
import { PageHeader } from "@/components/layout/PageHeader";
import { Activity, Battery, Zap, Brain, Moon, Footprints, Flame, Timer, AlertTriangle, Gauge, Eye } from "lucide-react";
import { useLens } from "@/context/LensContext";
import { cn } from "@/lib/utils";
import { LabRecoveryVitals } from "@/components/lab/LabRecoveryVitals";
import { LabSleepAnalysis, LabHRVTrend } from "@/components/lab/LabAnalysis";
import { ExecutiveSummaryWidget, SleepBankWidget, StrainCapacityWidget } from "@/components/dashboard/ExecutiveSummaryWidget";

// -- LAB MODE CONFIG --
const labComponents: Record<string, React.FC<{ compact?: boolean }>> = {
  recovery: LabRecoveryVitals,
  sleep: LabSleepAnalysis,
  hrv: LabHRVTrend,
};

const labAvailable = [
  { type: "recovery", title: "Recovery Vitals", category: "vitals" },
  { type: "sleep", title: "Sleep Analysis", category: "analysis" },
  { type: "hrv", title: "HRV Trend", category: "analysis" },
];

const labDefaults = [
  { i: "recovery-1", x: 0, y: 0, w: 6, h: 4, minW: 3, maxW: 12, minH: 2 },
  { i: "hrv-1", x: 6, y: 0, w: 6, h: 4, minW: 3, maxW: 12, minH: 2 },
  { i: "sleep-1", x: 0, y: 4, w: 12, h: 4, minW: 3, maxW: 12, minH: 2 },
];

const labDefaultWidgets = [
  { id: "recovery-1", type: "recovery", title: "Recovery Vitals" },
  { id: "hrv-1", type: "hrv", title: "HRV Trend" },
  { id: "sleep-1", type: "sleep", title: "Sleep Analysis" },
];


// -- FOCUS MODE CONFIG --
const focusComponents: Record<string, React.FC<{ compact?: boolean }>> = {
  readiness: ExecutiveSummaryWidget,
  sleep_bank: SleepBankWidget,
  strain: StrainCapacityWidget
};

const focusAvailable = [
  { type: "readiness", title: "Readiness Summary", category: "executive" },
  { type: "sleep_bank", title: "Sleep Bank", category: "executive" },
  { type: "strain", title: "Strain Capacity", category: "executive" },
];

const focusDefaults = [
  { i: "readiness-1", x: 0, y: 0, w: 12, h: 4, minW: 4, maxW: 12, minH: 2 },
  { i: "sleep_bank-1", x: 0, y: 4, w: 6, h: 2, minW: 3, maxW: 12, minH: 2 },
  { i: "strain-1", x: 6, y: 4, w: 6, h: 2, minW: 3, maxW: 12, minH: 2 },
];

const focusDefaultWidgets = [
  { id: "readiness-1", type: "readiness", title: "Readiness Summary" },
  { id: "sleep_bank-1", type: "sleep_bank", title: "Sleep Bank" },
  { id: "strain-1", type: "strain", title: "Strain Capacity" },
];

export default function Dashboard() {
  const { isFocusMode } = useLens();

  // We render BOTH canvases but simulate "page switching" by conditionally showing one.
  // Ideally, we might want to unmount the hidden one to save resources, OR keep it hidden to preserve state.
  // Given the request for persistence, unmounting is fine because `WidgetCanvas` saves to LocalStorage.
  // However, for smooth switching, mounting/unmounting might cause a flash. 
  // Let's rely on the conditional return for now as it's cleaner.

  if (isFocusMode) {
    return (
      <div className="min-h-screen pt-8 px-6 pb-20 cockpit-canvas flex flex-col items-center">
        <WidgetCanvas
          pageId="dashboard-focus" // DISTINCT ID for persistence
          locked={true}
          availableWidgets={focusAvailable}
          widgetComponents={focusComponents}
          defaultLayouts={focusDefaults}
          defaultWidgets={focusDefaultWidgets}
        >
          <PageHeader
            title="READY TO PERFORM"
            subtitle="EXECUTIVE SUMMARY"
            description="Focus Mode Active."
            icon={Eye}
            className="w-full"
          />
        </WidgetCanvas>
      </div>
    );
  }

  // -- LAB MODE VIEW (Data Scientist) --
  return (
    <div className="min-h-screen pt-8 px-6 pb-20 cockpit-canvas flex flex-col items-center">
      <WidgetCanvas
        pageId="dashboard-lab" // DISTINCT ID for persistence
        availableWidgets={labAvailable}
        widgetComponents={labComponents}
        defaultLayouts={labDefaults}
        defaultWidgets={labDefaultWidgets}
      >
        <PageHeader
          title="COCKPIT"
          subtitle="BIOMETRIC OVERVIEW"
          description="Live telemetry from biological and digital sensors."
          icon={Gauge}
          className="w-full"
        />
      </WidgetCanvas>
    </div>
  );
}
