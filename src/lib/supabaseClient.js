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
            const options = args[1] || {};
            // Only force no-store for GET requests or if cache isn't explicitly set
            // Avoid messing with POST bodies in aggressive environments
            return fetch(args[0], {
                ...options,
                cache: (options.method === 'GET' || !options.method) ? 'no-store' : options.cache
            });
        }
    }
})
