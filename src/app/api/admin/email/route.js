import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req) {
    try {
        const { email, subject, message, businessName } = await req.json();

        if (!process.env.RESEND_API_KEY) {
            return NextResponse.json({
                success: false,
                error: 'Email service not configured.'
            }, { status: 500 });
        }

        if (!email || !subject || !message) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const fromEmail = process.env.RESEND_FROM_EMAIL || 'reports@masterkeylabs.ai';

        const { data, error } = await resend.emails.send({
            from: `MasterKey Admin <${fromEmail}>`,
            to: email,
            subject: subject,
            text: message,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #020617;">
                    <h2 style="color: #00e5ff;">Message from MasterKey Admin</h2>
                    <p><strong>Business:</strong> ${businessName || 'N/A'}</p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                    <div style="line-height: 1.6; white-space: pre-wrap;">${message}</div>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #64748b;">This is a secure transmission from the MasterKey Command Center.</p>
                </div>
            `
        });

        if (error) throw error;

        return NextResponse.json({ success: true, messageId: data.id });
    } catch (error) {
        console.error('Admin Email POST Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
