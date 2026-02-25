-- ==========================================
-- MASTERKEY OS: SCHEMA UPDATE
-- Execute this in the Supabase SQL Editor
-- ==========================================

-- 1. Add the missing `user_id` column to the `businesses` table
-- This allows linking a completed diagnostic to the Supabase authenticated edge session.

ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Ensure RLS policies don't immediately break if they aren't configured yet
-- (Optional/Recommended step to ensure they can write to businesses)
-- CREATE POLICY "Enable insert for authenticated users only"
-- ON "public"."businesses"
-- AS PERMISSIVE FOR INSERT
-- TO authenticated
-- WITH CHECK (true);
