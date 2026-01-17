import { motion } from 'framer-motion';
import { Habit } from "@/types/habits";
import { PhaseData, getChemicalColor } from "@/lib/scientificMetrics";
import { cn } from "@/lib/utils";
import { Sun, Moon, Sunrise, Calendar } from 'lucide-react';

interface CircadianPhaseGridProps {
    phases: {
        morning: PhaseData;
        afternoon: PhaseData;
        evening: PhaseData;
        anytime: PhaseData;
    };
}

const PhaseCard = ({
    title,
    data,
    icon: Icon,
    subtitle
}: {
    title: string;
    data: PhaseData;
    icon: any;
    subtitle: string;
}) => {
    return (
        <div className="card-surface border-white/5 bg-zinc-900/20 backdrop-blur-xl p-6 flex flex-col h-[300px] relative overflow-hidden group">
            {/* Header */}
            <div className="flex justify-between items-start z-10">
                <div>
                    <h3 className="text-xs uppercase tracking-widest text-zinc-400 font-bold flex items-center gap-2">
                        <Icon className="w-3 h-3 text-emerald-500" />
                        {title}
                    </h3>
                    <p className="text-[9px] text-zinc-500 mt-1 font-mono uppercase">{subtitle}</p>
                </div>

                {/* Alignment Badge */}
                {data.habits.length > 0 && (
                    <div className={cn(
                        "px-2 py-0.5 rounded text-[9px] uppercase font-bold border",
                        data.alignmentScore === 'Optimal' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                            data.alignmentScore === 'Good' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                "bg-red-500/10 text-red-500 border-red-500/20"
                    )}>
                        {data.alignmentScore}
                    </div>
                )}
            </div>

            {/* List */}
            <div className="mt-6 space-y-2 overflow-y-auto flex-1 pr-2 custom-scrollbar z-10">
                {data.habits.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <span className="text-[9px] text-zinc-700 uppercase tracking-widest">No Active Habits</span>
                    </div>
                ) : (
                    data.habits.map((h, i) => (
                        <motion.div
                            key={h.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors group/item"
                        >
                            <div
                                className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]"
                                style={{ color: getChemicalColor(h.primary_driver || 'Dopamine'), backgroundColor: 'currentColor' }}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-medium text-zinc-300 truncate group-hover/item:text-white transition-colors">
                                    {h.name}
                                </div>
                                <div className="text-[8px] text-zinc-600 font-mono truncate">
                                    {h.primary_driver} • {h.duration}m
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Footer Stat */}
            {data.habits.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-[9px] text-zinc-500 font-mono uppercase z-10">
                    <span>Load: {data.load}</span>
                    <span className="text-zinc-400">{data.dominantAxis} Dominant</span>
                </div>
            )}

            {/* Background Gradient Hint */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
    );
};

export function CircadianPhaseGrid({ phases }: CircadianPhaseGridProps) {
    return (
        <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <PhaseCard
                    title="Morning"
                    subtitle="04:00 - 11:00"
                    icon={Sunrise}
                    data={phases.morning}
                />
                <PhaseCard
                    title="Afternoon"
                    subtitle="11:00 - 17:00"
                    icon={Sun}
                    data={phases.afternoon}
                />
                <PhaseCard
                    title="Evening"
                    subtitle="17:00 - 23:00"
                    icon={Moon}
                    data={phases.evening}
                />
                <PhaseCard
                    title="Anytime"
                    subtitle="Flexible"
                    icon={Calendar}
                    data={phases.anytime}
                />
            </div>
        </div>
    );
}
