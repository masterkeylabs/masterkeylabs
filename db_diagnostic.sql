-- ==========================================
-- MASTERKEY OS: DATABASE DIAGNOSTIC SCRIPT
-- Execute this in the Supabase SQL Editor
-- Paste the results back to me.
-- ==========================================

-- 1. Check all triggers on the businesses table
SELECT 
    trigger_name, 
    event_manipulation, 
    action_statement, 
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'businesses';

-- 2. Check for Row Level Security (RLS) policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check 
FROM pg_policies 
WHERE tablename = 'businesses';

-- 3. Check for any active locks (Deadlocks / Stalls)
SELECT 
    a.pid, 
    l.locktype, 
    l.mode, 
    l.granted, 
    a.query,
    a.state,
    a.wait_event_type,
    a.wait_event
FROM pg_stat_activity a
LEFT JOIN pg_locks l ON a.pid = l.pid
WHERE a.query ILIKE '%businesses%'
  AND a.pid <> pg_backend_pid();

-- 4. Check table structure and columns
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'businesses';
