-- ==========================================
-- MASTERKEY OS: SCHEMA REPAIR SCRIPT
-- Execute this in the Supabase SQL Editor
-- This ensures the 'has_crm' and 'has_erp' columns (and others) are correctly added.
-- ==========================================

-- 1. Repair loss_audit_results
ALTER TABLE public.loss_audit_results ADD COLUMN IF NOT EXISTS has_crm BOOLEAN DEFAULT false;
ALTER TABLE public.loss_audit_results ADD COLUMN IF NOT EXISTS has_erp BOOLEAN DEFAULT false;
ALTER TABLE public.loss_audit_results ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE public.loss_audit_results ADD COLUMN IF NOT EXISTS manual_hours INT DEFAULT 20;

-- 2. Repair ai_threat_results
ALTER TABLE public.ai_threat_results ADD COLUMN IF NOT EXISTS is_omnichannel BOOLEAN DEFAULT false;
ALTER TABLE public.ai_threat_results ADD COLUMN IF NOT EXISTS industry TEXT;

-- 3. Force refresh the PostgREST cache (Supabase internal)
-- Usually, running an ALTER TABLE automatically triggers a cache refresh,
-- but if the error persists, you can restart the database or wait a few minutes.
