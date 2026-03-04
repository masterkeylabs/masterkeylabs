-- ==========================================
-- MASTERKEY OS: EXHAUSTIVE SYSTEM SCAN
-- Execute this in the Supabase SQL Editor
-- This script avoids "ambiguous" errors.
-- ==========================================

-- 1. Scan for ALL triggers on the 'businesses' table
SELECT 
    tgname as trigger_name,
    tgenabled as status,
    pg_get_triggerdef(oid) as definition
FROM pg_trigger
WHERE tgrelid = 'public.businesses'::regclass
AND tgisinternal = false;

-- 2. Scan for ALL RLS Policies on the 'businesses' table
SELECT 
    policyname as policy_name,
    roles,
    cmd as action,
    qual as using_expression,
    with_check as check_expression
FROM pg_policies
WHERE tablename = 'businesses';

-- 3. Check for any non-obvious constraints or unique-checks that might hang
SELECT 
    conname as constraint_name,
    contype as type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.businesses'::regclass;
