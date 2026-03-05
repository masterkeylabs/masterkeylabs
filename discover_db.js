const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function discover() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
        const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
        const url = urlMatch[1].trim();
        const key = keyMatch[1].trim();

        const supabase = createClient(url, key);

        console.log("Listing all tables in public schema...");
        // This is a bit of a hack using a query that might fail but show info
        const { data, error } = await supabase.rpc('get_table_counts');
        // If RPC fails, let's try querying information_schema if enabled, or just hardcoded common ones

        const knownTables = ['businesses', 'loss_audit_results', 'ai_threat_results', 'night_loss_results', 'visibility_results', 'user_signups', 'admin_users'];
        for (const t of knownTables) {
            const { count, error: e } = await supabase.from(t).select('*', { count: 'exact', head: true });
            if (e) {
                console.log(`Table ${t}: ERROR - ${e.message}`);
            } else {
                console.log(`Table ${t}: ${count} records`);
            }
        }

    } catch (e) {
        console.error(e);
    }
}

discover();
