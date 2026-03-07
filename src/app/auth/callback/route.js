import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function GET(request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';

    if (code) {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data?.session) {
            console.log('--- OAuth Callback: Success ---');
            return NextResponse.redirect(`${origin}${next}`);
        }

        if (error) {
            console.error('--- OAuth Callback: Exchange Error ---', error);
        }
    }

    // fallback to login with error param
    return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`);
}
