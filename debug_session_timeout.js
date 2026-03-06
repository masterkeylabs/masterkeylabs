import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function runDiagnosis() {
    console.log('--- Database Diagnostic Run ---');
    console.log('Target URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

    // 1. Check Table Accessibility
    console.log('\n1. Checking table access...');
    const { count, error: tableErr } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true });

    if (tableErr) {
        console.error('❌ Businesses table error:', tableErr.message);
    } else {
        console.log('✅ Businesses table found. Row count:', count);
    }

    // 2. Check RPC Definition
    console.log('\n2. Testing RPC reachability...');
    try {
        const { data, error: rpcErr } = await supabase.rpc('initialize_business_profile', {
            p_payload: { email: 'test_diag@example.com', entity_name: 'Diag Test' },
            p_active_id: null
        });

        if (rpcErr) {
            console.error('❌ RPC error:', rpcErr.message, rpcErr.code);
        } else {
            console.log('✅ RPC call successful. Returned:', data);
        }
    } catch (e) {
        console.error('❌ RPC exception:', e.message);
    }

    // 3. Check for specific locks/triggers (indirectly)
    console.log('\n3. Testing direct insert...');
    const { data: insertData, error: insertErr } = await supabase
        .from('businesses')
        .insert({
            entity_name: 'Direct Insert Test',
            email: 'direct@test.com'
        })
        .select()
        .single();

    if (insertErr) {
        console.error('❌ Direct insert failed:', insertErr.message);
    } else {
        console.log('✅ Direct insert successful. ID:', insertData.id);
        // Cleanup
        await supabase.from('businesses').delete().eq('id', insertData.id);
    }
}

runDiagnosis();
