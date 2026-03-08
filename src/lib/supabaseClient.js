import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Using Browser Client to synchronize cookies with the server-side callback
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // Bypass Navigator Lock Manager via function strategy (Fixes both 10s timeout and TypeError)
        lock: async (name, callback) => {
            return await callback();
        }
    }
});
