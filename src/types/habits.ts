export type PrimaryDriver =
    | 'Dopamine' | 'Norepinephrine' | 'Acetylcholine' | 'Serotonin' | 'GABA'
    | 'Cortisol' | 'Endorphin' | 'Oxytocin' | 'Adenosine' | 'Testosterone'
    | 'Melatonin' | 'Dynorphin' | 'Endocannabinoid' | 'Tyrosine' | 'mTOR' | 'Growth Hormone' | 'Orexin'
    | 'Insulin' | 'Nitric Oxide' | 'Vagus Tone' | 'Lymph' | 'CSF' | 'Amygdala Suppression' | string;

export type Vector =
    | 'Cognitive' | 'Metabolic' | 'Thermal' | 'Musculoskeletal' | 'Circadian' | 'Social'
    | 'Autonomic' | 'Rest' | 'Focus' | 'Environment' | 'Nutritional';

export interface SchedulingConfig {
    type: 'daily' | 'weekly' | 'monthly' | 'monthly_relative' | 'interval';
    days?: string[]; // For weekly/daily (Mon, Tue)
    days_of_month?: number[]; // For monthly (1, 15)
    interval_days?: number; // For interval (every 3 days)
    week_num?: number; // For monthly relative (-1 = last)
    weekday?: string; // For monthly relative (Sun)
}

export interface Protocol {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    is_active: boolean;

    // Scientific Metadata (Parity with Habit)
    primary_driver?: PrimaryDriver;
    secondary_driver?: string;
    vector?: Vector;
    state?: number; // -5 to +5
    friction?: number; // 1-10

    // Scheduling (V11)
    scheduling_config?: SchedulingConfig;
    frequency_days?: string[]; // Legacy support

    time_of_day?: 'morning' | 'afternoon' | 'evening' | 'all_day';
    start_date?: string;
    end_date?: string;

    created_at?: string;
}

export interface Habit {
    id: string;
    user_id: string;
    protocol_id?: string;
    name: string;
    is_active: boolean;

    // Legacy Scheduling & Config
    frequency_days: string[]; // Legacy
    scheduling_config?: SchedulingConfig; // V11

    time_of_day: 'morning' | 'afternoon' | 'evening' | 'all_day';
    start_date?: string;
    end_date?: string;
    category?: string; // Stored (e.g. Focus, Body)
    emoji?: string; // Display Emoji
    protocol?: Protocol; // Joined Protocol Data

    // Legacy Metrics (Mapped to Scientific in UI)
    impact_score: number; // 1-10
    energy_cost: number; // 1-10 (Friction)

    // Scientific Config (V4)
    primary_driver: PrimaryDriver;
    secondary_driver?: string;
    vector: Vector;
    state: number; // -5 to +5
    friction: number; // 1-10 (Can mirror energy_cost)
    duration: number; // minutes

    created_at?: string;
}

export interface HabitLog {
    id: string;
    user_id: string;
    habit_id: string;
    completed_at: string;

    // Legacy Snapshots
    energy_cost_snapshot?: number;
    impact_score_snapshot?: number;
    reward_pathway_snapshot?: string;
}
