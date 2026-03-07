'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import {
    calculateLossAudit,
    calculateNightLoss,
    calculateVisibility,
    calculateAIThreat,
    BUSINESS_VERTICALS,
    parseNumericalRange,
    parseHoursRange
} from '@/lib/calculations';
import { formatIndian } from '@/utils/formatIndian';

import {
    RangeSelector,
    REVENUE_OPTIONS,
    EMPLOYEE_OPTIONS,
    PAYROLL_OPTIONS,
    MANUAL_HOURS_OPTIONS,
    DAILY_LEADS_OPTIONS,
    TXN_VALUE_OPTIONS
} from './RangeSelector';

export default function DashboardIntakeWizard({ business, existingData, t, onComplete, initialStep = 0, mode = 'audit' }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Secure Fetch Helper: Uses authenticated session token to enforce RLS
    const rawFetch = async (table, method, body = null, query = '') => {
        const { data: { session } } = await supabase.auth.getSession();

        const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}${query}`;
        const headers = {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            'Authorization': session?.access_token ? `Bearer ${session.access_token}` : `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
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

    const { user, fetchBusinessProfile } = useAuth();
    const [step, setStep] = useState(initialStep);
    const [activeId, setActiveId] = useState(business?.id || null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Initial state setup based on mode
    useEffect(() => {
        if (mode === 'profile') {
            setStep(0);
        } else if (mode === 'audit' && step === 0) {
            setStep(1); // Start at audit step
        }
    }, [mode]);

    // --- FORM STATES ---
    const [formM0, setFormM0] = useState({
        entityName: business?.entity_name && business.entity_name !== 'Initialize System' ? business.entity_name : '',
        ownerName: business?.owner_name || user?.user_metadata?.full_name || user?.user_metadata?.name || '',
        whatsapp: business?.phone || '',
        email: business?.email || '',
    });
    const [formM1, setFormM1] = useState({
        staffSalary: existingData?.lossAudit?.staff_salary || '',
        marketingBudget: existingData?.lossAudit?.marketing_budget || '',
        opsOverheads: existingData?.lossAudit?.ops_overheads || '',
        manualHours: existingData?.lossAudit?.manual_hours || 3,
        // Industry/Vertical removed from Step 1:
        annualRevenue: business?.annual_revenue || '',
        employeeCount: business?.employee_count || '',
        hasCRM: business?.has_crm || false,
        hasERP: business?.has_erp || false,
    });

    const [formM2, setFormM2] = useState({
        dailyInquiries: existingData?.nightLoss?.daily_inquiries || 50,
        closingTime: existingData?.nightLoss?.closing_time || '6pm',
        avgTransactionValue: existingData?.nightLoss?.profit_per_sale || formM1.opsOverheads || '',
        businessType: existingData?.nightLoss?.response_time || 'b2c'
    });

    const [formM3, setFormM3] = useState({
        city: existingData?.missedCustomers?.city || '',
        signals: existingData?.missedCustomers?.signals || {
            hasGoogleMyBusiness: false,
            hasWebsite: false,
            hasWhatsApp: false,
            activeSocialMedia: false,
            seoOptimized: false,
            hasCRM: false,
            runsAds: false
        }
    });

    const [formM4, setFormM4] = useState({
        industry: business?.vertical || 'retail', // Moved here
        aiAdoptionLevel: existingData?.aiThreat?.features?.aiAdoptionLevel || 'none',
        competitorAdoption: existingData?.aiThreat?.features?.competitorAdoption || 'low',
        operationalComplexity: existingData?.aiThreat?.features?.operationalComplexity || 'medium',
        marketPosition: existingData?.aiThreat?.features?.marketPosition || 'established',
        isOmnichannel: existingData?.aiThreat?.is_omnichannel || false
    });

    // Keep M2/M3 avg value synced if empty
    useEffect(() => {
        if (!formM2.avgTransactionValue && formM1.opsOverheads) {
            setFormM2(prev => ({ ...prev, avgTransactionValue: formM1.opsOverheads }));
        }
    }, [formM1.opsOverheads]);

    // --- HANDLERS ---

    // Step 0: Business Info
    const handleM0Submit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        let connectionTimedOut = false;
        const timeoutId = setTimeout(() => {
            connectionTimedOut = true;
            setError("The synchronization request is taking longer than expected (120s+). Your database might be under a lock. Please refresh and try again.");
            setIsSaving(false);
            console.error('Authorization Timeout: Request exceeded 120 seconds. This is often a browser-side deadlock.');
        }, 120000);

        try {
            const payload = {
                entity_name: formM0.entityName,
                owner_name: formM0.ownerName,
                phone: formM0.whatsapp,
                email: formM0.email,
                user_id: user?.id || null,
                classification: `dashboard_wizard::v2_raw_bypass`
            };

            let bizId = activeId;
            if (bizId === 'null' || bizId === 'undefined' || !bizId) bizId = null;

            console.log('--- Auth Flow Log: Step 1 (Started RAW Bypass) ---');
            if (!payload.email) throw new Error("Email registry entry required.");

            let finalBizId = bizId;

            // 1. Search for existing profile (Split query for maximum safety via RAW fetch)
            if (!finalBizId) {
                console.log('--- Auth Flow Log: Step 2 (Searching Email RAW) ---', payload.email);
                const resultsByEmail = await rawFetch('businesses', 'GET', null, `?email=eq.${encodeURIComponent(payload.email)}&select=id`);

                if (resultsByEmail && resultsByEmail.length > 0) {
                    finalBizId = resultsByEmail[0].id;
                    console.log('--- Auth Flow Log: Step 3 (Found by Email RAW) ---', finalBizId);
                } else if (payload.phone) {
                    console.log('--- Auth Flow Log: Step 3b (Searching Phone RAW) ---', payload.phone);
                    const resultsByPhone = await rawFetch('businesses', 'GET', null, `?phone=eq.${encodeURIComponent(payload.phone)}&select=id`);
                    if (resultsByPhone && resultsByPhone.length > 0) {
                        finalBizId = resultsByPhone[0].id;
                        console.log('--- Auth Flow Log: Step 4 (Found by Phone RAW) ---', finalBizId);
                    }
                }
            }

            console.log('--- Auth Flow Log: Step 5 (Committing Upsert RAW) ---', finalBizId || 'NEW');

            // 2. Perform Upsert via RAW fetch
            let upsertResult;
            if (finalBizId) {
                // Update existing
                const results = await rawFetch('businesses', 'PATCH', {
                    ...payload,
                    updated_at: new Date().toISOString()
                }, `?id=eq.${finalBizId}`);
                upsertResult = results[0];
            } else {
                // Insert new
                const results = await rawFetch('businesses', 'POST', {
                    ...payload,
                    updated_at: new Date().toISOString()
                });
                upsertResult = results[0];
            }

            console.log('--- Auth Flow Log: Step 6 (COMPLETE RAW) ---', {
                returnedId: upsertResult?.id,
                fallbackId: finalBizId,
                foundResult: !!upsertResult
            });

            if (connectionTimedOut) return;
            if (!upsertResult && !finalBizId) throw new Error("Synchronization established but record returned null.");

            finalBizId = upsertResult?.id || finalBizId;
            setActiveId(finalBizId);

            if (fetchBusinessProfile) {
                await fetchBusinessProfile(user?.id);
            }
            router.replace(`/dashboard`, { scroll: false });

            if (onComplete) onComplete();

            // If in profile mode, we wait a moment for DB commitment before reload
            if (mode === 'profile') {
                console.log('--- Auth Flow Log: Step 7 (Settle & Reload) ---');
                setTimeout(() => {
                    window.location.reload();
                }, 1000); // 1 second settle time
            } else {
                setStep(1);
            }
        } catch (err) {
            if (!connectionTimedOut) {
                setError(err.message || "An unexpected error occurred during authorization.");
                console.error('Authorization Fault:', err);
            }
        } finally {
            clearTimeout(timeoutId);
            setIsSaving(false);
        }
    };

    // Step 1: Loss Audit
    const handleM1Submit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        let connectionTimedOut = false;
        const timeoutId = setTimeout(() => {
            connectionTimedOut = true;
            setError("The synchronization request is taking longer than expected (120s+). Your database might be under a lock. Please refresh and try again.");
            setIsSaving(false);
            console.error('Module 01 Sync Timeout: Request exceeded 120 seconds.');
        }, 120000);

        try {
            console.log('--- Module 01 Submit: Starting Calculation ---');
            const staff = parseNumericalRange(formM1.staffSalary);
            const ops = parseNumericalRange(formM1.opsOverheads);
            const marketing = parseNumericalRange(formM1.marketingBudget);
            const revenue = parseFloat(formM1.annualRevenue) || 0;
            const hours = parseHoursRange(formM1.manualHours);

            const calc = calculateLossAudit(staff, ops, marketing, {
                manualHoursPerDay: hours,
                hasCRM: formM1.hasCRM,
                hasERP: formM1.hasERP,
                annualRevenue: revenue
            });

            const payload = {
                business_id: activeId,
                staff_salary: staff,
                ops_overheads: ops,
                marketing_budget: marketing,
                annual_revenue: revenue,
                industry: business?.vertical || formM4.industry || 'retail',
                manual_hours: Math.round(hours),
                has_crm: formM1.hasCRM,
                has_erp: formM1.hasERP,
                staff_waste: calc.staffWaste,
                marketing_waste: calc.marketingWaste,
                ops_waste: calc.opsWaste,
                coordination_drag: calc.coordinationDrag,
                total_burn: calc.totalBurn,
                annual_burn: calc.annualBurn,
                saving_target: calc.savingTarget,
                five_year_cost: calc.fiveYearCost,
                created_at: new Date().toISOString()
            };

            console.log('--- Module 01 Submit: Upserting results RAW ---', activeId);
            await rawFetch('loss_audit_results', 'POST', payload, `?on_conflict=business_id`);

            if (connectionTimedOut) return;

            console.log('--- Module 01 Submit: Updating metadata RAW ---');
            await rawFetch('businesses', 'PATCH', {
                annual_revenue: revenue,
                employee_count: parseInt(formM1.employeeCount) || 0,
                has_crm: formM1.hasCRM,
                has_erp: formM1.hasERP
            }, `?id=eq.${activeId}`);

            console.log('--- Module 01 Submit: SUCCESS ---');
            setStep(2);
        } catch (err) {
            if (!connectionTimedOut) {
                setError(err.message);
                console.error('Module 01 Fault:', err);
            }
        } finally {
            clearTimeout(timeoutId);
            setIsSaving(false);
        }
    };

    // Step 2: Night Loss
    const handleM2Submit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        let connectionTimedOut = false;
        const timeoutId = setTimeout(() => {
            connectionTimedOut = true;
            setError("Request timeout. Please refresh.");
            setIsSaving(false);
        }, 120000);

        try {
            console.log('--- Module 02 Submit: Starting RAW ---');
            const dailyLeads = parseNumericalRange(formM2.dailyInquiries);
            const avgValue = parseNumericalRange(formM2.avgTransactionValue);
            if (avgValue <= 0) throw new Error("Average transaction value is required.");

            const calc = calculateNightLoss(dailyLeads, formM2.closingTime, avgValue, formM2.businessType);

            const payload = {
                business_id: activeId,
                daily_inquiries: Math.round(dailyLeads),
                closing_time: formM2.closingTime,
                profit_per_sale: avgValue,
                response_time: formM2.businessType,
                monthly_days: 30,
                night_inquiries: calc.nightInquiries,
                current_revenue: calc.currentRevenue,
                potential_revenue: calc.potentialRevenue,
                monthly_loss: calc.monthlyLoss,
                annual_loss: calc.annualLoss,
                created_at: new Date().toISOString()
            };

            console.log('--- Module 02 Submit: Upserting results RAW ---');
            await rawFetch('night_loss_results', 'POST', payload, `?on_conflict=business_id`);

            if (connectionTimedOut) return;
            console.log('--- Module 02 Submit: SUCCESS RAW ---');
            setStep(3);
        } catch (err) {
            if (!connectionTimedOut) setError(err.message);
        } finally {
            clearTimeout(timeoutId);
            setIsSaving(false);
        }
    };

    // Step 3: Visibility
    const handleM3Submit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        let connectionTimedOut = false;
        const timeoutId = setTimeout(() => {
            connectionTimedOut = true;
            setError("Request timeout. Please refresh.");
            setIsSaving(false);
        }, 120000);

        try {
            console.log('--- Module 03 Submit: Starting RAW ---');
            if (!formM3.city) throw new Error("City is required.");
            const avgVal = parseNumericalRange(formM2.avgTransactionValue);
            const calc = calculateVisibility(formM3.signals, formM3.city, avgVal);

            const payload = {
                business_id: activeId,
                city: formM3.city.toLowerCase(),
                country: 'India',
                signals: formM3.signals,
                avg_transaction_value: avgVal,
                percent: calc.percent,
                status: calc.status,
                missed_customers: calc.missedCustomers,
                missed_revenue: calc.monthlyLoss,
                annual_loss: calc.annualLoss,
                gaps: calc.gaps,
                created_at: new Date().toISOString()
            };

            console.log('--- Module 03 Submit: Upserting results RAW ---');
            await rawFetch('visibility_results', 'POST', payload, `?on_conflict=business_id`);

            if (connectionTimedOut) return;
            console.log('--- Module 03 Submit: SUCCESS RAW ---');
            setStep(4);
        } catch (err) {
            if (!connectionTimedOut) setError(err.message);
        } finally {
            clearTimeout(timeoutId);
            setIsSaving(false);
        }
    };

    // Step 4: AI Threat
    const handleM4Submit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        let connectionTimedOut = false;
        const timeoutId = setTimeout(() => {
            connectionTimedOut = true;
            setError("Request timeout. Please refresh.");
            setIsSaving(false);
        }, 120000);

        try {
            console.log('--- Module 04 Submit: Starting RAW ---');
            const empCount = parseNumericalRange(formM1.employeeCount || 25);
            const calc = calculateAIThreat(formM4.industry, {
                isOmnichannel: formM4.isOmnichannel,
                hasCRM: formM1.hasCRM,
                hasERP: formM1.hasERP,
                employeeCount: empCount
            });

            const payload = {
                business_id: activeId,
                score: Math.round(calc.riskPct),
                years_left: Math.round(calc.yearsLeft),
                threat_level: calc.threatLevel,
                timeline_desc: calc.displayLabel,
                industry: formM4.industry,
                is_omnichannel: formM4.isOmnichannel,
                employee_count: empCount,
                features: {
                    aiAdoptionLevel: formM4.aiAdoptionLevel,
                    competitorAdoption: formM4.competitorAdoption,
                    operationalComplexity: formM4.operationalComplexity,
                },
                created_at: new Date().toISOString()
            };

            console.log('--- Module 04 Submit: Upserting results RAW ---');
            await rawFetch('ai_threat_results', 'POST', payload, `?on_conflict=business_id`);

            // GLOBAL SYNC: Save industry to businesses table
            console.log('--- Module 04 Submit: Global Industry Sync RAW ---');
            await rawFetch('businesses', 'PATCH', {
                vertical: formM4.industry,
                employee_count: empCount
            }, `?id=eq.${activeId}`);

            if (connectionTimedOut) return;

            console.log('--- Module 04 Submit: FULL SEQUENCE COMPLETE RAW ---');
            if (onComplete) onComplete();
            // window.location.reload(); // Removed: Handled by DashboardGrid unlocking sequence
        } catch (err) {
            if (!connectionTimedOut) setError(err.message);
        } finally {
            clearTimeout(timeoutId);
            setIsSaving(false);
        }
    };

    const STEP_TITLES = [
        "System Initialization [V2.1-RPC]",
        "Module 01: Operational Waste",
        "Module 02: Night Loss Leakage",
        "Module 03: Digital Invisibility",
        "Module 04: Extinction Horizon"
    ];

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 top-0 left-0 w-full h-full z-[150] flex items-center justify-center p-2 md:p-12 bg-black/60 backdrop-blur-xl animate-fade-in overflow-y-auto custom-scrollbar">
            <div className="w-full max-w-4xl bg-black/80 border border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[95vh] md:max-h-[85vh] overflow-hidden relative border-glow shadow-glow-blue">

                {/* Visual Accent */}
                <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-ios-cyan/50 to-transparent"></div>

                {/* Header Sequence */}
                <div className="px-6 py-6 md:px-10 md:py-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01] shrink-0">
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase font-black tracking-[0.4em] text-ios-cyan/60">
                            {mode === 'profile' ? 'Profile Setup' : `Audit Sequence: Step ${step} of 4`}
                        </p>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                            {mode === 'profile' ? 'Initialize Business' : STEP_TITLES[step]}
                        </h2>
                    </div>
                    {/* Progress Bar Mini */}
                    <div className="flex gap-1.5 bg-white/5 p-1 rounded-full px-3 border border-white/5">
                        {mode === 'profile' ? (
                            <div className="w-3 h-3 rounded-full bg-ios-cyan scale-110 shadow-[0_0_12px_rgba(0,210,255,0.8)]"></div>
                        ) : (
                            [1, 2, 3, 4].map(i => (
                                <div key={i} className={`w-3 h-3 rounded-full transition-all duration-700 ${step >= i ? 'bg-ios-cyan scale-110 shadow-[0_0_12px_rgba(0,210,255,0.8)]' : 'bg-white/10'}`}></div>
                            ))
                        )}
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mx-10 mt-6 bg-red-500/10 border border-red-500/20 px-6 py-3 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-[0.2em] text-center animate-bounce-in shrink-0">
                        CRITICAL FAULT: {error}
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar scroll-smooth">

                    {/* WIZARD STEP 0 : WELCOME & BIZ PROFILING */}
                    {step === 0 && (
                        <form onSubmit={handleM0Submit} className="space-y-12 animate-fade-in max-w-2xl mx-auto py-10">
                            <div className="text-center space-y-4">
                                <div className="relative inline-block">
                                    <div className="w-24 h-24 bg-ios-cyan/10 border border-ios-cyan/30 rounded-3xl flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(0,210,255,0.2)] rotate-3 hover:rotate-0 transition-transform duration-500">
                                        <span className="material-symbols-outlined text-5xl text-ios-cyan animate-pulse">shield_person</span>
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-black border border-white/20 rounded-full flex items-center justify-center">
                                        <span className="material-symbols-outlined text-xs text-white">lock</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Identity Profiling</h3>
                                    <p className="text-white/40 text-sm leading-relaxed max-w-sm mx-auto">
                                        Initialize your enterprise protocol. Provide the core entity details to unlock deep-level diagnostics.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6 md:space-y-8 bg-white/[0.02] border border-white/5 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem]">
                                <h3 className="text-[10px] text-ios-cyan uppercase tracking-[0.2em] font-bold mb-4 border-b border-white/5 pb-2">Business Identity</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-2 font-bold ml-1">Business Name</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Enter Legal Business Name"
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-ios-cyan outline-none transition-all placeholder:text-white/10 text-lg font-medium"
                                            value={formM0.entityName}
                                            onChange={e => setFormM0({ ...formM0, entityName: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-2 font-bold ml-1">Manager/Owner Name</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Enter Name"
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-ios-cyan outline-none transition-all placeholder:text-white/10 text-lg font-medium"
                                            value={formM0.ownerName}
                                            onChange={e => setFormM0({ ...formM0, ownerName: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-2 font-bold ml-1">WhatsApp Number</label>
                                        <input
                                            required
                                            type="tel"
                                            placeholder="Enter WhatsApp"
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-ios-cyan outline-none transition-all placeholder:text-white/10 text-lg font-medium"
                                            value={formM0.whatsapp}
                                            onChange={e => setFormM0({ ...formM0, whatsapp: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-2 font-bold ml-1">Email Address</label>
                                        <input
                                            required
                                            type="email"
                                            placeholder="Enter Email"
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-ios-cyan outline-none transition-all placeholder:text-white/10 text-lg font-medium"
                                            value={formM0.email}
                                            onChange={e => setFormM0({ ...formM0, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    disabled={isSaving}
                                    type="submit"
                                    className="group relative w-full py-5 bg-white text-black font-black uppercase tracking-[0.3em] text-sm rounded-2xl overflow-hidden hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50"
                                >
                                    <div className="absolute inset-0 bg-ios-cyan translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                                    <span className="relative z-10 group-hover:text-white transition-colors duration-500">
                                        {isSaving ? 'Synchronizing...' : 'Synchronize & Initialize'}
                                    </span>
                                </button>
                                <p className="text-center text-[9px] text-white/20 uppercase tracking-[0.2em] mt-4">Secure Initialization Protocol Active</p>
                            </div>
                        </form>
                    )}

                    {/* WIZARD STEP 1 : M1 */}
                    {step === 1 && (
                        <form onSubmit={handleM1Submit} className="space-y-10 animate-fade-in max-w-2xl mx-auto py-6">
                            <div className="space-y-2">
                                <p className="text-white/40 text-sm leading-relaxed">
                                    Input your estimated monthly overheads to calculate operational inefficiency friction.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-8 bg-white/[0.02] border border-white/5 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem]">
                                <RangeSelector
                                    label="Monthly Payroll / Staff Cost"
                                    options={PAYROLL_OPTIONS}
                                    value={formM1.staffSalary}
                                    onChange={val => setFormM1({ ...formM1, staffSalary: val })}
                                />

                                <RangeSelector
                                    label="Monthly Marketing / Ad Spend"
                                    options={PAYROLL_OPTIONS} // Reusing financial ranges
                                    value={formM1.marketingBudget}
                                    onChange={val => setFormM1({ ...formM1, marketingBudget: val })}
                                />

                                <RangeSelector
                                    label="Other Operational Overheads"
                                    options={PAYROLL_OPTIONS} // Reusing financial ranges
                                    value={formM1.opsOverheads}
                                    onChange={val => setFormM1({ ...formM1, opsOverheads: val })}
                                />

                                <RangeSelector
                                    label={t.lossAudit.manualHoursLabel}
                                    options={MANUAL_HOURS_OPTIONS}
                                    value={formM1.manualHours}
                                    onChange={val => setFormM1({ ...formM1, manualHours: val })}
                                />


                                {/* Moved from Initialization to Contextual Operational Waste section */}
                                {(!business?.employee_count || !business?.has_crm || !business?.vertical || !business?.annual_revenue) && (
                                    <div className="space-y-8 pt-4 border-t border-white/5">
                                        <h3 className="text-[10px] text-ios-cyan uppercase tracking-[0.2em] font-bold">Business & Operational Context</h3>

                                        {!business?.annual_revenue && (
                                            <RangeSelector
                                                label={t?.common?.revenueLabel || 'Estimated Annual Revenue'}
                                                options={REVENUE_OPTIONS}
                                                value={formM1.annualRevenue}
                                                onChange={val => setFormM1({ ...formM1, annualRevenue: val })}
                                            />
                                        )}

                                        {!business?.employee_count && (
                                            <RangeSelector
                                                label={t?.common?.employeeCountLabel || 'Number of Employees (Operational Scale)'}
                                                options={EMPLOYEE_OPTIONS}
                                                value={formM1.employeeCount}
                                                onChange={val => setFormM1({ ...formM1, employeeCount: val })}
                                            />
                                        )}
                                        <div className="flex items-center gap-6">
                                            <div
                                                onClick={() => setFormM1(prev => ({ ...prev, hasCRM: !prev.hasCRM }))}
                                                className={`flex-1 p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-center gap-3 ${formM1.hasCRM ? 'bg-ios-cyan/10 border-ios-cyan text-ios-cyan' : 'bg-black/40 border-white/10 text-white/40'}`}
                                            >
                                                <span className="material-symbols-outlined">{formM1.hasCRM ? 'check_circle' : 'circle'}</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest">Uses CRM</span>
                                            </div>
                                            <div
                                                onClick={() => setFormM1(prev => ({ ...prev, hasERP: !prev.hasERP }))}
                                                className={`flex-1 p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-center gap-3 ${formM1.hasERP ? 'bg-ios-cyan/10 border-ios-cyan text-ios-cyan' : 'bg-black/40 border-white/10 text-white/40'}`}
                                            >
                                                <span className="material-symbols-outlined">{formM1.hasERP ? 'check_circle' : 'circle'}</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest">Uses ERP/Systems</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    disabled={isSaving}
                                    type="submit"
                                    className="group relative px-12 py-4 bg-white text-black font-black uppercase tracking-[0.3em] text-xs rounded-xl overflow-hidden hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50"
                                >
                                    <div className="absolute inset-0 bg-ios-cyan translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                                    <span className="relative z-10 group-hover:text-white transition-colors duration-500">
                                        {isSaving ? 'Calculating...' : 'Next Protocol'}
                                    </span>
                                </button>
                            </div>
                        </form>
                    )}

                    {/* WIZARD STEP 2 : M2 */}
                    {step === 2 && (
                        <form onSubmit={handleM2Submit} className="space-y-10 animate-fade-in max-w-2xl mx-auto py-6">
                            <div className="space-y-2">
                                <p className="text-white/40 text-sm leading-relaxed">
                                    Determine revenue hemorrhage caused by after-hours unresponsiveness.
                                </p>
                            </div>

                            <div className="space-y-10 bg-white/[0.02] border border-white/5 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem]">
                                <RangeSelector
                                    label="Daily New Inquiries / Leads Intensity"
                                    options={DAILY_LEADS_OPTIONS}
                                    value={formM2.dailyInquiries}
                                    onChange={val => setFormM2({ ...formM2, dailyInquiries: val })}
                                />

                                <div className="space-y-4">
                                    <label className="text-[10px] text-ios-cyan font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-ios-cyan rounded-full"></span>
                                        Closing Time Sequence
                                    </label>
                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                        {['12pm', '6pm', '8pm', '10pm', '24x7'].map(time => (
                                            <div
                                                key={time}
                                                onClick={() => setFormM2({ ...formM2, closingTime: time })}
                                                className={`py-4 rounded-xl border cursor-pointer border-white/10 transition-all text-center group ${formM2.closingTime === time ? 'bg-ios-cyan/20 border-ios-cyan text-ios-cyan shadow-[0_0_15px_rgba(0,210,255,0.2)]' : 'bg-black/30 text-white/40 hover:border-white/20'}`}
                                            >
                                                <p className="font-black uppercase tracking-widest text-[10px]">{time === '24x7' ? '24/7' : time}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <RangeSelector
                                    label="Average Transaction / Ticket Value"
                                    options={TXN_VALUE_OPTIONS}
                                    value={formM2.avgTransactionValue}
                                    onChange={val => setFormM2({ ...formM2, avgTransactionValue: val })}
                                />

                                <div className="space-y-4">
                                    <label className="text-[10px] text-ios-cyan font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-ios-cyan rounded-full"></span>
                                        Conversion Profile
                                    </label>
                                    <div className="flex gap-4">
                                        {[
                                            { id: 'b2b', label: 'B2B/Mfg' },
                                            { id: 'b2c', label: 'B2C Retail' },
                                            { id: 'both', label: 'Hybrid' }
                                        ].map(type => (
                                            <div
                                                key={type.id}
                                                onClick={() => setFormM2({ ...formM2, businessType: type.id })}
                                                className={`flex-1 py-4 rounded-xl border cursor-pointer border-white/10 transition-all text-center ${formM2.businessType === type.id ? 'bg-purple-500/20 border-purple-500/50 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.1)]' : 'bg-black/30 text-white/40 hover:border-white/20'}`}
                                            >
                                                <p className="font-black uppercase tracking-[0.2em] text-[10px]">{type.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    disabled={isSaving}
                                    type="submit"
                                    className="group relative px-12 py-4 bg-white text-black font-black uppercase tracking-[0.3em] text-xs rounded-xl overflow-hidden hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50"
                                >
                                    <div className="absolute inset-0 bg-ios-cyan translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                                    <span className="relative z-10 group-hover:text-white transition-colors duration-500">
                                        {isSaving ? 'Calculating...' : 'Next Protocol'}
                                    </span>
                                </button>
                            </div>
                        </form>
                    )}

                    {/* WIZARD STEP 3 : M3 */}
                    {step === 3 && (
                        <form onSubmit={handleM3Submit} className="space-y-10 animate-fade-in max-w-2xl mx-auto py-6">
                            <div className="space-y-2">
                                <p className="text-white/40 text-sm leading-relaxed">
                                    Audit external digital surface area presence to calculate stealth losses.
                                </p>
                            </div>

                            <div className="space-y-10 bg-white/[0.02] border border-white/5 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem]">
                                <div className="space-y-4">
                                    <label className="text-[10px] text-ios-cyan font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-ios-cyan rounded-full"></span>
                                        Operating City / Geography
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. MUMBAI, DELHI, SURAT"
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-ios-cyan outline-none transition-all placeholder:text-white/5 text-lg font-medium uppercase"
                                        value={formM3.city}
                                        onChange={e => setFormM3({ ...formM3, city: e.target.value })}
                                    />
                                    <p className="text-[9px] text-white/20 uppercase tracking-widest">Required for search volume intensity calibration</p>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] text-ios-cyan font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-ios-cyan rounded-full"></span>
                                        Active Digital Signals
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { id: 'hasGoogleMyBusiness', label: 'Google Business Profile' },
                                            { id: 'hasWebsite', label: 'Active Website' },
                                            { id: 'hasWhatsApp', label: 'WhatsApp Business' },
                                            { id: 'activeSocialMedia', label: 'Active Social Media' },
                                            { id: 'seoOptimized', label: 'Local SEO Optimized' },
                                            { id: 'runsAds', label: 'Search/Social Ads' },
                                        ].map(sig => (
                                            <div
                                                key={sig.id}
                                                onClick={() => setFormM3(prev => ({ ...prev, signals: { ...prev.signals, [sig.id]: !prev.signals[sig.id] } }))}
                                                className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 group ${formM3.signals[sig.id] ? 'bg-ios-cyan/10 border-ios-cyan/50 shadow-[0_0_15px_rgba(0,210,255,0.1)]' : 'bg-black/30 border-white/10 hover:border-white/20'}`}
                                            >
                                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${formM3.signals[sig.id] ? 'bg-ios-cyan border-ios-cyan' : 'border-white/20 group-hover:border-white/40'}`}>
                                                    {formM3.signals[sig.id] && <span className="material-symbols-outlined text-[16px] text-black font-bold">check</span>}
                                                </div>
                                                <p className={`font-black text-[11px] uppercase tracking-wider ${formM3.signals[sig.id] ? 'text-ios-cyan' : 'text-white/40'}`}>{sig.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    disabled={isSaving}
                                    type="submit"
                                    className="group relative px-12 py-4 bg-white text-black font-black uppercase tracking-[0.3em] text-xs rounded-xl overflow-hidden hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50"
                                >
                                    <div className="absolute inset-0 bg-ios-cyan translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                                    <span className="relative z-10 group-hover:text-white transition-colors duration-500">
                                        {isSaving ? 'Calculating...' : 'Next Protocol'}
                                    </span>
                                </button>
                            </div>
                        </form>
                    )}

                    {/* WIZARD STEP 4 : M4 */}
                    {step === 4 && (
                        <form onSubmit={handleM4Submit} className="space-y-10 animate-fade-in max-w-2xl mx-auto py-6">
                            <div className="space-y-2">
                                <p className="text-white/40 text-sm leading-relaxed">
                                    Final Matrix calculation. Assess AI disruption risk threshold.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/[0.02] border border-white/5 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem]">
                                {!business?.vertical && (
                                    <div className="space-y-3 col-span-1 md:col-span-2 border-b border-white/5 pb-8 mb-2">
                                        <label className="text-[10px] text-ios-cyan font-black uppercase tracking-[0.3em] flex items-center gap-2 mb-4 flex-wrap">
                                            <span className="w-1.5 h-1.5 bg-ios-cyan rounded-full shrink-0"></span>
                                            <span className="break-words">Industry Sector Orientation</span>
                                        </label>
                                        <select
                                            required
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-ios-cyan outline-none transition-all text-lg font-medium"
                                            value={formM4.industry}
                                            onChange={e => setFormM4({ ...formM4, industry: e.target.value })}
                                        >
                                            {BUSINESS_VERTICALS.map(v => (
                                                <option key={v.value} value={v.value} className="bg-neutral-900">{v.label}</option>
                                            ))}
                                        </select>
                                        <p className="text-[9px] text-white/20 uppercase tracking-widest mt-2 break-words">Critical for AI risk benchmark calibration.</p>
                                    </div>
                                )}

                                <div className="space-y-3 min-w-0">
                                    <label className="text-[10px] text-ios-cyan font-black uppercase tracking-[0.3em] flex items-center gap-2 flex-wrap">
                                        <span className="w-1.5 h-1.5 bg-ios-cyan rounded-full shrink-0"></span>
                                        <span className="break-words">Physical Moat (Omnichannel)</span>
                                    </label>

                                    <div
                                        onClick={() => setFormM4(prev => ({ ...prev, isOmnichannel: !prev.isOmnichannel }))}
                                        className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 group ${formM4.isOmnichannel ? 'bg-ios-cyan/10 border-ios-cyan/50 shadow-[0_0_15px_rgba(0,210,255,0.1)]' : 'bg-black/30 border-white/10 hover:border-white/20'}`}
                                    >
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${formM4.isOmnichannel ? 'bg-ios-cyan border-ios-cyan' : 'border-white/20 group-hover:border-white/40'}`}>
                                            {formM4.isOmnichannel && <span className="material-symbols-outlined text-[16px] text-black font-bold">check</span>}
                                        </div>
                                        <p className={`font-black text-[11px] uppercase tracking-wider break-words ${formM4.isOmnichannel ? 'text-ios-cyan' : 'text-white/40'}`}>Physical Presence / Retail Moat</p>
                                    </div>
                                </div>

                                <div className="space-y-3 min-w-0">
                                    <label className="text-[10px] text-ios-cyan font-black uppercase tracking-[0.3em] flex items-center gap-2 flex-wrap">
                                        <span className="w-1.5 h-1.5 bg-ios-cyan rounded-full shrink-0"></span>
                                        <span className="break-words">AI Adoption Level</span>
                                    </label>
                                    <div className="relative group w-full">

                                        <select
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-ios-cyan outline-none appearance-none cursor-pointer text-lg transition-all"
                                            value={formM4.aiAdoptionLevel}
                                            onChange={e => setFormM4({ ...formM4, aiAdoptionLevel: e.target.value })}
                                        >
                                            <option value="none" className="bg-neutral-900 text-white">Zero (Manual Only)</option>
                                            <option value="basic" className="bg-neutral-900 text-white">Basic (Exploratory)</option>
                                            <option value="integrated" className="bg-neutral-900 text-white">Integrated Workflows</option>
                                            <option value="advanced" className="bg-neutral-900 text-white">Advanced Autonomous</option>
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                                            <span className="material-symbols-outlined">expand_more</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 min-w-0">
                                    <label className="text-[10px] text-ios-cyan font-black uppercase tracking-[0.3em] flex items-center gap-2 flex-wrap">
                                        <span className="w-1.5 h-1.5 bg-ios-cyan rounded-full shrink-0"></span>
                                        <span className="break-words">Market AI Dynamics</span>
                                    </label>
                                    <div className="relative group w-full">

                                        <select
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-ios-cyan outline-none appearance-none cursor-pointer text-lg transition-all"
                                            value={formM4.competitorAdoption}
                                            onChange={e => setFormM4({ ...formM4, competitorAdoption: e.target.value })}
                                        >
                                            <option value="low" className="bg-neutral-900 text-white">Low Disruption</option>
                                            <option value="medium" className="bg-neutral-900 text-white">Emerging Threats</option>
                                            <option value="high" className="bg-neutral-900 text-white">Aggressive Displacement</option>
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                                            <span className="material-symbols-outlined">expand_more</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 min-w-0">
                                    <label className="text-[10px] text-ios-cyan font-black uppercase tracking-[0.3em] flex items-center gap-2 flex-wrap">
                                        <span className="w-1.5 h-1.5 bg-ios-cyan rounded-full shrink-0"></span>
                                        <span className="break-words">Process Complexity</span>
                                    </label>
                                    <div className="relative group w-full">

                                        <select
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-ios-cyan outline-none appearance-none cursor-pointer text-lg transition-all"
                                            value={formM4.operationalComplexity}
                                            onChange={e => setFormM4({ ...formM4, operationalComplexity: e.target.value })}
                                        >
                                            <option value="low" className="bg-neutral-900 text-white">Low Complexity</option>
                                            <option value="medium" className="bg-neutral-900 text-white">High-Touch Manual</option>
                                            <option value="high" className="bg-neutral-900 text-white">Advanced Systemic</option>
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                                            <span className="material-symbols-outlined">expand_more</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    disabled={isSaving}
                                    type="submit"
                                    className="group relative px-12 py-5 bg-ios-cyan text-white font-black uppercase tracking-[0.4em] text-xs rounded-xl overflow-hidden hover:scale-[1.05] active:scale-95 transition-all duration-300 disabled:opacity-50 shadow-[0_0_20px_rgba(0,210,255,0.3)]"
                                >
                                    <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                                    <span className="relative z-10 group-hover:text-black transition-colors duration-500">
                                        {isSaving ? 'Finalizing...' : 'Submit Diagnostics'}
                                    </span>
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div >
    );
}
