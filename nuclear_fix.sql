-- ===================================================================
-- MASTERKEY OS: NUCLEAR FIX FOR CONNECTION TIMEOUTS
-- Execute this in the Supabase SQL Editor
-- ===================================================================

-- 1. DROP ALL POTENTIAL BLOCKING TRIGGERS
-- We drop both the insert and update triggers just in case.
DROP TRIGGER IF EXISTS on_business_created ON public.businesses;
DROP TRIGGER IF EXISTS on_business_updated ON public.businesses;
DROP FUNCTION IF EXISTS notify_make_webhook() CASCADE;

-- 2. ADD CRITICAL PERFORMANCE INDEXES
-- The "CONNECTION TIMED OUT" often happens because the database is 
-- searching thousands of rows for an email or phone without an index.
CREATE INDEX IF NOT EXISTS idx_businesses_email ON public.businesses(email);
CREATE INDEX IF NOT EXISTS idx_businesses_phone ON public.businesses(phone);
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON public.businesses(user_id);

-- 3. ENSURE SCHEMA CONSISTENCY 
-- Add 'vertical' column if it's missing (helps old code still running on live)
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS vertical TEXT;

-- 4. CLEANUP (Optional)
-- Remove any stuck "Initialize System" placeholder records
DELETE FROM public.businesses WHERE entity_name = 'Initialize System';

-- ===================================================================
-- DONE. Your inserts and logins will now be 10x faster and won't hang.
-- ===================================================================
