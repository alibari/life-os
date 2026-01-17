import { supabase } from "@/integrations/supabase/client";
import { Supplement, SupplementPayload, SupplementStack, MolecularCompound, StackTemplate, Experiment, Interaction, DosageStandard } from "@/types/supplements";

export const supplementService = {
    // --- AUTH ---
    getUser: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    // --- STACKS ---
    getStacks: async (): Promise<SupplementStack[]> => {
        const { data, error } = await supabase
            .from('supplement_stacks')
            .select(`
                *,
                supplements (*)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        // Ensure supplements array is initialized even if empty
        return data?.map(d => ({ ...d, supplements: d.supplements || [] })) || [];
    },

    getLibrary: async (): Promise<MolecularCompound[]> => {
        const { data, error } = await supabase
            .from('molecular_library')
            .select('*')
            .order('name');

        if (error) throw error;
        return data || [];
    },

    getTemplates: async (): Promise<StackTemplate[]> => {
        const { data, error } = await supabase
            .from('stack_templates')
            .select('*')
            .order('name');

        if (error) throw error;
        return data || [];
    },

    importTemplate: async (template: StackTemplate, userId: string): Promise<void> => {
        // 1. Create the Stack
        const { data: stackData, error: stackError } = await supabase
            .from('supplement_stacks')
            .insert({
                user_id: userId,
                name: template.name,
                description: template.description,
                is_active: false
            })
            .select()
            .single();

        if (stackError) throw stackError;

        // 2. Fetch Compounds (to get names if needed)
        const libraryIds = template.compounds?.map(c => c.library_id) || [];
        const { data: libraryItems } = await supabase
            .from('molecular_library')
            .select('*')
            .in('id', libraryIds);

        const supplementsToInsert = template.compounds?.map(c => {
            const libItem = libraryItems?.find(l => l.id === c.library_id);
            return {
                user_id: userId,
                stack_id: stackData.id,
                compound_id: c.library_id,
                name: libItem?.name || 'Unknown Compound',
                dosage_amount: c.dosage_amount,
                dosage_unit: c.dosage_unit,
                form: c.form || 'Standard',
                notes: c.notes,
                time_of_day: 'anytime'
            };
        });

        if (supplementsToInsert && supplementsToInsert.length > 0) {
            const { error: supError } = await supabase
                .from('supplements')
                .insert(supplementsToInsert);

            if (supError) throw supError;
        }
    },

    createStack: async (payload: { name: string, description?: string, scheduling_config?: any }) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data, error } = await supabase
            .from('supplement_stacks')
            .insert([{ ...payload, user_id: user.id }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    updateStack: async (id: string, updates: Partial<SupplementStack>) => {
        const { data, error } = await supabase
            .from('supplement_stacks')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    deleteStack: async (id: string) => {
        const { error } = await supabase
            .from('supplement_stacks')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // --- SUPPLEMENTS ---
    getSupplements: async (): Promise<Supplement[]> => {
        const { data, error } = await supabase
            .from('supplements')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    createSupplement: async (payload: SupplementPayload) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data, error } = await supabase
            .from('supplements')
            .insert([{ ...payload, user_id: user.id }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    updateSupplement: async (id: string, updates: Partial<SupplementPayload>) => {
        const { data, error } = await supabase
            .from('supplements')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    deleteSupplement: async (id: string) => {
        const { error } = await supabase
            .from('supplements')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    purgeAllStacks: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        await supabase.from('supplements').delete().eq('user_id', user.id);
        await supabase.from('supplement_stacks').delete().eq('user_id', user.id);
    },

    // --- EXPERIMENTS ---
    getExperiments: async (): Promise<Experiment[]> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data, error } = await supabase
            .from('experiments')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    createExperiment: async (payload: Partial<Experiment>) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data, error } = await supabase
            .from('experiments')
            .insert({ ...payload, user_id: user.id })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    updateExperiment: async (id: string, updates: Partial<Experiment>) => {
        const { data, error } = await supabase
            .from('experiments')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // --- SCIENCE ENGINE (Validation) ---
    checkInteractions: async (stackId: string): Promise<Interaction[]> => {
        // 1. Fetch supplements in stack
        const { data: supps } = await supabase.from('supplements').select('name').eq('stack_id', stackId);
        if (!supps || supps.length < 2) return [];

        // 2. Mock Logic (Real would query molecular_library.interactions)
        // We will improve this when we support querying specific JSONB keys
        const warnings: Interaction[] = [];
        const names = supps.map(s => s.name.toLowerCase());

        // Hardcoded Safety Checks (for demo/fallback)
        if (names.some(n => n.includes('zinc')) && names.some(n => n.includes('magnesium'))) {
            warnings.push({
                target_name: 'Zinc + Magnesium',
                type: 'Antagonistic',
                description: 'High doses of Zinc can inhibit Magnesium absorption. Split doses.',
                severity: 'Low'
            });
        }
        if (names.some(n => n.includes('caffeine')) && names.some(n => n.includes('theanine'))) {
            warnings.push({
                target_name: 'Caffeine + L-Theanine',
                type: 'Synergistic',
                description: 'L-Theanine mitigates jitteriness from Caffeine.',
                severity: 'Low' // Good synergy
            });
        }
        if (names.some(n => n.includes('5-htp')) && names.some(n => n.includes('ssri'))) {
            warnings.push({
                target_name: '5-HTP + SSRIs',
                type: 'Dangerous',
                description: 'Risk of Serotonin Syndrome. Do not combine.',
                severity: 'High'
            });
        }

        return warnings;
    },

    validateDosage: async (supplement: Supplement): Promise<DosageStandard | null> => {
        // Mock Implementation: Return standard if known, regardless of validation status
        const name = supplement.name.toLowerCase();

        if (name.includes('zinc')) {
            return { min_effective: 15, max_safe: 40, unit: 'mg', clinical_note: 'Upper Limit 40mg/day.' };
        }
        if (name.includes('vitamin d')) {
            return { min_effective: 2000, max_safe: 10000, unit: 'IU', clinical_note: 'Daily maintenance.' };
        }
        if (name.includes('magnesium')) {
            return { min_effective: 200, max_safe: 420, unit: 'mg', clinical_note: 'RDA (Elemental).' };
        }
        if (name.includes('omega') || name.includes('fish oil')) {
            return { min_effective: 1000, max_safe: 4000, unit: 'mg', clinical_note: 'EPA+DHA Combined.' };
        }
        if (name.includes('creatine')) {
            return { min_effective: 3000, max_safe: 5000, unit: 'mg', clinical_note: 'Daily saturation.' };
        }

        return null; // Unknown compound
    }
};
