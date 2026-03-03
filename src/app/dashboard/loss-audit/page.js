'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import FeatureLayout from '@/components/FeatureLayout';
import { calculateLossAudit, formatINR, formatINRFull, BUSINESS_VERTICALS } from '@/lib/calculations';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';

import { Suspense } from 'react';

function LossAuditContent() {
    const { business } = useAuth();
    const { lang, t } = useLanguage();
    const searchParams = useSearchParams();
    const router = useRouter();
    const businessId = business?.id || searchParams.get('id') || (typeof window !== 'undefined' ? localStorage.getItem('masterkey_business_id') : null);

    const [form, setForm] = useState({
        staffSalary: '',
        marketingBudget: '',
        opsOverheads: '',
        annualRevenue: '',
        industry: 'manufacturing',
        manualHours: 0,
        hasCRM: false,
        hasERP: false,
    });
    const [results, setResults] = useState(null);
    const [saving, setSaving] = useState(false);

    // Load existing results
    useEffect(() => {
        if (!businessId) return;
        const load = async () => {
            const { data } = await supabase
                .from('loss_audit_results')
                .select('*')
                .eq('business_id', businessId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (data) {
                const staff = data.staff_salary || 0;
                const marketing = data.marketing_budget || 0;
                const ops = data.ops_overheads || 0;

                setForm({
                    staffSalary: staff || '',
                    marketingBudget: marketing || '',
                    opsOverheads: ops || '',
                    annualRevenue: data.annual_revenue || '',
                    industry: data.industry || 'manufacturing',
                    manualHours: data.manual_hours || 0,
                    hasCRM: data.has_crm || false,
                    hasERP: data.has_erp || false,
                });

                // If results are stored in the DB, use them. 
                // Otherwise (or if they are 0), recalculate locally for immediate UI feedback.
                if (data.total_burn > 0) {
                    setResults(data);
                } else if (staff || marketing || ops) {
                    const calc = calculateLossAudit(staff, ops, marketing, {
                        manualHoursPerWeek: data.manual_hours || 0,
                        hasCRM: data.has_crm || false,
                        hasERP: data.has_erp || false,
                        annualRevenue: data.annual_revenue || 0
                    });
                    setResults(calc);
                }
            }
        };
        load();
    }, [businessId]);

    const handleCalculate = async (e) => {
        e.preventDefault();
        const staff = parseFloat(form.staffSalary) || 0;
        const ops = parseFloat(form.opsOverheads) || 0;
        const marketing = parseFloat(form.marketingBudget) || 0;

        const calc = calculateLossAudit(staff, ops, marketing, {
            manualHoursPerWeek: form.manualHours,
            hasCRM: form.hasCRM,
            hasERP: form.hasERP,
            annualRevenue: parseFloat(form.annualRevenue) || 0
        });
        setResults(calc);

        if (businessId) {
            setSaving(true);

            // Save full payload to match public.loss_audit_results schema
            const fullPayload = {
                business_id: businessId,
                staff_salary: staff,
                marketing_budget: marketing,
                ops_overheads: ops,
                annual_revenue: parseInt(form.annualRevenue) || 0,
                industry: form.industry,
                manual_hours: form.manualHours,
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
            if (saveErr) {
                console.error('Save Error:', saveErr);
                alert(`Sync Failed: ${saveErr.message}`);
            } else {
                // On success, jump to next audit
                router.push(`/dashboard/night-loss?id=${businessId}`);
            }
            setSaving(false);
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-1">{t.lossAudit.staffSalaryLabel}</label>
                                <input
                                    type="number" min="0" step="any"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                                    placeholder="₹ 3,00,000"
                                    value={form.staffSalary}
                                    onChange={(e) => setForm({ ...form, staffSalary: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-1">{t.lossAudit.marketingBudgetLabel}</label>
                                <input
                                    type="number" min="0" step="any"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                                    placeholder="₹ 50,000"
                                    value={form.marketingBudget}
                                    onChange={(e) => setForm({ ...form, marketingBudget: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-1">{t.lossAudit.opsOverheadLabel}</label>
                            <input
                                type="number" min="0" step="any"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                                placeholder="₹ 2,00,000"
                                value={form.opsOverheads}
                                onChange={(e) => setForm({ ...form, opsOverheads: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-1">{t.lossAudit.revenueLabel}</label>
                            <input
                                type="number" min="0" step="any"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                                placeholder="₹ 25,00,000"
                                value={form.annualRevenue}
                                onChange={(e) => setForm({ ...form, annualRevenue: e.target.value })}
                            />
                            <p className="text-[9px] text-white/30 mt-1 italic">{t.lossAudit.revenueSub}</p>
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <label className="text-[10px] text-ios-blue uppercase tracking-widest block mb-4 font-bold">{t.lossAudit.advancedHeader}</label>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-[11px] text-white/80 font-medium">{t.lossAudit.manualHoursLabel}</label>
                                        <span className="text-ios-blue font-bold font-mono">{form.manualHours || 20}h</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="60"
                                        className="w-full accent-ios-blue h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                        value={form.manualHours || 20}
                                        onChange={(e) => setForm({ ...form, manualHours: parseInt(e.target.value) })}
                                    />
                                    <p className="text-[9px] text-white/30 mt-1 italic">{t.lossAudit.manualHoursSub}</p>
                                </div>

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
                            className="w-full bg-ios-blue hover:bg-ios-blue/80 text-white font-bold py-4 md:py-5 rounded-2xl uppercase tracking-tight md:tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(0,132,255,0.2)] mt-8"
                        >
                            <span className="material-symbols-outlined text-sm md:text-base">analytics</span>
                            {saving ? t.lossAudit.syncingText : t.lossAudit.btnText}
                        </button>
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
