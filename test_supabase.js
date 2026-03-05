const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function test() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
        const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();

        console.log("URL:", url);
        const supabase = createClient(url, key);

        const testId = '00000000-0000-0000-0000-000000000000';
        console.log("Attempting to insert test record...");

        const { data, error } = await supabase.from('businesses').upsert({
            id: testId,
            entity_name: 'DIAGNOSTIC_TEST_ENTRY',
            owner_name: 'AI_AGENT_TEST'
        }).select();

        if (error) {
            console.error("Insert Error:", error);
        } else {
            console.log("Insert Success:", data);
        }

        const { data: fetch, error: fError } = await supabase.from('businesses').select('*');
        console.log("Total Businesses in DB:", fetch ? fetch.length : 0);
        if (fError) console.error("Fetch Error:", fError);

        // Cleanup
        await supabase.from('businesses').delete().eq('id', testId);
        console.log("Cleanup done.");

    } catch (e) {
        console.error("Execution error:", e);
    }
}

test();
