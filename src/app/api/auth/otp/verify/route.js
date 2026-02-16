import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req) {
    try {
        const { identifier, code } = await req.json();

        if (!identifier || !code) {
            return NextResponse.json({ error: 'Identifier and OTP code are required' }, { status: 400 });
        }

        // 1. Verify OTP
        let verification = null;
        const isEmail = identifier.includes('@');
        const isPhone = /^\+?[\d\s\-]{10,}$/.test(identifier) && !isEmail;

        if (isPhone && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_VERIFY_SERVICE_SID) {
            // --- Twilio Verify Check ---
            try {
                const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');

                // Unified Robust Normalization
                let normalizedPhone = identifier.replace(/\D/g, '');
                if (!identifier.startsWith('+')) {
                    if (normalizedPhone.length === 10) {
                        normalizedPhone = `+91${normalizedPhone}`;
                    } else {
                        normalizedPhone = `+${normalizedPhone}`;
                    }
                } else {
                    normalizedPhone = `+${normalizedPhone}`;
                }

                console.log(`📡 Verifying Twilio OTP for: ${normalizedPhone} (Code: ${code})`);

                const twilioRes = await fetch(
                    `https://verify.twilio.com/v2/Services/${process.env.TWILIO_VERIFY_SERVICE_SID}/VerificationCheck`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Basic ${auth}`,
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: new URLSearchParams({
                            To: normalizedPhone,
                            Code: code,
                        }),
                    }
                );

                const verifyData = await twilioRes.json();
                if (twilioRes.ok && verifyData.status === 'approved') {
                    verification = { success: true }; // Dummy object to pass existing check
                    console.log(`✅ Twilio Verify approved for ${normalizedPhone}`);
                } else {
                    console.error('❌ Twilio Verify Check Failed:', verifyData);
                }
            } catch (err) {
                console.error('❌ Twilio Verify Network Error:', err);
            }
        } else {
            // --- Existing Supabase-based verification for Email ---
            const { data: verifications, error: verifyError } = await supabase
                .from('otp_verifications')
                .select('*')
                .eq('identifier', identifier)
                .eq('code', code)
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false })
                .limit(1);

            if (verifyError) throw verifyError;
            verification = verifications?.[0];
        }

        if (!verification) {
            return NextResponse.json({ error: 'Invalid or expired OTP code' }, { status: 401 });
        }

        // 2. Fetch business data (most recent match)
        const { data: businesses, error: businessError } = await supabase
            .from('businesses')
            .select('id')
            .or(`email.eq.${identifier},phone.eq.${identifier}`)
            .order('created_at', { ascending: false })
            .limit(1);

        if (businessError) throw businessError;
        const business = businesses?.[0];

        if (!business) {
            return NextResponse.json({ error: 'Account no longer exists' }, { status: 404 });
        }

        // 3. Cleanup: Delete used OTP
        await supabase
            .from('otp_verifications')
            .delete()
            .eq('identifier', identifier);

        return NextResponse.json({
            success: true,
            businessId: business.id
        });

    } catch (err) {
        console.error('OTP Verify Error:', err);
        return NextResponse.json({ error: err.message || 'Verification failed' }, { status: 500 });
    }
}
