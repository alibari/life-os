import { useLocation, useNavigate } from "react-router-dom";
import {
  Gauge,
  Waves,
  FlaskConical,
  Star,
  User,
  Brain,
  Eye,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";

interface TheBladeProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { icon: Gauge, label: "COCKPIT", path: "/dashboard", description: "Dashboard" },
  { icon: Waves, label: "FLOW STATE", path: "/flow-state", description: "Deep Focus" },
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
  const { signOut } = useAuth();

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 flex flex-col border-r border-border bg-background transition-all duration-300 z-50",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-border flex items-center justify-between h-14 shrink-0">
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
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all btn-press group",
                "hover:bg-card",
                isActive && "bg-card border border-primary/30 glow-anabolic"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {!collapsed && (
                <div className="text-left min-w-0">
                  <p
                    className={cn(
                      "font-mono text-xs tracking-wide truncate transition-colors",
                      isActive ? "text-primary" : "text-foreground"
                    )}
                  >
                    {item.label}
                  </p>
                </div>
              )}
            </button>
          );

          if (collapsed && !isActive) { // Only tooltip on collapsed
            // Tooltip logic (omitted for brevity in replacement, but keeping standard structure)
            return (
              <Tooltip key={item.path} delayDuration={0}>
                <TooltipTrigger asChild>{button}</TooltipTrigger>
                <TooltipContent side="right" className="font-mono text-xs z-[100]">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return button;
        })}
      </nav>

      {/* Footer Controls */}
      <div className="p-3 border-t border-border bg-background/50 backdrop-blur-sm flex flex-col gap-2">

        {/* Sign Out - Sleek Minimalist */}
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className={cn(
            "w-full flex items-center gap-2 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors h-7",
            collapsed ? "justify-center p-0" : "justify-start px-2"
          )}
          title="Disconnect"
        >
          <LogOut className="h-3.5 w-3.5" />
          {!collapsed && <span className="font-mono text-[10px] tracking-wider uppercase">Disconnect</span>}
        </Button>

        {!collapsed && (
          <p className="text-[9px] font-mono text-muted-foreground/20 text-center pb-1">
            v1.0.0
          </p>
        )}
      </div>
    </aside>
  );
}
