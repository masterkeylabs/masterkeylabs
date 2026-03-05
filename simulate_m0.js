const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function simulateM0() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
        const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
        const url = urlMatch[1].trim();
        const key = keyMatch[1].trim();

        const supabase = createClient(url, key);

        const payload = {
            entity_name: "TIMEOUT_TEST_BIZ",
            owner_name: "TEST_OWNER",
            phone: "1234567890",
            email: "test@example.com",
            vertical: "retail",
            annual_revenue: 5000000,
            employee_count: 25,
            has_crm: true,
            has_erp: false,
            user_id: null // Diagnostic scripts often run without actual user session
        };

        console.log("Simulating Step 0 Upsert...");
        const start = Date.now();

        const { data, error } = await supabase
            .from('businesses')
            .upsert(payload)
            .select()
            .single();

        const duration = Date.now() - start;
        console.log(`Request completed in ${duration}ms`);

        if (error) {
            console.error("Upsert failed:", error.message);
        } else {
            console.log("Upsert Success ID:", data.id);
            // Cleanup
            await supabase.from('businesses').delete().eq('id', data.id);
        }

    } catch (e) {
        console.error("Script error:", e);
    }
}

simulateM0();
