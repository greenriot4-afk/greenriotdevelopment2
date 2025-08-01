-- Update existing objects with incorrect type 'product' to have proper types
-- Based on their characteristics, we'll update them to 'abandoned' as default
UPDATE objects 
SET type = 'abandoned' 
WHERE type = 'product';

-- Add a comment for future reference
COMMENT ON COLUMN objects.type IS 'Object type: abandoned, donation, or product';