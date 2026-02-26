import { supabase } from '@/lib/supabaseClient';
import { calculateLossAudit } from '@/lib/calculations';
import DashboardGrid from '@/components/DashboardGrid';
import DashboardFallback from '@/components/DashboardFallback';

// Optional: ensure Next.js dynamically renders this page on each request
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
    const business = bizRes.data || { entity_name: 'Your Business', id: businessId };

    // 1. Loss Audit Result → show Recoverable Savings
    // Try saving_target first (exists after migration), else compute from raw columns
    let lossAuditScore = 0;
    if (lossRes.data) {
        if (lossRes.data.saving_target) {
            lossAuditScore = lossRes.data.saving_target;
        } else {
            // Compute from raw stored columns (works even without migration SQL)
            const staff = lossRes.data.staff_salary || 0;
            const ops = lossRes.data.ops_overheads || 0;
            const marketing = lossRes.data.marketing_budget || 0;
            const calc = calculateLossAudit(staff, ops, marketing);
            lossAuditScore = calc.savingTarget;
        }
    }

    // 2. Night Loss Result
    const nightLossScore = nightRes.data?.monthly_loss || 0;

    // 3. Visibility Result
    const visibilityScore = visRes.data?.missed_customers || 0;

    // 4. AI Threat Result
    const aiThreatScore = threatRes.data?.score || 0;

    if (lossRes.error || threatRes.error || nightRes.error || visRes.error) {
        console.error('Dashboard Data Fetch Error:', {
            loss: lossRes.error,
            threat: threatRes.error,
            night: nightRes.error,
            vis: visRes.error
        });
    }

    // DEBUG: Log raw data to diagnose zero values
    console.log('[Dashboard DEBUG] loss_audit_results row:', JSON.stringify(lossRes.data));
    console.log('[Dashboard DEBUG] ai_threat_results row:', JSON.stringify(threatRes.data));

    // Combine into final payload
    const auditResults = {
        lossAudit: lossAuditScore,
        nightLoss: nightLossScore,
        missedCustomers: visibilityScore,
        aiThreat: aiThreatScore
    };

    return <DashboardGrid business={business} computedData={auditResults} />;
}
