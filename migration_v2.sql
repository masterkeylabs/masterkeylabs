-- MASTERKEY V2.0 SCHEMA MIGRATION
-- Purpose: Resolve "CONFIDENCE column not found" errors and unify "annual_loss" naming.
-- Instructions: Run this in your Supabase SQL Editor.

-- 1. Updates for Visibility Audit
ALTER TABLE visibility_results ADD COLUMN IF NOT EXISTS confidence TEXT;
ALTER TABLE visibility_results ADD COLUMN IF NOT EXISTS is_clamped BOOLEAN DEFAULT FALSE;
ALTER TABLE visibility_results ADD COLUMN IF NOT EXISTS annual_loss NUMERIC DEFAULT 0;

-- 2. Updates for Operational Audit (Consistency with Store/UI)
ALTER TABLE loss_audit_results ADD COLUMN IF NOT EXISTS annual_loss NUMERIC DEFAULT 0;

-- 3. Comments for Documentation
COMMENT ON COLUMN visibility_results.confidence IS 'Confidence score (HIGH/MEDIUM) based on revenue verification';
COMMENT ON COLUMN visibility_results.is_clamped IS 'Flag if the loss was capped by the MAX_REVENUE_MULTIPLIER logic guard';
COMMENT ON COLUMN loss_audit_results.annual_loss IS 'Unified naming for annual financial bleed';
