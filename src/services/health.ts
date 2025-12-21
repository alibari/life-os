import { supabase } from "@/integrations/supabase/client";

export interface HealthMetric {
    id: string;
    metric_name: string;
    value: number;
    unit: string;
    source: string;
    recorded_at: string;
}

export const healthService = {
    /**
     * Fetch the most recent value for a specific metric
     */
    async getLatestMetric(metricName: string): Promise<HealthMetric | null> {
        const { data, error } = await supabase
            .from("health_metrics")
            .select("*")
            .eq("metric_name", metricName)
            .order("recorded_at", { ascending: false })
            .limit(1)
            .single();

        if (error) {
            console.error(`Error fetching latest ${metricName}:`, error);
            return null;
        }

        return data;
    },

    /**
     * Fetch average value for a metric over the last N days
     */
    async getQuickAverage(metricName: string, days: number = 7): Promise<number | null> {
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - days);

        const { data, error } = await supabase
            .from("health_metrics")
            .select("value")
            .eq("metric_name", metricName)
            .gte("recorded_at", fromDate.toISOString());

        if (error || !data || data.length === 0) return null;

        const sum = data.reduce((acc, curr) => acc + Number(curr.value), 0);
        return sum / data.length;
    },

    async getMetricHistory(metricName: string, days: number = 7): Promise<HealthMetric[]> {
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - days);

        const { data, error } = await supabase
            .from("health_metrics")
            .select("*")
            .eq("metric_name", metricName)
            .gte("recorded_at", fromDate.toISOString())
            .order("recorded_at", { ascending: true })
            .limit(1000);

        if (error) {
            console.error(`Error fetching history for ${metricName}:`, error);
            return [];
        }

        return data || [];
    },

    /**
     * Fetch history for multiple metrics at once
     */
    async getMultiMetricHistory(metricNames: string[], days: number = 7): Promise<HealthMetric[]> {
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - days);

        const { data, error } = await supabase
            .from("health_metrics")
            .select("*")
            .in("metric_name", metricNames)
            .gte("recorded_at", fromDate.toISOString())
            .order("recorded_at", { ascending: true })
            .limit(2000);

        if (error) {
            console.error(`Error fetching multi-history:`, error);
            return [];
        }

        return data || [];
    },

    async getWakeTime(date: Date = new Date()): Promise<Date> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const { data, error } = await supabase
            .from("health_metrics")
            .select("recorded_at")
            .in("metric_name", ["step_count", "active_energy"])
            .gte("recorded_at", startOfDay.toISOString())
            .lte("recorded_at", endOfDay.toISOString())
            .order("recorded_at", { ascending: true })
            .limit(1);

        if (error || !data || data.length === 0) {
            const fallback = new Date(date);
            fallback.setHours(7, 0, 0, 0);
            return fallback;
        }

        return new Date(data[0].recorded_at);
    },

    /**
     * Enhanced Audit: Fetches counts, first seen, and latest sync for all metrics
     */
    async getSystemAudit() {
        const { data: metrics, error: mError } = await supabase
            .from("health_metrics")
            .select("metric_name, recorded_at")
            .order("recorded_at", { ascending: true });

        if (mError) throw mError;

        const auditData: Record<string, { count: number, min: string, max: string }> = {};

        metrics.forEach(m => {
            if (!auditData[m.metric_name]) {
                auditData[m.metric_name] = { count: 0, min: m.recorded_at, max: m.recorded_at };
            }
            auditData[m.metric_name].count++;
            if (m.recorded_at > auditData[m.metric_name].max) auditData[m.metric_name].max = m.recorded_at;
            if (m.recorded_at < auditData[m.metric_name].min) auditData[m.metric_name].min = m.recorded_at;
        });

        return Object.entries(auditData).map(([name, stats]) => ({
            name,
            count: stats.count,
            firstSeen: stats.min,
            latestSync: stats.max
        }));
    },

    async getRecentActivityFeed(): Promise<HealthMetric[]> {
        const { data, error } = await supabase
            .from("health_metrics")
            .select("*")
            .order("recorded_at", { ascending: false })
            .limit(15);

        if (error) return [];
        return data || [];
    },

    async getHardwareMetadata(): Promise<string[]> {
        const { data, error } = await supabase
            .from("health_metrics")
            .select("source")
            .limit(100);

        if (error) return ["Unknown Device"];
        const uniqueSources = Array.from(new Set(data.map(d => d.source)));
        return uniqueSources.length > 0 ? uniqueSources : ["Unknown Device"];
    },

    async bulkInsert(metrics: any[], onProgress?: (count: number) => void) {
        const BATCH_SIZE = 500;
        let processed = 0;

        for (let i = 0; i < metrics.length; i += BATCH_SIZE) {
            const batch = metrics.slice(i, i + BATCH_SIZE);
            const { error } = await supabase
                .from("health_metrics")
                .insert(batch);

            if (error) {
                console.error("Batch insert error:", error);
                throw error;
            }

            processed += batch.length;
            if (onProgress) onProgress(processed);
        }
    }
};
