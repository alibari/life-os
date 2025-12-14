import { useState, useEffect, useRef, ComponentType } from "react";
import RGL from "react-grid-layout";
import { Plus, GripVertical, X, LogOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useAuth } from "@/hooks/useAuth";
import { useUserSettings } from "@/hooks/useUserSettings";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import "react-grid-layout/css/styles.css";

const ReactGridLayout = RGL as ComponentType<any>;

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
}

interface WidgetConfig {
  id: string;
  type: string;
  title: string;
}

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

// Widget categories for tabs
const widgetCategories: Record<string, string[]> = {
  all: Object.keys(widgetComponents),
  readiness: ["readiness", "circadian", "voltage", "stateswitch"],
  neuro: ["dopamine", "pfc", "adenosine", "brain"],
  health: ["nutrition", "biohack"],
  analytics: ["graph", "yeartracker", "aisummary"],
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

export default function Dashboard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [activeTab, setActiveTab] = useState("all");
  
  const { user, signOut } = useAuth();
  const { layouts, widgets, loading, updateLayouts, updateWidgets, setLayouts, setWidgets } = useUserSettings();

  // Measure container width
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const handleLayoutChange = (newLayout: LayoutItem[]) => {
    // Merge changes with existing layouts
    const updatedLayout = layouts.map((existing) => {
      const changed = newLayout.find((l) => l.i === existing.i);
      if (changed) {
        return {
          ...changed,
          minW: existing.minW ?? 1,
          maxW: existing.maxW ?? 6,
          minH: existing.minH ?? 1,
          maxH: existing.maxH ?? 8,
        };
      }
      return existing;
    });
    updateLayouts(updatedLayout);
  };

  const addWidget = (type: string, title: string) => {
    const newId = `${type}-${Date.now()}`;
    const newWidget: WidgetConfig = { id: newId, type, title };
    
    const maxY = layouts.reduce((max, l) => Math.max(max, l.y + l.h), 0);
    
    const widgetSizes: Record<string, { w: number; h: number; minW: number; minH: number }> = {
      yeartracker: { w: 6, h: 3, minW: 3, minH: 2 },
      graph: { w: 4, h: 3, minW: 2, minH: 2 },
      biohack: { w: 2, h: 3, minW: 1, minH: 2 },
      aisummary: { w: 2, h: 3, minW: 1, minH: 2 },
    };
    
    const size = widgetSizes[type] || { w: 2, h: 2, minW: 1, minH: 1 };
    
    const newLayout: LayoutItem = { 
      i: newId, 
      x: 0, 
      y: maxY, 
      w: size.w, 
      h: size.h, 
      minW: size.minW, 
      maxW: 6, 
      minH: size.minH, 
      maxH: 8 
    };
    
    const newWidgets = [...widgets, newWidget];
    const newLayouts = [...layouts, newLayout];
    
    setWidgets(newWidgets);
    setLayouts(newLayouts);
    updateWidgets(newWidgets);
    updateLayouts(newLayouts);
  };

  const removeWidget = (id: string) => {
    const newWidgets = widgets.filter((w) => w.id !== id);
    const newLayouts = layouts.filter((l) => l.i !== id);
    
    setWidgets(newWidgets);
    setLayouts(newLayouts);
    updateWidgets(newWidgets);
    updateLayouts(newLayouts);
  };

  // Filter widgets by active tab (for display only)
  const filteredWidgets = widgets.filter((widget) => {
    if (activeTab === "all") return true;
    return widgetCategories[activeTab]?.includes(widget.type);
  });

  const filteredLayouts = layouts.filter((layout) => {
    const widget = widgets.find((w) => w.id === layout.i);
    if (!widget) return false;
    if (activeTab === "all") return true;
    return widgetCategories[activeTab]?.includes(widget.type);
  });

  // Get widget dimensions for responsive content
  const getWidgetDimensions = (widgetId: string) => {
    const layout = layouts.find((l) => l.i === widgetId);
    return {
      w: layout?.w ?? 2,
      h: layout?.h ?? 2,
      isCompact: (layout?.w ?? 2) <= 2 && (layout?.h ?? 2) <= 2,
      isWide: (layout?.w ?? 2) >= 4,
      isTall: (layout?.h ?? 2) >= 3,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center cockpit-canvas">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Loading your cockpit...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 cockpit-canvas" ref={containerRef}>
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="font-mono text-xs text-muted-foreground tracking-wider">
            {today.toUpperCase()}
          </p>
          <h1 className="font-mono text-2xl font-bold text-foreground mt-1">
            COCKPIT
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="btn-press gap-2 border-primary/30 hover:border-primary/60">
                <Plus className="h-4 w-4 text-primary" />
                <span className="hidden sm:inline">Add Widget</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-border bg-card/95 backdrop-blur-xl">
              {availableWidgets.map((widget) => (
                <DropdownMenuItem
                  key={widget.type}
                  onClick={() => addWidget(widget.type, widget.title)}
                  className="font-mono text-xs cursor-pointer"
                >
                  {widget.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card/50 backdrop-blur-sm border border-border/50 p-1 gap-1">
            <TabsTrigger 
              value="all" 
              className="font-mono text-xs px-4 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="readiness" 
              className="font-mono text-xs px-4 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md"
            >
              Readiness
            </TabsTrigger>
            <TabsTrigger 
              value="neuro" 
              className="font-mono text-xs px-4 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md"
            >
              Neuro
            </TabsTrigger>
            <TabsTrigger 
              value="health" 
              className="font-mono text-xs px-4 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md"
            >
              Health
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="font-mono text-xs px-4 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md"
            >
              Analytics
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Grid Dashboard */}
      {filteredWidgets.length > 0 && (
        <ReactGridLayout
          className="layout"
          layout={filteredLayouts}
          cols={6}
          rowHeight={140}
          width={containerWidth - 48}
          onLayoutChange={handleLayoutChange}
          draggableHandle=".drag-handle"
          margin={[16, 16]}
          containerPadding={[0, 0]}
          isResizable={true}
          isDraggable={true}
          resizeHandles={["s", "e", "se", "sw", "n", "w", "nw", "ne"]}
        >
          {filteredWidgets.map((widget) => {
            const WidgetComponent = widgetComponents[widget.type];
            const dims = getWidgetDimensions(widget.id);
            return (
              <div key={widget.id} className="relative group">
                {/* Enhanced Widget Controls */}
                <div className="absolute top-2 right-2 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <button
                    className="drag-handle p-1.5 rounded-md bg-background/90 backdrop-blur-sm border border-border/80 hover:border-primary/50 hover:bg-primary/10 cursor-grab active:cursor-grabbing transition-all shadow-sm"
                    title="Drag to move"
                  >
                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
                  </button>
                  <button
                    onClick={() => removeWidget(widget.id)}
                    className="p-1.5 rounded-md bg-background/90 backdrop-blur-sm border border-border/80 hover:bg-destructive/20 hover:border-destructive/50 transition-all shadow-sm"
                    title="Remove widget"
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>

                {/* Resize Hint */}
                <div className="absolute bottom-2 right-2 z-10 opacity-0 group-hover:opacity-50 transition-opacity pointer-events-none">
                  <Maximize2 className="h-3 w-3 text-primary rotate-90" />
                </div>

                {/* Widget Content */}
                <div className="h-full overflow-hidden">
                  <WidgetComponent compact={dims.isCompact} />
                </div>
              </div>
            );
          })}
        </ReactGridLayout>
      )}

      {/* Empty State */}
      {filteredWidgets.length === 0 && (
        <div className="card-surface p-12 text-center">
          <p className="text-muted-foreground mb-4">
            {activeTab === "all" 
              ? "No widgets added yet" 
              : `No ${activeTab} widgets added yet`}
          </p>
          <Button
            variant="outline"
            onClick={() => addWidget("readiness", "Readiness Index")}
            className="btn-press"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add your first widget
          </Button>
        </div>
      )}
    </div>
  );
}
