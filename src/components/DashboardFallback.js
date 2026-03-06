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

    // Raw Fetch Bypass Helper
    const rawFetch = async (table, method, body = null, query = '') => {
        const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}${query}`;
        const headers = {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation,resolution=merge-duplicates'
        };
        const options = {
            method,
            headers,
            body: body ? JSON.stringify(body) : null
        };
        const res = await fetch(url, options);
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Network response was not ok');
        }
        return await res.json();
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const id = localStorage.getItem('masterkey_business_id');
            setLocalId(id);
        }
    }, []);

    useEffect(() => {
        if (loading) return;

        const id = business?.id || localId;
        console.log('--- DashboardFallback Tracing ---', {
            source: business?.id ? 'AuthContext' : 'LocalStorage',
            id,
            urlId: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('id') : null
        });

        if (id && id !== 'null' && id !== 'undefined' && id !== '') {
            const currentUrlId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('id') : null;
            if (currentUrlId !== id) {
                console.log('--- Terminal Handshake: Redirecting to verified session ---', id);
                router.replace(`/dashboard?id=${id}`);
            }
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

                        console.log('--- Google Recovery: Syncing Profile (Direct RAW) ---');
                        let newBizId = null;

                        // 1. Check for existing profile by email/phone first (RAW)
                        const searchByContactResults = await rawFetch('businesses', 'GET', null, `?or=(email.eq.${payload.email},phone.eq.${payload.phone})&select=id`);
                        if (searchByContactResults && searchByContactResults.length > 0) {
                            newBizId = searchByContactResults[0].id;
                            console.log('Existing target found during recovery (RAW):', newBizId);
                        }

                        // 2. Transact profile via direct Upsert (RAW)
                        let upsertResult;
                        if (newBizId) {
                            const patchResults = await rawFetch('businesses', 'PATCH', {
                                ...payload,
                                updated_at: new Date().toISOString()
                            }, `?id=eq.${newBizId}`);
                            upsertResult = patchResults[0];
                        } else {
                            const postResults = await rawFetch('businesses', 'POST', {
                                ...payload,
                                updated_at: new Date().toISOString()
                            });
                            upsertResult = postResults[0];
                        }

                        if (!upsertResult && !newBizId) throw new Error("Upsert failed during recovery.");
                        newBizId = upsertResult?.id || newBizId;

                        if (newBizId) {
                            if (results) {
                                // Sync audits (RAW)
                                await rawFetch('loss_audit_results', 'POST', {
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
                                    created_at: new Date().toISOString()
                                });

                                const aiCalc = calculateAIThreat(formData.vertical || 'retail', {
                                    isOmnichannel: formData.contactAfter6 || false,
                                    hasCRM: false,
                                    hasERP: false,
                                    employeeCount: 25
                                });

                                await rawFetch('ai_threat_results', 'POST', {
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
                                    employee_count: 25,
                                    created_at: new Date().toISOString()
                                });

                                await rawFetch('visibility_results', 'POST', {
                                    business_id: newBizId,
                                    missed_customers: results.missedCustomers || 0,
                                    created_at: new Date().toISOString()
                                });

                                await rawFetch('night_loss_results', 'POST', {
                                    business_id: newBizId,
                                    monthly_loss: results.nightLoss || 0,
                                    created_at: new Date().toISOString()
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
