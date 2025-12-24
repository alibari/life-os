import { WidgetCanvas } from "@/components/layout/WidgetCanvas";
import { HabitListWidget } from "@/components/cockpit/HabitListWidget";
import { PageHeader } from "@/components/layout/PageHeader";
import { Star } from "lucide-react";

// Configuration
const widgetComponents: Record<string, React.FC<{ compact?: boolean }>> = {
  habits: HabitListWidget,
};

const availableWidgets: any[] = [
  { type: "habits", title: "Protocol / Habits", category: "tracking" },
];

const defaultLayouts = [
  { i: "habits-1", x: 6, y: 0, w: 6, h: 8, minW: 3, maxW: 12, minH: 4 },
];

const defaultWidgets = [
  { id: "habits-1", type: "habits", title: "Protocol / Habits" },
];

export default function NorthStar() {
  return (
    <div className="min-h-screen pt-8 px-6 pb-20 cockpit-canvas flex flex-col items-center">
      <WidgetCanvas
        pageId="northstar"
        availableWidgets={availableWidgets}
        widgetComponents={widgetComponents}
        defaultLayouts={defaultLayouts}
        defaultWidgets={defaultWidgets}
      >
        <PageHeader
          title="NORTH STAR"
          subtitle="10-YEAR VISION"
          icon={Star}
          className="w-full"
        />
      </WidgetCanvas>
    </div>
  );
}
