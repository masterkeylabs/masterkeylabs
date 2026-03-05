const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function countOnly() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
        const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
        const url = urlMatch[1].trim();
        const key = keyMatch[1].trim();

        const supabase = createClient(url, key);

        const tables = ['businesses', 'loss_audit_results', 'ai_threat_results', 'night_loss_results', 'visibility_results'];
        console.log("--- FINAL COUNTS ---");
        for (const t of tables) {
            const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
            if (error) {
                console.log(`${t}: ERROR ${error.message}`);
            } else {
                console.log(`${t}: ${count} records`);
            }
        }

        // Also check if any business exists for the ID found in audits
        const { data: audits } = await supabase.from('loss_audit_results').select('business_id').limit(1);
        if (audits && audits[0]) {
            const bid = audits[0].business_id;
            const { data: b } = await supabase.from('businesses').select('*').eq('id', bid).maybeSingle();
            console.log(`Checking linked business ${bid}:`, b ? `FOUND (${b.entity_name})` : "NOT FOUND");
        }

    } catch (e) {
        console.error(e);
    }
}

countOnly();
