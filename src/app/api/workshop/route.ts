import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

function toCamelCase(row: Record<string, unknown>) {
    const map: Record<string, string> = {
        full_name: 'fullName',
        contact_number: 'contactNumber',
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
        const body = await request.json();
        const { fullName, email, contactNumber, stream } = body;

        if (!fullName || !email || !contactNumber || !stream) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await getSupabase()
            .from('workshop_registrations')
            .insert({
                full_name: fullName,
                email: email,
                contact_number: contactNumber,
                stream: stream,
            })
            .select()
            .single();

        if (error) {
            console.error('Workshop registration error:', error);
            return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
        }

        return NextResponse.json(toCamelCase(data), { status: 201 });
    } catch (err) {
        console.error('Workshop registration error:', err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const { data, error } = await getSupabase()
            .from('workshop_registrations')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Failed to fetch workshop registrations:', error);
            return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
        }

        return NextResponse.json(data?.map(toCamelCase) || []);
    } catch (err) {
        console.error('Failed to fetch workshop registrations:', err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const { error } = await getSupabase()
            .from('workshop_registrations')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Failed to delete workshop registration:', error);
            return NextResponse.json({ error: 'Failed to delete registration' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Failed to delete workshop registration:', err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
