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

        let allData: any[] = [];
        let page = 0;
        const pageSize = 1000;
        // Safety cap mechanism: 100 pages = 100k records (likely plenty for <90 days)
        // User requested "load all needed data for the timespan", so we rely on range.
        const safetyMaxPages = 100;

        console.log(`[HealthService] Fetching ALL history for ${metricName} since ${fromDate.toISOString()}...`);

        while (page < safetyMaxPages) {
            const { data, error } = await supabase
                .from("health_metrics")
                .select("*")
                .eq("metric_name", metricName)
                .gte("recorded_at", fromDate.toISOString())
                .order("recorded_at", { ascending: false })
                .range(page * pageSize, (page + 1) * pageSize - 1);

            if (error) {
                console.error(`Error fetching page ${page}:`, error);
                break;
            }

            if (!data || data.length === 0) break;

            allData = [...allData, ...data];
            console.log(`[HealthService] Page ${page} fetched: ${data.length} rows. Total: ${allData.length}`);

            if (data.length < pageSize) break; // Reached the end of available data
            page++;
        }

        console.log(`[HealthService] Completed fetch. Total records: ${allData.length}`);
        return allData;
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

    /**
     * Helper: Fetch metadata (units) for discovered metrics.
     * Since RPC doesn't return units, we sample 1 row from each known metric.
     */
    async getMetricMetadata(metricNames: string[]): Promise<Record<string, string>> {
        if (!metricNames.length) return {};

        // Parallel fetch is okay for < 20 metrics
        const promises = metricNames.map(async (name) => {
            const { data } = await supabase
                .from("health_metrics")
                .select("unit")
                .eq("metric_name", name)
                .limit(1)
                .single();
            return { name, unit: data?.unit || "" };
        });

        const results = await Promise.all(promises);
        return results.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.unit }), {} as Record<string, string>);
    },

    async getWakeTime(date: Date = new Date()): Promise<Date | null> {
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
            // Strict Mode: Return null if no data found
            return null;
        }

        return new Date(data[0].recorded_at);
    },

    /**
     * Enhanced Audit: Fetches counts, first seen, and latest sync for all metrics
     */
    async getSystemAudit() {
        // @ts-ignore
        const { data, error } = await supabase.rpc('get_health_metrics_audit');

        if (error) {
            console.error("Audit RPC error:", error);
            // Fallback (empty) or throw, but let's handle gracefully
            return [];
        }

        // Map snake_case from RPC to camelCase for UI
        return (data || []).map((item: any) => ({
            name: item.name,
            count: item.count,
            firstSeen: item.first_seen,
            latestSync: item.latest_sync
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



    async generateFullExport(): Promise<any> {
        console.log("Starting full export generation...");

        // 1. Get all unique metrics using the reliable Audit RPC
        const auditData = await this.getSystemAudit();
        if (!auditData || auditData.length === 0) {
            console.warn("Export warning: No metrics found in audit.");
        }

        // Deduplicate names (Audit should be unique, but safety first)
        const metricNames = Array.from(new Set(auditData.map((u: any) => u.name))) as string[];
        console.log(`Found ${metricNames.length} unique metrics to export from Audit.`);

        // 2. Fetch Aggregated Data in Parallel (batching if needed, but 50-100 is fine)
        const exportData = await Promise.all(metricNames.map(async (name) => {
            // A. Get Unit (just take one)
            const { data: unitData } = await supabase
                .from("health_metrics")
                .select("unit")
                .eq("metric_name", name)
                .limit(1)
                .single();

            // B. Get Recent Data (Last 10)
            const { data: recentData } = await supabase
                .from("health_metrics")
                .select("value, unit, source, recorded_at")
                .eq("metric_name", name)
                .order("recorded_at", { ascending: false })
                .limit(10);

            // C. Get Min/Max (Efficient query)
            // Note: Supabase/PostgREST doesn't support easy "Select MIN(val)" directly without grouping or RPC.
            // Efficient workaround: Sort ASC limit 1, Sort DESC limit 1.
            const { data: minData } = await supabase
                .from("health_metrics")
                .select("value")
                .eq("metric_name", name)
                .order("value", { ascending: true })
                .limit(1)
                .single();

            const { data: maxData } = await supabase
                .from("health_metrics")
                .select("value")
                .eq("metric_name", name)
                .order("value", { ascending: false })
                .limit(1)
                .single();

            // D. Get Total Count
            const { count } = await supabase
                .from("health_metrics")
                .select("*", { count: 'exact', head: true })
                .eq("metric_name", name);

            return {
                metric_name: name,
                unit: unitData?.unit || "unknown",
                stats: {
                    min: minData?.value ?? null,
                    max: maxData?.value ?? null,
                    count: count || 0
                },
                recent_data: recentData || []
            };
        }));

        return {
            generated_at: new Date().toISOString(),
            system_version: "LifeOS v1.0",
            total_metrics: exportData.length,
            metrics: exportData
        };
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
    },

    async deleteAllData() {
        const { error } = await supabase
            .from("health_metrics")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000"); // Standard "Delete All" hack for Supabase if no filter 

        if (error) throw error;
    }
};
