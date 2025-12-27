-- 1. Create Enums
CREATE TYPE primary_driver_enum AS ENUM (
    'Dopamine', 'Norepinephrine', 'Acetylcholine', 'Serotonin', 'GABA', 
    'Cortisol', 'Endorphin', 'Oxytocin', 'Adenosine', 'Testosterone',
    'Melatonin', 'Dynorphin', 'Endocannabinoid' -- Added from seed data
);

CREATE TYPE vector_enum AS ENUM (
    'Cognitive', 'Metabolic', 'Thermal', 'Musculoskeletal', 'Circadian', 'Social'
);

-- 2. Create Protocols Table
CREATE TABLE IF NOT EXISTS protocols (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Update Habits Table
-- We will TRUNCATE first as requested
TRUNCATE TABLE habits CASCADE; 
TRUNCATE TABLE protocols CASCADE;

-- Drop old columns (Cleaning up)
ALTER TABLE habits 
    DROP COLUMN IF EXISTS category,
    DROP COLUMN IF EXISTS energy_cost,
    DROP COLUMN IF EXISTS impact_score,
    DROP COLUMN IF EXISTS reward_pathway,
    DROP COLUMN IF EXISTS time_of_day,
    DROP COLUMN IF EXISTS frequency_days,
    DROP COLUMN IF EXISTS start_date,
    DROP COLUMN IF EXISTS end_date;

-- Add new columns
ALTER TABLE habits
    ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT '⚡',
    ADD COLUMN IF NOT EXISTS protocol_id UUID REFERENCES protocols(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS primary_driver primary_driver_enum,
    ADD COLUMN IF NOT EXISTS vector vector_enum,
    ADD COLUMN IF NOT EXISTS state INTEGER DEFAULT 0 CHECK (state >= -5 AND state <= 5),
    ADD COLUMN IF NOT EXISTS friction INTEGER DEFAULT 1 CHECK (friction >= 1 AND friction <= 10),
    ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 15;

-- 4. Enable RLS on Protocols
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own protocols" ON protocols
    FOR ALL USING (auth.uid() = user_id);

-- 5. Seed Data
-- We need a User ID. Since this migration runs as admin, we often don't know the specific user ID to seed for.
-- However, strict instructions were "Seed: Insert these 2 Test Protocols".
-- To do this safely in SQL without a hardcoded User ID, we might need to skip active seeding HERE and do it via the App or a separate script.
-- BUT, if I assume the user "eaaf2dbd-44df-43ed-b599-6d7619c01994" (from previous context) is the target, I can seed.
-- Better approach: Creates a function to seed for the current user, or just leave tables empty and let the 'reset' button in UI trigger the seed?
-- User said: "Seed: Insert these 2 Test Protocols... to validate the engine."
-- I'll insert a placeholder user_id or try to select one. 
-- RISK: Inserting with NULL user_id might fail RLS or constraints.
-- Let's make user_id nullable for protocols/habits temporarily? No, that breaks security.
-- I'll use the ID `eaaf2dbd-44df-43ed-b599-6d7619c01994` which I saw earlier.

DO $$
DECLARE
    target_user_id UUID := 'eaaf2dbd-44df-43ed-b599-6d7619c01994';
    p1_id UUID;
    p2_id UUID;
BEGIN
    -- Only seed if the user exists
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
        
        -- Protocol 1: Morning Baseline
        INSERT INTO protocols (user_id, name, description, is_active)
        VALUES (target_user_id, '☀️ Morning Baseline (High Output)', 'Circadian entrainment and metabolic activation.', true)
        RETURNING id INTO p1_id;

        INSERT INTO habits (user_id, protocol_id, emoji, name, primary_driver, vector, state, friction, duration)
        VALUES 
            (target_user_id, p1_id, '☀️', 'Morning Sunlight', 'Cortisol', 'Circadian', 2, 2, 10),
            (target_user_id, p1_id, '🌊', 'Cold Shower', 'Norepinephrine', 'Thermal', 5, 8, 2),
            (target_user_id, p1_id, '🏃', 'Zone 2 Cardio', 'Endocannabinoid', 'Metabolic', 3, 6, 30);

        -- Protocol 2: Evening Downshift
        INSERT INTO protocols (user_id, name, description, is_active)
        VALUES (target_user_id, '🌙 Evening Downshift (Deep Recovery)', 'Parasympathetic nervous system activation.', false)
        RETURNING id INTO p2_id;

        INSERT INTO habits (user_id, protocol_id, emoji, name, primary_driver, vector, state, friction, duration)
        VALUES 
            (target_user_id, p2_id, '🚫', 'No Screens (8 PM)', 'Melatonin', 'Circadian', -3, 6, 120),
            (target_user_id, p2_id, '🛁', 'Hot Bath', 'Dynorphin', 'Thermal', -3, 3, 15),
            (target_user_id, p2_id, '📖', 'Fiction Reading', 'Serotonin', 'Cognitive', -3, 3, 30);
            
    END IF;
END $$;
