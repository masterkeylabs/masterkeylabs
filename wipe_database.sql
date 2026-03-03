-- 🚨 CAUTION: This script will delete ALL data from your business and audit tables. 🚨
-- Run this in the Supabase SQL Editor to reset your data for local testing.

TRUNCATE TABLE businesses CASCADE;
TRUNCATE TABLE loss_audit_results CASCADE;
TRUNCATE TABLE ai_threat_results CASCADE;
TRUNCATE TABLE night_loss_results CASCADE;
TRUNCATE TABLE visibility_results CASCADE;

-- Optional: Reset sequences if any
-- ALTER SEQUENCE businesses_id_seq RESTART WITH 1;
-- ALTER SEQUENCE loss_audit_results_id_seq RESTART WITH 1;

-- Note: CASCASE will ensure that dependent rows in results tables are also deleted.
-- If you only want to delete specific businesses, use DELETE FROM instead of TRUNCATE.
