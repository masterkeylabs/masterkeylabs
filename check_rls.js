const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function checkRLS() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
        const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();

        const supabase = createClient(url, key);

        console.log('--- RLS Policy Scan ---');

        // We can't query pg_policies directly via anon key usually.
        // But we can try to see if there's a problem by trying to SELECT as the user would.

        const { data, error } = await supabase.from('businesses').select('*').limit(1);

        if (error) {
            console.log(`RLS/Policy Error: ${error.message}`);
        } else {
            console.log(`RLS Check Success. Found ${data.length} records.`);
        }

    } catch (e) {
        console.error(e);
    }
}

checkRLS();
