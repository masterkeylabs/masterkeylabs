-- MASTERKEY V3.0 SCHEMA MIGRATION
-- Purpose: Add user status and verification tracking for Admin Dashboard.
-- Instructions: Run this in your Supabase SQL Editor.

-- 1. Updates for User Management
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- 2. Indexing for performance
CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);

-- 3. Documentation
COMMENT ON COLUMN businesses.status IS 'User account status: active, inactive, blocked';
COMMENT ON COLUMN businesses.is_verified IS 'Whether the user has verified their identity or business details';
