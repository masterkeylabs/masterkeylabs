const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function checkConstraints() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
        const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();

        const supabase = createClient(url, key);

        const tables = ['loss_audit_results', 'ai_threat_results', 'night_loss_results', 'visibility_results'];

        console.log("Testing UPSERT behavior on tables...");

        // Create a dummy business
        const { data: biz } = await supabase.from('businesses').insert({ entity_name: 'CONSTRAINT_TEST' }).select().single();
        console.log("Test Business ID:", biz.id);

        for (const table of tables) {
            console.log(`Testing ${table}...`);
            const payload = { business_id: biz.id, created_at: new Date().toISOString() };

            // First insert
            const { error: err1 } = await supabase.from(table).insert(payload);
            if (err1) console.error(`  Initial Insert Error for ${table}:`, err1.message);

            // Try upsert on same business_id
            const { error: err2 } = await supabase.from(table).upsert(payload, { onConflict: 'business_id' });
            if (err2) {
                console.log(`  UPSERT FAILED for ${table}:`, err2.message);
            } else {
                console.log(`  UPSERT PASSED for ${table}`);
            }
        }

        // Cleanup
        await supabase.from('businesses').delete().eq('id', biz.id);
        console.log("Cleanup complete.");

    } catch (e) {
        console.error(e);
    }
}

checkConstraints();
