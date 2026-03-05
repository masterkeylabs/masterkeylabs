import { supabase } from '@/lib/supabaseClient';
import { calculateLossAudit } from '@/lib/calculations';
import DashboardGrid from '@/components/DashboardGrid';
import DashboardFallback from '@/components/DashboardFallback';

// Force dynamic rendering to ensure fresh data on every visit
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage(props) {
    const searchParams = await props.searchParams;
    const businessId = searchParams?.id || null;

    if (!businessId) {
        // If no ID in URL, show the client fallback which checks localStorage and redirects
        return <DashboardFallback />;
    }

    // Await all Supabase queries concurrently on the server
    const [bizRes, lossRes, threatRes, nightRes, visRes] = await Promise.all([
        supabase.from('businesses').select('*').eq('id', businessId).maybeSingle(),
        supabase.from('loss_audit_results').select('*').eq('business_id', businessId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('ai_threat_results').select('*').eq('business_id', businessId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('night_loss_results').select('*').eq('business_id', businessId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('visibility_results').select('*').eq('business_id', businessId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ]);

    // Parse the data or fallback to defaults
    const business = bizRes.data || { id: businessId };

    // 1. Loss Audit Result → show Recoverable Savings
    const lossAuditScore = lossRes.data?.saving_target || 0;

    // 2. Night Loss Result
    const nightLossScore = nightRes.data?.monthly_loss || 0;

    // 3. Visibility Result
    const visibilityScore = visRes.data?.missed_customers || 0;

    // 4. AI Threat Result
    const aiThreatScore = threatRes.data?.score || 0;

    const fetchErrors = [lossRes.error, threatRes.error, nightRes.error, visRes.error].filter(Boolean);
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
