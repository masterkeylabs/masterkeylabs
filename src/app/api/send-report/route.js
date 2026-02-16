import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = null; // Replaced by local initialization inside POST

export async function POST(req) {
    try {
        if (!process.env.RESEND_API_KEY) {
            console.error('RESEND_API_KEY is not configured in environment variables.');
            return NextResponse.json({
                error: 'Email service not configured. Please add RESEND_API_KEY to .env.local'
            }, { status: 500 });
        }

        const resend = new Resend(process.env.RESEND_API_KEY);
        const { email, businessName, pdfBase64, contactPhone } = await req.json();

        if (!email || !pdfBase64) {
            return NextResponse.json({ error: 'Missing email or PDF data' }, { status: 400 });
        }

        const { data, error } = await resend.emails.send({
            from: 'MasterKey Labs <onboarding@resend.dev>', // Use Resend's default onboarding email for testing
            to: [email],
            subject: `Diagnostic Report: ${businessName}`,
            html: `
                <div style="font-family: sans-serif; color: #333; line-height: 1.6;">
                    <h2 style="color: #00e5ff;">MasterKey Labs Diagnostic Report</h2>
                    <p>Hello,</p>
                    <p>Attached is the Business Diagnostic Report for <strong>${businessName}</strong>.</p>
                    <p>This report highlights the AI threats to your industry, operational waste areas, and identified market opportunities for your business.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <h3>Next Steps for Future-Proofing:</h3>
                    <ul>
                        <li><strong>Brand Identity:</strong> Premium positioning in the AI-first economy.</li>
                        <li><strong>Systems & Automation:</strong> Automating repetitive tasks with custom AI solutions.</li>
                        <li><strong>Growth Marketing:</strong> Lead generation pipelines optimized for high conversion.</li>
                    </ul>
                    <p>If you have any questions, feel free to contact us via WhatsApp at +91 79009 00007 or reply to this email at support@masterkeylabs.in.</p>
                    <p>Best regards,<br/><strong>MasterKey Labs Team</strong></p>
                </div>
            `,
            attachments: [
                {
                    filename: `Diagnostic_Report_${businessName.replace(/\s+/g, '_')}.pdf`,
                    content: pdfBase64,
                },
            ],
        });

        if (error) {
            console.error('Resend Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (err) {
        console.error('API Error:', err);
        return NextResponse.json({ error: 'Internal Server Error: ' + err.message }, { status: 500 });
    }
}
