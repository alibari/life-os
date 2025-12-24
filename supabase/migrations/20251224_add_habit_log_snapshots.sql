-- Add snapshot columns to habit_logs to support historical tracking
ALTER TABLE habit_logs
ADD COLUMN IF NOT EXISTS energy_cost_snapshot INTEGER,
ADD COLUMN IF NOT EXISTS impact_score_snapshot INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reward_pathway_snapshot TEXT;

-- Add comment to explain purpose
COMMENT ON COLUMN habit_logs.energy_cost_snapshot IS 'Snapshot of habit energy cost at the time of completion';
COMMENT ON COLUMN habit_logs.impact_score_snapshot IS 'Snapshot of habit impact score at the time of completion';
COMMENT ON COLUMN habit_logs.reward_pathway_snapshot IS 'Snapshot of habit reward pathway (dopamine/serotonin/etc) at the time of completion';
