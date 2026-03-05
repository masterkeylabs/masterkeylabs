-- ===================================================================
-- MASTERKEY OS: SMART UPSERT & SESSION RE-ANCHORING RPC
-- ===================================================================

-- 1. ENSURE SCHEMA CONSISTENCY
-- Add missing columns if they don't exist
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS classification TEXT;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS scalability TEXT;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS digital_footprint TEXT;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS vertical TEXT;

-- 2. CREATE SMART UPSERT FUNCTION
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
    -- A. Normalize Input Data
    v_email := LOWER(TRIM(p_payload->>'email'));
    v_phone := TRIM(p_payload->>'phone');

    -- B. FIND THE BEST RECORD TO WORK WITH (Priority Search)
    -- 1. Try p_active_id first (if it's a valid existing ID)
    IF p_active_id IS NOT NULL THEN
        SELECT id INTO v_id_to_use FROM public.businesses WHERE id = p_active_id;
    END IF;

    -- 2. If not found by ID, try finding by Email
    IF v_id_to_use IS NULL AND v_email IS NOT NULL AND v_email != '' THEN
        SELECT id INTO v_id_to_use FROM public.businesses WHERE LOWER(email) = v_email LIMIT 1;
    END IF;

    -- 3. If still not found, try finding by Phone (raw match)
    IF v_id_to_use IS NULL AND v_phone IS NOT NULL AND v_phone != '' THEN
        SELECT id INTO v_id_to_use FROM public.businesses WHERE phone = v_phone LIMIT 1;
    END IF;

    -- C. UPDATE OR INSERT
    IF v_id_to_use IS NOT NULL THEN
        -- [UPDATE EXISTING]
        UPDATE public.businesses
        SET 
            entity_name = COALESCE(p_payload->>'entity_name', entity_name),
            owner_name = COALESCE(p_payload->>'owner_name', owner_name),
            phone = COALESCE(v_phone, phone),
            email = COALESCE(v_email, email),
            vertical = COALESCE(p_payload->>'vertical', vertical),
            classification = COALESCE(p_payload->>'classification', classification),
            annual_revenue = COALESCE(NULLIF(p_payload->>'annual_revenue', '')::NUMERIC, NULLIF((p_payload->>'annual_revenue')::TEXT, 'null')::NUMERIC, annual_revenue, 0),
            employee_count = COALESCE(NULLIF(p_payload->>'employee_count', '')::INTEGER, NULLIF((p_payload->>'employee_count')::TEXT, 'null')::INTEGER, employee_count, 0),
            has_crm = COALESCE(NULLIF(p_payload->>'has_crm', '')::BOOLEAN, NULLIF((p_payload->>'has_crm')::TEXT, 'null')::BOOLEAN, has_crm, false),
            has_erp = COALESCE(NULLIF(p_payload->>'has_erp', '')::BOOLEAN, NULLIF((p_payload->>'has_erp')::TEXT, 'null')::BOOLEAN, has_erp, false),
            user_id = COALESCE(NULLIF(p_payload->>'user_id', '')::UUID, user_id),
            scalability = COALESCE(p_payload->>'scalability', scalability),
            digital_footprint = COALESCE(p_payload->>'digital_footprint', digital_footprint)
        WHERE id = v_id_to_use
        RETURNING * INTO v_record;
    ELSE
        -- [INSERT NEW]
        INSERT INTO public.businesses (
            entity_name, owner_name, phone, email, vertical,
            annual_revenue, employee_count, has_crm, has_erp, user_id, 
            classification, scalability, digital_footprint
        ) VALUES (
            p_payload->>'entity_name',
            p_payload->>'owner_name',
            v_phone,
            v_email,
            p_payload->>'vertical',
            COALESCE(NULLIF(p_payload->>'annual_revenue', '')::NUMERIC, NULLIF((p_payload->>'annual_revenue')::TEXT, 'null')::NUMERIC, 0),
            COALESCE(NULLIF(p_payload->>'employee_count', '')::INTEGER, NULLIF((p_payload->>'employee_count')::TEXT, 'null')::INTEGER, 0),
            COALESCE(NULLIF(p_payload->>'has_crm', '')::BOOLEAN, NULLIF((p_payload->>'has_crm')::TEXT, 'null')::BOOLEAN, false),
            COALESCE(NULLIF(p_payload->>'has_erp', '')::BOOLEAN, NULLIF((p_payload->>'has_erp')::TEXT, 'null')::BOOLEAN, false),
            NULLIF(p_payload->>'user_id', '')::UUID,
            p_payload->>'classification',
            p_payload->>'scalability',
            p_payload->>'digital_footprint'
        )
        RETURNING * INTO v_record;
    END IF;

    -- D. Return the result as JSONB
    RETURN to_jsonb(v_record);
END;
$$;
