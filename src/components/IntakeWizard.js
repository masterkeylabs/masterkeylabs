'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { calculateLossAudit, calculateNightLoss, calculateAIThreat, calculateVisibility } from '@/lib/calculations';
import Link from 'next/link';

export default function IntakeWizard({ t }) {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [displayScore, setDisplayScore] = useState(0);
    const [scanIdx, setScanIdx] = useState(0);

    const [formData, setFormData] = useState({
        vertical: 'local_business',
        revenueBracket: '5-20L',
        employees: '1-10',
        marketingSpend: 10000,
        opsSpend: 50000,
        contactAfter6: 'ignored',
        businessName: '',
        contactName: '',
        whatsapp: '',
        email: ''
    });

    const [results, setResults] = useState(null);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
        const lossData = calculateLossAudit(staffCost, Number(formData.opsSpend), Number(formData.marketingSpend), {
            manualHoursPerWeek: 35,
            hasCRM: false,
            hasERP: false
        });

        const cvrMap = { 'ignored': 'none', 'manual': '1-4hrs', 'ai': 'instant' };
        const night = calculateNightLoss(15, '6pm', 5000, cvrMap[formData.contactAfter6] || 'none');

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
                score: threat,
                yearsLeft: Math.round((100 - threat) / 10),
                threatLevel: threat > 80 ? 'CRITICAL' : threat > 50 ? 'HIGH' : 'MODERATE',
                timelineDesc: 'Accelerated disruption'
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

    const submitLead = async (e) => {
        e.preventDefault();
        setErrorMsg(null);
        setSubmitting(true);

        try {
            // ── Duplicate phone & email check ─────────────────────────────
            const tenDigit = formData.whatsapp.replace(/\D/g, '').slice(-10);

            const [{ data: phoneDupe }, { data: emailDupe }] = await Promise.all([
                supabase.from('businesses').select('id').ilike('phone', `%${tenDigit}%`).limit(1),
                supabase.from('businesses').select('id').ilike('email', formData.email.trim()).limit(1),
            ]);

            if (phoneDupe && phoneDupe.length > 0) {
                setErrorMsg('📵 This mobile number is already registered. Please log in or contact support.');
                setSubmitting(false);
                return;
            }
            if (emailDupe && emailDupe.length > 0) {
                setErrorMsg('📧 This email is already registered. Please log in or use a different email.');
                setSubmitting(false);
                return;
            }
            // ──────────────────────────────────────────────────────────────

            const tempPassword = 'Mk' + Date.now() + '!';
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: tempPassword,
                options: { data: { owner_name: formData.contactName, phone: formData.whatsapp } }
            });

            let currentUser = authData?.user;

            if (authError && authError.message.includes('already registered')) {
                // If already registered, still try to proceed by finding the existing business
                const { data: existingUser } = await supabase.from('businesses').select('id').eq('email', formData.email).maybeSingle();
                if (existingUser) {
                    // Update current logic: we just need to bypass the failure and link the session
                }
            }

            // Base insert data
            let insertData = {
                entity_name: formData.businessName || (formData.contactName + " Business"),
                classification: formData.vertical + "::" + formData.revenueBracket,
                scalability: formData.employees,
                owner_name: formData.contactName,
                email: formData.email,
                phone: formData.whatsapp,
                digital_footprint: formData.contactAfter6,
            };

            let newBiz;
            let error;

            // Try inserting with user_id first
            const resWithUserId = await supabase.from('businesses').insert({
                ...insertData,
                user_id: currentUser?.id || null
            }).select().single();

            if (resWithUserId.error && resWithUserId.error.message.includes("Could not find the 'user_id' column")) {
                // Fallback: If the user hasn't run the SQL script to add user_id, insert without it
                console.warn("Missing 'user_id' column in 'businesses' table. Falling back to legacy insert. Please run supabase_setup_user_id.sql soon.");
                const resLegacy = await supabase.from('businesses').insert(insertData).select().single();
                newBiz = resLegacy.data;
                error = resLegacy.error;
            } else {
                newBiz = resWithUserId.data;
                error = resWithUserId.error;
            }

            if (error) throw error;

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

                const empCount = formData.employees === '1-10' ? 5 : formData.employees === '11-50' ? 25 : formData.employees === '51-200' ? 100 : 250;
                const staffCost = empCount * 25000;

                // 1. Save Loss Audit Results (minimal safe columns only)
                const lossInsert = await supabase.from('loss_audit_results').insert({
                    business_id: newBiz.id,
                    staff_salary: staffCost,
                    marketing_budget: Number(formData.marketingSpend),
                    ops_overheads: Number(formData.opsSpend),
                });
                if (lossInsert.error) {
                    console.error('[IntakeWizard] loss_audit_results insert error:', lossInsert.error.message);
                }

                // 2. Save Visibility Results (Added)
                const visResult = calculateVisibility([], formData.location || '');
                await supabase.from('visibility_results').insert({
                    business_id: newBiz.id,
                    city: formData.location || '',
                    signals: [],
                    percent: visResult.percent,
                    status: visResult.status,
                    missed_customers: visResult.missedCustomers,
                    gaps: visResult.gaps
                });

                // 3. Save AI Threat Results
                await supabase.from('ai_threat_results').insert({
                    business_id: newBiz.id,
                    score: results.threat.score,
                    years_left: results.threat.yearsLeft,
                    threat_level: results.threat.threatLevel,
                    timeline_desc: results.threat.timelineDesc,
                    industry: formData.vertical,
                    is_omnichannel: formData.contactAfter6 === 'ai'
                });

                // 3. Save Night Loss Results
                await supabase.from('night_loss_results').insert({
                    business_id: newBiz.id,
                    daily_inquiries: 15, // Baseline from wizard
                    closing_time: '6pm',
                    profit_per_sale: 25000,
                    response_time: formData.contactAfter6,
                    monthly_days: 26,
                    monthly_loss: results.night.lostRevenue.monthlyLoss,
                    annual_loss: results.night.lostRevenue.monthlyLoss * 12
                });
            }

            localStorage.setItem('masterkey_business_id', newBiz.id);
            router.push(`/dashboard?id=${newBiz.id}`);

        } catch (error) {
            console.error(error);
            setErrorMsg(error.message || "An error occurred.");
            setSubmitting(false);
        }
    };

    const sectionVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
    };

    const isKhatra = results?.threat?.score > 60;
    const threatColor = isKhatra ? 'text-ios-orange' : 'text-ios-blue';

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
                                <h3 className="text-2xl font-bold text-white mb-4">Ready for Analysis</h3>
                                <p className="text-white/40 text-sm max-w-xs">Initialize the protocol to map your Profit Leaks and AI Threat level.</p>
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
                                <h3 className="text-white font-semibold text-xl tracking-tight mb-3">Mapping System Vulnerabilities</h3>
                                <p className="text-ios-blue/60 text-xs font-mono uppercase tracking-widest animate-pulse h-5 lg:h-auto">
                                    {['Scanning Market Infrastructure...', 'Detecting Profit Leaks...', 'Analyzing AI Competition...', 'Calculating System Extinction...', 'Generating Protocol Report...'][scanIdx]}
                                </p>
                                <div className="w-64 h-1 bg-white/5 rounded-full mt-12 overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 2.5, ease: "linear" }} className="h-full bg-ios-blue shadow-[0_0_10px_rgba(0,122,255,0.5)]" />
                                </div>
                            </motion.div>
                        )}
                        {step === 5 && results && (
                            <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full flex flex-col items-center py-8">
                                <span className={isKhatra ? 'ios-badge-orange mb-8' : 'ios-badge-cyan mb-8'}>CRITICAL VULNERABILITY DETECTED</span>
                                <div className="text-center mb-8">
                                    <div className={`text-8xl md:text-9xl font-bold tracking-tighter ${threatColor} leading-none`}>
                                        {displayScore}<span className="text-2xl text-white/10 font-medium ml-2">%</span>
                                    </div>
                                    <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-bold mt-4">Profit Leak Index</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 w-full px-6">
                                    <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 text-center">
                                        <div className={`text-2xl font-bold ${threatColor}`}>{results.threat.yearsLeft}</div>
                                        <div className="text-[9px] text-white/30 uppercase tracking-widest font-bold mt-1">Years Left</div>
                                    </div>
                                    <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 text-center">
                                        <div className="text-lg font-bold text-white/80 overflow-hidden text-ellipsis whitespace-nowrap">₹{(results.loss.savingTarget / 100000).toFixed(1)}L</div>
                                        <div className="text-[9px] text-white/30 uppercase tracking-widest font-bold mt-1">Target Savings</div>
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
                                <div className="ios-badge-cyan">System Protocol v2.1</div>
                                <h2 className="text-3xl font-bold text-white leading-tight">Traditional dhanda is dying.</h2>
                                <p className="text-white/40 text-sm leading-relaxed">Let&apos;s calculate your survival rate and find your exact operational bleed.</p>
                                <button onClick={nextStep} className="ios-button-primary py-4 flex items-center justify-center gap-2 group mt-4">
                                    INITIATE SYSTEM AUDIT
                                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                </button>
                            </motion.div>
                        )}
                        {step === 1 && (
                            <motion.div key="w1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 flex-1 flex flex-col justify-center">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-[10px] text-ios-blue font-bold uppercase tracking-widest">Step 1 — Identity</span>
                                    <div className="flex gap-1"><div className="w-8 h-1 bg-ios-blue rounded-full"></div><div className="w-8 h-1 bg-white/10 rounded-full"></div><div className="w-8 h-1 bg-white/10 rounded-full"></div></div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold ml-1">Business Vertical</label>
                                        <select className="ios-input w-full" name="vertical" value={formData.vertical} onChange={handleChange}>
                                            <option value="retail" className="bg-[#020617]">Retail</option>
                                            <option value="fb" className="bg-[#020617]">Food & Beverage (F&B)</option>
                                            <option value="services" className="bg-[#020617]">Service</option>
                                            <option value="b2b" className="bg-[#020617]">B2B Goods</option>
                                            <option value="ecommerce" className="bg-[#020617]">E-commerce</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold ml-1">Monthly Revenue Bracket</label>
                                        <select className="ios-input w-full" name="revenueBracket" value={formData.revenueBracket} onChange={handleChange}>
                                            <option value="0-5L" className="bg-[#020617]">₹0 - ₹5 Lakh</option>
                                            <option value="5-20L" className="bg-[#020617]">₹5L - ₹20 Lakh</option>
                                            <option value="20-50L" className="bg-[#020617]">₹20L - ₹50 Lakh</option>
                                            <option value="50L+" className="bg-[#020617]">₹50L+</option>
                                        </select>
                                    </div>
                                </div>
                                <button onClick={nextStep} className="ios-button-primary py-4 mt-6">Continue Protocol</button>
                            </motion.div>
                        )}
                        {step === 2 && (
                            <motion.div key="w2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 flex-1 flex flex-col justify-center">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-[10px] text-ios-blue font-bold uppercase tracking-widest">Step 2 — The Bleed</span>
                                    <div className="flex gap-1"><div className="w-8 h-1 bg-ios-blue rounded-full"></div><div className="w-8 h-1 bg-ios-blue rounded-full"></div><div className="w-8 h-1 bg-white/10 rounded-full"></div></div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold ml-1">Number of Employees</label>
                                        <select className="ios-input w-full" name="employees" value={formData.employees} onChange={handleChange}>
                                            <option value="1-10" className="bg-[#020617]">1-10</option>
                                            <option value="11-50" className="bg-[#020617]">11-50</option>
                                            <option value="51-200" className="bg-[#020617]">51-200</option>
                                            <option value="201+" className="bg-[#020617]">201+</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold ml-1">Monthly Marketing Spend (₹)</label>
                                        <input className="ios-input w-full" type="number" name="marketingSpend" value={formData.marketingSpend} onChange={handleChange} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold ml-1">Monthly Operations Overhead (₹)</label>
                                        <input className="ios-input w-full" type="number" name="opsSpend" value={formData.opsSpend} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button onClick={prevStep} className="w-14 h-14 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all"><span className="material-symbols-outlined text-white/40">arrow_back</span></button>
                                    <button onClick={nextStep} className="ios-button-primary flex-1 py-4">Next Step</button>
                                </div>
                            </motion.div>
                        )}
                        {step === 3 && (
                            <motion.div key="w3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 flex-1 flex flex-col justify-center">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-[10px] text-ios-blue font-bold uppercase tracking-widest">Step 3 — The Tech Gap</span>
                                    <div className="flex gap-1"><div className="w-8 h-1 bg-ios-blue rounded-full"></div><div className="w-8 h-1 bg-ios-blue rounded-full"></div><div className="w-8 h-1 bg-ios-blue rounded-full"></div></div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-white/50 uppercase tracking-widest font-bold ml-1">How are client inquiries handled after 6 PM?</label>
                                        <div className="grid grid-cols-1 gap-2">
                                            <button onClick={() => setFormData({ ...formData, contactAfter6: 'ignored' })} className={`py-4 px-4 rounded-xl text-left border text-sm font-semibold transition-all ${formData.contactAfter6 === 'ignored' ? 'bg-ios-blue/10 border-ios-blue text-ios-blue' : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'}`}>Missed / Ignored</button>
                                            <button onClick={() => setFormData({ ...formData, contactAfter6: 'manual' })} className={`py-4 px-4 rounded-xl text-left border text-sm font-semibold transition-all ${formData.contactAfter6 === 'manual' ? 'bg-ios-blue/10 border-ios-blue text-ios-blue' : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'}`}>Manual WhatsApp / Calls</button>
                                            <button onClick={() => setFormData({ ...formData, contactAfter6: 'ai' })} className={`py-4 px-4 rounded-xl text-left border text-sm font-semibold transition-all ${formData.contactAfter6 === 'ai' ? 'bg-ios-blue/10 border-ios-blue text-ios-blue' : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'}`}>Automated AI Agent</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button onClick={prevStep} className="w-14 h-14 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all"><span className="material-symbols-outlined text-white/40">arrow_back</span></button>
                                    <button onClick={nextStep} className="ios-button-primary flex-1 py-4 flex items-center justify-center gap-2 glow-blue">
                                        <span className="material-symbols-outlined text-xl">radar</span>Generate Diagnostic Report
                                    </button>
                                </div>
                            </motion.div>
                        )}
                        {step === 4 && (
                            <motion.div key="w4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex items-center justify-center">
                                {/* Empty state while scanning is active on the left */}
                                <div className="text-white/20 uppercase tracking-widest text-[10px] font-bold animate-pulse">Running Diagnostic Protocols...</div>
                            </motion.div>
                        )}
                        {step === 5 && (
                            <motion.div key="w5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 flex flex-col justify-start overflow-y-auto scrollbar-hide absolute inset-0 bg-background-dark/95 backdrop-blur-md px-8 py-6 md:px-10 md:py-8 z-50">
                                <div className="p-4 bg-ios-orange/10 border border-ios-orange/20 rounded-xl mb-2 text-center">
                                    <p className="text-[11px] text-ios-orange font-bold uppercase tracking-wider mb-1">CRITICAL LEAKS DETECTED</p>
                                    <p className="text-xs text-white/80 leading-relaxed font-medium">Your comprehensive Extinction Report and Savings Target are ready. Enter your details to decrypt the dashboard.</p>
                                </div>
                                {errorMsg && <p className="text-xs text-ios-orange text-center mb-2">{errorMsg}</p>}
                                <form onSubmit={submitLead} className="space-y-3">
                                    <input className="ios-input w-full" placeholder="Business Name" name="businessName" value={formData.businessName || ''} onChange={handleChange} required />
                                    <input className="ios-input w-full" placeholder="Full Name" name="contactName" value={formData.contactName} onChange={handleChange} required />
                                    <input className="ios-input w-full" placeholder="WhatsApp Number" type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} required />
                                    <input className="ios-input w-full" placeholder="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} required />
                                    <button disabled={submitting} type="submit" className="ios-button-primary w-full py-4 text-sm mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-ios-orange to-ios-orange/80 shadow-[0_4px_15px_rgba(255,171,0,0.3)]">
                                        {submitting ? <span className="material-symbols-outlined animate-spin">sync</span> : <span className="material-symbols-outlined">enhanced_encryption</span>}
                                        DECRYPT DASHBOARD
                                    </button>
                                    <div className="text-center mt-6">
                                        <Link href="/login" className="text-[10px] text-white/30 hover:text-white transition-colors uppercase tracking-[0.15em] font-bold underline underline-offset-4">
                                            Already have an account? Log In
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
