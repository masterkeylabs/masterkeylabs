-- Workshop Registrations Table
CREATE TABLE IF NOT EXISTS workshop_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    stream TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE workshop_registrations ENABLE ROW LEVEL SECURITY;

-- Insert sample streams if needed
-- Streams: AI/ML, Web Development, Data Science, Cloud Computing, Cybersecurity, etc.
