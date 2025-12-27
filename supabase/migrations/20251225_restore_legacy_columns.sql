-- Restore Legacy Columns for Hybrid System

ALTER TABLE habits
    ADD COLUMN IF NOT EXISTS frequency_days TEXT[] DEFAULT ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    ADD COLUMN IF NOT EXISTS time_of_day TEXT DEFAULT 'all_day',
    ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Focus',
    ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ DEFAULT now(),
    ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS impact_score INTEGER DEFAULT 5,
    ADD COLUMN IF NOT EXISTS energy_cost INTEGER DEFAULT 5,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Ensure constraints (optional, but good for data integrity)
-- We check frequency_days is not null? Default handles it.
