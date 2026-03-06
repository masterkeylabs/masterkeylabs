const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('--- Database Audit Scan ---');

    const tables = ['businesses', 'loss_audit_results', 'night_loss_results', 'visibility_results', 'ai_threat_results'];

    for (const table of tables) {
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .order('updated_at', { ascending: false }, { nullsFirst: false })
            .limit(1);

        if (error) {
            console.error(`Error fetching ${table}:`, error.message);
        } else if (data && data.length > 0) {
            console.log(`Table: ${table}`);
            console.log(JSON.stringify(data[0], null, 2));
        } else {
            console.log(`Table: ${table} is EMPTY or no recent entries.`);
        }
        console.log('---------------------------');
    }
}

checkData();
