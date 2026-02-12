-- Run this SQL in your Supabase SQL Editor to create the tables

-- Applications (career submissions)
CREATE TABLE IF NOT EXISTS applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    vision TEXT NOT NULL,
    cv_data TEXT,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings (deep dive sessions)
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    company TEXT NOT NULL,
    preferred_date TEXT NOT NULL,
    preferred_time TEXT NOT NULL,
    message TEXT DEFAULT '',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'confirmed', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (optional - we use service role which bypasses RLS)
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Registrations (users who signed up via audit modal)
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
