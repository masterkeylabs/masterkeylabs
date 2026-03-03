import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'masterkey-auth-token',
        flowType: 'pkce'
    },
    global: {
        fetch: (...args) => {
            // Force bypass of Next.js aggressive client-side fetch caching
            return fetch(args[0], { ...args[1], cache: 'no-store' });
        }
    }
})
