import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function GET(req) {
    try {
        const supabase = await createClient();
        
        // Fetch all businesses (acting as users)
        const { data: users, error } = await supabase
            .from('businesses')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ success: true, users });
    } catch (error) {
        console.error('Admin Users GET Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const supabase = await createClient();
        const { userId, updates } = await req.json();

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('businesses')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, user: data });
    } catch (error) {
        console.error('Admin Users PATCH Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('businesses')
            .delete()
            .eq('id', userId);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Admin Users DELETE Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
