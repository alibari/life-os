import { ReactNode } from "react";
import { GripVertical, X, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface WidgetWrapperProps {
  children: ReactNode;
  title?: string;
  onRemove?: () => void;
  showControls?: boolean;
  className?: string;
  isEditing?: boolean;
}

export function WidgetWrapper({
  children,
  title,
  onRemove,
  showControls = true,
  className,
  isEditing = true,
}: WidgetWrapperProps) {
  return (
    <div className={cn("relative group h-full", className)}>
      {/* Widget Controls - Enhanced */}
      {showControls && isEditing && (
        <div className="absolute top-2 right-2 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button
            className="drag-handle p-1.5 rounded-md bg-background/90 backdrop-blur-sm border border-border/80 hover:border-primary/50 hover:bg-primary/10 cursor-grab active:cursor-grabbing transition-all"
            title="Drag to move"
          >
            <GripVertical className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
          </button>
          {onRemove && (
            <button
              onClick={onRemove}
              className="p-1.5 rounded-md bg-background/90 backdrop-blur-sm border border-border/80 hover:bg-destructive/20 hover:border-destructive/50 transition-all"
              title="Remove widget"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
            </button>
          )}
        </div>
      )}

      {/* Resize Indicator */}
      {showControls && isEditing && (
        <div className="absolute bottom-2 right-2 z-10 opacity-0 group-hover:opacity-60 transition-opacity pointer-events-none">
          <Maximize2 className="h-3 w-3 text-primary rotate-90" />
        </div>
      )}

      {/* Widget Content */}
      <div className="h-full overflow-hidden">
        {children}
      </div>
    </div>
  );
}
