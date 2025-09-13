-- Add can_copy column to compatibility_charts table
ALTER TABLE compatibility_charts 
ADD COLUMN can_copy BOOLEAN NOT NULL DEFAULT false;

-- Add comment to explain the column
COMMENT ON COLUMN compatibility_charts.can_copy IS 'Whether other users can copy this chart';
