import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {
        const { identifier, password } = await req.json();

        if (!identifier || !password) {
            return NextResponse.json({ error: 'Identifier and password are required' }, { status: 400 });
        }

        // 1. Find user by email or phone
        const { data: businesses, error: findError } = await supabase
            .from('businesses')
            .select('id, email, phone, password_hash')
            .or(`email.eq.${identifier},phone.eq.${identifier}`)
            .order('created_at', { ascending: false })
            .limit(1);

        if (findError) throw findError;

        const business = businesses?.[0];

        if (!business) {
            return NextResponse.json({ error: 'No account found with this identifier' }, { status: 404 });
        }

        if (!business.password_hash) {
            return NextResponse.json({
                error: 'This account was created without a password. Please use Forgot Password to set one.'
            }, { status: 400 });
        }

        // 2. Verify password
        const passwordValid = await bcrypt.compare(password, business.password_hash);

        if (!passwordValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // 3. Return business ID (session managed by client)
        return NextResponse.json({
            success: true,
            businessId: business.id,
            message: 'Login successful'
        });

    } catch (err) {
        console.error('User Login Error:', err);
        return NextResponse.json({ error: err.message || 'Login failed' }, { status: 500 });
    }
}
