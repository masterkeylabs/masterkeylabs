import { createClient } from '@/lib/supabaseServer';
import { calculateLossAudit } from '@/lib/calculations';
import DashboardGrid from '@/components/DashboardGrid';
import DashboardFallback from '@/components/DashboardFallback';

// Force dynamic rendering to ensure fresh data on every visit
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage(props) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // If not logged in, middleware catches it, but fallback UI just in case
        return <DashboardFallback />;
    }

    // 1. Securely fetch the business profile belonging to this user
    const { data: business, error: bizError } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (!business) {
        // Logged in, but no business profile found
        return <DashboardFallback />;
    }

    const businessId = business.id;

    // 2. Await all metric queries concurrently using the secure businessId
    const [lossRes, threatRes, nightRes, visRes] = await Promise.all([
        supabase.from('loss_audit_results').select('*').eq('business_id', businessId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('ai_threat_results').select('*').eq('business_id', businessId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('night_loss_results').select('*').eq('business_id', businessId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('visibility_results').select('*').eq('business_id', businessId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ]);

    // Parse the data or fallback to defaults
    // 1. Loss Audit Result → show Recoverable Savings
    const lossAuditScore = lossRes.data?.saving_target || 0;

    // 2. Night Loss Result
    const nightLossScore = nightRes.data?.monthly_loss || 0;

    // 3. Visibility Result
    const visibilityScore = visRes.data?.missed_customers || 0;

    // 4. AI Threat Result
    const aiThreatScore = threatRes.data?.score || 0;

    const fetchErrors = [bizError, lossRes.error, threatRes.error, nightRes.error, visRes.error].filter(Boolean);
    if (fetchErrors.length > 0) {
        console.warn('Dashboard Data Fetch Warning:', fetchErrors);
    }

    // Combine into final payload with full data rows
    const auditResults = {
        lossAudit: lossRes.data || { saving_target: 0 },
        nightLoss: nightRes.data || { monthly_loss: 0 },
        missedCustomers: visRes.data || { missed_customers: 0 },
        aiThreat: threatRes.data || { score: 0 }
    };

    return <DashboardGrid business={business} computedData={auditResults} />;
}
