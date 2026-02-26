import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { phone } = await req.json();

        if (!phone) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const serviceSid = process.env.TWILIO_SERVICE_SID;

        if (!accountSid || !authToken || !serviceSid) {
            console.error('Twilio credentials missing');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const response = await fetch(
            `https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
                },
                body: new URLSearchParams({
                    To: phone,
                    Channel: 'sms',
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error('Twilio API Error:', data);
            return NextResponse.json({ error: data.message || 'Failed to send OTP' }, { status: response.status });
        }

        return NextResponse.json({ success: true, sid: data.sid });
    } catch (error) {
        console.error('OTP Send Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
