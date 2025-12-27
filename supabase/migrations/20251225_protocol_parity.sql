-- Migration: Protocol Parity (Add scientific fields to protocols)
-- Date: 2025-12-25

ALTER TABLE protocols 
ADD COLUMN IF NOT EXISTS primary_driver text,
ADD COLUMN IF NOT EXISTS secondary_driver text,
ADD COLUMN IF NOT EXISTS vector text,
ADD COLUMN IF NOT EXISTS state integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS friction integer DEFAULT 5,
ADD COLUMN IF NOT EXISTS frequency_days text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS time_of_day text DEFAULT 'all_day';

-- Update existing protocols with defaults if needed
UPDATE protocols SET state = 0 WHERE state IS NULL;
UPDATE protocols SET friction = 5 WHERE friction IS NULL;
