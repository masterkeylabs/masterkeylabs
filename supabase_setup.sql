-- ==========================================
-- MASTERKEY OS: WEBHOOK SYSTEM (DEACTIVATED)
-- ==========================================

-- To remove the blocking trigger and function from your database,
-- run searching for "on_business_created" and dropping it.

DROP TRIGGER IF EXISTS on_business_created ON public.businesses;
DROP FUNCTION IF EXISTS notify_make_webhook();

-- ==========================================
-- NOTE: 
-- Webhooks are currently disabled to prevent connection timeouts.
-- To re-enable, you will need a valid URL from Make.com or Zapier.
-- ==========================================
