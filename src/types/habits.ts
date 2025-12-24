export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'all_day';
export type RewardPathway = 'dopamine_drive' | 'serotonin_satisfaction' | 'endorphin_relief' | 'oxytocin_connection' | 'cortisol_reduction';

export interface Habit {
    id: string;
    user_id: string;
    name: string;
    category: string;
    type: 'positive' | 'negative';
    time_of_day: TimeOfDay;
    energy_cost: number; // 1-10
    impact_score: number; // 1-10
    duration_minutes: number;
    reward_pathway: RewardPathway;
    is_active: boolean;
    start_date?: string; // ISO
    end_date?: string; // ISO
    frequency_days?: string[];
    streak: number;
    created_at: string;
}

export interface HabitLog {
    id: string;
    habit_id: string;
    completed_at: string; // ISO
    quality_rating?: number; // 1-5
    energy_cost_snapshot?: number;
    impact_score_snapshot?: number;
    reward_pathway_snapshot?: string;
}
