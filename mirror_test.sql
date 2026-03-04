-- ==========================================
-- MASTERKEY OS: MIRROR TEST (App Simulation)
-- Execute this in the Supabase SQL Editor
-- This mirrors EXACTLY what the JavaScript code does.
-- ==========================================

-- 1. Try a "Full Payload" insert with .select() behavior
-- Replace 'PASTE_A_USER_ID_HERE' if you have a real one, or use NULL.
INSERT INTO public.businesses (
    entity_name, 
    owner_name, 
    phone, 
    email, 
    user_id
)
VALUES (
    'MIRROR_TEST_01', 
    'DIAGNOSTIC', 
    '1234567890', 
    'mirror@test.com', 
    NULL -- Simulation of guest or specific user
)
RETURNING *;

-- 2. Check for RLS specifically on NEXT.JS headers
-- Sometimes Supabase hangs if the 'auth.uid()' function is slow.
EXPLAIN ANALYZE 
INSERT INTO public.businesses (entity_name, email) 
VALUES ('SPEED_TEST', 'speed@test.com');

-- 3. CLEANUP
DELETE FROM public.businesses WHERE entity_name LIKE 'MIRROR_TEST%';
DELETE FROM public.businesses WHERE entity_name = 'SPEED_TEST';
