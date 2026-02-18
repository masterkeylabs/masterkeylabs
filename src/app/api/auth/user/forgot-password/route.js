import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { Resend } from 'resend';

export async function POST(req) {
    try {
        const { identifier } = await req.json();

        if (!identifier) {
            return NextResponse.json({ error: 'Email or mobile number is required' }, { status: 400 });
        }

        // 1. Check if business exists
        const { data: businesses, error: findError } = await supabase
            .from('businesses')
            .select('id, email, phone')
            .or(`email.eq.${identifier},phone.eq.${identifier}`)
            .order('created_at', { ascending: false })
            .limit(1);

        if (findError) throw findError;

        const business = businesses?.[0];

        if (!business) {
            return NextResponse.json({ error: 'No account found with this identifier' }, { status: 404 });
        }

        // 2. Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // 3. Save OTP to database (using existing otp_verifications table)
        const { error: otpError } = await supabase
            .from('otp_verifications')
            .insert({
                identifier: identifier,
                code: otpCode,
                expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
            });

        if (otpError) throw otpError;

        // 4. Send OTP (Strict Delivery via Resend)
        let sentTo = null;
        const isEmail = identifier.includes('@');

        if (isEmail && process.env.RESEND_API_KEY && business.email) {
            console.log(`📡 Attempting Resend for: ${business.email}`);
            const resend = new Resend(process.env.RESEND_API_KEY);
            const fromEmail = process.env.RESEND_FROM_EMAIL || 'MasterKey Labs <onboarding@resend.dev>';

            const { data, error: sendError } = await resend.emails.send({
                from: fromEmail,
                to: [business.email],
                subject: `Password Reset Code: ${otpCode}`,
                html: `
                    <div style="font-family: sans-serif; color: #333; text-align: center; padding: 40px; background: #020617;">
                        <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(0,229,255,0.2); border-radius: 20px; padding: 40px; max-width: 500px; margin: 0 auto;">
                            <h2 style="color: #00e5ff;">MasterKey Labs</h2>
                            <p style="color: #fff; font-size: 16px;">Use the code below to reset your password:</p>
                            <div style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #00e5ff; margin: 20px 0; padding: 20px; border: 1px solid rgba(0,229,255,0.3); border-radius: 12px;">
                                ${otpCode}
                            </div>
                            <p style="font-size: 12px; color: #777;">This code will expire in 10 minutes.</p>
                        </div>
                    </div>
                `,
            });

            if (sendError) {
                console.error('❌ Resend API Error:', sendError);
            } else {
                console.log('✅ Resend success:', data);
                const [user, domain] = business.email.split('@');
                sentTo = `${user[0]}***${user[user.length - 1]}@${domain}`;
            }
        }

        // Console log for development / debugging
        console.log('\n' + '='.repeat(40));
        console.log(`🔑 USER OTP: ${otpCode}`);
        console.log(`📧 For: ${identifier}`);
        if (isEmail && !sentTo) console.log('⚠️  EMAIL FAILED OR RESEND NOT CONFIGURED');
        console.log('='.repeat(40) + '\n');

        return NextResponse.json({
            success: true,
            message: sentTo ? 'OTP sent successfully' : 'OTP generated (Email delivery failed status)',
            sentTo: sentTo || (isEmail ? 'your email' : 'your mobile')
        });

    } catch (err) {
        console.error('User Forgot Password Error:', err);
        return NextResponse.json({ error: err.message || 'Failed to send OTP' }, { status: 500 });
    }
}
