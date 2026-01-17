import { useLocation, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Settings as SettingsIcon,
  Activity,
  FlaskConical,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
  UploadCloud,
  Layers,
  Database,
  Eye,
  User,
  Brain,
  Shield,
  Loader2,
  Gauge,
  Waves,
  Star,
  Edit2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useLens } from "@/context/LensContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  // Profile Edit State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setProfileName(user.user_metadata.full_name);
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    setLoadingProfile(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: profileName }
    });
    setLoadingProfile(false);
    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated");
      setIsProfileOpen(false);
      window.location.reload();
    }
  };

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
        "h-screen sticky top-0 flex flex-col border-r border-white/5 bg-background z-50 transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
            <span className="font-mono text-xs font-bold tracking-[0.2em] text-white">
              LIFE_OS
            </span>
          </motion.div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn("text-zinc-500 hover:text-white transition-colors", collapsed && "mx-auto")}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto scrollbar-none">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (collapsed) {
            return (
              <Tooltip key={item.path} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link to={item.path}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "w-full h-10 mb-2 transition-colors duration-200",
                        isActive
                          ? "text-white bg-white/10"
                          : "text-zinc-500 hover:text-white"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-background border border-white/10 text-white font-mono text-xs">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-10 px-4 mb-1 transition-colors duration-200 uppercase tracking-wider",
                  isActive
                    ? "bg-white/5 text-white font-bold"
                    : "text-zinc-500 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className={cn("h-4 w-4 mr-3", isActive ? "text-white" : "text-zinc-600 group-hover:text-white")} />
                <span className="font-mono text-[10px]">
                  {item.label}
                </span>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer Controls: Profile + Lens + SignOut */}
      <div className="p-4 space-y-4 border-t border-white/5">

        {/* Sleek Segmented Lens Switcher - Minimalist Black/Gray */}
        {!collapsed && (
          <div className="relative flex h-8 items-center rounded-md bg-zinc-900 p-1 border border-white/5">
            <div className={cn(
              "absolute inset-y-1 w-1/2 rounded-sm transition-all duration-300 ease-out bg-zinc-800 shadow-sm",
              currentLens === 'lab' ? "translate-x-full" : "translate-x-0"
            )} />
            <button
              onClick={() => setLens('focus')}
              className={cn(
                "relative z-10 flex-1 text-[9px] font-mono tracking-wider uppercase transition-colors text-center",
                currentLens === 'focus' ? "text-white font-bold" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              Focus
            </button>
            <button
              onClick={() => setLens('lab')}
              className={cn(
                "relative z-10 flex-1 text-[9px] font-mono tracking-wider uppercase transition-colors text-center",
                currentLens === 'lab' ? "text-white font-bold" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              Lab
            </button>
          </div>
        )}

        {/* User Profile */}
        {!collapsed && user && (
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <DialogTrigger asChild>
                  <button className="h-8 w-8 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center text-white text-xs font-bold hover:border-white/20 transition-colors">
                    {user.user_metadata?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-background border border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle className="font-mono uppercase tracking-widest text-sm">Identity Configuration</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">Designation</span>
                      <Input
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="Enter Name"
                        className="bg-zinc-900 border-white/10 text-white font-mono"
                      />
                    </div>
                    <Button
                      onClick={handleUpdateProfile}
                      disabled={loadingProfile}
                      className="w-full bg-white text-black hover:bg-zinc-200 font-mono text-xs uppercase tracking-widest"
                    >
                      {loadingProfile ? "Updating..." : "Confirm Update"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-white leading-none mb-1 font-mono">
                  {user.user_metadata?.full_name || 'USER'}
                </span>
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/500 bg-green-500 animate-pulse" />
                  <span className="text-[9px] text-zinc-500 font-mono leading-none">CONNECTED</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsProfileOpen(true)}
                className="h-7 w-7 text-zinc-600 hover:text-white transition-colors"
                title="Settings"
              >
                <SettingsIcon className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                className="h-7 w-7 text-zinc-600 hover:text-red-400 transition-colors"
                title="Disconnect"
              >
                <LogOut className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Collapsed Logic for User Icon */}
        {collapsed && user && (
          <div className="flex justify-center border-t border-white/5 pt-4">
            <div className="h-8 w-8 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center text-white text-xs font-bold cursor-pointer" title={user.email}>
              {user.user_metadata?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
