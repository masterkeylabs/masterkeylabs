const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function checkTriggers() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
        const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();

        const supabase = createClient(url, key);

        console.log('--- Trigger Diagnostics ---');

        // We use a query that asks for trigger info
        // If we can't run arbitrary SQL, we try to see if there's an RPC we can exploit
        // or just look for clues in common trigger tables if accessible.

        // Actually, let's try a direct RPC that returns trigger info if the user has one
        // or try to query the info via supabase client if they have a view.

        // A better way: try to perform a direct insert without the RPC and see the error.
        const start = Date.now();
        const { error } = await supabase.from('businesses').insert({ entity_name: 'DIAGNOSTIC_TEST' });
        const duration = Date.now() - start;

        console.log(`Direct Insert Result: ${error ? error.message : 'Success'}`);
        console.log(`Duration: ${duration}ms`);

        if (error && error.message.includes('timeout')) {
            console.log("Confirmed: Direct INSERT also hangs.");
        }

    } catch (e) {
        console.error(e);
    }
}

checkTriggers();
