-- ==========================================
-- MASTERKEY LABS: DATABASE CLEANUP SCRIPT
-- ==========================================
-- WARNING: This will PERMANENTLY DELETE all data in these tables.

-- 1. Drop Result Tables (Dependents)
DROP TABLE IF EXISTS public.loss_audit_results CASCADE;
DROP TABLE IF EXISTS public.night_loss_results CASCADE;
DROP TABLE IF EXISTS public.visibility_results CASCADE;
DROP TABLE IF EXISTS public.ai_threat_results CASCADE;
DROP TABLE IF EXISTS public.user_signups CASCADE;
DROP TABLE IF EXISTS public.export_results CASCADE;
DROP TABLE IF EXISTS public.diagnostic_logs CASCADE;
DROP TABLE IF EXISTS public.audit_bookings CASCADE;

-- 2. Drop Main & Admin Tables
DROP TABLE IF EXISTS public.businesses CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;

-- 3. Drop Custom Functions
DROP FUNCTION IF EXISTS public.initialize_business_profile(JSONB, UUID);

-- 4. Drop Extensions (Optional, but good for cleanup)
-- DROP EXTENSION IF EXISTS "uuid-ossp";

-- ==========================================
-- CLEANUP COMPLETE
-- ==========================================
