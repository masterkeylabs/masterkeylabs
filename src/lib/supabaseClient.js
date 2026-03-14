import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Using Browser Client with custom auth configuration to prevent LockManager timeouts
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'masterkey-auth-token', // Explicit storage key
        // Explicitly bypass WebLocks to prevent "Acquiring an exclusive Navigator LockManager lock timed out"
        lock: (...args) => {
            // Supabase GoTrue can pass 2 or 3 arguments (name, [options], acquire_callback).
            // We use rest parameters to always grab the final argument as the callback function.
            const acquire = args[args.length - 1];
            
            // By executing acquire() directly without navigator.locks, we prevent cross-tab or concurrent request deadlocks.
            // This is a safe and recommended bypass for SPAs struggling with WebLock hanging issues.
            if (typeof acquire === 'function') {
               return Promise.resolve().then(() => acquire());
            }
            return Promise.resolve();
        }
    }
});
