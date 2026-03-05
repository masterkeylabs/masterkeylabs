const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function checkTriggers() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
        const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
        const url = urlMatch[1].trim();
        const key = keyMatch[1].trim();

        const supabase = createClient(url, key);

        console.log("Checking for triggers on 'businesses'...");

        // We can use a trick to see if triggers exist by looking at how long a request takes 
        // with/without potential side effects, BUT let's try to query pg_trigger if we can.
        // Most Supabase setups allow reading pg_catalog via RPC if set up, or just trying.

        const { data, error } = await supabase.rpc('inspect_triggers', { table_name: 'businesses' });

        if (error) {
            console.log("Could not find RPC 'inspect_triggers'. Attempting manual detection via latency...");

            const start = Date.now();
            await supabase.from('businesses').insert({ entity_name: 'TRIGGER_LATENCY_TEST' }).select();
            console.log(`Insert latency: ${Date.now() - start}ms`);

            // If latency is high (e.g. > 1000ms), there's a side process.
        } else {
            console.log("Detected Triggers:", data);
        }

    } catch (e) {
        console.error("Script error:", e);
    }
}

checkTriggers();
