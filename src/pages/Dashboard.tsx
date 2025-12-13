import { useState, useEffect, useRef, ComponentType } from "react";
import RGL from "react-grid-layout";
import { Plus, GripVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReadinessArc } from "@/components/cockpit/ReadinessArc";
import { CircadianClock } from "@/components/cockpit/CircadianClock";
import { TReadyScore } from "@/components/cockpit/TReadyScore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import "react-grid-layout/css/styles.css";

// Cast to any to avoid type issues with react-grid-layout
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
};

const availableWidgets = [
  { type: "readiness", title: "Readiness Index" },
  { type: "circadian", title: "Circadian Rhythm" },
  { type: "voltage", title: "System Voltage" },
];

const defaultLayouts: LayoutItem[] = [
  { i: "readiness-1", x: 0, y: 0, w: 1, h: 2, minW: 1, maxW: 3, minH: 2, maxH: 4 },
  { i: "circadian-1", x: 1, y: 0, w: 1, h: 2, minW: 1, maxW: 3, minH: 2, maxH: 4 },
  { i: "voltage-1", x: 2, y: 0, w: 1, h: 2, minW: 1, maxW: 3, minH: 2, maxH: 4 },
];

const defaultWidgets: WidgetConfig[] = [
  { id: "readiness-1", type: "readiness", title: "Readiness Index" },
  { id: "circadian-1", type: "circadian", title: "Circadian Rhythm" },
  { id: "voltage-1", type: "voltage", title: "System Voltage" },
];

const STORAGE_KEY_LAYOUTS = "cockpit-layouts";
const STORAGE_KEY_WIDGETS = "cockpit-widgets";

export default function Dashboard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  
  const [layouts, setLayouts] = useState<LayoutItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LAYOUTS);
    return saved ? JSON.parse(saved) : defaultLayouts;
  });
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_WIDGETS);
    return saved ? JSON.parse(saved) : defaultWidgets;
  });

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

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LAYOUTS, JSON.stringify(layouts));
  }, [layouts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_WIDGETS, JSON.stringify(widgets));
  }, [widgets]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const handleLayoutChange = (newLayout: LayoutItem[]) => {
    // Preserve min/max constraints when layout changes
    const updatedLayout = newLayout.map((item) => {
      const existing = layouts.find((l) => l.i === item.i);
      return {
        ...item,
        minW: existing?.minW ?? 1,
        maxW: existing?.maxW ?? 3,
        minH: existing?.minH ?? 2,
        maxH: existing?.maxH ?? 4,
      };
    });
    setLayouts(updatedLayout);
  };

  const addWidget = (type: string, title: string) => {
    const newId = `${type}-${Date.now()}`;
    const newWidget: WidgetConfig = { id: newId, type, title };
    
    const maxY = layouts.reduce((max, l) => Math.max(max, l.y + l.h), 0);
    const newLayout: LayoutItem = { i: newId, x: 0, y: maxY, w: 1, h: 2, minW: 1, maxW: 3, minH: 2, maxH: 4 };
    
    setWidgets([...widgets, newWidget]);
    setLayouts([...layouts, newLayout]);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter((w) => w.id !== id));
    setLayouts(layouts.filter((l) => l.i !== id));
  };

  return (
    <div className="min-h-screen p-6" ref={containerRef}>
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="btn-press gap-2">
              <Plus className="h-4 w-4" />
              Add Widget
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {availableWidgets.map((widget) => (
              <DropdownMenuItem
                key={widget.type}
                onClick={() => addWidget(widget.type, widget.title)}
                className="font-mono text-xs"
              >
                {widget.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Grid Dashboard */}
      {(ReactGridLayout as any) && (
        <ReactGridLayout
          className="layout"
          layout={layouts}
          cols={3}
          rowHeight={180}
          width={containerWidth - 48}
          onLayoutChange={(newLayout: LayoutItem[]) => handleLayoutChange(newLayout)}
          draggableHandle=".drag-handle"
          margin={[16, 16]}
          containerPadding={[0, 0]}
          isResizable={true}
          resizeHandles={["se"]}
        >
        {widgets.map((widget) => {
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
      {widgets.length === 0 && (
        <div className="card-surface p-12 text-center">
          <p className="text-muted-foreground mb-4">No widgets added yet</p>
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
