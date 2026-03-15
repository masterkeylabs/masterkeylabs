import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

async function getAuthenticatedClient() {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    if (!clientEmail || !privateKey) {
        throw new Error('Google Calendar credentials missing in environment variables');
    }

    return new JWT({
        email: clientEmail,
        key: privateKey,
        scopes: SCOPES,
    });
}

export async function GET() {
    try {
        const auth = await getAuthenticatedClient();
        const calendar = google.calendar({ version: 'v3', auth });
        const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

        // Check availability for the next 7 days
        const timeMin = new Date().toISOString();
        const timeMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

        const response = await calendar.freebusy.query({
            requestBody: {
                timeMin,
                timeMax,
                items: [{ id: calendarId }],
            },
        });

        const busySlots = response.data.calendars[calendarId].busy;

        // Generate suggested slots: Next 3 available 45-min slots during business hours (10 AM - 6 PM IST)
        const availableSlots = [];
        let currentCheck = new Date();
        currentCheck.setMinutes(0, 0, 0); // Round to hour
        
        while (availableSlots.length < 3 && availableSlots.length < 20) { // Limit iterations
            currentCheck.setHours(currentCheck.getHours() + 1);
            
            // Adjust to next business day if past 5 PM or weekend
            const day = currentCheck.getDay();
            const hour = currentCheck.getHours();
            
            if (day === 0 || day === 6 || hour < 10 || hour >= 17) {
                currentCheck.setDate(currentCheck.getDate() + 1);
                currentCheck.setHours(10, 0, 0, 0);
                continue;
            }

            const slotStart = new Date(currentCheck);
            const slotEnd = new Date(slotStart.getTime() + 45 * 60 * 1000);

            const isBusy = busySlots.some(busy => {
                const bStart = new Date(busy.start);
                const bEnd = new Date(busy.end);
                return (slotStart < bEnd && slotEnd > bStart);
            });

            if (!isBusy) {
                availableSlots.push({
                    start: slotStart.toISOString(),
                    end: slotEnd.toISOString(),
                    label: slotStart.toLocaleString('en-IN', { 
                        weekday: 'short', 
                        hour: 'numeric', 
                        minute: '2-digit', 
                        hour12: true,
                        timeZone: 'Asia/Kolkata' 
                    })
                });
            }
        }
        
        return NextResponse.json({ availableSlots });
    } catch (error) {
        console.error('Google Calendar API Error (GET):', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { startTime, endTime, summary, description, attendeeEmail } = await request.json();
        
        const auth = await getAuthenticatedClient();
        const calendar = google.calendar({ version: 'v3', auth });
        const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

        const event = {
            summary: summary || 'MasterKey Architecture Review',
            description: description || 'Technical blueprint session for survival.',
            start: {
                dateTime: startTime,
                timeZone: 'Asia/Kolkata',
            },
            end: {
                dateTime: endTime,
                timeZone: 'Asia/Kolkata',
            },
            attendees: attendeeEmail ? [{ email: attendeeEmail }] : [],
            reminders: {
                useDefault: true,
            },
        };

        const response = await calendar.events.insert({
            calendarId,
            resource: event,
            sendUpdates: 'all',
        });

        return NextResponse.json({ success: true, event: response.data });
    } catch (error) {
        console.error('Google Calendar API Error (POST):', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
