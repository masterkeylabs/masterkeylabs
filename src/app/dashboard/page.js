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
        const { data } = await supabase.from('businesses').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
        business = data;
    }

    if (!business) return <DashboardFallback />;

    const [lossRes, threatRes, nightRes, visRes] = await Promise.all([
        supabase.from('loss_audit_results').select('*').eq('business_id', business.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('ai_threat_results').select('*').eq('business_id', business.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('night_loss_results').select('*').eq('business_id', business.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('visibility_results').select('*').eq('business_id', business.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ]);

    const auditResults = {
        lossAudit: lossRes.data || { saving_target: 0 },
        nightLoss: nightRes.data || { monthly_loss: 0 },
        missedCustomers: visRes.data || { missed_customers: 0 },
        aiThreat: threatRes.data || { score: 0 }
    };

    return <DashboardGrid business={business} computedData={auditResults} />;
}
