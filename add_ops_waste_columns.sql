-- Migration: Add new columns for updated audit formulas
-- Run this in Supabase SQL Editor before using the updated app

-- ═══════════════════════════════════════════════════════════
-- 1. loss_audit_results — Operational Waste (Module 1)
-- ═══════════════════════════════════════════════════════════
ALTER TABLE public.loss_audit_results
ADD COLUMN IF NOT EXISTS annual_revenue BIGINT DEFAULT 0;

ALTER TABLE public.loss_audit_results
ADD COLUMN IF NOT EXISTS coordination_drag BIGINT DEFAULT 0;

-- ═══════════════════════════════════════════════════════════
-- 2. night_loss_results — Night Loss (Module 2)
-- ═══════════════════════════════════════════════════════════
ALTER TABLE public.night_loss_results
ADD COLUMN IF NOT EXISTS business_type TEXT DEFAULT 'both';

-- ═══════════════════════════════════════════════════════════
-- 3. visibility_results — Visibility (Module 3)
-- ═══════════════════════════════════════════════════════════
ALTER TABLE public.visibility_results
ADD COLUMN IF NOT EXISTS avg_transaction_value BIGINT DEFAULT 0;

-- ═══════════════════════════════════════════════════════════
-- 4. ai_threat_results — Extinction Horizon (Module 4)
-- ═══════════════════════════════════════════════════════════
ALTER TABLE public.ai_threat_results
ADD COLUMN IF NOT EXISTS has_crm BOOLEAN DEFAULT false;

ALTER TABLE public.ai_threat_results
ADD COLUMN IF NOT EXISTS has_erp BOOLEAN DEFAULT false;

ALTER TABLE public.ai_threat_results
ADD COLUMN IF NOT EXISTS employee_count INTEGER DEFAULT 25;
