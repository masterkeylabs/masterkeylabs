const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function listAll() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
        const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();

        const supabase = createClient(url, key);

        const tables = ['businesses', 'loss_audit_results', 'ai_threat_results', 'night_loss_results', 'visibility_results'];

        for (const table of tables) {
            const { data, count } = await supabase.from(table).select('*', { count: 'exact' });
            console.log(`Table ${table}: ${data ? data.length : 0} records (Count: ${count})`);
            if (data && data.length > 0) {
                console.log("  Sample ID from 1st record:", data[0].id || data[0].business_id);
            }
        }
    } catch (e) {
        console.error(e);
    }
}

listAll();
