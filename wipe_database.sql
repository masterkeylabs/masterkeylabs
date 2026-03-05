-- 🚨 CAUTION: This script will delete ALL data from your database tables. 🚨
-- Run this in the Supabase SQL Editor to reset your data.

-- Order matters for foreign keys if not using CASCADE, but CASCADE is used here for safety.
TRUNCATE TABLE public.businesses CASCADE;
TRUNCATE TABLE public.loss_audit_results CASCADE;
TRUNCATE TABLE public.ai_threat_results CASCADE;
TRUNCATE TABLE public.night_loss_results CASCADE;
TRUNCATE TABLE public.visibility_results CASCADE;
TRUNCATE TABLE public.user_signups CASCADE;
TRUNCATE TABLE public.admin_users CASCADE;
TRUNCATE TABLE public.export_results CASCADE;

-- Note: CASCADE ensures that dependent rows in child tables are also deleted.
-- After running this, the system will be completely fresh.
