'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { calculateLossAudit, calculateNightLoss, calculateAIThreat, calculateVisibility, BUSINESS_VERTICALS } from '@/lib/calculations';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';

const REVENUE_MIDPOINTS = {
    '0-5L': 250000,
    '5-20L': 1250000,
    '20-50L': 3500000,
    '50L-1Cr': 7500000,
    '1-5Cr': 30000000,
    '5Cr+': 100000000,
    '50L+': 7500000 // support old value
};

export default function IntakeWizard({ t }) {
    const router = useRouter();
    const { user, business } = useAuth();
    const [step, setStep] = useState(0);
    const [localId, setLocalId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [displayScore, setDisplayScore] = useState(0);
    const [scanIdx, setScanIdx] = useState(0);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setLocalId(localStorage.getItem('masterkey_business_id'));
        }
    }, []);

    const [formData, setFormData] = useState({
        vertical: 'retail',
        revenueBracket: '5-20L',
        employees: '1-10',
        marketingSpend: '50000',
        opsSpend: '100000',
        location: '',
        contactAfter6: 'manual',
        businessName: '',
        contactName: '',
        whatsapp: '',
        email: '',
    });

    const [results, setResults] = useState(null);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        const val = type === 'number' ? Math.max(0, parseInt(value) || 0).toString() : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const nextStep = () => {
        if (step === 3) generateReport();
        else setStep(s => s + 1);
    };

    const prevStep = () => setStep(s => Math.max(0, s - 1));

    const generateReport = async () => {
        setStep(4); // Trigger scanning phase

        // Calculations
        const empCount = formData.employees === '1-10' ? 5 : formData.employees === '11-50' ? 25 : formData.employees === '51-200' ? 100 : 250;
        const staffCost = empCount * 25000;
        // Derive annual revenue midpoint from revenue bracket for Coordination Drag
        const annualRevenue = REVENUE_MIDPOINTS[formData.revenueBracket] || 1250000;

        const lossData = calculateLossAudit(staffCost, Number(formData.opsSpend), Number(formData.marketingSpend), {
            manualHoursPerWeek: 0,
            hasCRM: false,
            hasERP: false,
            annualRevenue: annualRevenue
        });

        const night = calculateNightLoss(0, '6pm', 0, 'both');

        const threat = calculateAIThreat(
            formData.vertical,
            formData.contactAfter6 === 'ai'
        );

        setResults({
            loss: {
                staffWaste: lossData.staffWaste,
                marketingWaste: lossData.marketingWaste,
                opsWaste: lossData.opsWaste,
                totalBurn: lossData.totalBurn,
                annualBurn: lossData.annualBurn,
                savingTarget: lossData.savingTarget
            },
            night: {
                lostRevenue: night
            },
            threat: {
                score: threat.riskPct,
                yearsLeft: threat.yearsLeft,
                threatLevel: threat.riskBand,
                timelineDesc: threat.displayLabel
            }
        });

        await new Promise(r => setTimeout(r, 2500));
        setStep(5); // Lead Gate
    };

    useEffect(() => {
        if (step === 4) {
            const iv = setInterval(() => setScanIdx(p => (p + 1) % 5), 500);
            return () => clearInterval(iv);
        }
    }, [step]);

    useEffect(() => {
        if (results && step === 5) {
            let start = 0;
            const target = results.threat.score;
            const stepVal = Math.max(1, Math.floor(target / 40));
            const timer = setInterval(() => {
                start += stepVal;
                if (start >= target) { start = target; clearInterval(timer); }
                setDisplayScore(start);
            }, 30);
            return () => clearInterval(timer);
        }
    }, [results, step]);

    const syncAuditToSupabase = useCallback(async (bizId, currentResults) => {
        const empCount = formData.employees === '1-10' ? 5 : formData.employees === '11-50' ? 25 : formData.employees === '51-200' ? 100 : 250;
        const staffCost = empCount * 25000;
        const manualHours = 0;
        const hasCRM = false;
        const hasERP = false;
        const now = new Date().toISOString();
        const annualRevenueVal = REVENUE_MIDPOINTS[formData.revenueBracket] || 1250000;

        const fullCalc = calculateLossAudit(staffCost, Number(formData.opsSpend), Number(formData.marketingSpend), {
            manualHoursPerWeek: manualHours,
            hasCRM: hasCRM,
            hasERP: hasERP,
            annualRevenue: annualRevenueVal
        });

        // 1. Save Loss Audit Results
        const { error: e1 } = await supabase.from('loss_audit_results').upsert({
            business_id: bizId,
            staff_salary: staffCost,
            marketing_budget: Number(formData.marketingSpend),
            ops_overheads: Number(formData.opsSpend),
            annual_revenue: annualRevenueVal,
            manual_hours: manualHours,
            has_crm: hasCRM,
            has_erp: hasERP,
            industry: formData.vertical,
            staff_waste: fullCalc.staffWaste,
            marketing_waste: fullCalc.marketingWaste,
            ops_waste: fullCalc.opsWaste,
            coordination_drag: fullCalc.coordinationDrag,
            total_burn: fullCalc.totalBurn,
            annual_burn: fullCalc.annualBurn,
            saving_target: fullCalc.savingTarget,
            five_year_cost: fullCalc.fiveYearCost,
            created_at: now
        }, { onConflict: 'business_id' });
        if (e1) throw new Error(`Loss Audit Sync Failed: ${e1.message}`);

        // 2. Save Visibility Results
        const visResult = calculateVisibility([], formData.location || '');
        const { error: e2 } = await supabase.from('visibility_results').upsert({
            business_id: bizId,
            city: formData.location || '',
            signals: [],
            percent: visResult.percent,
            status: visResult.status,
            missed_customers: visResult.missedCustomers,
            gaps: visResult.gaps,
            created_at: now
        }, { onConflict: 'business_id' });
        if (e2) throw new Error(`Visibility Sync Failed: ${e2.message}`);

        // 3. Save AI Threat Results
        const { error: e3 } = await supabase.from('ai_threat_results').upsert({
            business_id: bizId,
            score: currentResults.threat.score,
            years_left: Math.round(currentResults.threat.yearsLeft),
            threat_level: currentResults.threat.threatLevel,
            timeline_desc: currentResults.threat.timelineDesc,
            industry: formData.vertical,
            is_omnichannel: formData.contactAfter6 === 'ai',
            created_at: now
        }, { onConflict: 'business_id' });
        if (e3) throw new Error(`AI Threat Sync Failed: ${e3.message}`);

        // 4. Save Night Loss Results
        const { error: e4 } = await supabase.from('night_loss_results').upsert({
            business_id: bizId,
            daily_inquiries: 0,
            closing_time: '6pm',
            profit_per_sale: 0,
            response_time: formData.contactAfter6,
            monthly_days: 26,
            monthly_loss: currentResults.night.lostRevenue.monthlyLoss,
            annual_loss: currentResults.night.lostRevenue.monthlyLoss * 12,
            created_at: now
        }, { onConflict: 'business_id' });
        if (e4) throw new Error(`Night Loss Sync Failed: ${e4.message}`);
    }, [formData.employees, formData.marketingSpend, formData.opsSpend, formData.revenueBracket, formData.vertical, formData.location, formData.contactAfter6]);

    const submitLead = async (e) => {
        e.preventDefault();
        setErrorMsg(null);
        setSubmitting(true);

        try {
            // ── Business Initialization via RPC ────────────────────────
            const bizPayload = {
                entity_name: formData.businessName || (formData.contactName + " Business"),
                classification: formData.vertical + "::" + formData.revenueBracket,
                scalability: formData.employees,
                owner_name: formData.contactName,
                email: formData.email,
                phone: formData.whatsapp,
                digital_footprint: formData.contactAfter6,
                user_id: user?.id || null,
                vertical: formData.vertical,
                annual_revenue: parseFloat(formData.revenueBracket.replace(/[^0-9.]/g, '')) || 0,
                employee_count: parseInt(formData.employees.replace(/[^0-9]/g, '')) || 0
            };

            const { data: newBiz, error: rpcErr } = await supabase.rpc('initialize_business_profile', {
                p_payload: bizPayload,
                p_active_id: null
            });

            if (rpcErr) throw rpcErr;
            if (newBiz && newBiz.error) throw new Error(newBiz.error);
            // ────────────────────────────────────────────────────────────

            if (newBiz && results) {
                // ── Log to user_signups table ──────────────────────────────
                await supabase.from('user_signups').insert({
                    business_id: newBiz.id,
                    full_name: formData.contactName,
                    email: formData.email,
                    phone: formData.whatsapp,
                    business_name: formData.businessName || (formData.contactName + ' Business'),
                    industry: formData.vertical,
                    revenue_bracket: formData.revenueBracket,
                    employees: formData.employees,
                    signed_up_at: new Date().toISOString(),
                }).then(({ error: signupErr }) => {
                    if (signupErr) console.warn('[IntakeWizard] user_signups insert skipped:', signupErr.message);
                });
                // ──────────────────────────────────────────────────────────

                await syncAuditToSupabase(newBiz.id, results);
            }

            localStorage.setItem('masterkey_business_id', newBiz.id);
            router.push(`/dashboard?id=${newBiz.id}`);

        } catch (error) {
            console.error(error);
            setErrorMsg(error.message || "An error occurred.");
            setSubmitting(false);
        }
    };

    const skipLeadForm = useCallback(async (currentResults) => {
        let bizId = business?.id || localStorage.getItem('masterkey_business_id');

        // If no business ID found but user is logged in, check if they already have one in DB
        if (!bizId && user?.id) {
            const { data: existingBiz } = await supabase
                .from('businesses')
                .select('id')
                .eq('user_id', user.id)
                .maybeSingle();
            if (existingBiz) bizId = existingBiz.id;
        }

        // If STILL no business ID but user is logged in, create a placeholder business for them
        // (This happens if a Google user finishes the audit without an existing record)
        if (!bizId && user?.id) {
            try {
                const { data: newBiz, error: createError } = await supabase
                    .from('businesses')
                    .insert({
                        entity_name: user.user_metadata?.full_name ? (user.user_metadata.full_name + "'s Business") : "My Business",
                        owner_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                        email: user.email,
                        user_id: user.id,
                        classification: formData.vertical + "::" + formData.revenueBracket
                    })
                    .select()
                    .single();

                if (createError) throw createError;
                bizId = newBiz.id;
            } catch (err) {
                console.error('Failed to create initial business:', err);
                setErrorMsg("Failed to initialize business profile.");
                return;
            }
        }

        if (bizId && currentResults) {
            try {
                // Ensure the business matches the logged in user if possible
                if (user?.id) {
                    await supabase.from('businesses').update({ user_id: user.id }).eq('id', bizId);
                }
                await syncAuditToSupabase(bizId, currentResults);
                localStorage.setItem('masterkey_business_id', bizId);
                router.push(`/dashboard?id=${bizId}`);
            } catch (err) {
                console.error('Auto-sync failed:', err);
                setErrorMsg("Dashboard sync failed. Please try again.");
            }
        } else if (bizId) {
            router.push(`/dashboard?id=${bizId}`);
        }
    }, [business, user, syncAuditToSupabase, router, formData.vertical, formData.revenueBracket]);

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        setErrorMsg(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`
                }
            });
            if (error) throw error;
        } catch (err) {
            setErrorMsg(err.message);
            setIsGoogleLoading(false);
        }
    };

    useEffect(() => {
        if (step === 5 && results && (user || business || localStorage.getItem('masterkey_business_id'))) {
            skipLeadForm(results);
        }
    }, [step, user, business, results, skipLeadForm]);

    const sectionVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
    };

    const isKhatra = results?.threat?.score > 60;
    const threatColor = isKhatra ? 'text-ios-orange' : 'text-ios-blue';

    const wizardT = t?.wizard || { step0: {}, step1: {}, step2: {}, step3: {}, step4: {}, step5: {} };

    return (
        <div className="relative w-full max-w-6xl flex flex-col lg:flex-row items-stretch justify-center gap-6 lg:gap-10">
            {/* DIAGNOSTIC HUD */}
            <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="relative w-full lg:w-3/5 order-1">
                <div className="absolute -inset-10 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="glass relative rounded-[2.5rem] p-10 md:p-12 border-primary/20 flex flex-col items-center justify-center min-h-[520px] text-center overflow-hidden shadow-[0_0_60px_rgba(0,229,255,0.08)]">
                    <div className="scanline"></div>
                    <AnimatePresence mode="wait">
                        {step < 4 && (
                            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-12">
                                <div className="w-24 h-24 bg-ios-blue/10 rounded-3xl flex items-center justify-center mb-8 border border-ios-blue/20">
                                    <span className="material-symbols-outlined text-ios-blue text-4xl">radar</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">{t?.diagnostic?.readyTitle || "Ready for Analysis"}</h3>
                                <p className="text-white/40 text-sm max-w-xs">{t?.diagnostic?.readySub || "Initialize the protocol to map your Profit Leaks and AI Threat level."}</p>
                            </motion.div>
                        )}
                        {step === 4 && (
                            <motion.div key="scanning" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="relative z-10 flex flex-col items-center py-12">
                                <div className="relative w-40 h-40 mb-12">
                                    <div className="absolute inset-0 border-[3px] border-white/5 rounded-full"></div>
                                    <div className="absolute inset-0 border-[3px] border-ios-blue rounded-full border-t-transparent animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-ios-blue text-4xl opacity-50">searching</span>
                                    </div>
                                </div>
                                <h3 className="text-white font-semibold text-xl tracking-tight mb-3">{t?.diagnostic?.scanning || "Mapping System Vulnerabilities"}</h3>
                                <p className="text-ios-blue/60 text-xs font-mono uppercase tracking-widest animate-pulse h-5 lg:h-auto">
                                    {(t?.diagnostic?.scanSteps || ['Scanning Market Infrastructure...', 'Detecting Profit Leaks...', 'Analyzing AI Competition...', 'Calculating System Extinction...', 'Generating Protocol Report...'])[scanIdx]}
                                </p>
                                <div className="w-64 h-1 bg-white/5 rounded-full mt-12 overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 2.5, ease: "linear" }} className="h-full bg-ios-blue shadow-[0_0_10px_rgba(0,122,255,0.5)]" />
                                </div>
                            </motion.div>
                        )}
                        {step === 5 && results && (
                            <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full flex flex-col items-center py-8">
                                <span className={isKhatra ? 'ios-badge-orange mb-8' : 'ios-badge-cyan mb-8'}>{t?.diagnostic?.results?.vulnerable || "CRITICAL VULNERABILITY DETECTED"}</span>
                                <div className="text-center mb-8">
                                    <div className={`text-8xl md:text-9xl font-bold tracking-tighter ${threatColor} leading-none`}>
                                        {displayScore}<span className="text-2xl text-white/10 font-medium ml-2">%</span>
                                    </div>
                                    <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-bold mt-4">{t?.diagnostic?.results?.index || "Profit Leak Index"}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 w-full px-6">
                                    <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 text-center">
                                        <div className={`text-2xl font-bold ${threatColor}`}>{results.threat.yearsLeft}</div>
                                        <div className="text-[9px] text-white/30 uppercase tracking-widest font-bold mt-1">{t?.diagnostic?.results?.yearsLeft || "Years Left"}</div>
                                    </div>
                                    <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 text-center">
                                        <div className="text-lg font-bold text-white/80 overflow-hidden text-ellipsis whitespace-nowrap">₹{(results.loss.savingTarget / 100000).toFixed(1)}L</div>
                                        <div className="text-[9px] text-white/30 uppercase tracking-widest font-bold mt-1">{t?.dashboard?.diagnosticGrid?.waste?.title || "Target Savings"}</div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* WIZARD FORM */}
            <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="w-full lg:w-2/5 order-2">
                <div className="glass rounded-[2.5rem] p-8 md:p-10 border-white/5 min-h-[520px] flex flex-col justify-between h-full relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <motion.div key="w0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 flex-1 flex flex-col justify-center">
                                <div className="ios-badge-cyan">{wizardT.step0.badge}</div>
                                <h2 className="text-3xl font-bold text-white leading-tight">{wizardT.step0.survival}</h2>
                                <p className="text-white/40 text-sm leading-relaxed">{wizardT.step0.survivalSub}</p>
                                <button onClick={nextStep} className="ios-button-primary py-4 flex items-center justify-center gap-2 group mt-4">
                                    {wizardT.step0.btn.toUpperCase()}
                                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                </button>

                                {(user || localId) && (
                                    <div className="flex flex-col gap-3 mt-4">
                                        <Link href={user ? "/dashboard" : `/dashboard?id=${localId}`} className="ios-button-primary py-4 flex items-center justify-center gap-2 group glow-blue !bg-ios-blue !text-white !shadow-[0_0_20px_rgba(0,122,255,0.4)]">
                                            {wizardT.step0.goDashboard}
                                            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                        </Link>
                                    </div>
                                )}
                            </motion.div>
                        )}
                        {step === 1 && (
                            <motion.div key="w1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 flex-1 flex flex-col justify-center">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-[10px] text-ios-blue font-bold uppercase tracking-widest">{wizardT.step1.badge}</span>
                                    <div className="flex gap-1"><div className="w-8 h-1 bg-ios-blue rounded-full"></div><div className="w-8 h-1 bg-white/10 rounded-full"></div><div className="w-8 h-1 bg-white/10 rounded-full"></div></div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold ml-1">{wizardT.step1.vertical}</label>
                                        <select className="ios-input w-full" name="vertical" value={formData.vertical} onChange={handleChange}>
                                            {BUSINESS_VERTICALS.map(v => (
                                                <option key={v.value} value={v.value} className="bg-[#020617]">{t?.verticals?.[v.value] || v.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold ml-1">{wizardT.step1.revenue}</label>
                                        <select className="ios-input w-full" name="revenueBracket" value={formData.revenueBracket} onChange={handleChange}>
                                            <option value="0-5L" className="bg-[#020617]">₹0 - ₹5 Lakh</option>
                                            <option value="5-20L" className="bg-[#020617]">₹5L - ₹20 Lakh</option>
                                            <option value="20-50L" className="bg-[#020617]">₹20L - ₹50 Lakh</option>
                                            <option value="50L+" className="bg-[#020617]">₹50L+</option>
                                        </select>
                                    </div>
                                </div>
                                <button onClick={nextStep} className="ios-button-primary py-4 mt-6">{wizardT.step2.next}</button>
                            </motion.div>
                        )}
                        {step === 2 && (
                            <motion.div key="w2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 flex-1 flex flex-col justify-center">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-[10px] text-ios-blue font-bold uppercase tracking-widest">{wizardT.step2.badge}</span>
                                    <div className="flex gap-1"><div className="w-8 h-1 bg-ios-blue rounded-full"></div><div className="w-8 h-1 bg-ios-blue rounded-full"></div><div className="w-8 h-1 bg-white/10 rounded-full"></div></div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold ml-1">{wizardT.step2.employees}</label>
                                        <select className="ios-input w-full" name="employees" value={formData.employees} onChange={handleChange}>
                                            <option value="1-10" className="bg-[#020617]">1-10</option>
                                            <option value="11-50" className="bg-[#020617]">11-50</option>
                                            <option value="51-200" className="bg-[#020617]">51-200</option>
                                            <option value="201+" className="bg-[#020617]">201+</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold ml-1">{wizardT.step2.marketing}</label>
                                        <input className="ios-input w-full" type="number" min="0" step="1000" name="marketingSpend" value={formData.marketingSpend} onChange={handleChange} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold ml-1">{wizardT.step2.ops}</label>
                                        <input className="ios-input w-full" type="number" min="0" step="1000" name="opsSpend" value={formData.opsSpend} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button onClick={prevStep} className="w-14 h-14 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all"><span className="material-symbols-outlined text-white/40">arrow_back</span></button>
                                    <button onClick={nextStep} className="ios-button-primary flex-1 py-4">{wizardT.step2.next}</button>
                                </div>
                            </motion.div>
                        )}
                        {step === 3 && (
                            <motion.div key="w3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 flex-1 flex flex-col justify-center">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-[10px] text-ios-blue font-bold uppercase tracking-widest">{wizardT.step3.badge}</span>
                                    <div className="flex gap-1"><div className="w-8 h-1 bg-ios-blue rounded-full"></div><div className="w-8 h-1 bg-ios-blue rounded-full"></div><div className="w-8 h-1 bg-ios-blue rounded-full"></div></div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-white/50 uppercase tracking-widest font-bold ml-1">{wizardT.step3.inquiry}</label>
                                        <div className="grid grid-cols-1 gap-2">
                                            <button onClick={() => setFormData({ ...formData, contactAfter6: 'ignored' })} className={`py-4 px-4 rounded-xl text-left border text-sm font-semibold transition-all ${formData.contactAfter6 === 'ignored' ? 'bg-ios-blue/10 border-ios-blue text-ios-blue' : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'}`}>{wizardT.step3.options.ignored}</button>
                                            <button onClick={() => setFormData({ ...formData, contactAfter6: 'manual' })} className={`py-4 px-4 rounded-xl text-left border text-sm font-semibold transition-all ${formData.contactAfter6 === 'manual' ? 'bg-ios-blue/10 border-ios-blue text-ios-blue' : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'}`}>{wizardT.step3.options.manual}</button>
                                            <button onClick={() => setFormData({ ...formData, contactAfter6: 'ai' })} className={`py-4 px-4 rounded-xl text-left border text-sm font-semibold transition-all ${formData.contactAfter6 === 'ai' ? 'bg-ios-blue/10 border-ios-blue text-ios-blue' : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'}`}>{wizardT.step3.options.ai}</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button onClick={prevStep} className="w-14 h-14 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all"><span className="material-symbols-outlined text-white/40">arrow_back</span></button>
                                    <button onClick={nextStep} className="ios-button-primary flex-1 py-4 flex items-center justify-center gap-2 glow-blue">
                                        <span className="material-symbols-outlined text-xl">radar</span>{wizardT.step3.btn}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                        {step === 4 && (
                            <motion.div key="w4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex items-center justify-center">
                                {/* Empty state while scanning is active on the left */}
                                <div className="text-white/20 uppercase tracking-widest text-[10px] font-bold animate-pulse">{wizardT.step4.running}</div>
                            </motion.div>
                        )}
                        {step === 5 && (
                            <motion.div key="w5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 flex flex-col justify-start overflow-y-auto scrollbar-hide absolute inset-0 bg-background-dark/95 backdrop-blur-md px-8 py-6 md:px-10 md:py-8 z-50">
                                <div className="p-4 bg-ios-orange/10 border border-ios-orange/20 rounded-xl mb-2 text-center">
                                    <p className="text-[11px] text-ios-orange font-bold uppercase tracking-wider mb-1">{wizardT.step5.leaks}</p>
                                    <p className="text-xs text-white/80 leading-relaxed font-medium">{wizardT.step5.decryption}</p>
                                </div>
                                {errorMsg && <p className="text-xs text-ios-orange text-center mb-2">{errorMsg}</p>}
                                <form onSubmit={submitLead} className="space-y-3">
                                    <input className="ios-input w-full" placeholder={t.auth.placeholder.business} name="businessName" value={formData.businessName || ''} onChange={handleChange} required />
                                    <input className="ios-input w-full" placeholder={t.auth.placeholder.name} name="contactName" value={formData.contactName} onChange={handleChange} required />
                                    <input className="ios-input w-full" placeholder={t.auth.placeholder.phone} type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} required />
                                    <input className="ios-input w-full" placeholder={t.auth.placeholder.email} type="email" name="email" value={formData.email} onChange={handleChange} required />
                                    <button disabled={submitting || isGoogleLoading} type="submit" className="ios-button-primary w-full py-4 text-sm mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-ios-orange to-ios-orange/80 shadow-[0_4px_15px_rgba(255,171,0,0.3)]">
                                        {submitting ? <span className="material-symbols-outlined animate-spin">sync</span> : <span className="material-symbols-outlined">enhanced_encryption</span>}
                                        {wizardT.step5.decryptBtn}
                                    </button>

                                    <div className="my-4 flex items-center gap-4">
                                        <div className="h-[1px] flex-1 bg-white/5"></div>
                                        <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">OR</span>
                                        <div className="h-[1px] flex-1 bg-white/5"></div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleGoogleLogin}
                                        disabled={submitting || isGoogleLoading}
                                        className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        <span className="text-sm font-bold tracking-tight text-white/90">CONTINUE WITH GOOGLE</span>
                                    </button>

                                    <div className="text-center mt-6">
                                        <Link href="/login" className="text-[10px] text-white/30 hover:text-white transition-colors uppercase tracking-[0.15em] font-bold underline underline-offset-4">
                                            {wizardT.step5.alreadyAccount}
                                        </Link>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
