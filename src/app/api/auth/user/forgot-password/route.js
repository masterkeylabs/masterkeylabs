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

        // 4. Send OTP (Simulated/Resend)
        let sentTo = null;
        const isEmail = identifier.includes('@');

        if (isEmail && process.env.RESEND_API_KEY && business.email) {
            const resend = new Resend(process.env.RESEND_API_KEY);
            const fromEmail = process.env.RESEND_FROM_EMAIL || 'MasterKey Labs <onboarding@resend.dev>';

            await resend.emails.send({
                from: fromEmail,
                to: [business.email],
                subject: `Password Reset Code: ${otpCode}`,
                html: `<div style="text-align:center; padding:20px;"><h2>Reset Password</h2><p>Your OTP is: <b>${otpCode}</b></p></div>`,
            });
            const [user, domain] = business.email.split('@');
            sentTo = `${user[0]}***${user[user.length - 1]}@${domain}`;
        }

        // Console log for development
        console.log(`🔑 USER PASSWORD RESET OTP: ${otpCode} FOR: ${identifier}`);

        return NextResponse.json({
            success: true,
            message: 'OTP sent successfully',
            sentTo: sentTo || (isEmail ? 'your email' : 'your mobile')
        });

    } catch (err) {
        console.error('User Forgot Password Error:', err);
        return NextResponse.json({ error: err.message || 'Failed to send OTP' }, { status: 500 });
    }
}
