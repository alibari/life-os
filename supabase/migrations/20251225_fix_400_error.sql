-- Fix 400 Bad Request by ensuring all new columns exist
-- Run this in Supabase SQL Editor

-- 1. Add Secondary Driver and Dates to HABITS
ALTER TABLE habits
    ADD COLUMN IF NOT EXISTS secondary_driver TEXT,
    ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ DEFAULT now(),
    ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;

-- 2. Add Dates to PROTOCOLS (if missed)
ALTER TABLE protocols 
    ADD COLUMN IF NOT EXISTS start_date TEXT,
    ADD COLUMN IF NOT EXISTS end_date TEXT;
