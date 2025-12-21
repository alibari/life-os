# Health Data Ingestion

## Overview
This directory contains the local ingestion script to load Apple Watch health data from the "Health Auto Export" JSON file into the Supabase `health_metrics` table.

## Prerequisites
1. Run the SQL migration `supabase/migrations/20251221_create_health_metrics.sql` in your Supabase Dashboard SQL Editor.
2. Ensure `.env` contains valid `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

## Running the Ingestion Script
```bash
node scripts/ingest_test_data.js
```

This will:
- Read `Health data/Export santé Déc 2025.json`
- Parse all metrics (HRV, heart_rate, resting_heart_rate, sleep, etc.)
- Batch insert them into `health_metrics` table
- Display a progress indicator

## Expected Output
```
Reading file: /path/to/Health data/Export santé Déc 2025.json
Processing metric: apple_exercise_time (12351 points)
Processing metric: heart_rate_variability (1810 points)
...
Total records to insert: 984706
....................
Ingestion complete!
```

## Verifying the Data
After running the script, you can verify the data in Supabase or directly in the app:
1. Open the Life OS app (http://localhost:8080)
2. Navigate to "The Lab" page
3. Check the "Recovery Vitals" widget for real HRV and RHR values

## Troubleshooting
- **Error: Missing Supabase credentials**: Ensure `.env` is properly configured.
- **Error: relations not found**: Run the SQL migration first.
- **Slow ingestion**: The script processes in batches of 100. For 984k records, expect 3-5 minutes.
