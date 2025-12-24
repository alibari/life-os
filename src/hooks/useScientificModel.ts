import { useState, useEffect } from "react";

export interface ScientificWeights {
    recovery_rhr_weight: number;
    recovery_hrv_weight: number;
    battery_decay_rate: number;
    battery_deep_work_cost: number;
    battery_nsdr_gain: number;
    readiness_sleep_weight: number;
    readiness_hrv_weight: number;
    readiness_mood_weight: number;
    focus_deep_work_weight: number;
    nutrition_hydration_weight: number;
    nutrition_calories_weight: number;
    nutrition_supplement_weight: number;
}

export const DEFAULT_WEIGHTS: ScientificWeights = {
    recovery_rhr_weight: 0.5,
    recovery_hrv_weight: 0.5,
    battery_decay_rate: 5,
    battery_deep_work_cost: 10,
    battery_nsdr_gain: 15,
    readiness_sleep_weight: 0.3,
    readiness_hrv_weight: 0.3,
    readiness_mood_weight: 0.4,
    focus_deep_work_weight: 1.0,
    nutrition_hydration_weight: 0.3,
    nutrition_calories_weight: 0.4,
    nutrition_supplement_weight: 0.3,
};

export function useScientificModel() {
    const [weights, setWeights] = useState<ScientificWeights>(() => {
        if (typeof window === "undefined") return DEFAULT_WEIGHTS;
        const saved = localStorage.getItem("scientific_weights");
        return saved ? JSON.parse(saved) : DEFAULT_WEIGHTS;
    });

    const updateWeight = (key: keyof ScientificWeights, value: number) => {
        const newWeights = { ...weights, [key]: value };
        setWeights(newWeights);
        localStorage.setItem("scientific_weights", JSON.stringify(newWeights));
    };

    const resetWeights = () => {
        setWeights(DEFAULT_WEIGHTS);
        localStorage.setItem("scientific_weights", JSON.stringify(DEFAULT_WEIGHTS));
    };

    return {
        weights,
        updateWeight,
        resetWeights,
        DEFAULTS: DEFAULT_WEIGHTS
    };
}
