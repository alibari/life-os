import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Gauge,
  Waves,
  FlaskConical,
  Star,
  User,
  Brain,
  Eye,
  Settings,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useLens } from "@/context/LensContext";

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
  { icon: Shield, label: "CONTROL CENTER", path: "/settings", description: "System Integrity" },
];

export function TheBlade({ collapsed, onToggle }: TheBladeProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { currentLens, setLens } = useLens();

  // Filter nav items: Hide 'Control Center' (Settings) in Focus Mode if strict visibility is requested.
  // User request: "in focus mode we hide the page control center its visible only in lab mode"
  const filteredNavItems = navItems.filter(item => {
    if (item.path === "/settings" && currentLens !== "lab") return false;
    return true;
  });

  // Redirect away from Settings if in Focus Mode
  useEffect(() => {
    if (currentLens === "focus" && location.pathname === "/settings") {
      navigate("/dashboard");
    }
  }, [currentLens, location.pathname, navigate]);

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
        {filteredNavItems.map((item) => {
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

      {/* Lens Switcher (Fluid Intelligence) */}
      {/* Lens Switcher (Premium Minimalist Toggle) */}
      {!collapsed && (
        <div className="px-4 py-4 border-t border-border/40">
          <div className="relative flex items-center bg-muted/30 rounded-full p-1 h-8">
            {/* Sliding Background - Clean Card Look */}
            <motion.div
              className="absolute top-1 bottom-1 bg-background rounded-full shadow-sm z-0"
              initial={false}
              animate={{
                x: currentLens === "focus" ? 0 : "100%",
                width: "50%"
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />

            <button
              onClick={() => setLens("focus")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 z-10 text-[10px] font-mono tracking-wider uppercase transition-colors duration-200",
                currentLens === "focus" ? "text-foreground font-medium" : "text-muted-foreground/60 hover:text-foreground/80"
              )}
            >
              <Eye className="w-3 h-3" />
              <span>Focus</span>
            </button>

            <button
              onClick={() => setLens("lab")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 z-10 text-[10px] font-mono tracking-wider uppercase transition-colors duration-200",
                currentLens === "lab" ? "text-foreground font-medium" : "text-muted-foreground/60 hover:text-foreground/80"
              )}
            >
              <FlaskConical className="w-3 h-3" />
              <span>Lab</span>
            </button>
          </div>
        </div>
      )}

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
