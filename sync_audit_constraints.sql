-- ==========================================
-- MASTERKEY OS: AUDIT UNIQUE CONSTRAINTS
-- Execute this in the Supabase SQL Editor
-- This ensures one record per business per audit type,
-- which allows UPSERT to work correctly for syncing.
-- ==========================================

-- 1. Loss Audit
ALTER TABLE public.loss_audit_results ADD CONSTRAINT unique_loss_business UNIQUE (business_id);

-- 2. AI Threat
ALTER TABLE public.ai_threat_results ADD CONSTRAINT unique_threat_business UNIQUE (business_id);

-- 3. Night Loss
ALTER TABLE public.night_loss_results ADD CONSTRAINT unique_night_business UNIQUE (business_id);

-- 4. Visibility
ALTER TABLE public.visibility_results ADD CONSTRAINT unique_visibility_business UNIQUE (business_id);
