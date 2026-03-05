-- ===================================================================
-- MASTERKEY OS: FIX DUPLICATE BUSINESS PROFILES
-- Execute this in the Supabase SQL Editor
-- ===================================================================

-- 1. CLEANUP: Optional - Remove records that are exact duplicates 
-- (Keeps the oldest record for each email/phone)
DELETE FROM public.businesses a
USING public.businesses b
WHERE a.id > b.id
  AND (a.email = b.email OR a.phone = b.phone)
  AND a.email IS NOT NULL 
  AND a.phone IS NOT NULL;

-- 2. ADD UNIQUE CONSTRAINTS
-- This prevents the database from ever accepting duplicates again.
-- If these fail, it means you have existing duplicates that need manual cleanup.

ALTER TABLE public.businesses 
DROP CONSTRAINT IF EXISTS businesses_email_key;

ALTER TABLE public.businesses 
ADD CONSTRAINT businesses_email_key UNIQUE (email);

ALTER TABLE public.businesses 
DROP CONSTRAINT IF EXISTS businesses_phone_key;

ALTER TABLE public.businesses 
ADD CONSTRAINT businesses_phone_key UNIQUE (phone);

-- 3. ENSURE INDEXES ARE ALSO UNIQUE (Redundant but good for performance)
DROP INDEX IF EXISTS idx_businesses_email;
CREATE UNIQUE INDEX idx_businesses_email ON public.businesses(email);

DROP INDEX IF EXISTS idx_businesses_phone;
CREATE UNIQUE INDEX idx_businesses_phone ON public.businesses(phone);

-- ===================================================================
-- DONE. Duplicates are now blocked at the database level.
-- ===================================================================
