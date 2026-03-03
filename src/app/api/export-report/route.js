import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Only initialize if API key is present to avoid startup errors
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req) {
    try {
        const body = await req.json();
        const { email, pdfBase64, businessName } = body;

        if (!process.env.RESEND_API_KEY) {
            return NextResponse.json({
                success: false,
                error: 'Email service not configured. Please add RESEND_API_KEY to .env.local and restart the server.'
            }, { status: 500 });
        }

        if (!email) {
            return NextResponse.json({ success: false, error: 'Target email address is required.' }, { status: 400 });
        }

        if (!pdfBase64) {
            return NextResponse.json({ success: false, error: 'PDF data is missing from the payload.' }, { status: 400 });
        }

        console.log(`--- DISPATCHING PDF REPORT TO ${email} ---`);

        // Strip the data URL prefix if sent from the client
        const base64Data = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
        const name = businessName || 'Your Business';

        // Crucial Fix: Convert base64 string to a raw Node.js Buffer so Resend treats it as a binary file 
        // instead of raw ASCII text, preventing PDF corruption inside the email attachment.
        const pdfBuffer = Buffer.from(base64Data, 'base64');

        const { data: resData, error: resError } = await resend.emails.send({
            from: 'MasterKey Intelligence <reports@masterkeylabs.in>',
            to: email, // Can be user-provided via modal
            subject: `[CONFIDENTIAL] Comprehensive Audit Report - ${name}`,
            text: `Please find the requested Comprehensive System Audit Report for ${name} attached to this email.\n\nThis confidential PDF details your Total Annual Bleed, Operational Friction, and the actionable steps for your Masterkey Labs Survival Protocol.\n\nBest,\nMasterKey OS Automated Dispatch`,
            attachments: [
                {
                    filename: `${name.replace(/\s+/g, '_')}_Audit_Report.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf',
                },
            ],
        });

        if (resError) throw resError;

        return NextResponse.json({
            success: true,
            message: `PDF Audit Report successfully dispatched to ${email}`
        });

    } catch (error) {
        console.error('PDF Export Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
