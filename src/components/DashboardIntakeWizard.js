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
    BUSINESS_VERTICALS
} from '@/lib/calculations';
import { formatIndian } from '@/utils/formatIndian';

export default function DashboardIntakeWizard({ business, existingData, t, onComplete }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const [step, setStep] = useState(0);
    const [activeId, setActiveId] = useState(business?.id || null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    // Initial state setup based on any existing data
    useEffect(() => {
        if (!existingData) return;

        let initialStep = 0;
        // Step 0: Ensure we have basic business info if they reached this component. If entity_name exists, skip.
        if (!business?.entity_name || business.entity_name === 'Initialize System' || !business.vertical) {
            initialStep = 0;
        } else if (!existingData || (!existingData.lossAudit?.created_at && !existingData.nightLoss?.created_at && !existingData.missedCustomers?.created_at && !existingData.aiThreat?.created_at)) {
            initialStep = 1;
        }
        else if (!existingData.lossAudit?.created_at) initialStep = 1;
        else if (!existingData.nightLoss?.created_at) initialStep = 2;
        else if (!existingData.missedCustomers?.created_at) initialStep = 3;
        else if (!existingData.aiThreat?.created_at) initialStep = 4;
        else initialStep = 5; // All complete

        // Only jump forward, don't force them back if they happen to open it manually
        if (initialStep > step && initialStep <= 4) {
            setStep(initialStep);
        }
    }, [existingData, business]);

    // --- FORM STATES ---
    const [formM0, setFormM0] = useState({
        entityName: business?.entity_name && business.entity_name !== 'Initialize System' ? business.entity_name : '',
        ownerName: business?.owner_name || '',
        whatsapp: business?.phone || '',
        email: business?.email || '',
    });
    const [formM1, setFormM1] = useState({
        staffSalary: existingData?.lossAudit?.staff_salary || '',
        marketingBudget: existingData?.lossAudit?.marketing_budget || '',
        opsOverheads: existingData?.lossAudit?.ops_overheads || '',
        annualRevenue: existingData?.lossAudit?.annual_revenue || '',
        industry: existingData?.lossAudit?.industry || business?.vertical || 'retail',
        manualHours: existingData?.lossAudit?.manual_hours || 0,
        hasCRM: existingData?.lossAudit?.has_crm || false,
        hasERP: existingData?.lossAudit?.has_erp || false,
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
        industry: formM1.industry || 'other',
        aiAdoptionLevel: existingData?.aiThreat?.features?.aiAdoptionLevel || 'none',
        competitorAdoption: existingData?.aiThreat?.features?.competitorAdoption || 'low',
        operationalComplexity: existingData?.aiThreat?.features?.operationalComplexity || 'medium',
        marketPosition: existingData?.aiThreat?.features?.marketPosition || 'established',
        hasDigitalMoat: existingData?.aiThreat?.features?.hasDigitalMoat || false
    });

    // Keep M4 industry synced with M1
    useEffect(() => {
        setFormM4(prev => ({ ...prev, industry: formM1.industry }));
    }, [formM1.industry]);

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

        // Timeout flag to prevent infinite hang on live
        let connectionTimedOut = false;
        const timeoutId = setTimeout(() => {
            connectionTimedOut = true;
            setError("Connection timed out. Please check your internet or try refreshing.");
            setIsSaving(false);
        }, 15000);

        try {
            const payload = {
                entity_name: formM0.entityName,
                owner_name: formM0.ownerName,
                phone: formM0.whatsapp,
                email: formM0.email,
                user_id: user?.id || null
            };

            let bizId = activeId;

            if (bizId) {
                // Update existing
                const { error: saveErr } = await supabase
                    .from('businesses')
                    .update(payload)
                    .eq('id', bizId);

                if (connectionTimedOut) return;
                if (saveErr) throw saveErr;
            } else {
                // Create new
                const { data: newBiz, error: saveErr } = await supabase
                    .from('businesses')
                    .insert(payload)
                    .select()
                    .single();

                if (connectionTimedOut) return;

                // Specific check for missing "vertical" column error which often happens on live
                if (saveErr) {
                    if (saveErr.message?.includes('column "vertical" of relation "businesses" does not exist')) {
                        throw new Error("System Schema Mismatch: Please run 'add_vertical_column.sql' in Supabase SQL editor.");
                    }
                    throw saveErr;
                }

                bizId = newBiz.id;
                setActiveId(bizId);

                // Update URL to persist session on refresh
                const params = new URLSearchParams(searchParams.toString());
                params.set('id', bizId);
                router.replace(`/dashboard?${params.toString()}`, { scroll: false });
            }

            clearTimeout(timeoutId);
            // Sync forward
            setStep(1);
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
        try {
            const staff = parseFloat(formM1.staffSalary) || 0;
            const ops = parseFloat(formM1.opsOverheads) || 0;
            const marketing = parseFloat(formM1.marketingBudget) || 0;
            const revenue = parseFloat(formM1.annualRevenue) || 0;

            const calc = calculateLossAudit(staff, ops, marketing, {
                manualHoursPerWeek: formM1.manualHours,
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
                industry: formM1.industry,
                manual_hours: formM1.manualHours,
                has_crm: formM1.hasCRM,
                has_erp: formM1.hasERP,
                // Mapped from calc
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

            const { error: saveErr } = await supabase.from('loss_audit_results').upsert(payload, { onConflict: 'business_id' });
            if (saveErr) throw saveErr;

            // Also update the main business vertical for classification
            await supabase.from('businesses').update({ vertical: formM1.industry }).eq('id', activeId);

            setStep(2);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    // Step 2: Night Loss
    const handleM2Submit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        try {
            const avgValue = parseFloat(formM2.avgTransactionValue) || 0;
            if (avgValue <= 0) throw new Error("Average transaction value is required.");

            const calc = calculateNightLoss(formM2.dailyInquiries, formM2.closingTime, avgValue, formM2.businessType);

            const payload = {
                business_id: activeId,
                daily_inquiries: formM2.dailyInquiries,
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

            const { error: saveErr } = await supabase.from('night_loss_results').upsert(payload, { onConflict: 'business_id' });
            if (saveErr) throw saveErr;
            setStep(3);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    // Step 3: Visibility
    const handleM3Submit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        try {
            if (!formM3.city) throw new Error("City is required.");
            const avgVal = parseFloat(formM2.avgTransactionValue) || 0;
            const calc = calculateVisibility(formM3.signals, formM3.city, avgVal);

            const activeSignalsArray = Object.keys(formM3.signals).filter(k => formM3.signals[k]);

            const payload = {
                business_id: activeId,
                city: formM3.city.toLowerCase(),
                country: 'India',
                signals: formM3.signals, // This is already an object { hasGoogleMyBusiness: true... }
                avg_transaction_value: avgVal,
                percent: calc.percent,
                status: calc.status,
                missed_customers: calc.missedCustomers,
                missed_revenue: calc.monthlyLoss,
                annual_loss: calc.annualLoss,
                gaps: calc.gaps,
                created_at: new Date().toISOString()
            };

            const { error: saveErr } = await supabase.from('visibility_results').upsert(payload, { onConflict: 'business_id' });
            if (saveErr) throw saveErr;
            setStep(4);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    // Step 4: AI Threat
    const handleM4Submit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        try {
            const industryValue = typeof formM4.industry === 'string' ? formM4.industry : formM4.industry?.value;
            if (!industryValue) throw new Error("Please select an industry sector");

            const calc = calculateAIThreat(industryValue, formM4);

            const payload = {
                business_id: activeId,
                industry: formM4.industry,
                score: calc.riskPct,
                threat_level: calc.riskBand,
                years_left: Math.round(calc.yearsLeft || 0),
                final_horizon: calc.finalHorizon || 0,
                timeline_desc: calc.displayLabel,
                is_omnichannel: formM4.isOmnichannel,
                has_crm: formM4.hasCRM,
                has_erp: formM4.hasERP,
                employee_count: formM4.employeeCount,
                created_at: new Date().toISOString()
            };

            const { error: saveErr } = await supabase.from('ai_threat_results').upsert(payload, { onConflict: 'business_id' });
            if (saveErr) throw saveErr;

            // All done! Tell parent to refresh
            if (onComplete) onComplete();
            router.refresh(); // Force page hard refresh to load all stats natively
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const STEP_TITLES = [
        "System Authorization",
        "Module 01: Operational Waste",
        "Module 02: Night Loss Leakage",
        "Module 03: Digital Invisibility",
        "Module 04: Extinction Horizon"
    ];

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-12 bg-black/60 backdrop-blur-xl animate-fade-in overflow-y-auto custom-scrollbar">
            <div className="w-full max-w-4xl bg-black/80 border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden relative border-glow shadow-glow-blue my-auto">

                {/* Visual Accent */}
                <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-ios-cyan/50 to-transparent"></div>

                {/* Header Sequence */}
                <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01] shrink-0">
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase font-black tracking-[0.4em] text-ios-cyan/60">Verification Sequence: Step {step + 1} of 5</p>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">{STEP_TITLES[step]}</h2>
                    </div>
                    {/* Progress Bar Mini */}
                    <div className="flex gap-1.5 bg-white/5 p-1 rounded-full px-3 border border-white/5">
                        {[0, 1, 2, 3, 4].map(i => (
                            <div key={i} className={`w-3 h-3 rounded-full transition-all duration-700 ${step >= i ? 'bg-ios-cyan scale-110 shadow-[0_0_12px_rgba(0,210,255,0.8)]' : 'bg-white/10'}`}></div>
                        ))}
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mx-10 mt-6 bg-red-500/10 border border-red-500/20 px-6 py-3 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-[0.2em] text-center animate-bounce-in shrink-0">
                        CRITICAL FAULT: {error}
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar scroll-smooth">

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
                                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Identity Verification</h3>
                                    <p className="text-white/40 text-sm leading-relaxed max-w-sm mx-auto">
                                        Initialize your enterprise protocol. Provide the core entity details to unlock deep-level diagnostics.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-8 bg-white/[0.02] border border-white/5 p-8 rounded-[2rem]">
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
                                        {isSaving ? 'Synchronizing...' : 'Authorize & Initialize'}
                                    </span>
                                </button>
                                <p className="text-center text-[9px] text-white/20 uppercase tracking-[0.2em] mt-4">Security Level 4: Encrypted Transmission Active</p>
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 bg-white/[0.02] border border-white/5 p-8 rounded-[2rem]">
                                <div className="sm:col-span-2 space-y-3 pb-6 border-b border-white/5">
                                    <label className="text-[10px] text-ios-cyan font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-ios-cyan rounded-full"></span>
                                        Vertical / Industry Sector
                                    </label>
                                    <div className="relative group">
                                        <select
                                            required
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-ios-cyan outline-none appearance-none cursor-pointer text-lg"
                                            value={formM1.industry}
                                            onChange={e => setFormM1({ ...formM1, industry: e.target.value })}
                                        >
                                            {BUSINESS_VERTICALS.map(v => (
                                                <option key={v.value} value={v.value} className="bg-[#0a0a0c]">{v.label}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 group-hover:text-ios-cyan transition-colors">
                                            <span className="material-symbols-outlined">expand_more</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] text-ios-cyan font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-ios-cyan rounded-full"></span>
                                        Monthly Payroll / Staff (₹)
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="0"
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-ios-cyan outline-none transition-all placeholder:text-white/5 text-lg font-medium"
                                        value={formM1.staffSalary}
                                        onChange={e => setFormM1({ ...formM1, staffSalary: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] text-ios-cyan font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-ios-cyan rounded-full"></span>
                                        Monthly Ad Spend (₹)
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="0"
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-ios-cyan outline-none transition-all placeholder:text-white/5 text-lg font-medium"
                                        value={formM1.marketingBudget}
                                        onChange={e => setFormM1({ ...formM1, marketingBudget: e.target.value })}
                                    />
                                </div>

                                <div className="sm:col-span-2 space-y-3">
                                    <label className="text-[10px] text-ios-cyan font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-ios-cyan rounded-full"></span>
                                        Other Operational Overheads (₹)
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="0"
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-ios-cyan outline-none transition-all placeholder:text-white/5 text-lg font-medium"
                                        value={formM1.opsOverheads}
                                        onChange={e => setFormM1({ ...formM1, opsOverheads: e.target.value })}
                                    />
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

                    {/* WIZARD STEP 2 : M2 */}
                    {step === 2 && (
                        <form onSubmit={handleM2Submit} className="space-y-10 animate-fade-in max-w-2xl mx-auto py-6">
                            <div className="space-y-2">
                                <p className="text-white/40 text-sm leading-relaxed">
                                    Determine revenue hemorrhage caused by after-hours unresponsiveness.
                                </p>
                            </div>

                            <div className="space-y-10 bg-white/[0.02] border border-white/5 p-8 rounded-[2rem]">
                                <div className="space-y-4">
                                    <label className="text-[10px] text-ios-cyan font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-ios-cyan rounded-full"></span>
                                        Daily Inquiries / Leads: <span className="text-white font-black ml-2 text-sm">{formM2.dailyInquiries}</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="200"
                                        step="1"
                                        className="w-full accent-ios-cyan h-2 bg-white/5 rounded-lg appearance-none cursor-pointer"
                                        value={formM2.dailyInquiries}
                                        onChange={e => setFormM2({ ...formM2, dailyInquiries: parseInt(e.target.value) })}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] text-ios-cyan font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-ios-cyan rounded-full"></span>
                                        Closing Time Sequence
                                    </label>
                                    <div className="flex gap-4">
                                        {['6pm', '8pm', '10pm'].map(time => (
                                            <div
                                                key={time}
                                                onClick={() => setFormM2({ ...formM2, closingTime: time })}
                                                className={`flex-1 py-4 rounded-xl border cursor-pointer border-white/10 transition-all text-center group ${formM2.closingTime === time ? 'bg-ios-cyan/20 border-ios-cyan text-ios-cyan shadow-[0_0_15px_rgba(0,210,255,0.2)]' : 'bg-black/30 text-white/40 hover:border-white/20'}`}
                                            >
                                                <p className="font-black uppercase tracking-widest text-xs">{time}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] text-ios-cyan font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-ios-cyan rounded-full"></span>
                                        Avg Transaction Value (₹)
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        step="any"
                                        placeholder="Enter Amount"
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-ios-cyan outline-none transition-all placeholder:text-white/5 text-lg font-medium"
                                        value={formM2.avgTransactionValue}
                                        onChange={e => setFormM2({ ...formM2, avgTransactionValue: e.target.value })}
                                    />
                                </div>

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

                            <div className="space-y-10 bg-white/[0.02] border border-white/5 p-8 rounded-[2rem]">
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[
                                            { id: 'hasGoogleMyBusiness', label: 'Google Business Profile' },
                                            { id: 'hasWebsite', label: 'Active Website' },
                                            { id: 'hasWhatsApp', label: 'WhatsApp Business' },
                                            { id: 'activeSocialMedia', label: 'Active Social Media' },
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 bg-white/[0.02] border border-white/5 p-8 rounded-[2rem]">
                                <div className="space-y-3">
                                    <label className="text-[10px] text-ios-cyan font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-ios-cyan rounded-full"></span>
                                        Industry Sector
                                    </label>
                                    <div className="relative group">
                                        <select
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-ios-cyan outline-none appearance-none cursor-pointer text-lg transition-all"
                                            value={formM4.industry}
                                            onChange={e => setFormM4({ ...formM4, industry: e.target.value })}
                                        >
                                            {BUSINESS_VERTICALS.map(v => (
                                                <option key={v.value} value={v.value} className="bg-neutral-900 text-white">{v.label}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                                            <span className="material-symbols-outlined">expand_more</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] text-ios-cyan font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-ios-cyan rounded-full"></span>
                                        AI Adoption Level
                                    </label>
                                    <div className="relative group">
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

                                <div className="space-y-3">
                                    <label className="text-[10px] text-ios-cyan font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-ios-cyan rounded-full"></span>
                                        Market AI Dynamics
                                    </label>
                                    <div className="relative group">
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

                                <div className="space-y-3">
                                    <label className="text-[10px] text-ios-cyan font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-ios-cyan rounded-full"></span>
                                        Process Complexity
                                    </label>
                                    <div className="relative group">
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
