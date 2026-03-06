const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function testRPC() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
        const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();

        const supabase = createClient(url, key);

        const payload = {
            entity_name: "RPC_TEST_BIZ",
            owner_name: "RPC_TEST_OWNER",
            phone: "9999999999",
            email: "rpc_test@example.com",
            user_id: null,
            classification: "diagnostic_test"
        };

        console.log("Calling initialize_business_profile RPC...");
        const start = Date.now();

        // Wrap in a Promise to allow a timeout in the script
        const rpcPromise = supabase.rpc('initialize_business_profile', {
            p_payload: payload,
            p_active_id: null
        });

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("RPC_TIMEOUT")), 10000)
        );

        try {
            const { data, error } = await Promise.race([rpcPromise, timeoutPromise]);
            const duration = Date.now() - start;
            console.log(`RPC completed in ${duration}ms`);

            if (error) {
                console.error("RPC Error:", error.message);
            } else {
                console.log("RPC Success Data:", data);
            }
        } catch (e) {
            if (e.message === "RPC_TIMEOUT") {
                console.log("CRITICAL: RPC HANGS in Node for more than 10 seconds.");
            } else {
                console.error("RPC Exception:", e.message);
            }
        }

    } catch (e) {
        console.error(e);
    }
}

testRPC();
