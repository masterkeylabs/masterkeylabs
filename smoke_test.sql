-- ===================================================================
-- MASTERKEY OS: SMOKE TEST & LOCK BREAKER
-- Execute this in the Supabase SQL Editor
-- ===================================================================

-- 1. KILL ALL STUCK CONNECTIONS
-- This forces the database to drop any "ghost" processes that are holding locks.
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE query ILIKE '%businesses%' 
AND pid <> pg_backend_pid();

-- 2. TEMPORARILY DISABLE RLS
-- Let's see if the hang is caused by a hidden Security Policy.
ALTER TABLE public.businesses DISABLE ROW LEVEL SECURITY;

-- 3. THE SMOKE TEST (Is the DB actually working?)
-- If this runs instantly, the problem is your WEBSITE'S CONNECTION.
-- If this HANGS, the problem is your DATABASE STORAGE/SERVER.
INSERT INTO public.businesses (entity_name, owner_name, email)
VALUES ('SMOKE TEST', 'SYSTEM', 'test@example.com')
RETURNING id;

-- 4. CLEANUP THE TEST
DELETE FROM public.businesses WHERE entity_name = 'SMOKE TEST';

-- 5. RE-ENABLE RLS (Optional/Safety)
-- ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
