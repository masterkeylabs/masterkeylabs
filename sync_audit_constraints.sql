-- ==========================================
-- MASTERKEY OS: AUDIT UNIQUE CONSTRAINTS (WITH CLEANUP)
-- Execute this in the Supabase SQL Editor
-- This script cleans duplicates before adding constraints.
-- ==========================================

-- 1. CLEANUP DUPLICATES (Keeping only the latest record per business)

-- Cleanup loss_audit_results
DELETE FROM public.loss_audit_results a
USING (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY business_id ORDER BY created_at DESC, id DESC) as rn
  FROM public.loss_audit_results
) b
WHERE a.id = b.id AND b.rn > 1;

-- Cleanup ai_threat_results
DELETE FROM public.ai_threat_results a
USING (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY business_id ORDER BY created_at DESC, id DESC) as rn
  FROM public.ai_threat_results
) b
WHERE a.id = b.id AND b.rn > 1;

-- Cleanup night_loss_results
DELETE FROM public.night_loss_results a
USING (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY business_id ORDER BY created_at DESC, id DESC) as rn
  FROM public.night_loss_results
) b
WHERE a.id = b.id AND b.rn > 1;

-- Cleanup visibility_results
DELETE FROM public.visibility_results a
USING (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY business_id ORDER BY created_at DESC, id DESC) as rn
  FROM public.visibility_results
) b
WHERE a.id = b.id AND b.rn > 1;


-- 2. ADD UNIQUE CONSTRAINTS

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_loss_business') THEN
        ALTER TABLE public.loss_audit_results ADD CONSTRAINT unique_loss_business UNIQUE (business_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_threat_business') THEN
        ALTER TABLE public.ai_threat_results ADD CONSTRAINT unique_threat_business UNIQUE (business_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_night_business') THEN
        ALTER TABLE public.night_loss_results ADD CONSTRAINT unique_night_business UNIQUE (business_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_visibility_business') THEN
        ALTER TABLE public.visibility_results ADD CONSTRAINT unique_visibility_business UNIQUE (business_id);
    END IF;
END $$;
