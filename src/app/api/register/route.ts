import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

function toCamelCase(row: Record<string, unknown>) {
    const map: Record<string, string> = { created_at: 'createdAt' };
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(row)) {
        out[map[k] || k] = v;
    }
    return out;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, phone, company } = body;

        if (!name || !email || !phone || !company) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await getSupabase()
            .from('registrations')
            .insert({ name, email, phone, company })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json(
                    { success: true, user: { name, email, phone, company } },
                    { status: 200 }
                );
            }
            return NextResponse.json(
                { error: 'Failed to register', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            user: toCamelCase(data || {}),
        }, { status: 201 });
    } catch (err: unknown) {
        const error = err as Error;
        return NextResponse.json(
            { error: 'Failed to register', details: error.message },
            { status: 500 }
        );
    }
}
