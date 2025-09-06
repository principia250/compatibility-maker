-- Add note column to compatibilities table
ALTER TABLE compatibilities 
ADD COLUMN note TEXT NULL;

-- Add comment to the column
COMMENT ON COLUMN compatibilities.note IS 'Optional note for compatibility relationship';
