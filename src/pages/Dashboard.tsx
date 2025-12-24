import { useState, useRef, useEffect } from "react";
import { WidgetCanvas } from "@/components/layout/WidgetCanvas";
import { PageHeader } from "@/components/layout/PageHeader";
import { Activity, Battery, Zap, Brain, Moon, Footprints, Flame, Timer, AlertTriangle, Gauge, Eye } from "lucide-react";
import { useLens } from "@/context/LensContext";
import { cn } from "@/lib/utils";
import { LabRecoveryVitals } from "@/components/lab/LabRecoveryVitals";
import { LabSleepAnalysis, LabHRVTrend } from "@/components/lab/LabAnalysis";
import { ExecutiveSummaryWidget, SleepBankWidget, StrainCapacityWidget } from "@/components/dashboard/ExecutiveSummaryWidget";
import { habitService } from "@/services/habitService";
import { useAuth } from "@/hooks/useAuth";

// -- LAB MODE CONFIG --
const labComponents: Record<string, React.FC<{ compact?: boolean }>> = {
  sleep: LabSleepAnalysis,
  hrv: LabHRVTrend,
};

const labAvailable = [
  { type: "sleep", title: "Sleep Analysis", category: "analysis" },
  { type: "hrv", title: "HRV Trend", category: "analysis" },
];

const labDefaults: any[] = [];
const labDefaultWidgets: any[] = [];


// -- FOCUS MODE CONFIG --
const focusComponents: Record<string, React.FC<{ compact?: boolean }>> = {
  readiness: ExecutiveSummaryWidget,
  sleep_bank: SleepBankWidget,
  strain: StrainCapacityWidget,
};

const focusAvailable = [
  { type: "readiness", title: "Readiness Summary", category: "executive" },
  { type: "sleep_bank", title: "Sleep Bank", category: "executive" },
  { type: "strain", title: "Strain Capacity", category: "executive" },
];

const focusDefaults: any[] = [];
const focusDefaultWidgets: any[] = [];

export default function Dashboard() {
  const { isFocusMode } = useLens();
  const { user } = useAuth();



  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "GOOD MORNING";
    if (hour < 18) return "GOOD AFTERNOON";
    return "GOOD EVENING";
  };

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || (user?.email?.startsWith('ceo') ? 'ALI' : 'OPERATOR');
  const greeting = `${getTimeGreeting()}, ${userName.toUpperCase()}`;

  if (isFocusMode) {
    return (
      <div className="min-h-screen pt-8 px-6 pb-20 cockpit-canvas flex flex-col items-center">
        <WidgetCanvas
          pageId="dashboard-focus-v2" // DISTINCT ID for persistence - Reset for v1.0.7
          locked={true}
          availableWidgets={focusAvailable}
          widgetComponents={focusComponents}
          defaultLayouts={focusDefaults}
          defaultWidgets={focusDefaultWidgets}
        >
          <PageHeader
            title={greeting}
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
    <div className="min-h-screen pt-8 px-6 pb-20 lab-canvas flex flex-col items-center">
      <WidgetCanvas
        pageId="dashboard-lab-v2" // Reset for v1.0.7
        locked={true}
        availableWidgets={labAvailable}
        widgetComponents={labComponents}
        defaultLayouts={labDefaults}
        defaultWidgets={labDefaultWidgets}
      >
        <PageHeader
          title={greeting} // Unifying greeting for consistency
          subtitle="BIOMETRIC OVERVIEW"
          description="Lab Mode Active."
          icon={Activity}
          className="w-full"
        />
      </WidgetCanvas>
    </div>
  );
}
