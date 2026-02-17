import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req) {
    try {
        const { email, code } = await req.json();

        if (!email || !code) {
            return NextResponse.json({
                error: 'Email and OTP code are required'
            }, { status: 400 });
        }

        // 1. Verify OTP exists and hasn't expired
        const { data: verifications, error: verifyError } = await supabase
            .from('admin_otp_verifications')
            .select('*')
            .eq('email', email)
            .eq('code', code)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1);

        if (verifyError) {
            if (verifyError.code === 'PGRST116') {
                return NextResponse.json({
                    error: 'Database table missing. Please run the admin_setup.sql script.'
                }, { status: 500 });
            }
            throw verifyError;
        }

        const verification = verifications?.[0];

        if (!verification) {
            return NextResponse.json({
                error: 'Invalid or expired OTP code'
            }, { status: 401 });
        }

        // 2. Verify admin user still exists
        const { data: adminUsers, error: adminError } = await supabase
            .from('admin_users')
            .select('id, email')
            .eq('email', email)
            .limit(1);

        if (adminError) throw adminError;

        const admin = adminUsers?.[0];

        if (!admin) {
            return NextResponse.json({
                error: 'Admin account no longer exists'
            }, { status: 404 });
        }

        // 3. Generate a temporary reset token (valid for 5 minutes)
        // Simple token: base64 encoded email + timestamp + verification id
        const resetToken = Buffer.from(
            JSON.stringify({
                email: email,
                verificationId: verification.id,
                expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
            })
        ).toString('base64');

        console.log(`✅ OTP verified for admin: ${email}`);

        return NextResponse.json({
            success: true,
            resetToken: resetToken,
            message: 'OTP verified successfully'
        });

    } catch (err) {
        console.error('Verify Reset OTP Error:', err);
        return NextResponse.json({
            error: err.message || 'OTP verification failed'
        }, { status: 500 });
    }
}
