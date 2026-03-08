import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function GET(request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';
    const urlError = searchParams.get('error');

    console.log('--- OAuth Callback: Request Received ---');
    console.log('Full URL:', request.url);

    if (urlError) {
        console.error('--- OAuth Callback: Google or URL Error ---', urlError);
        // If it's just our own error-loop param, don't necessarily bail if code is present
        // but it's better to clean the flow.
    }

    if (code) {
        const supabase = await createClient();
        console.log('--- OAuth Callback: Attempting Code Exchange ---');
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        console.log('--- OAuth Callback: Exchange Result ---', { hasSession: !!data?.session, hasError: !!exchangeError });

        if (!exchangeError && data?.session) {
            console.log('--- OAuth Callback: Success! Session created ---');
            return NextResponse.redirect(`${origin}${next}`);
        }

        if (exchangeError) {
            console.error('--- OAuth Callback: Exchange Error ---', exchangeError.message, exchangeError.status);
        } else if (!data?.session) {
            console.warn('--- OAuth Callback: No session data returned ---');
        }
    } else {
        console.warn('--- OAuth Callback: Missing code parameter ---');
    }

    // fallback to login with error param
    console.error('--- OAuth Callback: Redirecting to login with failure ---');
    return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`);
}
