import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!url || !key) {
    console.warn('Supabase: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add them to .env.local');
}

export const supabase = url && key ? createClient(url, key) : null;

export function getSupabase() {
    if (!supabase) {
        throw new Error('Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local');
    }
    return supabase;
}
