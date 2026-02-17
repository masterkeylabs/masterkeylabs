import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {
        const { resetToken, newPassword } = await req.json();

        if (!resetToken || !newPassword) {
            return NextResponse.json({
                error: 'Reset token and new password are required'
            }, { status: 400 });
        }

        // Validate password strength
        if (newPassword.length < 8) {
            return NextResponse.json({
                error: 'Password must be at least 8 characters long'
            }, { status: 400 });
        }

        // 1. Decode and validate reset token
        let tokenData;
        try {
            const decoded = Buffer.from(resetToken, 'base64').toString('utf-8');
            tokenData = JSON.parse(decoded);
        } catch (e) {
            return NextResponse.json({
                error: 'Invalid reset token'
            }, { status: 401 });
        }

        // Check if token has expired
        if (Date.now() > tokenData.expiresAt) {
            return NextResponse.json({
                error: 'Reset token has expired. Please request a new password reset code.'
            }, { status: 401 });
        }

        // 2. Verify the OTP verification still exists
        const { data: verifications, error: verifyError } = await supabase
            .from('admin_otp_verifications')
            .select('*')
            .eq('id', tokenData.verificationId)
            .eq('email', tokenData.email)
            .limit(1);

        if (verifyError) throw verifyError;

        if (!verifications || verifications.length === 0) {
            return NextResponse.json({
                error: 'Invalid or already used reset token'
            }, { status: 401 });
        }

        // 3. Hash the new password with bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // 4. Update admin user password
        const { error: updateError } = await supabase
            .from('admin_users')
            .update({ password_hash: hashedPassword })
            .eq('email', tokenData.email);

        if (updateError) throw updateError;

        // 5. Delete the used OTP verification
        await supabase
            .from('admin_otp_verifications')
            .delete()
            .eq('email', tokenData.email);

        console.log(`✅ Password reset successful for admin: ${tokenData.email}`);

        return NextResponse.json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (err) {
        console.error('Reset Password Error:', err);
        return NextResponse.json({
            error: err.message || 'Failed to reset password'
        }, { status: 500 });
    }
}
