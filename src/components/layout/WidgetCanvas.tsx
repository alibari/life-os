import { useState, useEffect, useRef, ComponentType } from "react";
import RGL from "react-grid-layout";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserSettings, LayoutItem, WidgetConfig } from "@/hooks/useUserSettings";
import { WidgetFrame } from "./WidgetFrame";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import "react-grid-layout/css/styles.css";

const ReactGridLayout = RGL as ComponentType<any>;

interface WidgetCanvasProps {
    pageId: string;
    availableWidgets: { type: string; title: string; category?: string }[];
    widgetComponents: Record<string, React.FC<{ compact?: boolean }>>;
    defaultLayouts?: LayoutItem[];
    defaultWidgets?: WidgetConfig[];
    children?: React.ReactNode; // Extra header content
}

export function WidgetCanvas({
    pageId,
    availableWidgets,
    widgetComponents,
    defaultLayouts = [],
    defaultWidgets = [],
    children
}: WidgetCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(1200);
    const { getPageSettings, updatePageSettings, loading } = useUserSettings();

    // Fetch data
    const { layouts, widgets } = getPageSettings(pageId, {
        layouts: defaultLayouts,
        widgets: defaultWidgets
    });

    // Measure container
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };

        // Initial and resize
        const observer = new ResizeObserver(updateWidth);
        if (containerRef.current) observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, []);

    const handleLayoutChange = (newLayout: LayoutItem[]) => {
        // Preserve constraints
        const updatedLayout = layouts.map((existing) => {
            const changed = newLayout.find((l) => l.i === existing.i);
            if (changed) {
                return {
                    ...changed,
                    minW: existing.minW ?? 2,
                    maxW: 12, // 12 cols
                    minH: existing.minH ?? 1,
                    maxH: existing.maxH ?? 12,
                };
            }
            return existing;
        });

        // Check for newly added items that might need sync
        const finalLayout = newLayout.map(l => {
            const existing = updatedLayout.find(e => e.i === l.i);
            return existing || l;
        });

        updatePageSettings(pageId, finalLayout, widgets);
    };

    const addWidget = (type: string, title: string) => {
        const newId = `${type}-${Date.now()}`;
        const newWidget: WidgetConfig = { id: newId, type, title };

        // Calculation position (bottom)
        const maxY = layouts.reduce((max, l) => Math.max(max, l.y + l.h), 0);

        const size = { w: 4, h: 4, minW: 2, minH: 2 };

        const newLayout: LayoutItem = {
            i: newId,
            x: 0,
            y: maxY,
            w: size.w,
            h: size.h,
            minW: size.minW,
            maxW: 12,
            minH: size.minH,
            maxH: 12
        };

        updatePageSettings(pageId, [...layouts, newLayout], [...widgets, newWidget]);
    };

    const removeWidget = (id: string) => {
        const newWidgets = widgets.filter((w) => w.id !== id);
        const newLayouts = layouts.filter((l) => l.i !== id);
        updatePageSettings(pageId, newLayouts, newWidgets);
    };

    const toggleFullWidth = (id: string) => {
        const layout = layouts.find(l => l.i === id);
        if (!layout) return;

        const isFull = layout.w === 12;
        const newLayouts = layouts.map(l => {
            if (l.i === id) {
                return { ...l, w: isFull ? 4 : 12, x: 0 }; // Reset to 4 or Expand to 12
            }
            return l;
        });
        updatePageSettings(pageId, newLayouts, widgets);
    };

    const getWidgetDimensions = (id: string) => {
        const l = layouts.find(i => i.i === id);
        return {
            w: l?.w || 4,
            h: l?.h || 4,
            isCompact: (l?.w || 4) < 4 || (l?.h || 4) < 4
        };
    };

    if (loading && layouts.length === 0) {
        return <div className="p-12 text-center text-muted-foreground animate-pulse">Loading cockpit...</div>;
    }

    return (
        <div className="w-full" ref={containerRef}>
            {/* Header Area with Children (PageHeader) and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0">
                <div className="flex-1 min-w-0">
                    {children}
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="btn-press gap-2 border-primary/30 hover:border-primary/60 h-8">
                                <Plus className="h-3.5 w-3.5 text-primary" />
                                <span className="text-xs font-mono">Add Widget</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto border-border bg-card/95 backdrop-blur-xl z-50">
                            {availableWidgets.map((widget) => (
                                <DropdownMenuItem
                                    key={widget.type + widget.title}
                                    onClick={() => addWidget(widget.type, widget.title)}
                                    className="font-mono text-xs cursor-pointer"
                                >
                                    {widget.title}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {widgets.length === 0 ? (
                <div className="card-surface p-12 text-center border-dashed border-2 border-border/50">
                    <p className="text-muted-foreground mb-4">Canvas Empty</p>
                    <Button variant="ghost" onClick={() => addWidget(availableWidgets[0]?.type || "text", availableWidgets[0]?.title || "Widget")}>
                        Start Building
                    </Button>
                </div>
            ) : (
                <ReactGridLayout
                    className="layout"
                    layout={layouts}
                    cols={12}
                    rowHeight={80} // Reduced height density for finer control
                    width={containerWidth}
                    onLayoutChange={handleLayoutChange}
                    draggableHandle=".drag-handle"
                    margin={[16, 16]}
                    isResizable={true}
                    isDraggable={true}
                    resizeHandles={['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne']}
                >
                    {widgets.map(w => {
                        const Component = widgetComponents[w.type] || (() => <div>Unknown Widget</div>);
                        const dims = getWidgetDimensions(w.id);
                        const layout = layouts.find(l => l.i === w.id);

                        return (
                            <div key={w.id}>
                                <WidgetFrame
                                    id={w.id}
                                    title={w.title}
                                    onRemove={removeWidget}
                                    isCompact={dims.isCompact}
                                    isFullWidth={layout?.w === 12}
                                    onToggleFullWidth={toggleFullWidth}
                                >
                                    <Component compact={dims.isCompact} />
                                </WidgetFrame>
                            </div>
                        );
                    })}
                </ReactGridLayout>
            )}
        </div>
    );
}
