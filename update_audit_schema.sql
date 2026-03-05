-- 1. Update 'businesses' table with centralized fields
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS annual_revenue NUMERIC,
ADD COLUMN IF NOT EXISTS employee_count INTEGER,
ADD COLUMN IF NOT EXISTS has_crm BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_erp BOOLEAN DEFAULT false;

-- 2. Update 'loss_audit_results' table
ALTER TABLE public.loss_audit_results 
ADD COLUMN IF NOT EXISTS annual_revenue NUMERIC,
ADD COLUMN IF NOT EXISTS coordination_drag NUMERIC;

-- 3. Update 'ai_threat_results' table
ALTER TABLE public.ai_threat_results 
ADD COLUMN IF NOT EXISTS has_crm BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_erp BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS employee_count INTEGER,
ADD COLUMN IF NOT EXISTS is_omnichannel BOOLEAN DEFAULT false;

-- 4. Update 'visibility_results' table
-- (Fields like 'signals' already handle dynamic content, but ensuring consistency)
ALTER TABLE public.visibility_results
ADD COLUMN IF NOT EXISTS annual_revenue NUMERIC;
