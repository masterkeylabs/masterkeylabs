const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function check() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
        const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

        if (!urlMatch || !keyMatch) {
            console.error("Could not find Supabase credentials in .env.local");
            return;
        }

        const url = urlMatch[1].trim();
        const key = keyMatch[1].trim();

        console.log("Connecting to:", url);
        const supabase = createClient(url, key);

        const { data: businesses, error: bError } = await supabase.from('businesses').select('*').order('created_at', { ascending: false });

        if (bError) {
            console.error("Error fetching businesses:", bError);
            return;
        }

        if (!businesses || businesses.length === 0) {
            console.log("No businesses found in table 'businesses'");
            return;
        }

        console.log(`Found ${businesses.length} businesses.`);
        const business = businesses[0];
        console.log("Testing latest business:", business.id, `"${business.entity_name}"`);

        const tables = ['loss_audit_results', 'ai_threat_results', 'night_loss_results', 'visibility_results'];
        for (const table of tables) {
            const { data, error } = await supabase.from(table).select('*').eq('business_id', business.id).maybeSingle();
            if (error) {
                console.error(`Error checking ${table}:`, error);
            } else {
                console.log(`Table ${table}:`, data ? `EXISTS (created_at: ${data.created_at})` : 'MISSING');
            }
        }
    } catch (e) {
        console.error("Script error:", e);
    }
}

check();
