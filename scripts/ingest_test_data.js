import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Helper to load env since we are running as a script
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase credentials in .env');
    console.error('Expected: VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const JSON_FILE_PATH = path.resolve('./Health data/Export santé Déc 2025.json');

async function ingestData() {
    console.log(`Reading file: ${JSON_FILE_PATH}`);
    const rawData = fs.readFileSync(JSON_FILE_PATH, 'utf-8');
    const jsonData = JSON.parse(rawData);

    const metrics = jsonData.data?.metrics;
    if (!metrics) {
        console.error('No metrics found in JSON');
        return;
    }

    const records = [];

    for (const metric of metrics) {
        const { name: rawName, units, data: points } = metric;
        const name = normalizeMetricName(rawName);

        if (!points) continue;

        console.log(`Processing metric: ${name} (from ${rawName}) - ${points.length} points`);

        for (const point of points) {
            if (point.qty === null || point.qty === undefined) continue;

            records.push({
                metric_name: name,
                unit: units,
                value: point.qty,
                source: point.source || 'Auto Export CLI',
                recorded_at: cleanDate(point.date)
            });
        }
    }

    function normalizeMetricName(name) {
        if (name.includes("heart_rate_variability")) return "heart_rate_variability";
        if (name.includes("resting_heart_rate")) return "resting_heart_rate";
        if (name.includes("step_count")) return "step_count";
        if (name.includes("active_energy")) return "active_energy";
        if (name.includes("sleep")) return "sleep_duration";
        if (name.includes("respiratory_rate")) return "respiratory_rate";
        return name;
    }

    function cleanDate(dateStr) {
        const sanitized = dateStr.replace(/\u202F/g, ' ');
        const date = new Date(sanitized);
        return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
    }

    console.log(`Total records to insert: ${records.length}`);

    const chunkSize = 500;
    for (let i = 0; i < records.length; i += chunkSize) {
        const chunk = records.slice(i, i + chunkSize);
        const { error } = await supabase.from('health_metrics').upsert(chunk);

        if (error) {
            console.error('Error inserting chunk:', error);
        } else {
            process.stdout.write(`.`);
        }
    }

    console.log('\nIngestion complete!');
}

ingestData();
