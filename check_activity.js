const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function checkActivity() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
        const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
        const url = urlMatch[1].trim();
        const key = keyMatch[1].trim();

        const supabase = createClient(url, key);

        console.log("Checking active database processes...");

        // This requires superuser or specific permissions, might fail on anon key
        // But let's try a query that often works in Supabase to see if we can get info
        const { data, error } = await supabase.rpc('inspect_locks');

        if (error) {
            console.log("RPC 'inspect_locks' not found or failed. Trying a manual insert and reporting time...");
        }

        const start = Date.now();
        const { error: insErr } = await supabase.from('businesses').insert({ entity_name: 'LATENCY_TEST' }).select();
        const end = Date.now();
        console.log(`Manual insert took ${end - start}ms`);

        if (!insErr) {
            await supabase.from('businesses').delete().eq('entity_name', 'LATENCY_TEST');
        } else {
            console.error("Insert failed during latency test:", insErr.message);
        }

    } catch (e) {
        console.error("Script error:", e);
    }
}

checkActivity();
