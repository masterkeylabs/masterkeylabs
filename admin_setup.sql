-- ===================================================================
-- MASTERKEY LABS — FAIL-SAFE SETUP SCRIPT
-- ===================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create/Update Tables (Safe version)
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_name TEXT NOT NULL,
  location TEXT,
  business_age INT DEFAULT 1,
  classification TEXT DEFAULT 'Local Business',
  scalability TEXT DEFAULT '1-10 (Micro)',
  digital_footprint TEXT,
  owner_name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- (Other tables like loss_audit_results etc. are already created by you, 
-- but you should ensure businesses has the admin columns)
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS owner_name TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS phone TEXT;

-- 3. Insert Default Admin
INSERT INTO admin_users (email, password_hash) 
VALUES ('admin@masterkey.com', 'masterkey123')
ON CONFLICT (email) DO NOTHING;

-- 4. ENABLE REALTIME — FAIL-SAFE VERSION
-- This block adds tables to realtime ONLY if they aren't already there.
DO $$
DECLARE
  tbl_name TEXT;
  tables_to_add TEXT[] := ARRAY['businesses', 'ai_threat_results', 'loss_audit_results', 'export_results', 'night_loss_results', 'visibility_results', 'admin_users'];
BEGIN
  FOREACH tbl_name IN ARRAY tables_to_add LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = tbl_name) THEN
      IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = tbl_name
      ) THEN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', tbl_name);
      END IF;
    END IF;
  END LOOP;
END $$;
