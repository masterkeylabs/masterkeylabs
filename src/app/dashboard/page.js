import { createClient } from '@/lib/supabaseServer';
import DashboardGrid from '@/components/DashboardGrid';
import DashboardFallback from '@/components/DashboardFallback';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage({ searchParams }) {
    const params = await searchParams;
    const businessId = params.id;
    const supabase = await createClient();

    // Fetch by ID (URL param) OR by User Session
    let business = null;
    const { data: { user } } = await supabase.auth.getUser();

    if (businessId) {
        const { data } = await supabase.from('businesses').select('*').eq('id', businessId).maybeSingle();
        business = data;
    } else if (user) {
        // 1. Try direct user_id match
        const { data } = await supabase.from('businesses').select('*').eq('user_id', user.id).maybeSingle();
        business = data;

        // 2. Fallback: Auto-link by verified email (Rescue flow)
        if (!business && user.email) {
            const { data: emailMatch } = await supabase.from('businesses').select('*').ilike('email', user.email).maybeSingle();
            if (emailMatch) {
                const { data: linked } = await supabase.from('businesses').update({ user_id: user.id }).eq('id', emailMatch.id).select().single();
                business = linked;
            }
        }
    }

    if (!business) return <DashboardFallback />;

    const [lossRes, threatRes, nightRes, visRes] = await Promise.all([
        supabase.from('loss_audit_results').select('*').eq('business_id', business.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('ai_threat_results').select('*').eq('business_id', business.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('night_loss_results').select('*').eq('business_id', business.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('visibility_results').select('*').eq('business_id', business.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ]);

    const auditResults = {
        lossAudit: lossRes.data || null,
        nightLoss: nightRes.data || null,
        missedCustomers: visRes.data || null,
        aiThreat: threatRes.data || null
    };

    return <DashboardGrid business={business} computedData={auditResults} />;
}
