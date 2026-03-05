const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function debugBusinesses() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
        const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
        const url = urlMatch[1].trim();
        const key = keyMatch[1].trim();

        const supabase = createClient(url, key);

        console.log("--- BUSINESSES TABLE DEBUG ---");

        // 1. Check for active triggers more aggressively
        console.log("Checking for triggers...");
        const { data: triggers, error: trigError } = await supabase.rpc('get_table_triggers', { t_name: 'businesses' });
        if (trigError) {
            console.log("RPC get_table_triggers failed, trying raw query via information_schema (might fail)...");
            // Usually can't do this via anon key, but checking regardless
        } else {
            console.log("Active Triggers:", triggers);
        }

        // 2. Check for unique constraints that might cause conflicts
        console.log("Checking existing records for conflict potential...");
        const { data: allBiz } = await supabase.from('businesses').select('id, email, phone, entity_name');
        console.log(`Current record count: ${allBiz?.length || 0}`);
        if (allBiz && allBiz.length > 0) {
            console.log("Sample records:", allBiz.slice(0, 3));
        }

        // 3. Try a targeted insert with unique fields and see if it fails/hangs
        const uniqueEmail = `test_${Date.now()}@example.com`;
        console.log(`Attempting test insert with email: ${uniqueEmail}`);

        const start = Date.now();
        const { data: insData, error: insErr } = await supabase.from('businesses').insert({
            entity_name: 'DIAGNOSTIC_BIZ',
            email: uniqueEmail,
            vertical: 'retail'
        }).select();

        console.log(`Test insert took ${Date.now() - start}ms`);
        if (insErr) {
            console.error("Insert failed:", insErr.message);
        } else {
            console.log("Insert Success ID:", insData[0].id);
            await supabase.from('businesses').delete().eq('id', insData[0].id);
        }

    } catch (e) {
        console.error("Script error:", e);
    }
}

debugBusinesses();
