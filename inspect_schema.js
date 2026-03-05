const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function inspect() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
        const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();

        const supabase = createClient(url, key);

        console.log("Checking columns for 'businesses':");
        const { data: cols, error: cErr } = await supabase.rpc('get_table_columns', { table_name: 'businesses' });
        // If RPC doesn't exist, we can try a simple query and check the returned keys
        const { data: sample, error: sErr } = await supabase.from('businesses').select('*').limit(1);
        if (sample && sample[0]) {
            console.log("Columns found in a record:", Object.keys(sample[0]));
        } else {
            console.log("Table is empty, cannot easily check columns via select.");
        }

        // Check for specific columns
        const { data: bData, error: bError } = await supabase.from('businesses').insert({ entity_name: 'SCHEMA_CHECK' }).select();
        if (bData) {
            console.log("INSERT successful. Record keys:", Object.keys(bData[0]));
            await supabase.from('businesses').delete().eq('id', bData[0].id);
        } else {
            console.error("INSERT failed during schema check:", bError);
        }

    } catch (e) {
        console.error(e);
    }
}

inspect();
