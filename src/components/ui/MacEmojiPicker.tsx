
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Smile, Zap, Activity, Coffee, Moon, Sun, BookOpen, Target, Dumbbell, Heart, Brain, Utensils, Droplets, Leaf, Flame, Shield, Briefcase, Monitor, Smartphone, Volume2, Award, Star, Flag, Clock } from "lucide-react";

const EMOJI_CATEGORIES = [
    {
        id: "activity", name: "Activity", icon: <Activity className="h-4 w-4" />, emojis: [
            "🏃", "🏋️", "🧘", "🚲", "🏊", "🚶", "🧗", "🥊", "🤸", "⛹️", "🏌️", "🏄", "🚣", "🚵", "🏇"
        ]
    },
    {
        id: "mind", name: "Mind", icon: <Brain className="h-4 w-4" />, emojis: [
            "🧠", "📚", "🖊️", "🎓", "🧩", "🎯", "🎲", "🎹", "🎨", "🎭", "🎬", "🎤", "🎧", "💡", "🕯️"
        ]
    },
    {
        id: "body", name: "Body", icon: <Heart className="h-4 w-4" />, emojis: [
            "💤", "🚿", "🛁", "🧴", "🪥", "🥗", "🥩", "🥚", "🥑", "🥕", "🍎", "🍌", "🍇", "🍵", "🥤"
        ]
    },
    {
        id: "objects", name: "Objects", icon: <Briefcase className="h-4 w-4" />, emojis: [
            "💻", "📱", "⌚", "📷", "🔋", "🔌", "💊", "🧬", "📢", "🔔", "📆", "📝", "📊", "🔒", "🔑"
        ]
    },
    {
        id: "symbols", name: "Symbols", icon: <Star className="h-4 w-4" />, emojis: [
            "🔥", "💧", "❄️", "☀️", "🌙", "⭐", "🌟", "✨", "💫", "🛑", "✅", "⚠️", "⛔", "♻️"
        ]
    }
];

export const MacEmojiPicker = ({ onSelect }: { onSelect: (emoji: string) => void }) => {
    const [activeCategory, setActiveCategory] = useState("activity");

    return (
        <div className="w-[320px] bg-[#1e1e1e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col h-[300px]">
            {/* Header / Tabs */}
            <div className="flex items-center justify-between px-2 pt-2 pb-2 bg-white/5 border-b border-white/5">
                {EMOJI_CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={cn(
                            "p-2 rounded-lg transition-all hover:bg-white/10",
                            activeCategory === cat.id ? "bg-white/10 text-emerald-400" : "text-zinc-500"
                        )}
                        title={cat.name}
                    >
                        {cat.icon}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <ScrollArea className="flex-1 p-4">
                <div className="grid grid-cols-7 gap-1">
                    {EMOJI_CATEGORIES.find(c => c.id === activeCategory)?.emojis.map(emoji => (
                        <button
                            key={emoji}
                            onClick={() => onSelect(emoji)}
                            className="h-10 w-10 flex items-center justify-center text-xl rounded-lg hover:bg-white/10 transition-colors hover:scale-110 active:scale-95"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </ScrollArea>

            <div className="px-4 py-2 text-[10px] text-zinc-600 border-t border-white/5 bg-black/20 text-center uppercase tracking-widest font-mono">
                Select Icon
            </div>
        </div>
    );
};
