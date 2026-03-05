'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { supabase } from '@/lib/supabaseClient';
import { calculateAIThreat } from '@/lib/calculations';
import IntakeWizard from './IntakeWizard';
import DashboardGrid from './DashboardGrid';
import Link from 'next/link';

export default function DashboardFallback() {
    const router = useRouter();
    const { business, loading, user } = useAuth();
    const { t } = useLanguage();
    const [localId, setLocalId] = useState(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const id = localStorage.getItem('masterkey_business_id');
            setLocalId(id);
        }
    }, []);

    useEffect(() => {
        if (loading) return;

        const id = business?.id || localId;
        if (id && id !== 'null' && id !== 'undefined' && id !== '') {
            // Business ID found — redirect with it
            router.replace(`/dashboard?id=${id}`);
        }
    }, [business, loading, router, localId]);

    // Handle Google OAuth post-redirect recovery
    useEffect(() => {
        const processPendingGoogleSignup = async () => {
            if (loading) return;

            if (user?.id && !business?.id && (!localId || localId === 'null')) {
                const pendingFormStr = localStorage.getItem('masterkey_temp_form');
                if (pendingFormStr) {
                    try {
                        const formData = JSON.parse(pendingFormStr);
                        const resultsStr = localStorage.getItem('masterkey_temp_results');
                        const results = resultsStr ? JSON.parse(resultsStr) : null;

                        const REVENUE_MAP = {
                            '< 10L': 500000,
                            '10L-50L': 3000000,
                            '50L-1CR': 7500000,
                            '1CR-5CR': 30000000,
                            '> 5CR': 100000000
                        };
                        const annualRev = REVENUE_MAP[formData.revenueBracket] || 1250000;

                        const payload = {
                            entity_name: formData.businessName || (formData.contactName ? formData.contactName + " Business" : "My Business"),
                            owner_name: formData.contactName || user.user_metadata?.full_name || user.email?.split('@')[0],
                            phone: formData.whatsapp || '',
                            email: formData.email || user.email,
                            annual_revenue: annualRev,
                            vertical: formData.vertical || 'retail',
                            user_id: user.id,
                            classification: formData.vertical ? `${formData.vertical}::${formData.revenueBracket}` : `dashboard_wizard::v2_rpc`
                        };

                        const { data: newBizRes, error: rpcErr } = await supabase.rpc('initialize_business_profile', {
                            p_payload: payload,
                            p_active_id: null
                        });

                        if (rpcErr) throw rpcErr;

                        let newBizId = null;
                        if (Array.isArray(newBizRes) && newBizRes[0]) newBizId = newBizRes[0].id;
                        else if (newBizRes && newBizRes.id) newBizId = newBizRes.id;
                        else if (typeof newBizRes === 'string') newBizId = newBizRes;

                        if (newBizId) {
                            if (results) {
                                // Sync audits
                                await supabase.from('loss_audit_results').insert({
                                    business_id: newBizId,
                                    staff_salary: 25 * 25000,
                                    marketing_budget: Number(formData.marketingSpend) || 0,
                                    ops_overheads: Number(formData.opsSpend) || 0,
                                    annual_revenue: annualRev,
                                    manual_hours: 0,
                                    has_crm: false,
                                    has_erp: false,
                                    industry: formData.vertical || 'retail',
                                    staff_waste: results.staffWaste || 0,
                                    marketing_waste: results.marketingWaste || 0,
                                    ops_waste: results.opsWaste || 0,
                                    coordination_drag: results.coordinationDrag || 0,
                                    total_burn: results.totalSilosLost || 0,
                                    saving_target: results.recoverableSavings || 0,
                                    calculation_basis: JSON.stringify(results)
                                });

                                const aiCalc = calculateAIThreat(formData.vertical || 'retail', {
                                    isOmnichannel: formData.contactAfter6 || false,
                                    hasCRM: false,
                                    hasERP: false,
                                    employeeCount: 25
                                });

                                await supabase.from('ai_threat_results').insert({
                                    business_id: newBizId,
                                    industry: formData.vertical || 'retail',
                                    score: aiCalc.riskPct,
                                    threat_level: aiCalc.riskBand,
                                    years_left: Math.round(aiCalc.yearsLeft || 0),
                                    final_horizon: aiCalc.finalHorizon || 0,
                                    timeline_desc: aiCalc.displayLabel,
                                    is_omnichannel: formData.contactAfter6 || false,
                                    has_crm: false,
                                    has_erp: false,
                                    employee_count: 25
                                });

                                await supabase.from('visibility_results').insert({
                                    business_id: newBizId,
                                    missed_customers: results.missedCustomers || 0,
                                    total_searches: typeof results.missedCustomers === 'number' ? results.missedCustomers * 2 : 0,
                                    competitor_wins: results.missedCustomers || 0
                                });

                                await supabase.from('night_loss_results').insert({
                                    business_id: newBizId,
                                    monthly_loss: results.nightLoss || 0,
                                    hours_unattended: 14,
                                    unanswered_queries: Math.round((results.nightLoss || 0) / 1000)
                                });
                            }

                            localStorage.removeItem('masterkey_temp_form');
                            localStorage.removeItem('masterkey_temp_results');
                            localStorage.setItem('masterkey_business_id', newBizId);

                            window.location.href = `/dashboard?id=${newBizId}`;
                            return;
                        }
                    } catch (e) {
                        console.error('Error recovering pending Google signup:', e);
                    }
                }
            }
        };

        processPendingGoogleSignup();
    }, [user, business, loading, localId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-10 text-center">
                <div className="w-16 h-16 border-4 border-ios-blue/20 border-t-ios-blue rounded-full animate-spin mb-6"></div>
                <p className="text-white/40 uppercase tracking-[0.2em] text-[10px] font-bold">Synchronizing Terminal...</p>
            </div>
        );
    }

    // If we've finished loading and STILL don't have a business ID,
    // show the DashboardGrid with empty values so they see the "4 audits" directly.
    if (!business?.id && (!localId || localId === 'null')) {
        const dummyData = {
            lossAudit: { saving_target: 0 },
            nightLoss: { monthly_loss: 0 },
            missedCustomers: { missed_customers: 0 },
            aiThreat: { score: 0 }
        };
        const placeholderBusiness = {
            entity_name: 'Initialize System',
            owner_name: user?.user_metadata?.full_name || user?.user_metadata?.name || '',
            email: user?.email || '',
            id: null
        };

        return (
            <div className="w-full">
                <DashboardGrid
                    business={placeholderBusiness}
                    computedData={dummyData}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-10 text-center animate-fade-in">
            <span className="material-symbols-outlined text-6xl text-white/10 mb-6">
                manage_accounts
            </span>
            <h2 className="text-2xl font-bold tracking-tight mb-3">No Active Business Session</h2>
            <p className="text-white/40 mb-8 max-w-sm leading-relaxed">
                No business session was found associated with your account. Please complete the intake protocol to activate your diagnostic dashboard.
            </p>
            <Link
                href="/"
                className="inline-flex items-center gap-2 bg-ios-blue hover:bg-ios-blue/80 text-white font-bold px-8 py-4 rounded-2xl uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-ios-blue/20"
            >
                <span className="material-symbols-outlined text-sm">rocket_launch</span>
                Start Business Intake
            </Link>
        </div>
    );
}
