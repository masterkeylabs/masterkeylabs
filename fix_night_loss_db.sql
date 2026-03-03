ALTER TABLE public.night_loss_results
ADD COLUMN IF NOT EXISTS business_type TEXT,
ADD COLUMN IF NOT EXISTS conversion_gap INTEGER;
