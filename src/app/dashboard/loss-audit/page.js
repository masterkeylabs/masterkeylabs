'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import FeatureLayout from '@/components/FeatureLayout';
import { calculateLossAudit, formatINR, formatINRFull, BUSINESS_VERTICALS, parseNumericalRange, parseHoursRange } from '@/lib/calculations';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import {
    RangeSelector,
    REVENUE_OPTIONS,
    PAYROLL_OPTIONS,
    MANUAL_HOURS_OPTIONS
} from '@/components/RangeSelector';

import { Suspense } from 'react';

const SEARCH_STEPS = [
    "INITIALIZING OPERATIONAL SCAN...",
    "ANALYZING EXPENSE STRUCTURE...",
    "DETECTING WORKFLOW GAPS...",
    "CALCULATING COORDINATION DRAG...",
    "MAPPING REVENUE LEAKS...",
    "FINALIZING LOSS AUDIT..."
];

function LossAuditContent() {
    const { business } = useAuth();
    const { lang, t } = useLanguage();
    const searchParams = useSearchParams();
    const router = useRouter();
    const businessId = business?.id;

    const [form, setForm] = useState({
        staffSalary: '',
        marketingBudget: '',
        opsOverheads: '',
        annualRevenue: '',
        industry: business?.vertical || 'retail',
        manualHours: 0,
        hasCRM: false,
        hasERP: false,
    });
    const [results, setResults] = useState(null);
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [searchIndex, setSearchIndex] = useState(0);

    // Load existing results
    useEffect(() => {
        if (!businessId) return;
        const load = async () => {
            const { data: auditData } = await supabase
                .from('loss_audit_results')
                .select('*')
                .eq('business_id', businessId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            // Load business vertical if form.industry is default
            let currentIndustry = auditData?.industry || business?.vertical || 'retail';

            if (!auditData?.industry && businessId) {
                const { data: biz } = await supabase.from('businesses').select('vertical').eq('id', businessId).single();
                if (biz?.vertical) currentIndustry = biz.vertical;
            }

            if (auditData) {
                setForm({
                    staffSalary: auditData.staff_salary || '',
                    marketingBudget: auditData.marketing_budget || '',
                    opsOverheads: auditData.ops_overheads || '',
                    annualRevenue: auditData.annual_revenue || '',
                    industry: currentIndustry,
                    manualHours: auditData.manual_hours || 0,
                    hasCRM: auditData.has_crm || false,
                    hasERP: auditData.has_erp || false,
                });

                if (auditData.total_burn > 0) {
                    setResults(auditData);
                } else {
                    const staff = parseNumericalRange(auditData.staff_salary);
                    const marketing = parseNumericalRange(auditData.marketing_budget);
                    const ops = parseNumericalRange(auditData.ops_overheads);
                    const hours = parseHoursRange(auditData.manual_hours);

                    const calc = calculateLossAudit(staff, ops, marketing, {
                        manualHoursPerDay: hours,
                        hasCRM: auditData.has_crm || false,
                        hasERP: auditData.has_erp || false,
                        annualRevenue: parseFloat(auditData.annual_revenue) || 0,
                        industry: currentIndustry
                    });
                    setResults(calc);
                }
            } else {
                setForm(prev => ({ ...prev, industry: currentIndustry }));
            }
        };
        load();
    }, [businessId, business?.vertical]);

    useEffect(() => {
        if (!saving) return;
        setSearchIndex(0);
        const s = setInterval(() => {
            setSearchIndex(prev => (prev + 1) % SEARCH_STEPS.length);
        }, 800);
        return () => clearInterval(s);
    }, [saving]);

    const handleCalculate = async (e) => {
        e.preventDefault();
        const staff = parseNumericalRange(form.staffSalary);
        const ops = parseNumericalRange(form.opsOverheads);
        const marketing = parseNumericalRange(form.marketingBudget);
        const hours = parseHoursRange(form.manualHours);

        const calc = calculateLossAudit(staff, ops, marketing, {
            manualHoursPerDay: hours,
            hasCRM: form.hasCRM,
            hasERP: form.hasERP,
            annualRevenue: parseFloat(form.annualRevenue) || 0,
            industry: form.industry
        });
        setResults(calc);

        if (businessId) {
            setSaving(true);
            try {
                // Save full payload to match public.loss_audit_results schema
                const fullPayload = {
                    business_id: businessId,
                    staff_salary: staff,
                    marketing_budget: marketing,
                    ops_overheads: ops,
                    annual_revenue: parseInt(form.annualRevenue) || 0,
                    industry: form.industry,
                    manual_hours: Math.round(hours),
                    has_crm: form.hasCRM,
                    has_erp: form.hasERP,
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

                const { error: saveErr } = await supabase.from('loss_audit_results').upsert(fullPayload, { onConflict: 'business_id' });

                // Also update global business vertical
                await supabase.from('businesses').update({ vertical: form.industry }).eq('id', businessId);

                if (saveErr) {
                    console.error('Save Error:', saveErr);
                    alert(`Sync Failed: ${saveErr.message}`);
                } else {
                    console.log('--- Loss Audit: Sync Success ---');
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 3000);
                }
            } catch (err) {
                console.error('Unexpected Audit Error:', err);
                alert('An unexpected error occurred while saving. Please try again.');
            } finally {
                setSaving(false);
            }
        }
    };

    const maxWaste = results ? Math.max(results.staffWaste || results.staff_waste, results.marketingWaste || results.marketing_waste, results.opsWaste || results.ops_waste, results.coordinationDrag || results.coordination_drag || 0, 1) : 1;

    return (
        <FeatureLayout
            title={t.lossAudit.title}
            subtitle={t.lossAudit.subTitle}
            backHref={businessId ? `/dashboard?id=${businessId}` : '/dashboard'}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Input Form */}
                <div className="bg-carbon border border-white/10 rounded-xl p-5 md:p-8">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-alert-red">trending_down</span>
                        {t.lossAudit.formHeader}
                    </h3>
                    <form onSubmit={handleCalculate} className="space-y-6">
                        <div>
                            <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-2">{t.lossAudit.industryLabel}</label>
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all font-sans"
                                value={form.industry}
                                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                            >
                                {BUSINESS_VERTICALS.map(ind => (
                                    <option key={ind.value} value={ind.value} className="bg-[#050505]">{t.common.industries[ind.value] || ind.label}</option>
                                ))}
                            </select>
                        </div>

                        <RangeSelector
                            label={t.lossAudit.staffSalaryLabel}
                            options={PAYROLL_OPTIONS}
                            value={form.staffSalary}
                            onChange={val => setForm({ ...form, staffSalary: val })}
                        />

                        <RangeSelector
                            label={t.lossAudit.marketingBudgetLabel}
                            options={PAYROLL_OPTIONS}
                            value={form.marketingBudget}
                            onChange={val => setForm({ ...form, marketingBudget: val })}
                        />

                        <RangeSelector
                            label={t.lossAudit.opsOverheadLabel}
                            options={PAYROLL_OPTIONS}
                            value={form.opsOverheads}
                            onChange={val => setForm({ ...form, opsOverheads: val })}
                        />

                        <RangeSelector
                            label={t.lossAudit.revenueLabel}
                            options={REVENUE_OPTIONS}
                            value={form.annualRevenue}
                            onChange={val => setForm({ ...form, annualRevenue: val })}
                        />

                        <div className="pt-4 border-t border-white/5">
                            <label className="text-[10px] text-ios-blue uppercase tracking-widest block mb-4 font-bold">{t.lossAudit.advancedHeader}</label>

                            <div className="space-y-6">
                                <RangeSelector
                                    label={t.lossAudit.manualHoursLabel}
                                    options={MANUAL_HOURS_OPTIONS}
                                    value={form.manualHours}
                                    onChange={val => setForm({ ...form, manualHours: val })}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, hasCRM: !form.hasCRM })}
                                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${form.hasCRM ? 'bg-ios-blue/10 border-ios-blue/50' : 'bg-white/5 border-white/10 opacity-60'}`}
                                    >
                                        <div className="text-left">
                                            <p className="text-[10px] font-bold text-white uppercase tracking-tight">{t.lossAudit.crmReadyLabel}</p>
                                            <p className="text-[9px] text-white/40">{t.lossAudit.crmSub}</p>
                                        </div>
                                        <span className={`material-symbols-outlined text-sm ${form.hasCRM ? 'text-ios-blue' : 'text-white/20'}`}>
                                            {form.hasCRM ? 'check_circle' : 'radio_button_unchecked'}
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, hasERP: !form.hasERP })}
                                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${form.hasERP ? 'bg-ios-blue/10 border-ios-blue/50' : 'bg-white/5 border-white/10 opacity-60'}`}
                                    >
                                        <div className="text-left">
                                            <p className="text-[10px] font-bold text-white uppercase tracking-tight">{t.lossAudit.erpLabel}</p>
                                            <p className="text-[9px] text-white/40">{t.lossAudit.erpSub}</p>
                                        </div>
                                        <span className={`material-symbols-outlined text-sm ${form.hasERP ? 'text-ios-blue' : 'text-white/20'}`}>
                                            {form.hasERP ? 'check_circle' : 'radio_button_unchecked'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full relative overflow-hidden bg-ios-blue hover:bg-ios-blue/80 text-white font-bold py-4 md:py-5 rounded-2xl uppercase tracking-tight md:tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(0,132,255,0.2)] mt-8"
                        >
                            {saving && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%] animate-scan" style={{ animation: 'scan 1.5s linear infinite' }} />
                            )}
                            <span className="relative z-10 flex items-center gap-3">
                                {saving ? (
                                    <>
                                        <span className="animate-spin text-sm">⌛</span>
                                        {SEARCH_STEPS[searchIndex]}
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-sm md:text-base">analytics</span>
                                        {t.lossAudit.btnText}
                                    </>
                                )}
                            </span>
                        </button>

                        {showSuccess && (
                            <div className="flex items-center gap-2 text-neon-green text-[11px] font-bold uppercase tracking-widest mt-4 justify-center animate-fade-in">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                {t.dashboard.rescue.booking.btn.success || 'Update Saved Successfully'}
                            </div>
                        )}
                        <style jsx>{`
                            @keyframes scan {
                                0% { background-position: -100% 0; }
                                100% { background-position: 200% 0; }
                            }
                        `}</style>
                    </form>
                </div>

                {/* Results */}
                <div className="space-y-6">
                    {results ? (
                        <>
                            {/* Headline */}
                            <div className="bg-black border-2 border-alert-red/30 rounded-xl p-6 md:p-8 glow-red text-center">
                                <p className="text-white/50 text-xs md:text-sm uppercase tracking-widest mb-2">{t.lossAudit.burnHeadline}</p>
                                <p className="text-3xl md:text-5xl font-black text-alert-red tracking-tight">
                                    {formatINRFull(results.totalBurn ?? results.total_burn)}<span className="text-lg md:text-xl text-white/30">{t.lossAudit.perMonth}</span>
                                </p>
                                <p className="text-white/40 mt-2 text-xs md:text-sm">{t.lossAudit.annualBurnLine.replace('{amount}', formatINR((results.annualBurn ?? results.annual_burn)))}</p>
                            </div>

                            {/* Breakdown Bars */}
                            <div className="bg-carbon border border-white/10 rounded-xl p-6">
                                <h4 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-4">{t.lossAudit.breakdownTitle}</h4>
                                <div className="space-y-4">
                                    {[
                                        { label: t.lossAudit.payrollWaste, value: results.staffWaste ?? results.staff_waste, color: 'bg-alert-red' },
                                        { label: t.lossAudit.overheadWaste, value: results.opsWaste ?? results.ops_waste, color: 'bg-primary' },
                                        { label: t.lossAudit.marketingWaste, value: results.marketingWaste ?? results.marketing_waste, color: 'bg-alert-orange' },
                                        ...((results.coordinationDrag ?? results.coordination_drag) > 0 ? [{ label: t.lossAudit.coordinationDrag, value: results.coordinationDrag ?? results.coordination_drag, color: 'bg-ios-purple' }] : []),
                                    ].map((item, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-white/60">{item.label}</span>
                                                <span className="text-white font-bold">{formatINRFull(item.value)}</span>
                                            </div>
                                            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                                <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${(item.value / maxWaste) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[9px] text-white/25 mt-4 leading-relaxed italic">{t.lossAudit.source}</p>
                            </div>

                            {/* Recoverable + 5-year */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-neon-green/10 border border-neon-green/30 rounded-xl p-6 text-center">
                                    <p className="text-[10px] uppercase tracking-widest text-neon-green font-bold mb-2">{t.lossAudit.recoverableTitle}</p>
                                    <p className="text-2xl font-black text-neon-green">{formatINRFull(results.savingTarget ?? results.saving_target)}<span className="text-sm text-neon-green/60">{t.lossAudit.perMonth}</span></p>
                                </div>
                                <div className="bg-alert-red/10 border border-alert-red/30 rounded-xl p-6 text-center">
                                    <p className="text-[10px] uppercase tracking-widest text-alert-red font-bold mb-2">{t.lossAudit.inactionTitle}</p>
                                    <p className="text-2xl font-black text-alert-red">{formatINR(results.fiveYearCost ?? results.five_year_cost)}</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-carbon border border-white/10 rounded-xl p-12 text-center">
                            <span className="material-symbols-outlined text-6xl text-white/10 mb-4">analytics</span>
                            <p className="text-white/30 text-sm">{t.lossAudit.emptyState}</p>
                        </div>
                    )}
                </div>
            </div>
        </FeatureLayout>
    );
}

export default function LossAuditPage() {
    return (
        <Suspense fallback={<div className="text-white p-10">Loading...</div>}>
            <LossAuditContent />
        </Suspense>
    );
}
