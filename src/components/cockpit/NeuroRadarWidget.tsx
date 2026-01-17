import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface NeuroRadarProps {
    data: {
        Drive: number;
        Focus: number;
        Strength: number;
        Energy: number;
        Calm: number;
        Joy: number;
    };
}

export const NeuroRadarWidget: React.FC<NeuroRadarProps> = ({ data }) => {
    // Transform data for Recharts
    const chartData = Object.entries(data).map(([key, value]) => ({
        subject: key,
        A: value,
        fullMark: 20, // Theoretical max for rendering scaling
    }));

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full flex flex-col items-center justify-center relative"
        >
            <div className="absolute top-2 left-4 text-xs font-mono text-zinc-500 tracking-widest uppercase">
                Neuro-Chemical Profile
            </div>

            <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                        <PolarGrid stroke="#3f3f46" strokeDasharray="3 3" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: '#a1a1aa', fontSize: 10, fontFamily: 'monospace' }}
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                        <Radar
                            name="Neuro-Activation"
                            dataKey="A"
                            stroke="#fbbf24" // Amber-400 for a futuristic look
                            fill="#fbbf24"
                            fillOpacity={0.3}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* Legend / Stats */}
            <div className="w-full px-4 flex justify-between text-[10px] text-zinc-600 font-mono mt-2">
                {Object.entries(data).map(([k, v]) => (
                    <div key={k} className="flex flex-col items-center">
                        <span className={v > 5 ? "text-amber-400 font-bold" : ""}>{k.substring(0, 3)}</span>
                        <span>{v.toFixed(1)}</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};
