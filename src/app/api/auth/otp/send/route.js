import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { Resend } from 'resend';

export async function POST(req) {
    try {
        const { identifier } = await req.json(); // email or phone

        if (!identifier) {
            return NextResponse.json({ error: 'Email or mobile number is required' }, { status: 400 });
        }

        // 1. Check if business exists (taking the most recent one if duplicates exist)
        const { data: businesses, error: findError } = await supabase
            .from('businesses')
            .select('id, email, phone, entity_name')
            .or(`email.eq.${identifier},phone.eq.${identifier}`)
            .order('created_at', { ascending: false })
            .limit(1);

        if (findError) throw findError;

        const business = businesses?.[0];

        if (!business) {
            return NextResponse.json({ error: 'No account found with this identifier. Please sign up instead.' }, { status: 404 });
        }

        // 2. Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // 3. Save OTP to database
        const { error: otpError } = await supabase
            .from('otp_verifications')
            .insert({
                identifier: identifier,
                code: otpCode,
                expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
            });

        if (otpError) {
            // Graceful handling if table doesn't exist yet
            if (otpError.code === 'PGRST116' ||
                otpError.message.includes('relation "otp_verifications" does not exist') ||
                otpError.message.includes('schema cache')) {
                return NextResponse.json({
                    error: 'Database table missing. Please follow the instructions in the implementation plan to create the "otp_verifications" table in Supabase.'
                }, { status: 500 });
            }
            throw otpError;
        }

        // 4. Send OTP via Email or SMS (Strict Separation)
        let sentTo = null;
        const isEmail = identifier.includes('@');
        const isPhone = /^\+?[\d\s\-]{10,}$/.test(identifier) && !isEmail;

        if (isPhone) {
            // --- STRICT SMS Delivery (Twilio Verify Service) ---
            if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_VERIFY_SERVICE_SID) {
                try {
                    const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');

                    // Improved Normalization for India (+91)
                    let normalizedPhone = identifier.replace(/\D/g, '');
                    if (!identifier.startsWith('+')) {
                        if (normalizedPhone.length === 10) {
                            normalizedPhone = `+91${normalizedPhone}`;
                        } else {
                            normalizedPhone = `+${normalizedPhone}`;
                        }
                    } else {
                        normalizedPhone = `+${normalizedPhone}`; // already has + roughly
                    }

                    console.log(`📡 Attempting Twilio Verify for: ${normalizedPhone} (Original: ${identifier})`);

                    const twilioRes = await fetch(
                        `https://verify.twilio.com/v2/Services/${process.env.TWILIO_VERIFY_SERVICE_SID}/Verifications`,
                        {
                            method: 'POST',
                            headers: {
                                'Authorization': `Basic ${auth}`,
                                'Content-Type': 'application/x-www-form-urlencoded',
                            },
                            body: new URLSearchParams({
                                To: normalizedPhone,
                                Channel: 'sms',
                            }),
                        }
                    );

                    if (twilioRes.ok) {
                        const cleanPhone = normalizedPhone.replace(/\D/g, '');
                        sentTo = `+${'*'.repeat(cleanPhone.length - 4)}${cleanPhone.slice(-4)}`;
                        console.log(`✅ Twilio Verify OTP triggered for ${normalizedPhone}`);
                    } else {
                        const errorData = await twilioRes.json();
                        console.error('❌ Twilio Verify API Error Details:', JSON.stringify(errorData, null, 2));
                        // If it's a trial account error, log it specifically
                        if (errorData.code === 60200) console.log('💡 TIP: Invalid phone number format.');
                        if (errorData.code === 21608) console.log('💡 TIP: Trial account - verify this number in Twilio console first.');
                    }
                } catch (smsErr) {
                    console.error('❌ Twilio Verify Network Error:', smsErr);
                }
            }
        } else if (isEmail) {
            // --- STRICT Email Delivery (Resend) ---
            if (process.env.RESEND_API_KEY && business.email) {
                const resend = new Resend(process.env.RESEND_API_KEY);
                const fromEmail = process.env.RESEND_FROM_EMAIL || 'MasterKey Labs <onboarding@resend.dev>';

                const { data, error: sendError } = await resend.emails.send({
                    from: fromEmail,
                    to: [business.email],
                    subject: `Your Login OTP: ${otpCode}`,
                    html: `
                        <div style="font-family: sans-serif; color: #333; text-align: center; padding: 40px;">
                            <h2 style="color: #00e5ff;">MasterKey Labs</h2>
                            <p style="font-size: 16px;">Use the following code to access your command center:</p>
                            <div style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #00e5ff; margin: 20px 0;">
                                ${otpCode}
                            </div>
                            <p style="font-size: 12px; color: #777;">This code will expire in 10 minutes.</p>
                        </div>
                    `,
                });

                if (sendError) {
                    console.error('❌ Login OTP Resend API Error:', sendError);
                } else {
                    console.log('✅ Login OTP Resend Success:', data);
                    const [user, domain] = business.email.split('@');
                    sentTo = `${user[0]}***${user[user.length - 1]}@${domain}`;
                }
            }
        }

        // CRITICAL for user testing: Log to console in ALL cases
        console.log('\n' + '='.repeat(35));
        console.log(`🔑 LOGIN OTP FOR: ${identifier}`);
        console.log(`👉 CODE: ${otpCode}`);
        if (isPhone && !sentTo) {
            console.log('⚠️  SMS FAILED OR TWILIO NOT CONFIGURED');
        }
        if (isEmail && !sentTo) {
            console.log('⚠️  EMAIL FAILED OR RESEND NOT CONFIGURED');
        }
        console.log('='.repeat(35) + '\n');

        return NextResponse.json({
            success: true,
            message: 'OTP sent successfully',
            sentTo: sentTo || (isPhone ? 'your mobile' : 'your email')
        });

    } catch (err) {
        console.error('OTP Send Error:', err);
        return NextResponse.json({ error: err.message || 'Failed to send OTP' }, { status: 500 });
    }
}
