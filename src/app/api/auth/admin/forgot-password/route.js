import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { Resend } from 'resend';

export async function POST(req) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        // 1. Check if admin user exists
        const { data: adminUsers, error: findError } = await supabase
            .from('admin_users')
            .select('id, email, role')
            .eq('email', email)
            .limit(1);

        if (findError) throw findError;

        const admin = adminUsers?.[0];

        if (!admin) {
            return NextResponse.json({
                error: 'No admin account found with this email address'
            }, { status: 404 });
        }

        // 2. Simple Rate Limiting: Check if an OTP was sent recently (last 60 seconds)
        const { data: recentOtps } = await supabase
            .from('admin_otp_verifications')
            .select('created_at')
            .eq('email', email)
            .gt('created_at', new Date(Date.now() - 60 * 1000).toISOString())
            .order('created_at', { ascending: false })
            .limit(1);

        if (recentOtps && recentOtps.length > 0) {
            return NextResponse.json({
                error: 'Please wait at least 60 seconds before requesting another code'
            }, { status: 429 });
        }

        // 3. Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // 4. Save OTP to database
        const { error: otpError } = await supabase
            .from('admin_otp_verifications')
            .insert({
                email: email,
                code: otpCode,
                expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
            });

        if (otpError) {
            // Graceful handling if table doesn't exist yet
            if (otpError.code === 'PGRST116' ||
                otpError.message.includes('relation "admin_otp_verifications" does not exist') ||
                otpError.message.includes('schema cache')) {
                return NextResponse.json({
                    error: 'Database table missing. Please run the admin_setup.sql script in Supabase to create the "admin_otp_verifications" table.'
                }, { status: 500 });
            }
            throw otpError;
        }

        // 5. Send OTP via Email
        let sentTo = null;

        if (process.env.RESEND_API_KEY) {
            const resend = new Resend(process.env.RESEND_API_KEY);
            const fromEmail = process.env.RESEND_FROM_EMAIL || 'MasterKey Labs <onboarding@resend.dev>';

            const { data, error: sendError } = await resend.emails.send({
                from: fromEmail,
                to: [email],
                subject: `Password Reset Code: ${otpCode}`,
                html: `
                    <div style="font-family: sans-serif; color: #333; text-align: center; padding: 40px; background: linear-gradient(135deg, #020617 0%, #0a1628 100%);">
                        <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(0,229,255,0.2); border-radius: 20px; padding: 40px; max-width: 500px; margin: 0 auto;">
                            <h2 style="color: #00e5ff; margin-bottom: 10px; font-size: 24px; font-weight: bold;">MasterKey Labs</h2>
                            <p style="color: rgba(255,255,255,0.4); font-size: 10px; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 30px;">Command Center</p>
                            
                            <p style="font-size: 16px; color: rgba(255,255,255,0.8); margin-bottom: 30px;">
                                A password reset was requested for your admin account. Use the following code to reset your password:
                            </p>
                            
                            <div style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #00e5ff; margin: 30px 0; padding: 20px; background: rgba(0,229,255,0.1); border-radius: 12px; border: 2px solid rgba(0,229,255,0.3);">
                                ${otpCode}
                            </div>
                            
                            <p style="font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 30px;">
                                This code will expire in 10 minutes.
                            </p>
                            
                            <p style="font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                                If you didn't request this password reset, please ignore this email or contact support immediately.
                            </p>
                        </div>
                    </div>
                `,
            });

            if (sendError) {
                console.error('❌ Admin Resend API Error:', sendError);
            } else {
                console.log('✅ Admin Resend Success:', data);
                const [user, domain] = email.split('@');
                sentTo = `${user[0]}***${user[user.length - 1]}@${domain}`;
            }
        }

        // CRITICAL for testing: Always log to console
        console.log('\n' + '='.repeat(50));
        console.log(`🔐 ADMIN PASSWORD RESET OTP`);
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Code: ${otpCode}`);
        console.log(`⏰ Expires: ${new Date(Date.now() + 10 * 60 * 1000).toLocaleString()}`);
        if (!sentTo) {
            console.log('⚠️  EMAIL NOT SENT - RESEND_API_KEY not configured');
        }
        console.log('='.repeat(50) + '\n');

        return NextResponse.json({
            success: true,
            message: 'Password reset code sent successfully',
            sentTo: sentTo || 'your email (check console logs for OTP)'
        });

    } catch (err) {
        console.error('Forgot Password Error:', err);
        return NextResponse.json({
            error: err.message || 'Failed to send password reset code'
        }, { status: 500 });
    }
}
