import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Using standard SSR Browser Client. DO NOT manually override `storageKey` or `auth` settings 
// here as it breaks the @supabase/ssr auto-chunking cookie transport required for Server Side Rendering!
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
