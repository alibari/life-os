import { Habit } from "@/types/habits";
import { isScheduledForToday } from "@/lib/scheduling";

// --- TYPES ---
export type NeuroAxis = 'Drive' | 'Focus' | 'Rest' | 'Serenity' | 'Metabolic';

export interface ScientificStats {
    systemLoad: number;
    protocolEfficiency: {
        strain: number; // Cumulative Friction
        duration: number; // Cumulative Duration
        ratio: number; // Efficiency (Strain / Minute)
    };
    neuroProfile: Record<NeuroAxis, number>;
    chemicalDistribution: Record<string, number>; // Raw chemical counts
    autonomic: {
        sympathetic: number;
        parasympathetic: number;
        balance: number; // Net score
    };
    circadian: {
        morning: PhaseData;
        afternoon: PhaseData;
        evening: PhaseData;
        anytime: PhaseData;
    };
}

export interface PhaseData {
    habits: Habit[];
    load: number;
    dominantAxis: NeuroAxis | 'Balanced';
    alignmentScore: 'Optimal' | 'Good' | 'Poor';
}

// --- CONFIGURATION: The "Future Proof" Map ---
// Any chemical not listed here falls into "General" or mapped by heuristic.
const CHEMICAL_AXIS_MAP: Record<string, NeuroAxis> = {
    // 1. DRIVE & REWARD (Motivation, Pursuit)
    'dopamine': 'Drive',
    'testosterone': 'Drive',
    'dynorphin': 'Drive', // Inverse drive (pain->pleasure)
    'tyrosine': 'Drive',
    'endorphin': 'Drive', // Often Joy, but functionally reward/pursuit in this system

    // 2. FOCUS & VIGILANCE (Alertness, Action)
    'acetylcholine': 'Focus',
    'norepinephrine': 'Focus',
    'adrenaline': 'Focus',
    'orexin': 'Focus',
    'glutamate': 'Focus',
    'histamine': 'Focus',
    'cortisol': 'Focus', // Acute cortisol is focus

    // 3. REST & RESTORE (Sleep, Growth)
    'adenosine': 'Rest',
    'melatonin': 'Rest',
    'growth hormone': 'Rest',
    'growth_hormone': 'Rest', // Normalize

    // 4. SERENITY & STABILIZATION (Mood, Anxiety)
    'serotonin': 'Serenity',
    'oxytocin': 'Serenity',
    'gaba': 'Serenity',
    'anandamide': 'Serenity',

    // 5. METABOLIC & VITALITY (Energy, Health)
    'insulin': 'Metabolic',
    'nitric oxide': 'Metabolic',
    'nitric_oxide': 'Metabolic',
    'nad+': 'Metabolic',
    'ketones': 'Metabolic',
    'co2 tolerance': 'Metabolic',
    'co2_tolerance': 'Metabolic'
};

// Colors for the UI (Shared source of truth)
export const AXIS_COLORS: Record<NeuroAxis, string> = {
    'Drive': '#10b981', // Emerald
    'Focus': '#f59e0b', // Amber
    'Rest': '#3b82f6', // Blue
    'Serenity': '#8b5cf6', // Violet
    'Metabolic': '#ef4444' // Red
};

// --- LOGIC ---

export const calculateScientificMetrics = (habits: Habit[]): ScientificStats => {
    const stats: ScientificStats = {
        systemLoad: 0,
        protocolEfficiency: { strain: 0, duration: 0, ratio: 0 },
        neuroProfile: { 'Drive': 0, 'Focus': 0, 'Rest': 0, 'Serenity': 0, 'Metabolic': 0 },
        chemicalDistribution: {},
        autonomic: { sympathetic: 0, parasympathetic: 0, balance: 0 },
        circadian: {
            morning: { habits: [], load: 0, dominantAxis: 'Balanced', alignmentScore: 'Good' },
            afternoon: { habits: [], load: 0, dominantAxis: 'Balanced', alignmentScore: 'Good' },
            evening: { habits: [], load: 0, dominantAxis: 'Balanced', alignmentScore: 'Good' },
            anytime: { habits: [], load: 0, dominantAxis: 'Balanced', alignmentScore: 'Good' }
        }
    };

    habits.forEach(h => {
        // 1. System Load & Efficiency
        // Formula: Friction * Intensity(State)
        // If state is 0, use 1 as base intensity
        const intensity = Math.max(1, Math.abs(h.state || 0));
        const load = (h.friction || 0) * intensity;

        stats.systemLoad += load;
        stats.protocolEfficiency.strain += (h.friction || 0);
        stats.protocolEfficiency.duration += (h.duration || 0);

        // 2. Neuro Profile
        const drivers = [h.primary_driver, h.secondary_driver].filter(Boolean) as string[];
        drivers.forEach((d, index) => {
            const cleanD = d.toLowerCase().trim();
            const axis = CHEMICAL_AXIS_MAP[cleanD];

            // Weight: Primary = 1.0, Secondary = 0.5
            const weight = index === 0 ? 1.0 : 0.5;

            if (axis) {
                stats.neuroProfile[axis] += (intensity * weight);
            }

            // Raw Distribution
            stats.chemicalDistribution[cleanD] = (stats.chemicalDistribution[cleanD] || 0) + weight;
        });

        // 3. Autonomic Tone
        // Heuristic:
        // Positive State (>0) = Parasympathetic (Rest/Digest) usually
        // Negative State (<0) = Sympathetic (Fight/Flight) usually
        if ((h.state || 0) < 0) {
            stats.autonomic.sympathetic += Math.abs(h.state || 0);
            stats.autonomic.balance -= Math.abs(h.state || 0);
        } else {
            stats.autonomic.parasympathetic += (h.state || 0);
            stats.autonomic.balance += (h.state || 0);
        }

        // 4. Circadian Distribution (Bucket Sort)
        if (h.time_of_day === 'morning') stats.circadian.morning.habits.push(h);
        else if (h.time_of_day === 'afternoon') stats.circadian.afternoon.habits.push(h);
        else if (h.time_of_day === 'evening') stats.circadian.evening.habits.push(h);
        else stats.circadian.anytime.habits.push(h);
    });

    // 5. Calculate Phase Stats
    const phases: (keyof typeof stats.circadian)[] = ['morning', 'afternoon', 'evening', 'anytime'];
    phases.forEach(p => {
        const phase = stats.circadian[p];
        if (phase.habits.length > 0) {
            // Load
            phase.load = phase.habits.reduce((acc, h) => acc + calculateCognitiveLoad(h), 0);

            // Dominant Axis
            const axisCounts: Record<string, number> = {};
            phase.habits.forEach(h => {
                const axis = CHEMICAL_AXIS_MAP[h.primary_driver?.toLowerCase() || ''] || 'Metabolic';
                axisCounts[axis] = (axisCounts[axis] || 0) + 1;
            });
            const topAxis = Object.entries(axisCounts).sort((a, b) => b[1] - a[1])[0];
            phase.dominantAxis = topAxis ? topAxis[0] as NeuroAxis : 'Balanced';

            // Alignment Score (Heuristic)
            // Morning should be Drive/Metabolic/Focus
            // Evening should be Rest/Serenity
            // Afternoon should be Focus/Metabolic
            const axis = phase.dominantAxis;
            if (p === 'morning' && (axis === 'Rest' || axis === 'Serenity')) phase.alignmentScore = 'Poor';
            else if (p === 'evening' && (axis === 'Drive' || axis === 'Focus')) phase.alignmentScore = 'Poor';
            else phase.alignmentScore = 'Optimal';
        }
    });

    // Final Ratio
    if (stats.protocolEfficiency.duration > 0) {
        stats.protocolEfficiency.ratio = stats.protocolEfficiency.strain / stats.protocolEfficiency.duration;
    }

    return stats;
};

// Helper: Get Color for a specific Chemical (Specific override or fallback to Axis)
export const getChemicalColor = (chemical: string): string => {
    const c = chemical.toLowerCase().trim();
    if (CHEMICAL_AXIS_MAP[c]) return AXIS_COLORS[CHEMICAL_AXIS_MAP[c]];
    return '#71717a'; // Zinc-500
};

// --- NEW HELPERS (Phase 2) ---

export const calculateCognitiveLoad = (h: Habit): number => {
    // Formula: (Friction * Duration) + Vector_Weight
    // Vector Weight: High intensity vectors add load
    const baseLoad = (h.friction || 0) * (h.duration || 1);
    const intensity = Math.abs(h.state || 0); // Absolute state intensity
    return Math.round(baseLoad + (intensity * 10));
};

export const formatSmartDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
};
