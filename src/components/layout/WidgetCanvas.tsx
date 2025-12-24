import { useState, useEffect, useRef, ComponentType } from "react";
import { cn } from "@/lib/utils";
import RGL from "react-grid-layout";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserSettings, LayoutItem, WidgetConfig } from "@/hooks/useUserSettings";
import { WidgetFrame } from "./WidgetFrame";
import { motion, AnimatePresence } from "framer-motion";
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
    locked?: boolean;
    children?: React.ReactNode;
}

export function WidgetCanvas({
    pageId,
    availableWidgets,
    widgetComponents,
    defaultLayouts = [],
    defaultWidgets = [],
    children,
    locked = false
}: WidgetCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
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
                const width = containerRef.current.offsetWidth;
                if (width > 0) setContainerWidth(width);
            }
        };

        // Initial measurement
        updateWidth();

        const observer = new ResizeObserver(updateWidth);
        if (containerRef.current) observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, []);

    const handleLayoutChange = (newLayout: LayoutItem[]) => {
        // If locked, do not save layout changes that might accidentally happen
        if (locked) return;

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
        if (locked) return;
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
        if (locked) return;
        const newWidgets = widgets.filter((w) => w.id !== id);
        const newLayouts = layouts.filter((l) => l.i !== id);
        updatePageSettings(pageId, newLayouts, newWidgets);
    };

    const toggleFullWidth = (id: string) => {
        if (locked) return;
        const layout = layouts.find(l => l.id === id || l.i === id);
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
        return (
            <div className="w-full min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                <div className="font-mono text-[10px] tracking-widest text-primary/50 uppercase">
                    Syncing...
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full" ref={containerRef}>
            <AnimatePresence mode="wait">
                {containerWidth > 0 && !loading && (
                    <motion.div
                        key={pageId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35, ease: "linear" }}
                        className="w-full"
                    >
                        {/* Header Area with Children (PageHeader) and Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0">
                            <div className="flex-1 min-w-0">
                                {children}
                            </div>

                            {!locked && (
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
                            )}
                        </div>

                        {widgets.length === 0 ? (
                            <div className="card-surface p-12 text-center border-dashed border-2 border-border/50">
                                <p className="text-muted-foreground mb-4">Canvas Empty</p>
                                {!locked && (
                                    <Button variant="ghost" onClick={() => addWidget(availableWidgets[0]?.type || "text", availableWidgets[0]?.title || "Widget")}>
                                        Start Building
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <ReactGridLayout
                                className="layout"
                                layout={layouts.map(l => ({ ...l, static: locked }))}
                                cols={12}
                                rowHeight={80}
                                width={containerWidth}
                                onLayoutChange={handleLayoutChange}
                                draggableHandle={locked ? undefined : ".drag-handle"}
                                margin={[16, 16]}
                                isResizable={!locked}
                                isDraggable={!locked}
                                resizeHandles={['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne']}
                                // Crucial: Disable initial animation to prevent "moving"
                                useCSSTransforms={containerWidth > 0}
                            >
                                {widgets.map(w => {
                                    const Component = widgetComponents[w.type] || (() => <div className="p-4">Unknown Widget: {w.type}</div>);
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
                                                locked={locked}
                                            >
                                                <Component compact={dims.isCompact} />
                                            </WidgetFrame>
                                        </div>
                                    );
                                })}
                            </ReactGridLayout>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
