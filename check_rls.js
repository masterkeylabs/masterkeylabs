const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function checkRLS() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
        const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
        const url = urlMatch[1].trim();
        const key = keyMatch[1].trim();

        const supabase = createClient(url, key);

        const targetId = '1738777f-b185-4b5b-a8ad-ea5d8aaf6d78';
        console.log(`Checking specifically for business_id: ${targetId}`);

        const { data, error } = await supabase.from('businesses').select('*').eq('id', targetId).maybeSingle();
        if (error) console.error("Error fetching specific business:", error);
        console.log("Specific Business Result:", data);

        // Try to insert a dummy business and see if we can read it back
        const testId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
        await supabase.from('businesses').insert({ id: testId, entity_name: 'RLS_TEST' });
        const { data: readBack } = await supabase.from('businesses').select('*').eq('id', testId).maybeSingle();
        console.log("RLS Check (Read back inserted record):", readBack ? "SUCCESS" : "FAILED (RLS likely blocking)");

        if (readBack) await supabase.from('businesses').delete().eq('id', testId);

    } catch (e) {
        console.error(e);
    }
}

checkRLS();
