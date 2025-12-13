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
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface TheBladeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function TheBlade({ open, onOpenChange }: TheBladeProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-72 border-r border-border bg-background/80 backdrop-blur-xl p-0"
      >
        <SheetHeader className="p-6 border-b border-border">
          <SheetTitle className="font-mono text-lg tracking-wider text-foreground">
            <span className="text-primary">LIFE</span>
            <span className="text-muted-foreground">_OS</span>
          </SheetTitle>
        </SheetHeader>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all btn-press",
                  "hover:bg-card",
                  isActive && "bg-card border border-primary/30 glow-anabolic"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <div className="text-left">
                  <p
                    className={cn(
                      "font-mono text-sm tracking-wide",
                      isActive ? "text-primary" : "text-foreground"
                    )}
                  >
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Version Footer */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="text-xs font-mono text-muted-foreground/50">
            v1.0.0 // PROTOCOL ACTIVE
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
