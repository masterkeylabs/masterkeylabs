-- ==========================================
-- MASTERKEY OS: WEBHOOK NERVOUS SYSTEM
-- Execute this in the Supabase SQL Editor
-- ==========================================

-- 1. Create a function that triggers a webhook to your Make.com (or Zapier) URL
-- Replace 'YOUR_MAKE_WEBHOOK_URL' with the actual URL from your automation provider
-- This function will intercept row insertions on the businesses table and forward them.

CREATE OR REPLACE FUNCTION notify_make_webhook()
RETURNS trigger AS $$
DECLARE
  payload JSON;
BEGIN
  payload = json_build_object(
    'business_id', NEW.id,
    'entity_name', NEW.entity_name,
    'phone', NEW.phone,
    'email', NEW.email,
    'vertical', NEW.classification,
    'timestamp', timezone('utc'::text, now())
  );

  -- Execute the HTTP POST request to Make.com Webhook
  -- Note: ensure the pg_net extension is enabled in Database > Extensions in Supabase
  PERFORM net.http_post(
      url:='YOUR_MAKE_WEBHOOK_URL',
      body:=payload::jsonb,
      headers:='{"Content-Type": "application/json"}'::jsonb
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the Trigger
DROP TRIGGER IF EXISTS on_business_created ON public.businesses;

CREATE TRIGGER on_business_created
AFTER INSERT ON public.businesses
FOR EACH ROW EXECUTE FUNCTION notify_make_webhook();

-- ==========================================
-- NOTE:
-- Once this payload hits Make.com, you can configure Make to:
-- A) Ping the MasterKey team via WhatsApp/Slack.
-- B) Pull the associated 'loss_audit_results' and 'ai_threat_results' using the business_id.
-- C) Automatically assign the High-Ticket lead to the closest sales architect.
-- ==========================================
