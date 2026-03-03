-- Migration to add country column to visibility_results
ALTER TABLE public.visibility_results ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'India';
