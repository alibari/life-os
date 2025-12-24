import { useRef, useState, useEffect } from "react";
import { Brain, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useUserSettings } from "@/hooks/useUserSettings";
import { WidgetCanvas } from "@/components/layout/WidgetCanvas";
import { FlowProvider, useFlow } from "@/context/FlowContext";

import { PageHeader } from "@/components/layout/PageHeader";

// Widgets
import { FlowTimerWidget } from "@/components/flow/widgets/FlowTimerWidget";
import { FlowProtocolWidget } from "@/components/flow/widgets/FlowProtocolWidget";
import { FlowHistoryWidget } from "@/components/flow/widgets/FlowHistoryWidget";

import { WeeklyStreak } from "@/components/flowstate/WeeklyStreak";
import { FocusGoals } from "@/components/flowstate/FocusGoals";
import { FlowAIInsights } from "@/components/flowstate/FlowAIInsights";
import { AppTracker } from "@/components/flowstate/AppTracker";

// Configuration
const widgetComponents: Record<string, React.FC<{ compact?: boolean }>> = {
  timer: FlowTimerWidget,
};

const availableWidgets = [
  { type: "timer", title: "Flow Timer", category: "core" },
];

const defaultLayouts = [
  // Center Stage: Timer
  { i: "timer-1", x: 2, y: 0, w: 8, h: 5, minW: 4, minH: 4 },
];

const defaultWidgets = [
  { id: "timer-1", type: "timer", title: "Flow Timer" },
];


function FlowStateContent() {
  const { sessions } = useFlow();

  const todaySessions = sessions.filter(
    (s) => new Date(s.startTime).toDateString() === new Date().toDateString()
  );
  const totalFocusToday = todaySessions.reduce((acc, s) => acc + s.focusMinutes, 0);
  const avgRPE = todaySessions.filter(s => s.rpe).length > 0
    ? todaySessions.filter(s => s.rpe).reduce((acc, s) => acc + (s.rpe || 0), 0) / todaySessions.filter(s => s.rpe).length
    : null;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="min-h-screen pt-8 px-6 pb-20 cockpit-canvas flex flex-col items-center">
      <WidgetCanvas
        pageId="flow-cortex"
        availableWidgets={availableWidgets}
        widgetComponents={widgetComponents}
        defaultLayouts={defaultLayouts}
        defaultWidgets={defaultWidgets}
      >
        <PageHeader
          title="FLOW STATE"
          subtitle={`${today.toUpperCase()} • 90-MIN PROTOCOL`}
          icon={Brain}
          className="w-full"
        >
          {/* Quick Stats moved to children/right side */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="font-mono text-[10px] text-muted-foreground">Sessions</p>
              <p className="font-mono text-sm font-bold text-foreground">{todaySessions.length}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[10px] text-muted-foreground">Focus Time</p>
              <p className="font-mono text-sm font-bold text-growth">
                {Math.floor(totalFocusToday / 60)}h {totalFocusToday % 60}m
              </p>
            </div>
            {avgRPE !== null && (
              <div className="text-right hidden md:block">
                <p className="font-mono text-[10px] text-muted-foreground">Avg RPE</p>
                <p className={cn(
                  "font-mono text-sm font-bold",
                  avgRPE <= 4 && "text-growth",
                  avgRPE > 4 && avgRPE <= 7 && "text-warning",
                  avgRPE > 7 && "text-destructive"
                )}>
                  {avgRPE.toFixed(1)}
                </p>
              </div>
            )}
          </div>
        </PageHeader>
      </WidgetCanvas>
    </div>
  );
}

export default function FlowState() {
  return (
    <FlowProvider>
      <FlowStateContent />
    </FlowProvider>
  );
}
