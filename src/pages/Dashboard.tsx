import { useState, useEffect, useRef, ComponentType } from "react";
import RGL from "react-grid-layout";
import { Plus, GripVertical, X, LogOut } from "lucide-react";
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

const widgetComponents: Record<string, React.FC> = {
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
    const updatedLayout = newLayout.map((item) => {
      const existing = layouts.find((l) => l.i === item.i);
      return {
        ...item,
        minW: existing?.minW ?? 1,
        maxW: existing?.maxW ?? 6,
        minH: existing?.minH ?? 2,
        maxH: existing?.maxH ?? 6,
      };
    });
    updateLayouts(updatedLayout);
  };

  const addWidget = (type: string, title: string) => {
    const newId = `${type}-${Date.now()}`;
    const newWidget: WidgetConfig = { id: newId, type, title };
    
    const maxY = layouts.reduce((max, l) => Math.max(max, l.y + l.h), 0);
    
    const widgetSizes: Record<string, { w: number; h: number; minW: number }> = {
      yeartracker: { w: 6, h: 3, minW: 4 },
      graph: { w: 4, h: 3, minW: 2 },
      biohack: { w: 2, h: 3, minW: 2 },
      aisummary: { w: 2, h: 3, minW: 2 },
    };
    
    const size = widgetSizes[type] || { w: 2, h: 2, minW: 1 };
    
    const newLayout: LayoutItem = { 
      i: newId, 
      x: 0, 
      y: maxY, 
      w: size.w, 
      h: size.h, 
      minW: size.minW, 
      maxW: 6, 
      minH: 2, 
      maxH: 6 
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

  // Filter widgets by active tab
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
                <span>Add Widget</span>
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
          <TabsList className="bg-card/50 backdrop-blur-sm border border-border/50 p-1">
            <TabsTrigger 
              value="all" 
              className="font-mono text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="readiness" 
              className="font-mono text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              Readiness
            </TabsTrigger>
            <TabsTrigger 
              value="neuro" 
              className="font-mono text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              Neuro
            </TabsTrigger>
            <TabsTrigger 
              value="health" 
              className="font-mono text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              Health
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="font-mono text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
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
          rowHeight={160}
          width={containerWidth - 48}
          onLayoutChange={(newLayout: LayoutItem[]) => {
            if (activeTab === "all") {
              handleLayoutChange(newLayout);
            }
          }}
          draggableHandle=".drag-handle"
          margin={[12, 12]}
          containerPadding={[0, 0]}
          isResizable={activeTab === "all"}
          isDraggable={activeTab === "all"}
          resizeHandles={["s", "e", "se"]}
        >
          {filteredWidgets.map((widget) => {
            const WidgetComponent = widgetComponents[widget.type];
            return (
              <div key={widget.id} className="relative group">
                {/* Drag Handle & Controls */}
                <div className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="drag-handle p-1.5 rounded bg-card/80 backdrop-blur-sm border border-border hover:bg-muted cursor-grab active:cursor-grabbing"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => removeWidget(widget.id)}
                    className="p-1.5 rounded bg-card/80 backdrop-blur-sm border border-border hover:bg-destructive/20 hover:border-destructive/50"
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>

                {/* Widget Content */}
                <div className="h-full overflow-hidden">
                  <WidgetComponent />
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
