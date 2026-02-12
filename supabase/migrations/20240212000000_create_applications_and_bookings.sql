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

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
