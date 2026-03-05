const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function listTriggers() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
        const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
        const url = urlMatch[1].trim();
        const key = keyMatch[1].trim();

        const supabase = createClient(url, key);

        console.log("Checking for triggers on the 'businesses' table...");

        // We can't query pg_trigger directly through the anon key usually unless RLS is off or we use RPC
        // Let's try to query it via an RPC if available, or just log if we can even reach the table

        const { data, error } = await supabase.from('businesses').select('*').limit(1);
        if (error) {
            console.error("Connectivity check failed:", error.message);
            return;
        }
        console.log("Connectivity to businesses table: OK");

        // Try a small update to see if it hangs
        if (data && data.length > 0) {
            console.log("Testing a tiny update to see if it hangs (5s timeout)...");
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            try {
                const { error: updateErr } = await supabase
                    .from('businesses')
                    .update({ last_sync: new Date().toISOString() })
                    .eq('id', data[0].id)
                    .select(); // Assuming last_sync column exists or just use entity_name

                clearTimeout(timeoutId);
                if (updateErr) {
                    console.log("Update returned immediately with error (Good):", updateErr.message);
                } else {
                    console.log("Update returned immediately with success (Good)");
                }
            } catch (e) {
                if (e.name === 'AbortError') {
                    console.log("CRITICAL: Update HANGED for more than 5 seconds. This confirms a server-side lock or trigger loop.");
                } else {
                    throw e;
                }
            }
        } else {
            console.log("No records to test update with. Attempting to insert a temporary record...");
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            try {
                const { data: insData, error: insErr } = await supabase
                    .from('businesses')
                    .insert({ entity_name: 'TRIGGER_TEST_TEMP' })
                    .select();

                clearTimeout(timeoutId);
                if (insErr) {
                    console.log("Insert returned immediately but failed:", insErr.message);
                } else {
                    console.log("Insert returned immediately with success.");
                    await supabase.from('businesses').delete().eq('id', insData[0].id);
                }
            } catch (e) {
                if (e.name === 'AbortError') {
                    console.log("CRITICAL: Insert HANGED for more than 5 seconds. This confirms a server-side lock or trigger loop.");
                } else {
                    throw e;
                }
            }
        }

    } catch (e) {
        console.error("Script error:", e);
    }
}

listTriggers();
