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
        const { name, units, data: points } = metric;

        if (!points) continue;

        console.log(`Processing metric: ${name} (${points.length} points)`);

        for (const point of points) {
            if (point.qty === null || point.qty === undefined) continue;

            // Manual parsing for "2025-09-23 6:12:00 PM +0200" to ensure correctness
            // But new Date() usually handles this format in Node too.
            records.push({
                metric_name: name,
                unit: units,
                value: point.qty,
                source: point.source || 'Unknown Source',
                recorded_at: new Date(point.date).toISOString()
            });
        }
    }

    console.log(`Total records to insert: ${records.length}`);

    const chunkSize = 100;
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
