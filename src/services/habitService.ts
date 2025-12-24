
import { supabase } from "@/integrations/supabase/client";
import { HABIT_Biblio } from "./habitLibrary";
import type { Habit, HabitLog } from "@/types/habits";


export const habitService = {
    // Fetch all habits (for settings/management) - Returns EVERYTHING
    getHabits: async (): Promise<Habit[]> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data, error } = await supabase
            .from('habits')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    // FABRICATED: Create Multiple Habits (Import Protocol)
    importProtocol: async (habits: Partial<Habit>[]): Promise<string> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        if (habits.length === 0) return "No habits to import.";

        // 1. Fetch existing habits to prevent duplicates
        const { data: existingHabits } = await supabase
            .from('habits')
            .select('name')
            .eq('user_id', user.id);

        const existingNames = new Set((existingHabits || []).map(h => h.name));

        // 2. Filter out duplicates
        const newHabits = habits.filter(h => h.name && !existingNames.has(h.name));

        if (newHabits.length === 0) {
            return `All ${habits.length} habits in this protocol are already active.`;
        }

        const records = newHabits.map(h => ({
            ...h,
            user_id: user.id,
            is_active: true,
            start_date: new Date().toISOString()
        }));

        // 3. Insert new ones
        const { error } = await supabase
            .from('habits')
            .insert(records);

        if (error) throw error;

        return `Successfully imported ${newHabits.length} new habits (Skipped ${habits.length - newHabits.length} existing).`;
    },

    // Fetch only ACTIVE habits for today (for Widget/Day View)
    getActiveHabitsForToday: async (): Promise<Habit[]> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const now = new Date();

        const { data, error } = await supabase
            .from('habits')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true);

        if (error) throw error;

        // Filter by date range (client side for simplicity with ISO strings)
        return (data || []).filter((h: Habit) => {
            const start = h.start_date ? new Date(h.start_date) : new Date(0);
            const end = h.end_date ? new Date(h.end_date) : new Date(9999, 11, 31);
            return now >= start && now <= end;
        });
    },

    async createHabit(habit: Partial<Habit>) {
        const { data, error } = await supabase
            .from('habits')
            .insert(habit as any)
            .select()
            .single();

        if (error) throw error;
        return data as unknown as Habit;
    },

    async updateHabit(id: string, updates: Partial<Habit>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data, error } = await supabase
            .from('habits')
            .update(updates as any)
            .eq('id', id)
            .eq('user_id', user.id) // Security Hardening
            .select()
            .single();

        if (error) throw error;
        return data as unknown as Habit;
    },

    async deleteHabit(id: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { error } = await supabase
            .from('habits')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id); // Security Hardening
        if (error) throw error;
    },

    // --- Logs with Snapshotting ---
    async getHabitLogs() {
        // 1. Get user's habits first to ensure isolation
        const habits = await this.getHabits();
        const habitIds = habits.map(h => h.id);

        if (habitIds.length === 0) return [];

        const { data, error } = await supabase
            .from('habit_logs')
            .select('*')
            .in('habit_id', habitIds)
            // @ts-ignore
            .gte('completed_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()) // Fetch last year for accurate streaks
            .order('completed_at', { ascending: false });

        if (error) throw error;
        return data as unknown as HabitLog[];
    },

    async getDailyLogs(date: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // Ensure we match the normalization in logHabit
        const start = `${date}T00:00:00`;
        const end = `${date}T23:59:59`;

        const { data, error } = await supabase
            .from('habit_logs')
            .select('*')
            .eq('user_id', user.id)
            .gte('completed_at', start)
            .lte('completed_at', end);

        if (error) throw error;
        return data as unknown as HabitLog[];
    },

    async logHabit(habitId: string, completed_at: string, completed: boolean) { // completed boolean still useful for toggle logic
        // Use just the date part for the unique constraint check if we want one per day, 
        // BUT the schema might have changed? Let's assume we want to support multiple logs/day or just one?
        // For simplicity in this 'Life OS', one per day is usually the standard for habits.
        // Let's rely on the client passing a full ISO, but checking collision on Date.
        const datePart = completed_at.split('T')[0];

        if (completed) {
            // Fetch current habit details to snapshot
            const { data: habit, error: fetchError } = await supabase
                .from('habits')
                .select('energy_cost, impact_score, reward_pathway')
                .eq('id', habitId)
                .single();

            if (fetchError) throw fetchError;

            // Normalize to Midnight UTC for "One Log Per Day" consistency
            // This ensures uniqueness constraint works even if client sends different times
            const normalizedDate = new Date(completed_at);
            normalizedDate.setUTCHours(0, 0, 0, 0);
            const finalIso = normalizedDate.toISOString();

            // Upsert with snapshot
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from('habit_logs')
                .upsert({
                    habit_id: habitId,
                    user_id: user.id, // REQUIRED for unique constraint
                    completed_at: finalIso, // Normalized to T00:00:00.000Z
                    energy_cost_snapshot: habit.energy_cost,
                    impact_score_snapshot: habit.impact_score,
                    reward_pathway_snapshot: habit.reward_pathway
                } as any, { onConflict: 'user_id, habit_id, completed_at' })
                .select()
                .single();

            if (error) throw error;
            return data;
        } else {
            // Delete log if unchecked (approximate match on day)
            const startOfDay = `${datePart}T00:00:00`;
            const endOfDay = `${datePart}T23:59:59`;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { error } = await supabase
                .from('habit_logs')
                .delete()
                .eq('user_id', user.id) // Security: Ensure we only delete our own
                .eq('habit_id', habitId)
                .gte('completed_at', startOfDay)
                .lte('completed_at', endOfDay);
            if (error) throw error;
            return null;
        }
    },

    async toggleHabitLog(habitId: string, date: string, completed: boolean) {
        return this.logHabit(habitId, date, completed);
    },

    // --- Analytics v3.0 (Chemical & Bio-Cost) ---
    async getAdvancedMetrics() {
        const habits = await this.getHabits(); // Gets ALL habits
        const activeHabits = habits.filter(h => h.is_active); // Only metrics for active? Or all? Usually active.
        const logs = await this.getHabitLogs(); // Last 30 days

        // 1. System Load (Protocol Load)
        // Calculated from ACTIVE HABITS (The Plan), not just what was done.
        const totalEnergy = activeHabits.reduce((acc, h) => acc + (h.energy_cost || 0), 0);
        const systemLoad = totalEnergy; // Total daily load of the protocol

        // 2. Pathway Profile (Protocol Design)
        // Calculated from ACTIVE HABITS (The Plan)
        const pathwayCounts: Record<string, number> = {};
        let totalPathways = 0;

        activeHabits.forEach(h => {
            if (h.reward_pathway) {
                pathwayCounts[h.reward_pathway] = (pathwayCounts[h.reward_pathway] || 0) + 1;
                totalPathways++;
            }
        });

        const pathwayProfile = Object.keys(pathwayCounts).reduce((acc, key) => {
            acc[key] = Math.round((pathwayCounts[key] / (totalPathways || 1)) * 100);
            return acc;
        }, {} as Record<string, number>);

        // 3. Neuroplasticity Index
        const streaks = this.calculateStreaks(activeHabits, logs);
        const weightedStreakScore = activeHabits.reduce((acc, h) => {
            const streak = streaks[h.id] || 0;
            return acc + (streak * (h.impact_score || 1));
        }, 0);
        const neuroplasticity = Math.min(100, Math.round((weightedStreakScore / 1500) * 100));

        return {
            systemLoad,
            pathwayProfile,
            neuroplasticity,
            streaks
        };
    },

    calculateStreaks(habits: Habit[], logs: HabitLog[]) {
        const streaks: Record<string, number> = {};
        habits.forEach(h => {
            let currentStreak = 0;
            const today = new Date();
            for (let i = 0; i < 365; i++) {
                const d = new Date();
                d.setDate(today.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                // Check if any log exists for this date
                const hasLog = logs.some(l => l.habit_id === h.id && l.completed_at.startsWith(dateStr));
                if (hasLog) {
                    currentStreak++;
                } else if (i === 0) {
                    continue; // Today doesn't break streak yet
                } else {
                    break;
                }
            }
            streaks[h.id] = currentStreak;
        });
        return streaks;
    },

    /**
     * RESET & SEED (Library V2)
     */
    async resetAndSeed(userId: string) {
        console.log("Starting System Reset & Seeding...");

        const { error: deleteError } = await supabase.from('habits').delete().eq('user_id', userId);
        if (deleteError) throw deleteError;

        const habitsToInsert = HABIT_Biblio.map(h => ({
            ...h,
            user_id: userId,
            is_active: true,
            start_date: new Date().toISOString()
        }));

        const { error: insertError } = await supabase.from('habits').insert(habitsToInsert);
        if (insertError) throw insertError;
    },

    /**
     * PURE DELETE (Empty State)
     */
    async purgeAllHabits(userId: string) {
        console.log("Purging all habits...");
        const { error } = await supabase.from('habits').delete().eq('user_id', userId);
        if (error) throw error;
    }
};
