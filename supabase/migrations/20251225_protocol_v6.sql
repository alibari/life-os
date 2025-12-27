-- Protocol V6: Add Scheduling (Dates)
-- Date: 2025-12-25

ALTER TABLE protocols 
ADD COLUMN IF NOT EXISTS start_date text,
ADD COLUMN IF NOT EXISTS end_date text;

-- Ensure previous columns exist (in case user missed V5.4 migration)
ALTER TABLE protocols 
ADD COLUMN IF NOT EXISTS frequency_days text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS time_of_day text DEFAULT 'all_day';
