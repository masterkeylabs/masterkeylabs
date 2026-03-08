-- ===================================================================
-- MASTERKEY LABS: LIVE SYNC & PERFORMANCE PATCH
-- ===================================================================
-- This script is 100% safe to run on existing databases.
-- It will NOT delete data. It only updates logic and adds indexes.

-- 1. ENSURE COLUMNS (Just in case)
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS digital_footprint TEXT;

-- 2. PERFORMANCE INDEXES (Optimizes lookups to prevent timeouts)
CREATE INDEX IF NOT EXISTS idx_businesses_email ON public.businesses (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_businesses_phone ON public.businesses (phone);
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON public.businesses (user_id);

-- 3. UPDATED INITIALIZATION RPC
-- This version correctly handles 'digital_footprint' and has optimized search priority.
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
            digital_footprint = COALESCE(p_payload->>'digital_footprint', digital_footprint),
            annual_revenue = COALESCE((p_payload->>'annual_revenue')::NUMERIC, annual_revenue),
            employee_count = COALESCE((p_payload->>'employee_count')::INTEGER, employee_count),
            has_crm = COALESCE((p_payload->>'has_crm')::BOOLEAN, has_crm),
            has_erp = COALESCE((p_payload->>'has_erp')::BOOLEAN, has_erp),
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
