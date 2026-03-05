-- Add UNIQUE constraints to business_id columns to allow proper UPSERTing
-- Run this in Supabase SQL Editor

-- 1. loss_audit_results
ALTER TABLE public.loss_audit_results DROP CONSTRAINT IF EXISTS loss_audit_results_business_id_key;
ALTER TABLE public.loss_audit_results ADD CONSTRAINT loss_audit_results_business_id_key UNIQUE (business_id);

-- 2. ai_threat_results
ALTER TABLE public.ai_threat_results DROP CONSTRAINT IF EXISTS ai_threat_results_business_id_key;
ALTER TABLE public.ai_threat_results ADD CONSTRAINT ai_threat_results_business_id_key UNIQUE (business_id);

-- 3. night_loss_results
ALTER TABLE public.night_loss_results DROP CONSTRAINT IF EXISTS night_loss_results_business_id_key;
ALTER TABLE public.night_loss_results ADD CONSTRAINT night_loss_results_business_id_key UNIQUE (business_id);

-- 4. visibility_results
ALTER TABLE public.visibility_results DROP CONSTRAINT IF EXISTS visibility_results_business_id_key;
ALTER TABLE public.visibility_results ADD CONSTRAINT visibility_results_business_id_key UNIQUE (business_id);
