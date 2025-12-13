import { useLocation, useNavigate } from "react-router-dom";
import {
  Gauge,
  Swords,
  FlaskConical,
  Star,
  User,
  Brain,
  Eye,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TheBladeProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { icon: Gauge, label: "COCKPIT", path: "/dashboard", description: "Dashboard" },
  { icon: Swords, label: "WAR ROOM", path: "/war-room", description: "Deep Work" },
  { icon: FlaskConical, label: "THE LAB", path: "/lab", description: "Bio-Data" },
  { icon: Star, label: "NORTH STAR", path: "/north-star", description: "Goals" },
  { icon: User, label: "THE MIRROR", path: "/mirror", description: "Social/Aura" },
  { icon: Brain, label: "CORTEX", path: "/cortex", description: "Notes" },
  { icon: Eye, label: "THE ORACLE", path: "/oracle", description: "Analytics" },
  { icon: Settings, label: "VAULT", path: "/vault", description: "Settings" },
];

export function TheBlade({ collapsed, onToggle }: TheBladeProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 flex flex-col border-r border-border bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-border flex items-center justify-between h-14">
        {!collapsed && (
          <h1 className="font-mono text-sm tracking-wider">
            <span className="text-primary">LIFE</span>
            <span className="text-muted-foreground">_OS</span>
          </h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 btn-press"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          const button = (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all btn-press",
                "hover:bg-card",
                isActive && "bg-card border border-primary/30 glow-anabolic"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              {!collapsed && (
                <div className="text-left min-w-0">
                  <p
                    className={cn(
                      "font-mono text-xs tracking-wide truncate",
                      isActive ? "text-primary" : "text-foreground"
                    )}
                  >
                    {item.label}
                  </p>
                </div>
              )}
            </button>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.path} delayDuration={0}>
                <TooltipTrigger asChild>{button}</TooltipTrigger>
                <TooltipContent side="right" className="font-mono text-xs">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return button;
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-border">
          <p className="text-xs font-mono text-muted-foreground/50">
            v1.0.0 // ACTIVE
          </p>
        </div>
      )}
    </aside>
  );
}
