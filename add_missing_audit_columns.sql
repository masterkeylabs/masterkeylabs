-- Add missing columns to audit results for the new Dashboard Intelligence Report
-- Run this in the Supabase SQL Editor

-- 1. Night Loss: Add conversion_gap %
ALTER TABLE public.night_loss_results 
ADD COLUMN IF NOT EXISTS conversion_gap NUMERIC DEFAULT 22.5;

-- 2. Visibility: Add missed_revenue and annual_loss
ALTER TABLE public.visibility_results 
ADD COLUMN IF NOT EXISTS missed_revenue NUMERIC DEFAULT 0;

ALTER TABLE public.visibility_results 
ADD COLUMN IF NOT EXISTS annual_loss NUMERIC DEFAULT 0;

-- 3. AI Threat: Add final_horizon (months)
ALTER TABLE public.ai_threat_results 
ADD COLUMN IF NOT EXISTS final_horizon INT DEFAULT 30;

-- 4. Ensure Loss Audit has coordination_drag (if not already there)
ALTER TABLE public.loss_audit_results 
ADD COLUMN IF NOT EXISTS coordination_drag NUMERIC DEFAULT 0;
