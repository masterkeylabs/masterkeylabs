-- Registrations (users who signed up via audit/registration modal)
CREATE TABLE IF NOT EXISTS registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    company TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit submissions (when logged-in user completes audit tabs)
CREATE TABLE IF NOT EXISTS audit_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT NOT NULL,
    user_name TEXT,
    user_company TEXT,
    audit_type TEXT NOT NULL,
    audit_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_submissions ENABLE ROW LEVEL SECURITY;
