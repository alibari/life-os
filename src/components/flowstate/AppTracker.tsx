import { useState, useEffect } from "react";
import { Monitor, Eye, EyeOff, Globe, FileText, MessageSquare, Music, Code, Mail, Video, ShoppingBag, Gamepad2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppUsage {
  id: string;
  name: string;
  url?: string;
  category: "productive" | "neutral" | "distracting";
  timeSpent: number; // in seconds
  visits: number;
  icon: typeof Globe;
}

interface AppTrackerProps {
  isVisible: boolean;
  onToggleVisibility: () => void;
}

// Mock data - in real app, this would come from browser extension or tracking service
const generateMockApps = (): AppUsage[] => [
  { id: "1", name: "VS Code", category: "productive", timeSpent: 7200, visits: 45, icon: Code },
  { id: "2", name: "GitHub", url: "github.com", category: "productive", timeSpent: 3600, visits: 23, icon: Globe },
  { id: "3", name: "Stack Overflow", url: "stackoverflow.com", category: "productive", timeSpent: 1800, visits: 18, icon: Search },
  { id: "4", name: "Notion", url: "notion.so", category: "productive", timeSpent: 2400, visits: 12, icon: FileText },
  { id: "5", name: "Slack", category: "neutral", timeSpent: 1500, visits: 34, icon: MessageSquare },
  { id: "6", name: "Gmail", url: "mail.google.com", category: "neutral", timeSpent: 900, visits: 15, icon: Mail },
  { id: "7", name: "YouTube", url: "youtube.com", category: "distracting", timeSpent: 1200, visits: 8, icon: Video },
  { id: "8", name: "Twitter", url: "twitter.com", category: "distracting", timeSpent: 600, visits: 12, icon: Globe },
  { id: "9", name: "Spotify", category: "neutral", timeSpent: 5400, visits: 3, icon: Music },
  { id: "10", name: "Amazon", url: "amazon.com", category: "distracting", timeSpent: 300, visits: 2, icon: ShoppingBag },
];

export function AppTracker({ isVisible, onToggleVisibility }: AppTrackerProps) {
  const [apps, setApps] = useState<AppUsage[]>([]);
  const [filter, setFilter] = useState<"all" | "productive" | "neutral" | "distracting">("all");

  useEffect(() => {
    // Simulate loading app data
    setApps(generateMockApps());
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const filteredApps = apps
    .filter((app) => filter === "all" || app.category === filter)
    .sort((a, b) => b.timeSpent - a.timeSpent)
    .slice(0, 10);

  const totalTime = apps.reduce((acc, app) => acc + app.timeSpent, 0);
  const productiveTime = apps
    .filter((app) => app.category === "productive")
    .reduce((acc, app) => acc + app.timeSpent, 0);
  const distractingTime = apps
    .filter((app) => app.category === "distracting")
    .reduce((acc, app) => acc + app.timeSpent, 0);

  const productivityScore = totalTime > 0 
    ? Math.round((productiveTime / (productiveTime + distractingTime)) * 100) 
    : 0;

  const categoryColors = {
    productive: "growth",
    neutral: "muted-foreground",
    distracting: "destructive",
  };

  if (!isVisible) return null;

  return (
    <div className="card-surface h-full p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-focus/10 border border-focus/20">
            <Monitor className="h-3.5 w-3.5 text-focus" />
          </div>
          <h3 className="font-mono text-xs font-medium text-foreground">App Tracker</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            "px-2 py-0.5 rounded-full font-mono text-[10px] font-bold",
            productivityScore >= 70 ? "bg-growth/10 text-growth" :
            productivityScore >= 40 ? "bg-warning/10 text-warning" :
            "bg-destructive/10 text-destructive"
          )}>
            {productivityScore}% Focus
          </div>
          <button
            onClick={onToggleVisibility}
            className="p-1 rounded hover:bg-muted/50 transition-colors"
          >
            <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-3 p-1 bg-background/50 rounded-lg">
        {(["all", "productive", "neutral", "distracting"] as const).map((cat) => {
          const getButtonStyle = () => {
            if (filter !== cat) return "text-muted-foreground hover:text-foreground";
            if (cat === "all") return "bg-foreground/10 text-foreground";
            return `bg-${categoryColors[cat]}/10 text-${categoryColors[cat]}`;
          };
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "flex-1 px-2 py-1 rounded font-mono text-[9px] uppercase transition-all",
                getButtonStyle()
              )}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* App List */}
      <div className="space-y-1.5 flex-1 overflow-auto">
        {filteredApps.map((app, idx) => {
          const Icon = app.icon;
          const percentage = totalTime > 0 ? (app.timeSpent / totalTime) * 100 : 0;
          return (
            <div
              key={app.id}
              className="flex items-center gap-2 p-2 bg-background/30 rounded-lg group hover:bg-background/50 transition-all"
            >
              <span className="font-mono text-[9px] text-muted-foreground w-4">
                #{idx + 1}
              </span>
              <div className={cn(
                "p-1 rounded",
                `bg-${categoryColors[app.category]}/10`
              )}>
                <Icon className={cn("h-3 w-3", `text-${categoryColors[app.category]}`)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] text-foreground truncate">{app.name}</p>
                  <span className="font-mono text-[10px] font-medium text-foreground">
                    {formatTime(app.timeSpent)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 bg-muted/30 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", `bg-${categoryColors[app.category]}`)}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="font-mono text-[8px] text-muted-foreground">
                    {app.visits} visits
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border">
        <div className="text-center">
          <p className="font-mono text-[9px] text-muted-foreground">Productive</p>
          <p className="font-mono text-xs font-bold text-growth">{formatTime(productiveTime)}</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-[9px] text-muted-foreground">Neutral</p>
          <p className="font-mono text-xs font-bold text-muted-foreground">
            {formatTime(apps.filter(a => a.category === "neutral").reduce((acc, a) => acc + a.timeSpent, 0))}
          </p>
        </div>
        <div className="text-center">
          <p className="font-mono text-[9px] text-muted-foreground">Distracting</p>
          <p className="font-mono text-xs font-bold text-destructive">{formatTime(distractingTime)}</p>
        </div>
      </div>
    </div>
  );
}
