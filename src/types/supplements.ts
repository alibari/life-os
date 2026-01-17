export interface MolecularCompound {
    id: string;
    is_system?: boolean;
    name: string;
    category?: string;
    description?: string;
    benefits?: string[];
    default_dosage_amount?: number;
    default_dosage_unit?: string;
    scientific_link?: string;
}

export interface StackTemplate {
    id: string;
    is_system?: boolean;
    name: string;
    description?: string;
    benefits?: string[];
    compounds?: {
        library_id: string;
        dosage_amount: number;
        dosage_unit: string;
        form?: string;
        notes?: string;
    }[];
}

export interface SupplementStack {
    id: string;
    // ... existing fields ...
    user_id: string;
    name: string;
    description?: string;
    scheduling_config?: {
        days?: string[]; // Legacy/Fixed
        time?: string;
        type?: 'weekly' | 'cycle' | 'condition';
        cycle_on?: number;
        cycle_off?: number;
        start_date?: string;
        condition_id?: string;
    };
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
    supplements?: Supplement[]; // Joined data
}

export interface Supplement {
    id: string;
    user_id: string;
    stack_id?: string | null;
    name: string;
    dosage_amount?: number;
    dosage_unit?: string;
    form?: 'capsule' | 'tablet' | 'powder' | 'liquid' | 'gummy' | 'other' | string;
    frequency?: 'daily' | 'weekly' | 'as_needed' | string;
    time_of_day?: 'morning' | 'afternoon' | 'evening' | 'bedtime' | 'anytime' | string;
    status: 'active' | 'paused' | 'out_of_stock' | 'archived';
    inventory_count?: number;
    notes?: string;
    created_at?: string;
}

export interface SupplementPayload {
    stack_id?: string | null;
    name: string;
    dosage_amount?: number;
    dosage_unit?: string;
    form?: string;
    frequency?: string;
    time_of_day?: string;
    status?: string;
    inventory_count?: number;
    notes?: string;
}

// --- SCIENTIFIC MODULE TYPES ---

export interface Interaction {
    target_id?: string;
    target_name: string;
    type: 'Synergistic' | 'Antagonistic' | 'Dangerous';
    description: string;
    severity: 'Low' | 'Medium' | 'High';
}

export interface DosageStandard {
    min_effective: number;
    max_safe: number;
    unit: string;
    clinical_note?: string;
}

export interface ExperimentPhase {
    name: string; // e.g. "Baseline", "Intervention"
    duration_days: number;
    active_stacks: string[]; // Stack IDs active during this phase
}

export interface Experiment {
    id: string;
    user_id: string;
    name: string;
    hypothesis?: string;
    status: 'draft' | 'active' | 'completed' | 'paused';
    phases: ExperimentPhase[];
    current_phase_index: number;
    start_date?: string;
    created_at?: string;
}

export interface ExperimentLog {
    id: string;
    experiment_id: string;
    date: string;
    subjective_score: number;
    notes?: string;
    metrics_snapshot?: any;
}

