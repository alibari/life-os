import { useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Habit } from "@/types/habits";
import { getChemicalColor } from "@/lib/scientificMetrics";

export function CircadianWaveWidget({
    habits
}: {
    habits: Habit[]
}) {
    // 1. Generate the Ideal Circadian Curve (Sine Wave)
    // Morning Peak (Cortisol) ~ 8am, Dip ~ 3pm, Eve Peak? No, Melatonin rises PM.
    // Let's model "System Energy" vs Time.
    // 6am: Rising. 10am: Peak. 3pm: Dip. 8pm: Winding Down.
    const sections = ['Morning', 'Afternoon', 'Evening'];

    // Generate data points for the wave
    const waveData = useMemo(() => {
        const points = [];
        for (let i = 0; i <= 24; i++) {
            // Simple model: 
            // Morning rise (6-10)
            // Sustained (10-16)
            // Taper (16-22)
            // Sleep (22-6)
            let energy = 10;
            if (i >= 6 && i < 10) energy = 10 + (i - 6) * 20; // Rise to 90
            else if (i >= 10 && i < 16) energy = 90 - (i - 10) * 5; // Slow dip to 60
            else if (i >= 16 && i < 22) energy = 60 - (i - 16) * 10; // Drop to 0
            else energy = 10; // Base

            points.push({ time: i, energy });
        }
        return points;
    }, []);

    // 2. Map Habits to the Wave
    // We map 'morning' -> 8am, 'afternoon' -> 14pm, 'evening' -> 20pm
    // 'all_day' -> Distributed or separate? Let's put them at bottom.

    const plottedHabits = useMemo(() => {
        return habits.map(h => {
            let hour = 12;
            let label = "Anytime";

            if (h.time_of_day === 'morning') { hour = 8; label = "Morning"; }
            else if (h.time_of_day === 'afternoon') { hour = 14; label = "Afternoon"; }
            else if (h.time_of_day === 'evening') { hour = 20; label = "Evening"; }
            else { hour = 12; label = "Anytime"; } // Center them but distinct?

            // Add some jitter so they don't overlap perfectly
            const jitter = Math.random() * 2 - 1;

            return {
                ...h,
                plotX: hour + jitter,
                plotY: h.time_of_day === 'all_day' ? 5 : (waveData.find(d => d.time === hour)?.energy || 50) + (Math.random() * 10),
                color: getChemicalColor(h.primary_driver || 'Dopamine')
            };
        });
    }, [habits, waveData]);

    return (
        <div className="w-full h-[300px] relative bg-black/40 border border-white/5 rounded-2xl overflow-hidden p-6">
            <div className="absolute top-6 left-6 z-10">
                <h3 className="text-xs uppercase tracking-widest text-zinc-400 font-bold flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Circadian Architecture
                </h3>
            </div>

            {/* Backing Grid / Wave */}
            <div className="absolute inset-x-0 bottom-0 top-12 z-0 opacity-20">
                <ResponsiveContainer width="100%" height="80%">
                    <AreaChart data={waveData}>
                        <defs>
                            <linearGradient id="energyGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.1} />
                                <stop offset="40%" stopColor="#f59e0b" stopOpacity={0.4} />
                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="energy"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            fill="url(#energyGradient)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Overlay Habits */}
            <div className="absolute inset-0 z-20 pointer-events-none">
                {/* 
                    This is a simplified overlay. 
                    In a real complex chart we'd use CustomDot in Recharts, 
                    but for "Floating Pills" HTML/CSS is often cleaner/easier to animate.
                 */}
                <div className="relative w-full h-full">
                    {plottedHabits.map((h, i) => {
                        // Map X (0-24) to %
                        const left = (h.plotX / 24) * 100;
                        // Map Y (0-100) to % (inverted logic for CSS top)
                        const bottom = h.plotY;

                        return (
                            <motion.div
                                key={h.id || i}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="absolute flex flex-col items-center group pointer-events-auto cursor-pointer"
                                style={{
                                    left: `${left}%`,
                                    bottom: `${bottom}%`,
                                    transform: 'translate(-50%, 50%)'
                                }}
                            >
                                <div
                                    className="w-3 h-3 rounded-full border border-white/20 shadow-[0_0_10px_-2px_currentColor] transition-all group-hover:scale-150"
                                    style={{ backgroundColor: h.color, color: h.color }}
                                />
                                <div className="opacity-0 group-hover:opacity-100 absolute bottom-4 bg-black/90 border border-white/10 px-2 py-1 rounded text-[9px] whitespace-nowrap z-50 transition-opacity">
                                    <span className="font-bold text-white">{h.name}</span>
                                    <span className="ml-1 text-zinc-400">({h.primary_driver?.slice(0, 3)})</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Axis Labels */}
            <div className="absolute bottom-4 left-6 right-6 flex justify-between text-[9px] text-zinc-600 font-mono uppercase">
                <span>04:00</span>
                <span>08:00 (Wake)</span>
                <span>12:00</span>
                <span>16:00</span>
                <span>20:00 (Wind Down)</span>
                <span>24:00</span>
            </div>
        </div>
    );
}
