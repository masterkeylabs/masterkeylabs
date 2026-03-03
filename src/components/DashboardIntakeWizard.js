'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
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
    const [step, setStep] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    // Initial state setup based on any existing data
    useEffect(() => {
        if (!existingData) return;

        let initialStep = 0;
        if (!existingData || (!existingData.lossAudit?.created_at && !existingData.nightLoss?.created_at && !existingData.missedCustomers?.created_at && !existingData.aiThreat?.created_at)) {
            initialStep = 0;
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
    }, [existingData]);

    // --- FORM STATES ---
    const [formM1, setFormM1] = useState({
        staffSalary: existingData?.lossAudit?.staff_salary || '',
        marketingBudget: existingData?.lossAudit?.marketing_budget || '',
        opsOverheads: existingData?.lossAudit?.ops_overheads || '',
        annualRevenue: existingData?.lossAudit?.annual_revenue || '',
        industry: existingData?.lossAudit?.industry || 'manufacturing',
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

    // Step 0: Welcome
    const handleStart = () => setStep(1);

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
                business_id: business.id,
                ...calc,
                staff_salary: staff,
                ops_overheads: ops,
                marketing_budget: marketing,
                annual_revenue: revenue,
                industry: formM1.industry,
                manual_hours: formM1.manualHours,
                has_crm: formM1.hasCRM,
                has_erp: formM1.hasERP,
            };

            const { error: saveErr } = await supabase.from('loss_audit_results').upsert(payload, { onConflict: 'business_id' });
            if (saveErr) throw saveErr;
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
                business_id: business.id,
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
                business_id: business.id,
                signals: activeSignalsArray,
                city: formM3.city.toLowerCase(),
                missed_searches: calc.missedSearches,
                missed_customers: calc.missedCustomers,
                monthly_loss: calc.monthlyLoss,
                annual_loss: calc.annualLoss,
                percent: calc.invisibilityScore,
                score: calc.visibilityScore,
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
            const indKey = Object.keys(BUSINESS_VERTICALS).find(k => k.toLowerCase() === formM4.industry?.toLowerCase());
            const vertical = BUSINESS_VERTICALS[indKey || 'OTHER'];
            if (!vertical) throw new Error("Invalid vertical selected");

            const calc = calculateAIThreat(vertical, formM4);

            const payload = {
                business_id: business.id,
                industry: formM4.industry,
                score: calc.score,
                threat_level: calc.threatLevel,
                years_left: calc.timeToLiveMonths / 12,
                final_horizon: calc.timeToLiveMonths,
                risk_band: calc.riskBand,
                primary_impact: calc.primaryImpact,
                action_required: calc.actionRequired,
                features: formM4,
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
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-6 pt-[10vh] bg-black/40 backdrop-blur-md overflow-y-auto custom-scrollbar">
            <div className="w-full max-w-3xl bg-[#0a0a0c] border border-white/10 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header Sequence */}
                <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <div>
                        <p className="text-[10px] uppercase font-black tracking-[0.3em] text-white/30 mb-1">Step {step} of 4</p>
                        <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">{STEP_TITLES[step]}</h2>
                    </div>
                    {/* Progress Bar Mini */}
                    <div className="flex gap-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`w-8 h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'bg-ios-cyan shadow-[0_0_10px_rgba(0,210,255,0.5)]' : 'bg-white/10'}`}></div>
                        ))}
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="bg-red-500/10 border-b border-red-500/20 px-8 py-3 text-red-500 text-sm font-bold uppercase tracking-widest text-center">
                        ERROR: {error}
                    </div>
                )}

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">

                    {/* WIZARD STEP 0 : WELCOME */}
                    {step === 0 && (
                        <div className="space-y-6 animate-fade-in text-center py-10">
                            <div className="w-20 h-20 bg-ios-cyan/10 border border-ios-cyan/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(0,210,255,0.2)]">
                                <span className="material-symbols-outlined text-4xl text-ios-cyan">radar</span>
                            </div>
                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">System Diagnostic Required</h3>
                            <p className="text-white/50 max-w-md mx-auto leading-relaxed">
                                To unlock your Masterkey OS dashboard and calculate your exact Monthly Bleed, you must complete the 4 core diagnostic protocols sequentially.
                            </p>
                            <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/5 inline-block text-left mb-8 min-w-[300px]">
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Target Entity</p>
                                <p className="text-xl font-bold text-white tracking-tight">{business?.entity_name}</p>
                            </div>
                            <button
                                onClick={handleStart}
                                className="w-full sm:w-auto px-10 py-4 bg-white text-black font-black uppercase tracking-widest text-sm rounded-xl hover:bg-ios-cyan hover:shadow-[0_0_20px_rgba(0,210,255,0.5)] transition-all duration-300"
                            >
                                Initiate Protocol
                            </button>
                        </div>
                    )}

                    {/* WIZARD STEP 1 : M1 */}
                    {step === 1 && (
                        <form onSubmit={handleM1Submit} className="space-y-6 animate-fade-in">
                            <p className="text-white/50 text-sm mb-6">Input your estimated monthly overheads to calculate operational inefficiency friction.</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] text-white/60 uppercase tracking-widest block mb-2">Monthly Payroll/Staff Cost (₹)</label>
                                    <input type="number" step="any" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-ios-cyan focus:ring-1 focus:ring-ios-cyan outline-none transition-all" value={formM1.staffSalary} onChange={e => setFormM1({ ...formM1, staffSalary: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[10px] text-white/60 uppercase tracking-widest block mb-2">Monthly Marketing Ad Spend (₹)</label>
                                    <input type="number" step="any" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-ios-cyan focus:ring-1 focus:ring-ios-cyan outline-none transition-all" value={formM1.marketingBudget} onChange={e => setFormM1({ ...formM1, marketingBudget: e.target.value })} />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-[10px] text-white/60 uppercase tracking-widest block mb-2">Other Operational Overheads (₹)</label>
                                    <input type="number" step="any" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-ios-cyan focus:ring-1 focus:ring-ios-cyan outline-none transition-all" value={formM1.opsOverheads} onChange={e => setFormM1({ ...formM1, opsOverheads: e.target.value })} />
                                </div>

                                <div className="sm:col-span-2 pt-4 border-t border-white/5">
                                    <label className="text-[10px] text-white/60 uppercase tracking-widest block mb-2">Primary Industry Sector</label>
                                    <select className="w-full bg-[#111115] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-ios-cyan outline-none" value={formM1.industry} onChange={e => setFormM1({ ...formM1, industry: e.target.value })}>
                                        <option value="manufacturing">Manufacturing & Heavy Industry</option>
                                        <option value="real_estate">Real Estate & Construction</option>
                                        <option value="healthcare">Healthcare & Clinics</option>
                                        <option value="retail">Retail & E-commerce</option>
                                        <option value="professional_services">Professional Services (Agency/Consulting)</option>
                                        <option value="education">Education & Coaching</option>
                                        <option value="hospitality">Hospitality & Restaurants</option>
                                        <option value="other">Other / General</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-8 flex justify-end">
                                <button disabled={isSaving} type="submit" className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest text-sm rounded-xl hover:bg-ios-cyan transition-all duration-300 disabled:opacity-50">
                                    {isSaving ? 'Calculating...' : 'Next Protocol'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* WIZARD STEP 2 : M2 */}
                    {step === 2 && (
                        <form onSubmit={handleM2Submit} className="space-y-6 animate-fade-in">
                            <p className="text-white/50 text-sm mb-6">Determine revenue hemorrhage caused by after-hours unresponsiveness.</p>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] text-white/60 uppercase tracking-widest block mb-2">Average Daily Inquiries / Leads (Current: {formM2.dailyInquiries})</label>
                                    <input type="range" min="1" max="200" step="1" className="w-full accent-ios-cyan" value={formM2.dailyInquiries} onChange={e => setFormM2({ ...formM2, dailyInquiries: parseInt(e.target.value) })} />
                                </div>

                                <div className="flex flex-wrap gap-4">
                                    {['6pm', '8pm', '10pm'].map(time => (
                                        <div
                                            key={time}
                                            onClick={() => setFormM2({ ...formM2, closingTime: time })}
                                            className={`flex-1 p-4 rounded-xl border cursor-pointer border-white/10 transition-all text-center ${formM2.closingTime === time ? 'bg-ios-cyan/20 border-ios-cyan text-ios-cyan' : 'bg-white/5 text-white'}`}
                                        >
                                            <p className="font-bold uppercase tracking-wider text-sm">{time}</p>
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <label className="text-[10px] text-white/60 uppercase tracking-widest block mb-2">Average Transaction Value (₹) *Required</label>
                                    <input required type="number" step="any" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-ios-cyan outline-none transition-all" value={formM2.avgTransactionValue} onChange={e => setFormM2({ ...formM2, avgTransactionValue: e.target.value })} />
                                </div>

                                <div>
                                    <label className="text-[10px] text-white/60 uppercase tracking-widest block mb-2">Business Type (Conversion Profile)</label>
                                    <div className="flex flex-wrap gap-4">
                                        {[
                                            { id: 'b2b', label: 'B2B/Mfg' },
                                            { id: 'b2c', label: 'B2C Retail' },
                                            { id: 'both', label: 'Hybrid' }
                                        ].map(type => (
                                            <div
                                                key={type.id}
                                                onClick={() => setFormM2({ ...formM2, businessType: type.id })}
                                                className={`flex-1 p-4 rounded-xl border cursor-pointer border-white/10 transition-all text-center ${formM2.businessType === type.id ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-white/5 text-white'}`}
                                            >
                                                <p className="font-bold uppercase tracking-wider text-[11px]">{type.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 flex justify-end">
                                <button disabled={isSaving} type="submit" className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest text-sm rounded-xl hover:bg-ios-cyan transition-all duration-300 disabled:opacity-50">
                                    {isSaving ? 'Calculating...' : 'Next Protocol'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* WIZARD STEP 3 : M3 */}
                    {step === 3 && (
                        <form onSubmit={handleM3Submit} className="space-y-6 animate-fade-in">
                            <p className="text-white/50 text-sm mb-6">Audit external digital surface area presence to calculate stealth losses.</p>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] text-white/60 uppercase tracking-widest block mb-2">Operating City *Required for Search Volume Data</label>
                                    <input required type="text" placeholder="e.g. Mumbai, Delhi, Surat" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-ios-cyan outline-none transition-all uppercase" value={formM3.city} onChange={e => setFormM3({ ...formM3, city: e.target.value })} />
                                </div>

                                <div>
                                    <label className="text-[10px] text-white/60 uppercase tracking-widest block mb-4">Active Digital Signals (Select all that apply)</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {[
                                            { id: 'hasGoogleMyBusiness', label: 'Google Business Profile' },
                                            { id: 'hasWebsite', label: 'Active Website' },
                                            { id: 'hasWhatsApp', label: 'WhatsApp Business' },
                                            { id: 'activeSocialMedia', label: 'Active Social Media' },
                                            { id: 'runsAds', label: 'Running Search/Social Ads' },
                                        ].map(sig => (
                                            <div
                                                key={sig.id}
                                                onClick={() => setFormM3(prev => ({ ...prev, signals: { ...prev.signals, [sig.id]: !prev.signals[sig.id] } }))}
                                                className={`p-4 rounded-xl border cursor-pointer border-white/10 transition-all flex items-center gap-3 ${formM3.signals[sig.id] ? 'bg-cyan-500/10 border-cyan-500' : 'bg-white/5'}`}
                                            >
                                                <div className={`w-5 h-5 rounded flex items-center justify-center border ${formM3.signals[sig.id] ? 'bg-cyan-500 border-cyan-500' : 'border-white/20'}`}>
                                                    {formM3.signals[sig.id] && <span className="material-symbols-outlined text-[14px] text-black">check</span>}
                                                </div>
                                                <p className={`font-bold text-[12px] uppercase ${formM3.signals[sig.id] ? 'text-cyan-400' : 'text-white'}`}>{sig.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 flex justify-end">
                                <button disabled={isSaving} type="submit" className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest text-sm rounded-xl hover:bg-ios-cyan transition-all duration-300 disabled:opacity-50">
                                    {isSaving ? 'Calculating...' : 'Next Protocol'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* WIZARD STEP 4 : M4 */}
                    {step === 4 && (
                        <form onSubmit={handleM4Submit} className="space-y-6 animate-fade-in">
                            <p className="text-white/50 text-sm mb-6">Final Matrix calculation. Assess AI disruption risk threshold.</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] text-white/60 uppercase tracking-widest block mb-2">Industry Target</label>
                                    <select className="w-full bg-[#111115] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none" value={formM4.industry} onChange={e => setFormM4({ ...formM4, industry: e.target.value })}>
                                        {Object.entries(BUSINESS_VERTICALS).map(([key, obj]) => (
                                            <option key={key} value={key}>{obj.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] text-white/60 uppercase tracking-widest block mb-2">Current Internal AI Adoption</label>
                                    <select className="w-full bg-[#111115] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none" value={formM4.aiAdoptionLevel} onChange={e => setFormM4({ ...formM4, aiAdoptionLevel: e.target.value })}>
                                        <option value="none">Zero (Manual Only)</option>
                                        <option value="basic">Basic (ChatGPT occasionally)</option>
                                        <option value="integrated">Integrated Workflows</option>
                                        <option value="advanced">Advanced Autonomous</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] text-white/60 uppercase tracking-widest block mb-2">Competitor AI Dynamics</label>
                                    <select className="w-full bg-[#111115] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none" value={formM4.competitorAdoption} onChange={e => setFormM4({ ...formM4, competitorAdoption: e.target.value })}>
                                        <option value="low">Low Disruption</option>
                                        <option value="medium">Emerging Threats</option>
                                        <option value="high">Rapid Aggressive Displacement</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] text-white/60 uppercase tracking-widest block mb-2">Operational Complexity</label>
                                    <select className="w-full bg-[#111115] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none" value={formM4.operationalComplexity} onChange={e => setFormM4({ ...formM4, operationalComplexity: e.target.value })}>
                                        <option value="low">Simple (Easy to automate)</option>
                                        <option value="medium">Standard Operations</option>
                                        <option value="high">Highly Complex/Human Dependent</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-8 flex justify-end">
                                <button disabled={isSaving} type="submit" className="px-8 py-3 bg-red-500 text-white font-black uppercase tracking-widest text-sm rounded-xl hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all duration-300 disabled:opacity-50">
                                    {isSaving ? 'Calculating...' : 'Finalize Diagnostics'}
                                </button>
                            </div>
                        </form>
                    )}

                </div>
            </div>
        </div>
    );
}
