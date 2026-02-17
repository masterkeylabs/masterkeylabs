import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {
        const { identifier, otp, newPassword } = await req.json();

        if (!identifier || !otp || !newPassword) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        // 1. Verify OTP
        const { data: verifications, error: verifyError } = await supabase
            .from('otp_verifications')
            .select('*')
            .eq('identifier', identifier)
            .eq('code', otp)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1);

        if (verifyError) throw verifyError;

        if (!verifications || verifications.length === 0) {
            return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 });
        }

        // 2. Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 3. Update business password
        const { error: updateError } = await supabase
            .from('businesses')
            .update({ password_hash: hashedPassword })
            .or(`email.eq.${identifier},phone.eq.${identifier}`);

        if (updateError) throw updateError;

        // 4. Cleanup
        await supabase.from('otp_verifications').delete().eq('identifier', identifier);

        return NextResponse.json({ success: true, message: 'Password reset successful' });

    } catch (err) {
        console.error('User Reset Password Error:', err);
        return NextResponse.json({ error: err.message || 'Reset failed' }, { status: 500 });
    }
}
