-- Scientific Module Migration
-- Run this in your Supabase SQL Editor

-- 1. Upgrade Molecular Library
ALTER TABLE molecular_library 
ADD COLUMN IF NOT EXISTS interactions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS dosage_standards JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS citations JSONB DEFAULT '[]'::jsonb;

-- 2. Create Experiments Table
CREATE TABLE IF NOT EXISTS experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    hypothesis TEXT,
    status TEXT CHECK (status IN ('draft', 'active', 'completed', 'paused')) DEFAULT 'draft',
    phases JSONB NOT NULL DEFAULT '[]'::jsonb,
    current_phase_index INTEGER DEFAULT 0,
    start_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Experiment Logs
CREATE TABLE IF NOT EXISTS experiment_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    subjective_score INTEGER CHECK (subjective_score BETWEEN 1 AND 10),
    notes TEXT,
    metrics_snapshot JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. RLS Policies
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_logs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own experiments') THEN
        CREATE POLICY "Users can manage their own experiments" ON experiments
            FOR ALL USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own experiment logs') THEN
        CREATE POLICY "Users can manage their own experiment logs" ON experiment_logs
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END
$$;
