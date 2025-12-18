import { useRef, useState } from "react";
import { GripVertical, X, Maximize2, Minimize2, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface WidgetFrameProps {
    children: React.ReactNode;
    id: string;
    title: string;
    onRemove: (id: string) => void;
    isCompact?: boolean;
    className?: string;
    // Passed by react-grid-layout
    style?: React.CSSProperties;
    className_rgl?: string;
    onMouseDown?: React.MouseEventHandler;
    onMouseUp?: React.MouseEventHandler;
    onTouchEnd?: React.TouchEventHandler;

    // Custom props
    isFullWidth?: boolean;
    onToggleFullWidth?: (id: string) => void;
}

export function WidgetFrame({
    children,
    id,
    title,
    onRemove,
    isCompact,
    className,
    style,
    className_rgl,
    onMouseDown,
    onMouseUp,
    onTouchEnd,
    isFullWidth,
    onToggleFullWidth,
    ...props
}: WidgetFrameProps) {
    return (
        <div
            id={id}
            className={cn(
                "group h-full w-full bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/20 hover:bg-card/80 transition-colors duration-200",
                className_rgl,
                className
            )}
            style={{ ...style, containerType: "size" }}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onTouchEnd={onTouchEnd}
            {...props}
        >
            {/* Header Controls (Visible on Hover) */}
            <div className="absolute top-0 inset-x-0 h-10 z-20 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-b from-black/5 to-transparent">
                {/* Drag Handle */}
                <div className="drag-handle p-1.5 rounded-md cursor-grab active:cursor-grabbing hover:bg-primary/10 transition-colors">
                    <GripVertical className="h-4 w-4 text-muted-foreground/50 hover:text-primary" />
                </div>

                <div className="flex items-center gap-1">
                    {/* Full Width Toggle */}
                    {onToggleFullWidth && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-md hover:bg-primary/10 hover:text-primary text-muted-foreground/50"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent drag
                                onToggleFullWidth(id);
                            }}
                            title={isFullWidth ? "Collapse" : "Full Width"}
                        >
                            {isFullWidth ? <Minimize2 className="h-3.5 w-3.5" /> : <ArrowLeftRight className="h-3.5 w-3.5" />}
                        </Button>
                    )}

                    {/* Remove Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground/50"
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent drag
                            onRemove(id);
                        }}
                    >
                        <X className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>

            {/* Widget Content */}
            <div className={cn("h-full w-full p-4 overflow-hidden flex flex-col", isCompact ? "p-2" : "p-4")}>
                {!isCompact && (
                    <h3 className="text-xs font-mono font-medium text-muted-foreground mb-2 select-none pointer-events-none truncate uppercase tracking-wider opacity-60">
                        {title}
                    </h3>
                )}
                <div className="flex-1 min-h-0 relative">
                    {children}
                </div>
            </div>

            {/* Corner Resize Hints (Decorative) */}
            <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-primary/20 rounded-br-sm opacity-0 group-hover:opacity-100 pointer-events-none" />
        </div>
    );
}
