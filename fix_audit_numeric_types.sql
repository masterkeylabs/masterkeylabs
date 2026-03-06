-- masterkeylabsv2.0/fix_audit_numeric_types.sql
-- Fixes "invalid input syntax for type integer" by changing INT columns to NUMERIC

-- 1. Fix loss_audit_results
ALTER TABLE public.loss_audit_results ALTER COLUMN manual_hours TYPE NUMERIC USING manual_hours::NUMERIC;

-- 2. Fix ai_threat_results
ALTER TABLE public.ai_threat_results ALTER COLUMN years_left TYPE NUMERIC USING years_left::NUMERIC;
-- Score is usually % so INT is fine, but let's be safe
ALTER TABLE public.ai_threat_results ALTER COLUMN score TYPE NUMERIC USING score::NUMERIC;

-- 3. Fix night_loss_results
ALTER TABLE public.night_loss_results ALTER COLUMN daily_inquiries TYPE NUMERIC USING daily_inquiries::NUMERIC;

-- 4. Fix visibility_results
ALTER TABLE public.visibility_results ALTER COLUMN percent TYPE NUMERIC USING percent::NUMERIC;

-- ==========================================
-- Done. Audit tables now support float values for better precision.
-- ==========================================
