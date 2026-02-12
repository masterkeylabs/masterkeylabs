import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

function toCamelCase(row: Record<string, unknown>) {
    const map: Record<string, string> = {
        user_email: 'userEmail',
        user_name: 'userName',
        user_company: 'userCompany',
        audit_type: 'auditType',
        audit_data: 'auditData',
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
        const { userEmail, userName, userCompany, auditType, auditData } = body;

        if (!userEmail || !auditType) {
            return NextResponse.json({ error: 'Missing userEmail or auditType' }, { status: 400 });
        }

        const { data, error } = await getSupabase()
            .from('audit_submissions')
            .insert({
                user_email: userEmail,
                user_name: userName || null,
                user_company: userCompany || null,
                audit_type: auditType,
                audit_data: auditData || {},
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { error: 'Failed to save audit', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, audit: toCamelCase(data || {}) }, { status: 201 });
    } catch (err: unknown) {
        const error = err as Error;
        return NextResponse.json(
            { error: 'Failed to save audit', details: error.message },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const { data, error } = await getSupabase()
            .from('audit_submissions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json(
                { error: 'Failed to fetch audits', details: error.message },
                { status: 500 }
            );
        }

        const audits = (data || []).map(toCamelCase);
        return NextResponse.json(audits);
    } catch (err: unknown) {
        const error = err as Error;
        return NextResponse.json(
            { error: 'Failed to fetch audits', details: error.message },
            { status: 500 }
        );
    }
}
