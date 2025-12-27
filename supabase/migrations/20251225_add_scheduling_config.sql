-- Add scheduling_config JSONB column to support advanced frequencies
ALTER TABLE protocols 
ADD COLUMN IF NOT EXISTS scheduling_config JSONB DEFAULT '{"type": "daily", "days": ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]}';

ALTER TABLE habits 
ADD COLUMN IF NOT EXISTS scheduling_config JSONB DEFAULT '{"type": "daily", "days": ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]}';

-- Comment explaining the structure
COMMENT ON COLUMN protocols.scheduling_config IS 'Flexible scheduling: {type: daily|weekly|monthly, days:[], interval:3, ...}';
