const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function checkTriggers() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
        const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
        const url = urlMatch[1].trim();
        const key = keyMatch[1].trim();

        const supabase = createClient(url, key);

        console.log("Attempting to insert a business and catch error detail...");
        const { data, error } = await supabase.from('businesses').insert({
            entity_name: 'TRIGGER_TEST',
            owner_name: 'TEST'
        }).select();

        if (error) {
            console.error("Insert Error Detail:", error);
        } else {
            console.log("Insert worked:", data);
            await supabase.from('businesses').delete().eq('id', data[0].id);
        }

    } catch (e) {
        console.error(e);
    }
}

checkTriggers();
