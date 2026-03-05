const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function simulate() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
        const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();

        const supabase = createClient(url, key);

        const payload = {
            entity_name: 'TIMEOUT_DEBUG_TEST',
            owner_name: 'DEBUG_AGENT',
            phone: '9999999999',
            email: 'debug_timeout@test.com',
            vertical: 'Technology',
            annual_revenue: 1000000,
            employee_count: 50,
            has_crm: true,
            has_erp: false,
            user_id: null
        };

        console.log('1. Checking for duplicates...');
        const start = Date.now();
        const [{ data: pD }, { data: eD }] = await Promise.all([
            supabase.from('businesses').select('id').ilike('phone', '%9999999999%').limit(1),
            supabase.from('businesses').select('id').ilike('email', 'debug_timeout@test.com').limit(1)
        ]);
        console.log(`Duplicate check took ${Date.now() - start}ms`);

        console.log('2. Attempting INSERT...');
        const insStart = Date.now();
        const { data, error } = await supabase.from('businesses').insert(payload).select().maybeSingle();
        console.log(`Insert took ${Date.now() - insStart}ms`);

        if (error) console.error('Insert Error:', error);
        if (data) {
            console.log('Success! Cleaning up...');
            await supabase.from('businesses').delete().eq('id', data.id);
        }

    } catch (e) {
        console.error(e);
    }
}

simulate();
