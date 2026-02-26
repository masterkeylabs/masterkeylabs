import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
    try {
        const { phone, code, fullName } = await req.json();

        if (!phone || !code) {
            return NextResponse.json({ error: 'Phone and code are required' }, { status: 400 });
        }

        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID || process.env.TWILIO_SERVICE_SID;

        const response = await fetch(
            `https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
                },
                body: new URLSearchParams({
                    To: phone,
                    Code: code,
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ error: data.message || 'Verification failed' }, { status: response.status });
        }

        if (data.status === 'approved') {
            // Bypass Supabase OTP and use Admin API to sign in/up since we verified via Twilio
            // For a production app, you might want to create a custom JWT or use Supabase's passwordless flow
            // Here, we'll use a service role to ensure the user exists in Supabase.
            // NOTE: You need SUPABASE_SERVICE_ROLE_KEY for this.

            return NextResponse.json({
                success: true,
                message: 'Verified',
                // We'll return the verification status. The frontend will then handle Supabase session.
                // In a real app, you'd exchange this for a Supabase session here.
            });
        }

        return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    } catch (error) {
        console.error('OTP Verify Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
