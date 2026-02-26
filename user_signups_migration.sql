-- Create user_signups table to track all new signups from the intake wizard
CREATE TABLE IF NOT EXISTS user_signups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    business_name TEXT,
    industry TEXT,
    revenue_bracket TEXT,
    employees TEXT,
    signed_up_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups by email and phone
CREATE INDEX IF NOT EXISTS idx_user_signups_email ON user_signups(email);
CREATE INDEX IF NOT EXISTS idx_user_signups_phone ON user_signups(phone);
CREATE INDEX IF NOT EXISTS idx_user_signups_business_id ON user_signups(business_id);
