-- ===================================================================
-- MASTERKEY OS: HIGH-PERFORMANCE INITIALIZATION RPC
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
    v_last10 TEXT;
    v_existing_id UUID;
    v_result JSONB;
BEGIN
    -- 1. Extract and normalize
    v_email := LOWER(TRIM(p_payload->>'email'));
    v_phone := p_payload->>'phone';
    v_last10 := RIGHT(REGEXP_REPLACE(v_phone, '\D', '', 'g'), 10);

    -- 2. Check for duplicates
    -- We look for any record matching email OR the last 10 digits of the phone
    SELECT id INTO v_existing_id
    FROM public.businesses
    WHERE (LOWER(email) = v_email OR RIGHT(REGEXP_REPLACE(phone, '\D', '', 'g'), 10) = v_last10)
    LIMIT 1;

    -- 3. Logic based on mode
    IF p_active_id IS NOT NULL THEN
        -- UPDATE MODE
        IF v_existing_id IS NOT NULL AND v_existing_id != p_active_id THEN
            RETURN jsonb_build_object('error', '📵 This mobile or email is already registered to another enterprise.', 'code', 'DUPLICATE');
        END IF;

        UPDATE public.businesses
        SET 
            entity_name = COALESCE(p_payload->>'entity_name', entity_name),
            owner_name = COALESCE(p_payload->>'owner_name', owner_name),
            phone = COALESCE(p_payload->>'phone', phone),
            email = COALESCE(p_payload->>'email', email),
            vertical = COALESCE(p_payload->>'vertical', vertical),
            classification = COALESCE(p_payload->>'classification', classification),
            annual_revenue = (p_payload->>'annual_revenue')::NUMERIC,
            employee_count = (p_payload->>'employee_count')::INTEGER,
            has_crm = (p_payload->>'has_crm')::BOOLEAN,
            has_erp = (p_payload->>'has_erp')::BOOLEAN,
            user_id = (p_payload->>'user_id')::UUID
        WHERE id = p_active_id
        RETURNING to_jsonb(public.businesses.*) INTO v_result;

    ELSE
        -- INSERT MODE
        IF v_existing_id IS NOT NULL THEN
            RETURN jsonb_build_object('error', '📵 This profile is already initialized. Please log in or use new credentials.', 'code', 'DUPLICATE');
        END IF;

        INSERT INTO public.businesses (
            entity_name, owner_name, phone, email, vertical,
            annual_revenue, employee_count, has_crm, has_erp, user_id, classification
        ) VALUES (
            p_payload->>'entity_name',
            p_payload->>'owner_name',
            p_payload->>'phone',
            p_payload->>'email',
            p_payload->>'vertical',
            (p_payload->>'annual_revenue')::NUMERIC,
            (p_payload->>'employee_count')::INTEGER,
            (p_payload->>'has_crm')::BOOLEAN,
            (p_payload->>'has_erp')::BOOLEAN,
            (p_payload->>'user_id')::UUID,
            p_payload->>'classification'
        )
        RETURNING to_jsonb(public.businesses.*) INTO v_result;
    END IF;

    RETURN v_result;
END;
$$;
