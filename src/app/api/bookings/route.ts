import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

function toCamelCase(row: Record<string, unknown>) {
    const map: Record<string, string> = {
        preferred_date: 'preferredDate',
        preferred_time: 'preferredTime',
        created_at: 'createdAt',
    };
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(row)) {
        out[map[k] || k] = v;
    }
    return out;
}

export async function POST(request: Request) {
    try {
        console.log('[API] Booking POST request received');

        const body = await request.json();
        console.log('[API] Request body:', body);

        const { data, error } = await getSupabase()
            .from('bookings')
            .insert({
                name: body.name,
                email: body.email,
                phone: body.phone,
                company: body.company,
                preferred_date: body.preferredDate,
                preferred_time: body.preferredTime,
                message: body.message || '',
            })
            .select()
            .single();

        if (error) {
            console.error('[API] Supabase error:', error);
            return NextResponse.json(
                {
                    success: false,
                    error: 'Failed to create booking',
                    details: error.message,
                    type: error.code,
                },
                { status: 500 }
            );
        }

        console.log('[API] Booking created:', data?.id);
        return NextResponse.json({ success: true, booking: toCamelCase(data || {}) }, { status: 201 });
    } catch (err: unknown) {
        const error = err as Error;
        console.error('[API] Error creating booking:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create booking',
                details: error.message,
                type: error.name,
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        console.log('[API] Booking GET request received');

        const { data, error } = await getSupabase()
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[API] Supabase error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch bookings', details: error.message },
                { status: 500 }
            );
        }

        const bookings = (data || []).map(toCamelCase);
        console.log('[API] Bookings fetched:', bookings.length);

        return NextResponse.json(bookings);
    } catch (err: unknown) {
        const error = err as Error;
        console.error('[API] Error fetching bookings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch bookings', details: error.message },
            { status: 500 }
        );
    }
}
