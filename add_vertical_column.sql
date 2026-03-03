-- ===================================================================
-- MASTERKEY OS: ADD MISSING VERTICAL COLUMN
-- Execute this in the Supabase SQL Editor
-- ===================================================================

-- Add 'vertical' column to businesses table if it doesn't already exist
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS vertical TEXT;

-- (Optional) Update existing classification to vertical for consistency
UPDATE public.businesses SET vertical = classification WHERE vertical IS NULL;
