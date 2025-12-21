export type MetricID =
    | 'heart_rate_variability'
    | 'resting_heart_rate'
    | 'sleep_duration'
    | 'sleep_efficiency'
    | 'active_energy'
    | 'step_count'
    | 'respiratory_rate'
    | 'oxygen_saturation'
    | 'walking_steadiness'
    | 'recovery_score'   // Composite
    | 'readiness_score'  // Composite
    | 'focus_score';     // Composite

export type MetricCategory = 'recovery' | 'activity' | 'sleep' | 'vitals' | 'cognitive';

export type MetricType = 'raw' | 'derived' | 'composite';

export interface MetricDefinition {
    id: MetricID;
    name: string;
    category: MetricCategory;
    type: MetricType;
    unit: string;
    description: string;
    source: 'health_kit' | 'system_calc' | 'manual';

    // Time Scope: How far back do we look?
    timeScope: 'last_record' | '24h_avg' | '7d_avg' | 'projected';

    // Dependencies: If this is a formula, what does it need?
    dependencies?: MetricID[];

    // The Formula (for composite metrics) - documentation only for now
    formulaDescription?: string;

    // Validation thresholds (e.g., HRV cannot be negative)
    validation?: {
        min: number;
        max: number;
    }
}
