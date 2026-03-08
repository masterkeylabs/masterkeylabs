-- ===================================================================
-- MASTERKEY LABS: COMPREHENSIVE SCHEMA REBUILD (V2.2-STABLE)
-- ===================================================================
-- This script reconstructs the entire database structure with 
-- strict typing, unique constraints, and optimized RLS policies.

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BUSINESSES TABLE
-- The central anchor for all diagnostic data
CREATE TABLE public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID DEFAULT NULL, -- Nullable for guest/onboarding flow
    entity_name TEXT NOT NULL DEFAULT 'Initialize System',
    owner_name TEXT,
    phone TEXT,
    email TEXT,
    vertical TEXT,
    classification TEXT,
    scalability TEXT,
    digital_footprint TEXT,
    annual_revenue NUMERIC DEFAULT 0,
    employee_count INTEGER DEFAULT 0,
    has_crm BOOLEAN DEFAULT FALSE,
    has_erp BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance Optimization: Indexes for Search
CREATE INDEX IF NOT EXISTS idx_businesses_email ON public.businesses (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_businesses_phone ON public.businesses (phone);
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON public.businesses (user_id);

-- 2. OPERATIONAL WASTE (LOSS AUDIT) RESULTS
CREATE TABLE public.loss_audit_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    industry TEXT,
    staff_salary NUMERIC DEFAULT 0,
    marketing_budget NUMERIC DEFAULT 0,
    ops_overheads NUMERIC DEFAULT 0,
    annual_revenue NUMERIC DEFAULT 0,
    manual_hours INTEGER DEFAULT 0,
    has_crm BOOLEAN DEFAULT FALSE,
    has_erp BOOLEAN DEFAULT FALSE,
    -- Computed Results
    staff_waste NUMERIC DEFAULT 0,
    marketing_waste NUMERIC DEFAULT 0,
    ops_waste NUMERIC DEFAULT 0,
    coordination_drag NUMERIC DEFAULT 0,
    total_burn NUMERIC DEFAULT 0,
    annual_burn NUMERIC DEFAULT 0,
    saving_target NUMERIC DEFAULT 0,
    five_year_cost NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_business_loss UNIQUE (business_id)
);

-- 3. NIGHT LOSS RESULTS
CREATE TABLE public.night_loss_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    daily_inquiries INTEGER DEFAULT 0,
    closing_time TEXT,
    profit_per_sale NUMERIC DEFAULT 0,
    response_time TEXT,
    monthly_days INTEGER DEFAULT 30,
    -- Computed Results
    night_inquiries INTEGER DEFAULT 0,
    current_revenue NUMERIC DEFAULT 0,
    potential_revenue NUMERIC DEFAULT 0,
    monthly_loss NUMERIC DEFAULT 0,
    annual_loss NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_business_night UNIQUE (business_id)
);

-- 4. MARKET VISIBILITY RESULTS
CREATE TABLE public.visibility_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    city TEXT,
    country TEXT DEFAULT 'India',
    signals JSONB DEFAULT '{}'::jsonb,
    avg_transaction_value NUMERIC DEFAULT 0,
    -- Computed Results
    percent INTEGER DEFAULT 0,
    status TEXT,
    missed_customers INTEGER DEFAULT 0,
    missed_revenue NUMERIC DEFAULT 0,
    annual_loss NUMERIC DEFAULT 0,
    gaps JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_business_visibility UNIQUE (business_id)
);

-- 5. AI THREAT (EXTINCTION HORIZON) RESULTS
CREATE TABLE public.ai_threat_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    industry TEXT,
    score NUMERIC DEFAULT 0,
    threat_level TEXT,
    years_left NUMERIC DEFAULT 0,
    final_horizon INTEGER DEFAULT 0,
    timeline_desc TEXT,
    is_omnichannel BOOLEAN DEFAULT FALSE,
    has_crm BOOLEAN DEFAULT FALSE,
    has_erp BOOLEAN DEFAULT FALSE,
    employee_count INTEGER DEFAULT 0,
    features JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_business_threat UNIQUE (business_id)
);

-- 9. DIAGNOSTIC LOGS (Extended)
CREATE TABLE public.diagnostic_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    event_type TEXT,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. AUDIT BOOKINGS
CREATE TABLE public.audit_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    booking_time TIMESTAMPTZ,
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. USER SIGNUPS LOG
CREATE TABLE public.user_signups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    business_name TEXT,
    industry TEXT,
    revenue_bracket TEXT,
    employees TEXT,
    signed_up_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. EXPORT OPPORTUNITY RESULTS
CREATE TABLE public.export_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    product_name TEXT,
    product_category TEXT,
    local_price NUMERIC DEFAULT 0,
    monthly_qty NUMERIC DEFAULT 0,
    unit_of_measure TEXT,
    destination TEXT,
    multiplier NUMERIC DEFAULT 0,
    export_revenue NUMERIC DEFAULT 0,
    local_revenue NUMERIC DEFAULT 0,
    export_cost NUMERIC DEFAULT 0,
    net_profit NUMERIC DEFAULT 0,
    additional_income NUMERIC DEFAULT 0,
    roi_percent NUMERIC DEFAULT 0,
    annual_additional NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. ADMIN USERS (Internal Command Center)
CREATE TABLE public.admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'ADMIN',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ===================================================================
-- SECURITY (RLS) POLICIES
-- ===================================================================
-- Enabling RLS
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loss_audit_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.night_loss_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visibility_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_threat_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_bookings ENABLE ROW LEVEL SECURITY;

-- UNIVERSAL POLICIES (Allowing system flow)
-- 1-5. Diagnostics & Business
CREATE POLICY "Public / Authenticated - Businesses Access" ON public.businesses FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Public / Authenticated - Loss Audit Access" ON public.loss_audit_results FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Public / Authenticated - Night Loss Access" ON public.night_loss_results FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Public / Authenticated - Visibility Access" ON public.visibility_results FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Public / Authenticated - AI Threat Access" ON public.ai_threat_results FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- 6. User Signups
CREATE POLICY "Public / Authenticated - User Signups Access" ON public.user_signups FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- 7. Export Results
CREATE POLICY "Public / Authenticated - Export Results Access" ON public.export_results FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- 8. Admin Users (Restrict to service_role or authenticated with logic if needed)
-- For now, allowing select for login check, but update as needed
CREATE POLICY "Public - Admin Login Check" ON public.admin_users FOR SELECT USING (TRUE);

-- 9. Diagnostic Logs
CREATE POLICY "Public / Authenticated - Diagnostic Logs Access" ON public.diagnostic_logs FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- 10. Audit Bookings
CREATE POLICY "Public / Authenticated - Audit Bookings Access" ON public.audit_bookings FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- ===================================================================
-- SMART INITIALIZATION RPC
-- ===================================================================
CREATE OR REPLACE FUNCTION public.initialize_business_profile(
    p_payload JSONB,
    p_active_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_email TEXT;
    v_phone TEXT;
    v_id_to_use UUID;
    v_record RECORD;
BEGIN
    v_email := LOWER(TRIM(p_payload->>'email'));
    v_phone := TRIM(p_payload->>'phone');

    -- Search logic (Priority: ID -> Email -> Phone)
    IF p_active_id IS NOT NULL THEN
        SELECT id INTO v_id_to_use FROM public.businesses WHERE id = p_active_id;
    END IF;

    IF v_id_to_use IS NULL AND v_email IS NOT NULL AND v_email != '' THEN
        SELECT id INTO v_id_to_use FROM public.businesses WHERE LOWER(email) = v_email LIMIT 1;
    END IF;

    IF v_id_to_use IS NULL AND v_phone IS NOT NULL AND v_phone != '' THEN
        SELECT id INTO v_id_to_use FROM public.businesses WHERE phone = v_phone LIMIT 1;
    END IF;

    -- Upsert
    IF v_id_to_use IS NOT NULL THEN
        UPDATE public.businesses SET 
            entity_name = COALESCE(p_payload->>'entity_name', entity_name),
            owner_name = COALESCE(p_payload->>'owner_name', owner_name),
            phone = COALESCE(v_phone, phone),
            email = COALESCE(v_email, email),
            vertical = COALESCE(p_payload->>'vertical', vertical),
            classification = COALESCE(p_payload->>'classification', classification),
            annual_revenue = COALESCE((p_payload->>'annual_revenue')::NUMERIC, annual_revenue),
            employee_count = COALESCE((p_payload->>'employee_count')::INTEGER, employee_count),
            has_crm = COALESCE((p_payload->>'has_crm')::BOOLEAN, has_crm),
            has_erp = COALESCE((p_payload->>'has_erp')::BOOLEAN, has_erp),
            digital_footprint = COALESCE(p_payload->>'digital_footprint', digital_footprint),
            user_id = COALESCE((p_payload->>'user_id')::UUID, user_id),
            updated_at = now()
        WHERE id = v_id_to_use
        RETURNING * INTO v_record;
    ELSE
        INSERT INTO public.businesses (
            entity_name, owner_name, phone, email, vertical,
            annual_revenue, employee_count, has_crm, has_erp, user_id, 
            classification, digital_footprint
        ) VALUES (
            p_payload->>'entity_name', p_payload->>'owner_name', v_phone, v_email, 
            p_payload->>'vertical', 
            COALESCE((p_payload->>'annual_revenue')::NUMERIC, 0),
            COALESCE((p_payload->>'employee_count')::INTEGER, 0),
            COALESCE((p_payload->>'has_crm')::BOOLEAN, FALSE),
            COALESCE((p_payload->>'has_erp')::BOOLEAN, FALSE),
            (p_payload->>'user_id')::UUID,
            p_payload->>'classification',
            p_payload->>'digital_footprint'
        )
        RETURNING * INTO v_record;
    END IF;

    RETURN to_jsonb(v_record);
END;
$$;
