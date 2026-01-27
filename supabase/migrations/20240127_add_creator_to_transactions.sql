-- Add created_by column to transactions table
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS created_by text;

-- Update existing transactions to have a default value (optional, e.g., 'system' or null)
-- UPDATE public.transactions SET created_by = 'system' WHERE created_by IS NULL;
