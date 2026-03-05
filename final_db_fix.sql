-- 1. Cleanup orphaned records where business_id is NULL
DELETE FROM public.loss_audit_results WHERE business_id IS NULL;
DELETE FROM public.ai_threat_results WHERE business_id IS NULL;
DELETE FROM public.night_loss_results WHERE business_id IS NULL;
DELETE FROM public.visibility_results WHERE business_id IS NULL;

-- 2. Enforce NOT NULL constraint on business_id for all audit tables
ALTER TABLE public.loss_audit_results ALTER COLUMN business_id SET NOT NULL;
ALTER TABLE public.ai_threat_results ALTER COLUMN business_id SET NOT NULL;
ALTER TABLE public.night_loss_results ALTER COLUMN business_id SET NOT NULL;
ALTER TABLE public.visibility_results ALTER COLUMN business_id SET NOT NULL;

-- 3. Ensure the Unique constraints exist (from previous fix_constraints.sql)
-- loss_audit_results
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'loss_audit_results_business_id_key') THEN
        ALTER TABLE public.loss_audit_results ADD CONSTRAINT loss_audit_results_business_id_key UNIQUE (business_id);
    END IF;
END $$;

-- ai_threat_results
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ai_threat_results_business_id_key') THEN
        ALTER TABLE public.ai_threat_results ADD CONSTRAINT ai_threat_results_business_id_key UNIQUE (business_id);
    END IF;
END $$;

-- night_loss_results
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'night_loss_results_business_id_key') THEN
        ALTER TABLE public.night_loss_results ADD CONSTRAINT night_loss_results_business_id_key UNIQUE (business_id);
    END IF;
END $$;

-- visibility_results
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'visibility_results_business_id_key') THEN
        ALTER TABLE public.visibility_results ADD CONSTRAINT visibility_results_business_id_key UNIQUE (business_id);
    END IF;
END $$;
