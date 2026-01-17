import { supabase } from "@/integrations/supabase/client";
import { HABIT_Biblio, PROTOCOL_BUNDLES } from "./habitLibrary";
import { RAW_HABITS, RAW_PROTOCOLS } from "@/data/scientificHabits";
import type { Habit, HabitLog, Vector, Protocol } from "@/types/habits";

import { isScheduledForToday, freqMap } from "@/lib/scheduling";



const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const habitService = {

    // Fetch Habits (Hybrid: Protocol + Standalone)
    getHabits: async (): Promise<Habit[]> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data, error } = await supabase
            .from('habits')
            .select(`
                *,
                protocol:protocols!protocol_id (
                    id,
                    name,
                    is_active,
                    scheduling_config
                )
            `)
            .eq('user_id', user.id)
            .order('time_of_day', { ascending: false })
            .order('name');

        if (error) throw error;
        return data as unknown as Habit[];
    },

    // Fetch Protocols for "Top of List" view
    getProtocols: async (): Promise<Protocol[]> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data, error } = await supabase
            .from('protocols')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at');

        if (error) throw error;
        return data as Protocol[];
    },

    // Hybrid Filter Logic: Date + Frequency + Active
    getActiveHabitsForToday: async (): Promise<Habit[]> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        // 1. Get Logged Habits (completed today)
        const startOfDay = new Date(todayStr); // UTC assumption or User Local? 
        // Better: Use the date string to form ISO Range for the whole day
        const start = `${todayStr}T00:00:00`;
        const end = `${todayStr}T23:59:59`;

        const { data: logs } = await supabase
            .from('habit_logs')
            .select('habit_id')
            .gte('completed_at', start)
            .lte('completed_at', end);

        const loggedIds = new Set(logs?.map(l => l.habit_id));

        // 2. Get Active Habits
        const { data: habits, error } = await supabase
            .from('habits')
            .select(`
                *,
                protocol:protocols!protocol_id (
                    id,
                    name,
                    is_active,
                    scheduling_config
                )
            `)
            .eq('user_id', user.id);

        if (error) throw error;

        // 3. Filter
        const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const currentDay = dayMap[now.getDay()];

        return (habits || []).filter((h: any) => {
            const protocol = h.protocol; // Explicit Alias

            // ROBUST PARSING: Ensure configs are Objects, not JSON Strings
            // (Fixes issue where stringified JSON causes 'daily' default override)
            let protocolConfig = protocol?.scheduling_config;
            if (typeof protocolConfig === 'string') {
                try { protocolConfig = JSON.parse(protocolConfig); } catch (e) { }
            }

            let habitConfig = h.scheduling_config;
            if (typeof habitConfig === 'string') {
                try { habitConfig = JSON.parse(habitConfig); } catch (e) { }
            }

            // Check Protocol Status & Schedule (Priority)
            if (protocol) {
                // 1. Protocol Active Check (Master Switch)
                if (protocol.is_active === false) return false;

                // 2. Habit Active Check (Sub-Switch) - Allows pausing specific habit in active protocol
                if (h.is_active === false) return false;

                // 3. Protocol Schedule Check
                // V11 Protocol Schedule
                if (protocolConfig && protocolConfig.type !== 'daily') {
                    if (!isScheduledForToday(protocolConfig)) {
                        return false;
                    }
                }
                // Legacy Protocol Schedule
                else if (protocol.frequency_days && protocol.frequency_days.length > 0) {
                    if (!protocol.frequency_days.includes(currentDay)) return false;
                }

                // 4. Individual Habit Schedule Check (Overrides Protocol)
                // Hybrid Heuristic for Protocol-Bound Habits
                const isComplexConfig = habitConfig && habitConfig.type !== 'daily';

                if (isComplexConfig) {
                    // FIX: Pass start_date for Interval calculations
                    if (!isScheduledForToday(habitConfig, h.start_date)) {
                        return false;
                    }
                } else {
                    // Fallback to Legacy Frequency Days (if "Daily" or null)
                    let freqDays = h.frequency_days;

                    // 1. Parse String if needed (Robustness)
                    if (typeof freqDays === 'string') {
                        try {
                            freqDays = JSON.parse(freqDays);
                        } catch (e) {
                            const clean = freqDays.replace(/[{}"'\[\]]/g, '');
                            freqDays = clean.split(',').map((s: string) => s.trim());
                        }
                    }

                    if (freqDays && Array.isArray(freqDays) && freqDays.length > 0) {
                        // 2. Normalize & Compare
                        const normalizedFreq = freqDays.map((d: string) => d.slice(0, 3));
                        if (!normalizedFreq.includes(currentDay)) return false;
                    }
                    // If no legacy days, assume Daily (Config was 'daily' or null) -> matched.
                }

                // If Protocol Checks passed, we INCLUDE it.
                return true;
            }

            // Standalone Habit Schedule
            // (Only check these if NO protocol exists)
            if (!protocol) {
                // 1. Standalone Active Check
                if (h.is_active === false) return false;

                // 2. Hybrid Scheduling Heuristic
                // A. Check for "Complex" V11 Schedule (Interval, Monthly, or Explicit Weekly)
                // We trust these over legacy fields because they imply specific modern intent.
                const isComplexConfig = habitConfig && habitConfig.type !== 'daily';

                if (isComplexConfig) {
                    // FIX: Pass start_date for Interval calculations
                    if (!isScheduledForToday(habitConfig, h.start_date)) return false;
                    return true; // Trusted Complex Config matched today
                }

                // B. Fallback to Legacy Frequency Days
                // If config is just "Daily" (weak default), we check if legacy frequency days exist.
                // Robustness FIX: Handle string cases and full day names (Monday vs Mon)
                let freqDays = h.frequency_days;

                // 1. Parse String if needed
                if (typeof freqDays === 'string') {
                    try {
                        // Try JSON (common in Supabase text/json columns)
                        freqDays = JSON.parse(freqDays);
                    } catch (e) {
                        // Fallback: CSV or Postgres Array style ({Mon,Tue})
                        const clean = freqDays.replace(/[{}"'\[\]]/g, '');
                        freqDays = clean.split(',').map((s: string) => s.trim());
                    }
                }

                if (freqDays && Array.isArray(freqDays) && freqDays.length > 0) {
                    // 2. Normalize & Compare (Handle 'Monday' vs 'Mon')
                    const normalizedFreq = freqDays.map((d: string) => d.slice(0, 3));
                    if (!normalizedFreq.includes(currentDay)) return false;
                    return true; // Legacy constraint matched
                }

                // C. Default to Daily (Active)
                // If no complex config and no legacy text, it's a daily habit.
                return true;
            }
            return false;
        }).map((h: any) => ({
            ...h,
            protocol: h.protocol,
            completed: loggedIds.has(h.id)
        }));
    },

    // CRUD
    createHabit: async (habit: Partial<Habit>) => {
        const { data, error } = await supabase
            .from('habits')
            .insert(habit as any)
            .select()
            .single();
        if (error) {
            console.error("Supabase Create Internal Error:", error);
            throw error;
        }
        return data;
    },

    updateHabit: async (id: string, updates: Partial<Habit>) => {
        const { data, error } = await supabase
            .from('habits')
            .update(updates as any)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    deleteHabit: async (id: string) => {
        const { error } = await supabase
            .from('habits')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // --- PROTOCOL CRUD ---
    createProtocol: async (protocol: Partial<Protocol>) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user");

        const { data, error } = await supabase
            .from('protocols')
            .insert({ ...protocol, user_id: user.id })
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    updateProtocol: async (id: string, updates: Partial<Protocol>) => {
        const { data, error } = await supabase
            .from('protocols')
            .update(updates as any)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    deleteProtocol: async (id: string) => {
        const { error } = await supabase
            .from('protocols')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // Import Logic (Legacy Library)
    importProtocol: async (habits: Partial<Habit>[]): Promise<string> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        if (habits.length === 0) return "No habits.";

        const records = habits.map(h => ({
            user_id: user.id,
            name: h.name, // Explicitly map fields to avoid spreading legacy columns
            is_active: true,
            scheduling_config: h.scheduling_config || { type: 'daily', days: [] },
            vector: h.vector || 'Cognitive',
            primary_driver: h.primary_driver || 'Dopamine',
            secondary_driver: h.secondary_driver,
            friction: h.friction || 1,
            state: h.state || 0,
            duration: h.duration || 15,
            time_of_day: h.time_of_day || 'all_day',
            protocol_id: h.protocol_id
        }));

        const { error } = await supabase.from('habits').insert(records);
        if (error) throw error;
        return `Imported ${habits.length} habits.`;
    },

    // Metrics (Updated)
    getScientificMetrics: async () => {
        const habits = await habitService.getActiveHabitsForToday();

        // 1. Allostatic Load (Duration Weighted)
        // Formula: Sum(Friction * Log2(Duration + 1))
        const systemLoad = Math.round(habits.reduce((acc, h) => {
            const durationFactor = Math.log2((h.duration || 1) + 1);
            return acc + ((h.friction || 0) * durationFactor);
        }, 0));

        // 2. The 6-Axis Neuro-Map
        const neuroProfile = {
            'Drive': 0, 'Focus': 0, 'Strength': 0,
            'Energy': 0, 'Calm': 0, 'Joy': 0
        };

        // Helper to map Driver -> Axis
        const mapDriverToAxis = (driver: string): keyof typeof neuroProfile | null => {
            const d = driver?.toLowerCase().trim();
            if (['dopamine', 'tyrosine', 'orexin', 'endocannabinoid'].includes(d)) return 'Drive'; // Moved Endocan to Drive? No, Audit said Joy. Let's start with Drive but user said Joy for runner high. Wait audit said Joy.
            // Let's stick to the Audit:
            if (['dopamine', 'tyrosine', 'orexin'].includes(d)) return 'Drive';
            if (['acetylcholine', 'norepinephrine', 'glutamate'].includes(d)) return 'Focus'; // Cold Shower (Norepi) -> Focus
            if (['testosterone', 'growth hormone', 'mtor', 'dynorphin'].includes(d)) return 'Strength';
            if (['adrenaline', 'cortisol', 'insulin', 'nitric oxide', 'lymph', 'csf'].includes(d)) return 'Energy'; // Cold Plunge (Adrenaline) -> Energy
            if (['gaba', 'adenosine', 'melatonin', 'vagus tone', 'amygdala suppression', 'co2 tolerance'].includes(d)) return 'Calm';
            if (['serotonin', 'oxytocin', 'endorphin', 'endocannabinoid'].includes(d)) return 'Joy'; // Endocan moved to Joy
            return null;
        };

        habits.forEach(h => {
            const intensity = Math.abs(h.state || 1); // |State| is volume

            // Primary Driver (100% Weight)
            const pAxis = mapDriverToAxis(h.primary_driver);
            if (pAxis) neuroProfile[pAxis] += (intensity * 1.0);

            // Secondary Driver (50% Weight)
            if (h.secondary_driver) {
                const sAxis = mapDriverToAxis(h.secondary_driver);
                if (sAxis) neuroProfile[sAxis] += (intensity * 0.5);
            }
        });

        // 3. Sympathetic vs Parasympathetic Tone (Dual Bar)
        const sympathetic = habits.reduce((acc, h) => (h.state < 0) ? acc + Math.abs(h.state) : acc, 0);
        const parasympathetic = habits.reduce((acc, h) => (h.state > 0) ? acc + h.state : acc, 0);

        return { systemLoad, neuroProfile, autonomicBalance: { sympathetic, parasympathetic } };
    },

    toggleHabitLog: async (habitId: string, date: string, completed: boolean) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user");

        const d = new Date(date);
        d.setUTCHours(0, 0, 0, 0);
        const iso = d.toISOString();

        if (completed) {
            const { error } = await supabase.from('habit_logs').upsert({
                habit_id: habitId,
                user_id: user.id,
                completed_at: iso
            }, { onConflict: 'user_id, habit_id, completed_at' });
            if (error) throw error;
        } else {
            const { error } = await supabase.from('habit_logs').delete()
                .eq('habit_id', habitId)
                .eq('user_id', user.id)
                .eq('completed_at', iso);
            if (error) throw error;
        }
    },

    getDailyLogs: async (date: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user");
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

    purgeAllHabits: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user");

        await supabase.from('habit_logs').delete().eq('user_id', user.id);
        await supabase.from('habits').delete().eq('user_id', user.id);
        await supabase.from('protocols').delete().eq('user_id', user.id);
    },

    // SEEDING V5 (Unified with V10 Library)
    seedScientificSystem: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user");

        // 1. Purge
        await supabase.from('habits').delete().eq('user_id', user.id);
        await supabase.from('protocols').delete().eq('user_id', user.id);

        // 2. Insert Protocols
        const protocolMap = new Map<string, string>(); // Name -> ID
        for (const p of PROTOCOL_BUNDLES) {
            const { data, error } = await supabase.from('protocols').insert({
                user_id: user.id,
                name: p.name,
                description: p.description,
                is_active: true, // Default active on seed
                scheduling_config: (p as any).scheduling_config
            }).select().single();
            if (error) throw error;
            protocolMap.set(p.name, data.id);
        }

        // 3. Insert Habits (From Biblio)
        for (const h of HABIT_Biblio) {
            // Find parent protocols
            const parentBundles = PROTOCOL_BUNDLES.filter(b => b.habits.includes(h.name || ''));

            const habitPayload = {
                user_id: user.id,
                name: h.name,
                primary_driver: h.primary_driver || 'Dopamine',
                secondary_driver: h.secondary_driver,
                vector: h.vector || 'Cognitive',
                state: h.state || 0,
                friction: h.friction || 5,
                duration: h.duration || 15,
                frequency_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], // Default Daily

                is_active: true,
                time_of_day: h.time_of_day || 'all_day'
            };

            if (parentBundles.length === 0) {
                // Standalone
                await habitService.createHabit(habitPayload);
            } else {
                // Create for each context
                for (const b of parentBundles) {
                    const pid = protocolMap.get(b.name);
                    await habitService.createHabit({ ...habitPayload, protocol_id: pid });
                }
            }
        }
    },


    // LIBRARY IMPORT
    importProtocolBundle: async (bundleId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user");

        const bundle = PROTOCOL_BUNDLES.find(b => b.id === bundleId);
        if (!bundle) throw new Error("Bundle not found");

        // 1. Create Protocol
        const { data: protocol, error: pError } = await supabase.from('protocols').insert({
            user_id: user.id,
            name: bundle.name,
            description: bundle.description,
            is_active: true
        }).select().single();

        if (pError) throw pError;

        // 2. Create Habits
        for (const habitName of bundle.habits) {
            let template = HABIT_Biblio.find(h => h.name === habitName);

            // 2b. Fallback: Trim match
            if (!template) {
                template = HABIT_Biblio.find(h => h.name?.trim() === habitName.trim());
            }

            if (template) {
                await habitService.createHabit({
                    user_id: user.id,
                    protocol_id: protocol.id,
                    name: template.name,
                    // Map legacy biblio fields if needed, or use defaults
                    primary_driver: (template as any).primary_driver || 'Dopamine',
                    secondary_driver: (template as any).secondary_driver,
                    vector: (template as any).vector || 'Cognitive',
                    friction: (template as any).friction || 3,
                    state: (template as any).state || 0,
                    duration: (template as any).duration || 15,
                    is_active: true,
                    scheduling_config: (template as any).scheduling_config || { type: 'daily', days: [] },
                    time_of_day: template.time_of_day as any || 'all_day'
                });
            } else {
                console.error(`[ImportProtocol] FAILED to find template for habit: "${habitName}" in bundle: ${bundle.name}`);
            }
        }
    },

    // SYNC: Update existing habits to match library definitions
    // (Fixes "Eat the Frog" missing secondary driver for existing users)
    syncHabitDefinitions: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user");

        const { data: userHabits } = await supabase.from('habits').select('*').eq('user_id', user.id);
        if (!userHabits) return "No habits found.";

        let updatedCount = 0;
        for (const h of userHabits) {
            // Fuzzy Match: Check if template name (with emoji) contains user name (legacy vanilla)
            // e.g. "🐸 Eat the Frog" includes "Eat the Frog" (Case Insensitive)
            const template = HABIT_Biblio.find(t =>
                t.name === h.name ||
                (t.name?.toLowerCase().includes(h.name.toLowerCase()) && h.name.length > 5) ||
                (h.name.toLowerCase().includes(t.name?.split(' ').slice(1).join(' ').toLowerCase() || 'xyz'))
            );

            if (template) {
                // Update Name (Standardize) + Scientific Fields
                await supabase.from('habits').update({
                    name: template.name, // Normalize Name to "Emj [Name]"
                    primary_driver: (template as any).primary_driver,
                    secondary_driver: (template as any).secondary_driver,
                    vector: (template as any).vector,
                    state: (template as any).state,
                    friction: (template as any).friction,
                    duration: (template as any).duration
                }).eq('id', h.id);
                updatedCount++;
            }
        }
        return `Synced ${updatedCount} habits with latest scientific data.`;
    }
};
