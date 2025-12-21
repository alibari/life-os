import { MetricDefinition } from "./types";

export const METRIC_REGISTRY: Record<string, MetricDefinition> = {
    // --- RECOVERY ---
    heart_rate_variability: {
        id: "heart_rate_variability",
        name: "Heart Rate Variability (SDNN)",
        category: "recovery",
        type: "raw",
        unit: "ms",
        source: "health_kit",
        timeScope: "last_record",
        description: "Variation in time intervals between heartbeats. Higher is generally better for recovery.",
        validation: { min: 0, max: 200 }
    },
    resting_heart_rate: {
        id: "resting_heart_rate",
        name: "Resting Heart Rate",
        category: "recovery",
        type: "raw",
        unit: "bpm",
        source: "health_kit",
        timeScope: "last_record",
        description: "Baseline heart rate while fully at rest. Lower indicates efficient cardiac function.",
        validation: { min: 30, max: 120 }
    },
    recovery_score: {
        id: "recovery_score",
        name: "System Recovery",
        category: "recovery",
        type: "composite",
        unit: "%",
        source: "system_calc",
        timeScope: "24h_avg",
        description: "Bio-Logic calculation of physiological capacity based on HRV and RHR.",
        dependencies: ["heart_rate_variability", "resting_heart_rate"],
        formulaDescription: "((HRV - 30) / 70) * 50 + ((80 - RHR) / 40) * 50"
    },

    // --- SLEEP ---
    sleep_duration: {
        id: "sleep_duration",
        name: "Total Sleep",
        category: "sleep",
        type: "raw",
        unit: "hrs",
        source: "health_kit",
        timeScope: "last_record",
        description: "Total time asleep including all sleep stages.",
    },

    // --- ACTIVITY ---
    active_energy: {
        id: "active_energy",
        name: "Active Calories",
        category: "activity",
        type: "raw",
        unit: "kcal",
        source: "health_kit",
        timeScope: "24h_avg",
        description: "Energy burned over baseline metabolic rate.",
    },
    step_count: {
        id: "step_count",
        name: "Steps",
        category: "activity",
        type: "raw",
        unit: "steps",
        source: "health_kit",
        timeScope: "24h_avg",
        description: "Total steps taken during the day.",
    },

    // --- VITALS ---
    respiratory_rate: {
        id: "respiratory_rate",
        name: "Respiratory Rate",
        category: "vitals",
        type: "raw",
        unit: "br/m",
        source: "health_kit",
        timeScope: "24h_avg",
        description: "Breaths per minute during sleep.",
    },
};
