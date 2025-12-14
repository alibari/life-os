import { useState, useEffect } from "react";
import { Brain, Sparkles, TrendingUp, AlertTriangle, Lightbulb, Zap, Clock, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface Session {
  startTime: Date | string;
  focusMinutes: number;
  rpe?: number;
  sessionType?: string;
}

interface FlowAIInsightsProps {
  sessions: Session[];
  todayFocusMinutes: number;
  avgRPE: number | null;
}

interface Insight {
  type: "positive" | "warning" | "suggestion" | "pattern";
  icon: typeof Brain;
  title: string;
  message: string;
  metric?: string;
}

export function FlowAIInsights({ sessions, todayFocusMinutes, avgRPE }: FlowAIInsightsProps) {
  const [currentInsight, setCurrentInsight] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [displayedText, setDisplayedText] = useState("");

  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];
    const today = new Date();
    
    // Get week sessions
    const weekSessions = sessions.filter((s) => {
      const sessionDate = new Date(s.startTime);
      const diffDays = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays < 7;
    });

    const weekFocusMinutes = weekSessions.reduce((acc, s) => acc + s.focusMinutes, 0);
    const avgSessionLength = weekSessions.length > 0 ? weekFocusMinutes / weekSessions.length : 0;

    // Best performance time analysis
    const sessionsByHour = sessions.reduce((acc, s) => {
      const hour = new Date(s.startTime).getHours();
      if (!acc[hour]) acc[hour] = { total: 0, count: 0, rpeSum: 0 };
      acc[hour].total += s.focusMinutes;
      acc[hour].count++;
      if (s.rpe) acc[hour].rpeSum += s.rpe;
      return acc;
    }, {} as Record<number, { total: number; count: number; rpeSum: number }>);

    const bestHour = Object.entries(sessionsByHour).reduce((best, [hour, data]) => {
      const efficiency = data.count > 0 ? data.total / data.count : 0;
      return efficiency > (best?.efficiency || 0) ? { hour: Number(hour), efficiency } : best;
    }, null as { hour: number; efficiency: number } | null);

    if (bestHour) {
      const hourLabel = bestHour.hour > 12 ? `${bestHour.hour - 12}PM` : `${bestHour.hour}AM`;
      insights.push({
        type: "pattern",
        icon: Clock,
        title: "Peak Performance Window",
        message: `Your best focus sessions happen around ${hourLabel}. Schedule high-priority work during this window for optimal cognitive output.`,
        metric: `${Math.round(bestHour.efficiency)}min avg`,
      });
    }

    // Today's progress
    if (todayFocusMinutes >= 180) {
      insights.push({
        type: "positive",
        icon: Zap,
        title: "Deep Work Champion",
        message: `You've logged ${Math.floor(todayFocusMinutes / 60)}+ hours of focused work today. Your prefrontal cortex is primed for complex problem-solving.`,
        metric: `${Math.floor(todayFocusMinutes / 60)}h ${todayFocusMinutes % 60}m`,
      });
    } else if (todayFocusMinutes < 45 && today.getHours() > 12) {
      insights.push({
        type: "warning",
        icon: AlertTriangle,
        title: "Focus Deficit Detected",
        message: "You're behind on focused work today. Consider a single 45-min session to prevent cognitive debt from accumulating.",
        metric: `${todayFocusMinutes}min today`,
      });
    }

    // RPE trend analysis
    if (avgRPE !== null) {
      if (avgRPE > 7) {
        insights.push({
          type: "warning",
          icon: Activity,
          title: "High Cognitive Load",
          message: "Your perceived effort is elevated. Consider shorter sessions, more breaks, or simpler tasks to prevent burnout.",
          metric: `RPE ${avgRPE.toFixed(1)}`,
        });
      } else if (avgRPE <= 4) {
        insights.push({
          type: "positive",
          icon: TrendingUp,
          title: "Flow State Achieved",
          message: "Low effort rating suggests you're in flow. You can potentially extend sessions or tackle more complex challenges.",
          metric: `RPE ${avgRPE.toFixed(1)}`,
        });
      }
    }

    // Streak analysis
    const consecutiveDays = (() => {
      let streak = 0;
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const hasSession = sessions.some(
          (s) => new Date(s.startTime).toDateString() === checkDate.toDateString()
        );
        if (hasSession) streak++;
        else break;
      }
      return streak;
    })();

    if (consecutiveDays >= 7) {
      insights.push({
        type: "positive",
        icon: Sparkles,
        title: "Consistency Champion",
        message: `${consecutiveDays}-day focus streak! Consistent practice builds myelin around neural pathways, making focus easier over time.`,
        metric: `${consecutiveDays} days`,
      });
    }

    // Suggestions
    if (avgSessionLength < 60) {
      insights.push({
        type: "suggestion",
        icon: Lightbulb,
        title: "Extend Your Sessions",
        message: "Try pushing past the 60-minute mark. The brain typically enters deeper flow states after the initial 15-minute friction phase.",
        metric: `${Math.round(avgSessionLength)}min avg`,
      });
    }

    // Default insight if none generated
    if (insights.length === 0) {
      insights.push({
        type: "suggestion",
        icon: Brain,
        title: "Building Your Profile",
        message: "Complete more focus sessions to unlock personalized AI insights based on your unique cognitive patterns.",
        metric: `${sessions.length} sessions`,
      });
    }

    return insights;
  };

  const insights = generateInsights();
  const insight = insights[currentInsight % insights.length];

  useEffect(() => {
    setIsTyping(true);
    setDisplayedText("");
    let charIndex = 0;
    const text = insight.message;
    
    const typeInterval = setInterval(() => {
      if (charIndex < text.length) {
        setDisplayedText(text.slice(0, charIndex + 1));
        charIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 20);

    return () => clearInterval(typeInterval);
  }, [currentInsight, insight.message]);

  useEffect(() => {
    const rotateInterval = setInterval(() => {
      setCurrentInsight((prev) => (prev + 1) % insights.length);
    }, 12000);

    return () => clearInterval(rotateInterval);
  }, [insights.length]);

  const Icon = insight.icon;
  const typeColors = {
    positive: "growth",
    warning: "warning",
    suggestion: "focus",
    pattern: "primary",
  };
  const color = typeColors[insight.type];

  return (
    <div className="card-surface h-full p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-md", `bg-${color}/10 border border-${color}/20`)}>
            <Brain className={cn("h-3.5 w-3.5", `text-${color}`)} />
          </div>
          <h3 className="font-mono text-xs font-medium text-foreground">AI Insights</h3>
        </div>
        {insight.metric && (
          <span className={cn("font-mono text-[10px] px-2 py-0.5 rounded-full", `bg-${color}/10 text-${color}`)}>
            {insight.metric}
          </span>
        )}
      </div>

      {/* Insight Card */}
      <div className={cn("flex-1 p-3 rounded-lg border", `bg-${color}/5 border-${color}/20`)}>
        <div className="flex items-center gap-2 mb-2">
          <Icon className={cn("h-4 w-4", `text-${color}`)} />
          <span className={cn("font-mono text-xs font-medium", `text-${color}`)}>
            {insight.title}
          </span>
        </div>
        <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
          {displayedText}
          {isTyping && <span className="animate-pulse">▋</span>}
        </p>
      </div>

      {/* Insight Navigation */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {insights.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentInsight(idx)}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all",
              idx === currentInsight % insights.length
                ? `bg-${color}`
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
          />
        ))}
      </div>
    </div>
  );
}
