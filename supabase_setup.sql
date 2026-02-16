-- ===================================================================
-- MasterKey Labs — Complete Supabase Schema
-- Run this in your Supabase SQL Editor (replace existing schema)
-- ===================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================== BUSINESSES TABLE =====================
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_name TEXT NOT NULL,
  location TEXT,
  business_age INT DEFAULT 1,
  classification TEXT DEFAULT 'Local Business',
  scalability TEXT DEFAULT '1-10 (Micro)',
  digital_footprint TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== AI THREAT RESULTS =====================
CREATE TABLE IF NOT EXISTS ai_threat_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  score INT NOT NULL,
  years_left INT NOT NULL,
  threat_level TEXT NOT NULL,
  timeline_desc TEXT,
  industry TEXT,
  modifiers JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== LOSS AUDIT RESULTS =====================
CREATE TABLE IF NOT EXISTS loss_audit_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  staff_salary INT,
  marketing_budget INT,
  ops_overheads INT,
  industry TEXT,
  staff_waste INT,
  marketing_waste INT,
  ops_waste INT,
  total_burn INT,
  annual_burn INT,
  saving_target INT,
  five_year_cost INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== EXPORT RESULTS =====================
CREATE TABLE IF NOT EXISTS export_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  product_name TEXT,
  product_category TEXT,
  local_price INT,
  monthly_qty INT,
  unit_of_measure TEXT DEFAULT 'kg',
  destination TEXT DEFAULT 'UAE',
  multiplier FLOAT,
  export_revenue INT,
  local_revenue INT,
  export_cost INT,
  net_profit INT,
  additional_income INT,
  roi_percent INT,
  annual_additional INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== NIGHT LOSS RESULTS =====================
CREATE TABLE IF NOT EXISTS night_loss_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  daily_inquiries INT,
  closing_time TEXT,
  profit_per_sale INT,
  response_time TEXT,
  monthly_days INT DEFAULT 26,
  night_inquiries INT,
  current_revenue INT,
  potential_revenue INT,
  monthly_loss INT,
  annual_loss INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== VISIBILITY RESULTS =====================
CREATE TABLE IF NOT EXISTS visibility_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  city TEXT,
  signals JSONB DEFAULT '{}',
  percent INT,
  status TEXT,
  missed_customers INT,
  gaps JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== KEEP EXISTING TABLES =====================
-- (business_status, capital_leaks, extinction_config, diagnostic_logs remain for legacy)

-- ===================== ENABLE REALTIME =====================
ALTER PUBLICATION supabase_realtime ADD TABLE businesses;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_threat_results;
ALTER PUBLICATION supabase_realtime ADD TABLE loss_audit_results;
ALTER PUBLICATION supabase_realtime ADD TABLE export_results;
ALTER PUBLICATION supabase_realtime ADD TABLE night_loss_results;
ALTER PUBLICATION supabase_realtime ADD TABLE visibility_results;
