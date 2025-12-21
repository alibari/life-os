import { healthService, HealthMetric } from "@/services/health";
import { supabase } from "@/integrations/supabase/client";
import { METRIC_REGISTRY } from "../registry/metrics";
import { MetricID } from "../registry/types";

export interface MetricResult {
    value: number;
    timestamp: string;
    source: string;
    isStale?: boolean;
}

/**
 * The Repository restricts access to data based on the Scientific Registry.
 * Components ask for an ID, the Repo handles the fetching logic.
 */
export const metricRepository = {
    /**
     * Get the single latest valid value for a metric
     */
    async getLatest(metricId: MetricID): Promise<MetricResult | null> {
        const definition = METRIC_REGISTRY[metricId];
        if (!definition) {
            console.warn(`[Repo] Unknown metric ID: ${metricId}`);
            return null;
        }

        // 1. If it's a raw metric, fetch from Supabase via Health Service
        if (definition.type === 'raw') {
            // In a real app we might cache this in React Query, 
            // but the Repo layer can also hold simple cache logic if needed.
            const data = await healthService.getLatestMetric(metricId);

            if (!data) return null;

            return {
                value: Number(data.value),
                timestamp: data.recorded_at,
                source: data.source
            };
        }

        // 2. If it's a composite, we would calculate it here (Logic Layer)
        // For now, composites like 'recovery_score' are calculated in the UI or hook,
        // but typically the Repo would ask the Engine to solve it.
        return null;
    },

    /**
     * Get the trend over N days
     */
    async getTrend(metricId: MetricID, days: number = 7): Promise<MetricResult[]> {
        const data = await healthService.getMetricHistory(metricId, days);
        return data.map(d => ({
            value: Number(d.value),
            timestamp: d.recorded_at,
            source: d.source
        }));
    },

    /**
     * Get trends for multiple metrics efficiently
     */
    async getMultiTrend(metricIds: MetricID[], days: number = 7): Promise<Record<MetricID, MetricResult[]>> {
        // Filter for raw metrics (composites would need calc engine)
        const rawMetrics = metricIds.filter(id => METRIC_REGISTRY[id]?.type === 'raw');

        const data = await healthService.getMultiMetricHistory(rawMetrics, days);

        // Initialize result object
        const result: Record<string, MetricResult[]> = {};
        metricIds.forEach(id => result[id] = []);

        // Group data points
        data.forEach(d => {
            if (result[d.metric_name]) {
                result[d.metric_name].push({
                    value: Number(d.value),
                    timestamp: d.recorded_at,
                    source: d.source
                });
            }
        });

        return result;
    },

    /**
     * Get average value for a metric between two dates (inclusive)
     */
    async getAverage(metricId: MetricID, startDate: Date, endDate: Date): Promise<number | null> {
        const definition = METRIC_REGISTRY[metricId];
        if (definition?.type !== 'raw') return null; // Only raw supported for now

        const { data, error } = await supabase
            .from("health_metrics")
            .select("value")
            .eq("metric_name", metricId)
            .gte("recorded_at", startDate.toISOString())
            .lte("recorded_at", endDate.toISOString());

        if (error || !data || data.length === 0) return null;

        const sum = data.reduce((acc, curr) => acc + Number(curr.value), 0);
        return sum / data.length;
    }
};
