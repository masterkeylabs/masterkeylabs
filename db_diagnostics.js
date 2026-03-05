const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function runDiagnostics() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
        const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();

        const supabase = createClient(url, key);

        console.log('--- Database Diagnostics ---');

        // 1. Check for all triggers on businesses table
        const { data: triggers, error: tErr } = await supabase.from('businesses').select('*').limit(0); // Dummy for connection

        // Since we can't run arbitrary SQL easily without an RPC, let's try to infer from common behavior.
        // Let's check if there are any other tables that might have triggers cascaded.

        console.log('Checking counts of records in related tables...');
        const tables = ['businesses', 'loss_audit_results', 'ai_threat_results', 'night_loss_results', 'visibility_results'];
        for (const table of tables) {
            const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
            console.log(`Table ${table}: ${count} rows`);
            if (error) console.error(`Error counting ${table}:`, error.message);
        }

        console.log('--- End Diagnostics ---');

    } catch (e) {
        console.error(e);
    }
}

runDiagnostics();
