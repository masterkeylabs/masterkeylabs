const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function inspectDetail() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
        const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
        const url = urlMatch[1].trim();
        const key = keyMatch[1].trim();

        const supabase = createClient(url, key);

        const tables = ['businesses', 'loss_audit_results', 'ai_threat_results', 'night_loss_results', 'visibility_results'];

        for (const table of tables) {
            const { data, error } = await supabase.from(table).select('*');
            if (error) {
                console.error(`Error in ${table}:`, error.message);
                continue;
            }
            console.log(`--- Table: ${table} (${data.length} records) ---`);
            if (data.length > 0) {
                // Log simplified record
                const r = data[0];
                console.log(`  First Record ID: ${r.id}`);
                if (r.business_id) console.log(`  Linked Business ID: ${r.business_id}`);
                if (r.entity_name) console.log(`  Entity Name: ${r.entity_name}`);
                if (r.created_at) console.log(`  Created At: ${r.created_at}`);
            }
        }
    } catch (e) {
        console.error(e);
    }
}

inspectDetail();
