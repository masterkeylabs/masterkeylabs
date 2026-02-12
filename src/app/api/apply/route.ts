import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

function toCamelCase(row: Record<string, unknown>) {
    const map: Record<string, string> = {
        full_name: 'fullName',
        cv_data: 'cvData',
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
        console.log('--- Career Submission Start ---');

        const body = await request.json();
        const { fullName, email, vision, cvData } = body;

        console.log('Processing submission for:', fullName, 'CV present:', !!cvData);

        if (!fullName || !email || !vision) {
            console.warn('Submission failed: Missing fields');
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await getSupabase()
            .from('applications')
            .insert({
                full_name: fullName,
                email,
                vision,
                cv_data: cvData || null,
            })
            .select('id')
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({
                error: 'Database connection failed',
                details: error.message,
                technicalDetails: error.message,
            }, { status: 503 });
        }

        console.log('Application saved successfully:', data?.id);
        return NextResponse.json({
            message: 'Application submitted successfully',
            id: data?.id,
        }, { status: 201 });
    } catch (error: unknown) {
        const err = error as Error;
        console.error('CRITICAL ERROR in Career API:', {
            error: err.message,
            stack: err.stack,
            name: err.name,
        });
        return NextResponse.json({
            error: 'Failed to submit application',
            details: err.message,
            type: err.name,
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        const { data, error } = await getSupabase()
            .from('applications')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
        }

        const applications = (data || []).map(toCamelCase);
        return NextResponse.json(applications);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
    }
}
