import { Brain, Sparkles, TrendingUp, AlertTriangle, Lightbulb, ArrowRight, Zap } from "lucide-react";
import { useState, useEffect } from "react";

interface Insight {
  type: "positive" | "warning" | "suggestion";
  title: string;
  description: string;
}

const mockInsights: Insight[] = [
  {
    type: "positive",
    title: "Sleep Recovery Optimal",
    description: "Your 8.2h sleep with 1.8h deep phases puts you in the top 15% of your 90-day average.",
  },
  {
    type: "warning", 
    title: "Adenosine Building",
    description: "Caffeine effect wearing off in ~2h. Consider a 20-min power nap before 2pm for optimal recovery.",
  },
  {
    type: "suggestion",
    title: "Peak Focus Window",
    description: "Based on your circadian data, schedule deep work between 9am-12pm today for maximum cognitive output.",
  },
];

const correlations = [
  { metric1: "Sleep Quality", metric2: "Focus Score", correlation: 0.87, direction: "positive" },
  { metric1: "Morning Exercise", metric2: "Evening Energy", correlation: 0.72, direction: "positive" },
  { metric1: "Late Caffeine", metric2: "Deep Sleep", correlation: -0.65, direction: "negative" },
];

export const AISummary = () => {
  const [activeInsight, setActiveInsight] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [displayedText, setDisplayedText] = useState("");
  
  const currentInsight = mockInsights[activeInsight];
  const fullText = currentInsight.description;

  // Typewriter effect
  useEffect(() => {
    setDisplayedText("");
    setIsTyping(true);
    let index = 0;
    
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(prev => prev + fullText[index]);
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 20);
    
    return () => clearInterval(timer);
  }, [activeInsight, fullText]);

  // Auto-rotate insights
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isTyping) {
        setActiveInsight(prev => (prev + 1) % mockInsights.length);
      }
    }, 8000);
    return () => clearInterval(timer);
  }, [isTyping]);

  const getInsightStyles = (type: string) => {
    switch (type) {
      case "positive":
        return {
          icon: TrendingUp,
          bg: "bg-primary/10",
          border: "border-primary/30",
          text: "text-primary",
          glow: "shadow-[0_0_20px_hsl(var(--primary)/0.2)]",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          bg: "bg-amber-500/10",
          border: "border-amber-500/30",
          text: "text-amber-400",
          glow: "shadow-[0_0_20px_rgba(251,191,36,0.2)]",
        };
      case "suggestion":
        return {
          icon: Lightbulb,
          bg: "bg-secondary/10",
          border: "border-secondary/30",
          text: "text-secondary",
          glow: "shadow-[0_0_20px_hsl(var(--secondary)/0.2)]",
        };
      default:
        return {
          icon: Sparkles,
          bg: "bg-muted",
          border: "border-border",
          text: "text-foreground",
          glow: "",
        };
    }
  };

  const styles = getInsightStyles(currentInsight.type);
  const InsightIcon = styles.icon;

  return (
    <div className="card-surface p-4 h-full flex flex-col overflow-hidden">
      {/* Header with DNA animation */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Brain className="h-4 w-4 text-secondary" />
            <Sparkles className="absolute -top-1 -right-1 h-2.5 w-2.5 text-primary animate-pulse" />
          </div>
          <span className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
            AI Insights
          </span>
        </div>
        <div className="flex items-center gap-1">
          {mockInsights.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveInsight(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === activeInsight ? "bg-primary w-4" : "bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Insight Card */}
      <div className={`relative p-4 rounded-lg border ${styles.bg} ${styles.border} ${styles.glow} mb-3 transition-all duration-300`}>
        {/* Animated background */}
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <svg className="w-full h-full" viewBox="0 0 100 40">
              <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="hsl(var(--secondary))" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <path
                d="M0 20 Q 25 10, 50 20 T 100 20"
                stroke="url(#waveGradient)"
                strokeWidth="0.5"
                fill="none"
                className="animate-[pulse_3s_ease-in-out_infinite]"
              />
              <path
                d="M0 25 Q 25 15, 50 25 T 100 25"
                stroke="url(#waveGradient)"
                strokeWidth="0.5"
                fill="none"
                className="animate-[pulse_3s_ease-in-out_infinite_0.5s]"
              />
            </svg>
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <InsightIcon className={`h-4 w-4 ${styles.text}`} />
            <span className={`font-mono text-sm font-semibold ${styles.text}`}>
              {currentInsight.title}
            </span>
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed min-h-[40px]">
            {displayedText}
            {isTyping && <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse" />}
          </p>
        </div>
      </div>

      {/* Correlations Section */}
      <div className="flex-1 min-h-0">
        <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-2">
          Pattern Correlations
        </div>
        <div className="space-y-2">
          {correlations.map((corr, i) => (
            <div 
              key={i}
              className="flex items-center gap-2 p-2 bg-muted/20 rounded-md border border-border/50"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-foreground font-medium truncate">{corr.metric1}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="text-foreground font-medium truncate">{corr.metric2}</span>
                </div>
              </div>
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono ${
                corr.direction === "positive" 
                  ? "bg-primary/10 text-primary" 
                  : "bg-destructive/10 text-destructive"
              }`}>
                {corr.direction === "positive" ? "+" : ""}{(corr.correlation * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-3 pt-3 border-t border-border shrink-0">
        <div className="flex items-center gap-2">
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-md text-primary text-[11px] font-mono transition-all">
            <Zap className="h-3 w-3" />
            Apply Suggestion
          </button>
          <button className="py-2 px-3 bg-muted/30 hover:bg-muted/50 border border-border rounded-md text-muted-foreground text-[11px] font-mono transition-all">
            See All
          </button>
        </div>
      </div>
    </div>
  );
};
