const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function verifySchema() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
        const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
        const url = urlMatch[1].trim();
        const key = keyMatch[1].trim();

        const supabase = createClient(url, key);

        console.log("Verifying 'businesses' table columns...");
        // Select one record to see columns
        const { data, error } = await supabase.from('businesses').select('*').limit(1);

        if (error) {
            console.error("Error fetching from businesses:", error.message);
            if (error.message.includes("does not exist")) {
                console.log("CRITICAL: The table 'businesses' itself might be missing or columns are mismatched.");
            }
            return;
        }

        if (data && data.length > 0) {
            const cols = Object.keys(data[0]);
            console.log("Found columns:", cols);
            const required = ['annual_revenue', 'employee_count', 'has_crm', 'has_erp', 'vertical'];
            const missing = required.filter(c => !cols.includes(c));
            if (missing.length > 0) {
                console.log("MISSING COLUMNS:", missing);
            } else {
                console.log("All required columns for Step 0 synchronization are present.");
            }
        } else {
            console.log("Table is empty, checking schema via RPC or dummy insert...");
            // Attempt a dummy insert with new columns to see if it fails
            const { error: insertErr } = await supabase.from('businesses').insert({
                entity_name: 'SCHEMA_CHECK',
                annual_revenue: 0,
                employee_count: 0
            }).select();

            if (insertErr) {
                console.log("Insert failed, likely due to missing columns:", insertErr.message);
            } else {
                console.log("Insert worked! Columns exist.");
                // Cleanup
                await supabase.from('businesses').delete().eq('entity_name', 'SCHEMA_CHECK');
            }
        }

    } catch (e) {
        console.error("Script error:", e);
    }
}

verifySchema();
