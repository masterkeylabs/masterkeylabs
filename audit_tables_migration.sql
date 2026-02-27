-- ==========================================
-- MASTERKEY OS: AUDIT TABLES MIGRATION
-- Execute this in the Supabase SQL Editor
-- Run this to ensure all audit result tables exist with required columns
-- ==========================================

-- 1. Create loss_audit_results (safe, creates only if missing)
CREATE TABLE IF NOT EXISTS public.loss_audit_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  staff_salary NUMERIC DEFAULT 0,
  marketing_budget NUMERIC DEFAULT 0,
  ops_overheads NUMERIC DEFAULT 0,
  industry TEXT,
  manual_hours INT DEFAULT 20,
  has_crm BOOLEAN DEFAULT false,
  has_erp BOOLEAN DEFAULT false,
  staff_waste NUMERIC DEFAULT 0,
  marketing_waste NUMERIC DEFAULT 0,
  ops_waste NUMERIC DEFAULT 0,
  total_burn NUMERIC DEFAULT 0,
  annual_burn NUMERIC DEFAULT 0,
  saving_target NUMERIC DEFAULT 0,
  five_year_cost NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add any missing columns to loss_audit_results (safe ALTERs)
ALTER TABLE public.loss_audit_results ADD COLUMN IF NOT EXISTS total_burn NUMERIC DEFAULT 0;
ALTER TABLE public.loss_audit_results ADD COLUMN IF NOT EXISTS annual_burn NUMERIC DEFAULT 0;
ALTER TABLE public.loss_audit_results ADD COLUMN IF NOT EXISTS saving_target NUMERIC DEFAULT 0;
ALTER TABLE public.loss_audit_results ADD COLUMN IF NOT EXISTS five_year_cost NUMERIC DEFAULT 0;
ALTER TABLE public.loss_audit_results ADD COLUMN IF NOT EXISTS staff_waste NUMERIC DEFAULT 0;
ALTER TABLE public.loss_audit_results ADD COLUMN IF NOT EXISTS marketing_waste NUMERIC DEFAULT 0;
ALTER TABLE public.loss_audit_results ADD COLUMN IF NOT EXISTS ops_waste NUMERIC DEFAULT 0;
ALTER TABLE public.loss_audit_results ADD COLUMN IF NOT EXISTS has_crm BOOLEAN DEFAULT false;
ALTER TABLE public.loss_audit_results ADD COLUMN IF NOT EXISTS has_erp BOOLEAN DEFAULT false;
ALTER TABLE public.loss_audit_results ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE public.loss_audit_results ADD COLUMN IF NOT EXISTS manual_hours INT DEFAULT 20;

-- 3. Create ai_threat_results (safe)
CREATE TABLE IF NOT EXISTS public.ai_threat_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  score INT DEFAULT 0,
  years_left INT DEFAULT 5,
  threat_level TEXT DEFAULT 'MODERATE',
  timeline_desc TEXT,
  industry TEXT,
  is_omnichannel BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Add any missing columns to ai_threat_results (safe ALTERs)
ALTER TABLE public.ai_threat_results ADD COLUMN IF NOT EXISTS score INT DEFAULT 0;
ALTER TABLE public.ai_threat_results ADD COLUMN IF NOT EXISTS years_left INT DEFAULT 5;
ALTER TABLE public.ai_threat_results ADD COLUMN IF NOT EXISTS threat_level TEXT;
ALTER TABLE public.ai_threat_results ADD COLUMN IF NOT EXISTS timeline_desc TEXT;
ALTER TABLE public.ai_threat_results ADD COLUMN IF NOT EXISTS is_omnichannel BOOLEAN DEFAULT false;

-- 5. Create night_loss_results (safe)
CREATE TABLE IF NOT EXISTS public.night_loss_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  daily_inquiries INT DEFAULT 15,
  closing_time TEXT DEFAULT '6pm',
  profit_per_sale NUMERIC DEFAULT 25000,
  response_time TEXT DEFAULT 'none',
  monthly_days INT DEFAULT 26,
  monthly_loss NUMERIC DEFAULT 0,
  annual_loss NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.night_loss_results ADD COLUMN IF NOT EXISTS monthly_loss NUMERIC DEFAULT 0;
ALTER TABLE public.night_loss_results ADD COLUMN IF NOT EXISTS annual_loss NUMERIC DEFAULT 0;

-- 6. Create visibility_results (safe)
CREATE TABLE IF NOT EXISTS public.visibility_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  city TEXT,
  signals JSONB DEFAULT '[]',
  percent INT DEFAULT 0,
  status TEXT DEFAULT 'INVISIBLE',
  missed_customers INT DEFAULT 0,
  gaps JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.visibility_results ADD COLUMN IF NOT EXISTS missed_customers INT DEFAULT 0;
ALTER TABLE public.visibility_results ADD COLUMN IF NOT EXISTS percent INT DEFAULT 0;

-- ==========================================
-- Done. All audit tables now have required columns.
-- ==========================================
