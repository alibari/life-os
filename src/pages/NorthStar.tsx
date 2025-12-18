import { WidgetCanvas } from "@/components/layout/WidgetCanvas";
import { NorthStarVision } from "@/components/northstar/NorthStarVision";
import { NorthStarPillars } from "@/components/northstar/NorthStarPillars";
import { NorthStarObjectives } from "@/components/northstar/NorthStarObjectives";
import { NorthStarAlignment } from "@/components/northstar/NorthStarAlignment";
import { PageHeader } from "@/components/layout/PageHeader";
import { Star } from "lucide-react";

// Configuration
const widgetComponents: Record<string, React.FC<{ compact?: boolean }>> = {
  vision: NorthStarVision,
  pillars: NorthStarPillars,
  objectives: NorthStarObjectives,
  alignment: NorthStarAlignment,
};

const availableWidgets = [
  { type: "vision", title: "10-Year Vision", category: "strategy" },
  { type: "pillars", title: "Life Pillars", category: "strategy" },
  { type: "objectives", title: "Quarterly Objectives", category: "execution" },
  { type: "alignment", title: "Daily Alignment", category: "execution" },
];

const defaultLayouts = [
  { i: "vision-1", x: 0, y: 0, w: 6, h: 2, minW: 3, maxW: 6, minH: 2 },
  { i: "pillars-1", x: 0, y: 2, w: 4, h: 3, minW: 2, maxW: 6, minH: 2 },
  { i: "alignment-1", x: 4, y: 2, w: 2, h: 3, minW: 2, maxW: 4, minH: 2 },
  { i: "objectives-1", x: 0, y: 5, w: 6, h: 3, minW: 3, maxW: 6, minH: 2 },
];

const defaultWidgets = [
  { id: "vision-1", type: "vision", title: "10-Year Vision" },
  { id: "pillars-1", type: "pillars", title: "Life Pillars" },
  { id: "alignment-1", type: "alignment", title: "Daily Alignment" },
  { id: "objectives-1", type: "objectives", title: "Quarterly Objectives" },
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
