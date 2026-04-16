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
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
        console.error('--- DashboardPage: Auth Error ---', authError);
    }

    if (businessId) {
        const { data, error } = await supabase.from('businesses').select('*').eq('id', businessId).maybeSingle();
        if (error) console.error(`--- DashboardPage: Business Fetch Error (ID: ${businessId}) ---`, error);
        business = data;
    } else if (user) {
        // Only fetch by user_id here. 
        // The linking logic is handled safely on the client by AuthProvider.
        const { data, error } = await supabase.from('businesses').select('*').eq('user_id', user.id).maybeSingle();
        if (error) console.error(`--- DashboardPage: Business Fetch Error (User: ${user.id}) ---`, error);
        business = data;

        // Fallback: Check email if user_id match fails, but DO NOT update DB here (Purity)
        if (!business && user.email) {
            const { data: emailMatch, error: emailError } = await supabase.from('businesses').select('*').ilike('email', user.email).maybeSingle();
            if (emailError) console.error('--- DashboardPage: Email Match Error ---', emailError);
            business = emailMatch;
        }
    }

    if (!business) return <DashboardFallback />;

    // Promise.all with defensive results handling
    const [lossRes, threatRes, nightRes, visRes] = await Promise.all([
        supabase.from('loss_audit_results').select('*').eq('business_id', business.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('ai_threat_results').select('*').eq('business_id', business.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('night_loss_results').select('*').eq('business_id', business.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('visibility_results').select('*').eq('business_id', business.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ]);

    // Log errors if any, but continue with nulls to prevent page crash
    if (lossRes.error) console.error('Dashboard Error [Loss]:', lossRes.error);
    if (threatRes.error) console.error('Dashboard Error [Threat]:', threatRes.error);
    if (nightRes.error) console.error('Dashboard Error [Night]:', nightRes.error);
    if (visRes.error) console.error('Dashboard Error [Visibility]:', visRes.error);

    const auditResults = {
        lossAudit: lossRes.data || null,
        nightLoss: nightRes.data || null,
        missedCustomers: visRes.data || null,
        aiThreat: threatRes.data || null
    };

    return <DashboardGrid business={business} computedData={auditResults} />;
}
