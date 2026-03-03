'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import FeatureLayout from '@/components/FeatureLayout';
import { calculateAIThreat, BUSINESS_VERTICALS } from '@/lib/calculations';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';

import { Suspense } from 'react';

const DISPLAY_COLORS = {
    red: { bg: 'bg-alert-red/10', border: 'border-alert-red/30', text: 'text-alert-red', fill: '#ff3131' },
    orange: { bg: 'bg-alert-orange/10', border: 'border-alert-orange/30', text: 'text-alert-orange', fill: '#ff5e00' },
    gold: { bg: 'bg-premium-gold/10', border: 'border-premium-gold/30', text: 'text-premium-gold', fill: '#ffd700' },
    blue: { bg: 'bg-ios-blue/10', border: 'border-ios-blue/30', text: 'text-ios-blue', fill: '#0084ff' },
};

const EMPLOYEE_RANGES = [
    { value: 5, label: '< 10', desc: 'Micro (+6 mo)' },
    { value: 25, label: '10–49', desc: 'Small (neutral)' },
    { value: 100, label: '50–200', desc: 'Medium (−6 mo)' },
    { value: 300, label: '200+', desc: 'Large (−12 mo)' },
];

function AIThreatContent() {
    const { business } = useAuth();
    const { lang, t } = useLanguage();
    const searchParams = useSearchParams();
    const router = useRouter();
    const businessId = business?.id || searchParams.get('id') || (typeof window !== 'undefined' ? localStorage.getItem('masterkey_business_id') : null);

    const [form, setForm] = useState({
        industry: 'retail',
        isOmnichannel: false,
        hasCRM: false,
        hasERP: false,
        employeeCount: 0,
    });
    const [results, setResults] = useState(null);
    const [saving, setSaving] = useState(false);

    // Load existing results or pre-populate from 1st module
    useEffect(() => {
        if (!businessId) return;
        const load = async () => {
            // 1. Try to load existing AI Threat results
            const { data: aiData } = await supabase
                .from('ai_threat_results')
                .select('*')
                .eq('business_id', businessId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (aiData) {
                setForm({
                    industry: aiData.industry || 'retail',
                    isOmnichannel: aiData.is_omnichannel || false,
                    hasCRM: aiData.has_crm || false,
                    hasERP: aiData.has_erp || false,
                    employeeCount: aiData.employee_count || 0,
                });
                const calc = calculateAIThreat(aiData.industry || 'retail', {
                    isOmnichannel: aiData.is_omnichannel || false,
                    hasCRM: aiData.has_crm || false,
                    hasERP: aiData.has_erp || false,
                    employeeCount: aiData.employee_count || 0,
                });
                setResults(calc);
            } else {
                // 2. If no AI metrics exist yet, fetch industry from 1st module (Operational Waste)
                const { data: lossData } = await supabase
                    .from('loss_audit_results')
                    .select('industry')
                    .eq('business_id', businessId)
                    .maybeSingle();

                if (lossData?.industry) {
                    setForm(prev => ({ ...prev, industry: lossData.industry }));
                }
            }
        };
        load();
    }, [businessId]);

    const handleCalculate = async (e) => {
        e.preventDefault();

        const calc = calculateAIThreat(form.industry, {
            isOmnichannel: form.isOmnichannel,
            hasCRM: form.hasCRM,
            hasERP: form.hasERP,
            employeeCount: form.employeeCount,
        });

        setResults(calc);

        if (businessId) {
            setSaving(true);
            const payload = {
                business_id: businessId,
                score: calc.riskPct,
                years_left: Math.round(calc.yearsLeft),
                threat_level: calc.riskBand,
                timeline_desc: calc.displayLabel,
                final_horizon: calc.finalHorizon,
                industry: form.industry,
                is_omnichannel: form.isOmnichannel,
                has_crm: form.hasCRM,
                has_erp: form.hasERP,
                employee_count: form.employeeCount,
                created_at: new Date().toISOString()
            };

            const { error: saveErr } = await supabase.from('ai_threat_results').upsert(payload, { onConflict: 'business_id' });
            if (saveErr) {
                console.error('Save Error:', saveErr);
                alert(`Sync Failed: ${saveErr.message}`);
            } else {
                // Final step: return to dashboard
                router.push(`/dashboard?id=${businessId}`);
            }
            setSaving(false);
        }
    };

    const colorStyle = results ? DISPLAY_COLORS[results.displayColor] || DISPLAY_COLORS.orange : null;

    return (
        <FeatureLayout
            title={t.aiThreat.title}
            subtitle={t.aiThreat.subTitle}
            backHref={businessId ? `/dashboard?id=${businessId}` : '/dashboard'}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Input Form */}
                <div className="bg-carbon border border-white/10 rounded-xl p-5 md:p-8">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-ios-blue">psychology</span>
                        {t.aiThreat.formHeader}
                    </h3>
                    <form onSubmit={handleCalculate} className="space-y-6">
                        <div>
                            <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-2">{t.aiThreat.industryLabel}</label>
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all font-sans"
                                value={form.industry}
                                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                            >
                                {BUSINESS_VERTICALS.map(ind => (
                                    <option key={ind.value} value={ind.value} className="bg-background-dark">{t.common.industries[ind.value] || ind.label} ({ind.risk}%)</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-2">{t.lossAudit.manualHoursLabel.split('(')[0].trim() || 'Employees'}</label>
                            <div className="grid grid-cols-4 gap-2">
                                {EMPLOYEE_RANGES.map(er => (
                                    <button key={er.value} type="button"
                                        className={`py-3 px-1 rounded-lg text-center transition-all border ${form.employeeCount === er.value
                                            ? 'bg-ios-blue/10 border-ios-blue/30 text-ios-blue'
                                            : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'}`}
                                        onClick={() => setForm({ ...form, employeeCount: er.value })}
                                    >
                                        <p className="font-bold text-sm">{t.aiThreat.employeeRanges[er.value]?.label || er.label}</p>
                                        <p className="text-[8px] opacity-50">{t.aiThreat.employeeRanges[er.value]?.desc || er.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <label className="text-[10px] text-ios-blue uppercase tracking-widest block mb-4 font-bold">{t.dashboard.auditSummary.header.overview}</label>
                            <div className="space-y-3">
                                {[
                                    { key: 'isOmnichannel' },
                                    { key: 'hasCRM' },
                                    { key: 'hasERP' },
                                ].map(factor => (
                                    <button key={factor.key} type="button"
                                        onClick={() => setForm({ ...form, [factor.key]: !form[factor.key] })}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${form[factor.key] ? 'bg-ios-blue/10 border-ios-blue/50' : 'bg-white/5 border-white/10 opacity-60'}`}
                                    >
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-white uppercase tracking-tight">{t.aiThreat.factors[factor.key].label}</p>
                                            <p className="text-xs text-white/40 mt-0.5">{t.aiThreat.factors[factor.key].desc}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] text-ios-blue/60 font-bold">{t.aiThreat.factors[factor.key].bonus}</span>
                                            <span className={`material-symbols-outlined text-2xl ${form[factor.key] ? 'text-ios-blue' : 'text-white/20'}`}>
                                                {form[factor.key] ? 'check_circle' : 'radio_button_unchecked'}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-ios-blue hover:bg-ios-blue/80 text-white font-bold py-4 md:py-5 rounded-2xl uppercase tracking-tight md:tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(0,132,255,0.2)] mt-4"
                        >
                            <span className="material-symbols-outlined text-sm md:text-base">radar</span>
                            {saving ? t.visibility.scanningText : t.aiThreat.btnText}
                        </button>
                    </form>
                </div>

                {/* Results */}
                <div className="space-y-6">
                    {results ? (
                        <>
                            {/* Risk Score */}
                            <div className={`bg-black border-2 ${colorStyle.border} rounded-2xl p-6 md:p-10 text-center shadow-2xl`}>
                                <p className="text-white/50 text-xs uppercase tracking-[0.3em] mb-4">{t.aiThreat.threatLevel}</p>
                                <p className={`text-5xl md:text-7xl font-black tracking-tighter ${colorStyle.text}`}>
                                    {results.riskPct}<span className="text-xl md:text-2xl text-white/20">%</span>
                                </p>
                                <p className={`text-sm font-bold uppercase tracking-[0.2em] mt-3 ${colorStyle.text}`}>
                                    {t.common.statuses[results.riskLevel] || results.riskBand}
                                </p>
                            </div>

                            {/* Time Horizon */}
                            <div className={`${colorStyle.bg} border ${colorStyle.border} rounded-2xl p-6 md:p-8 text-center`}>
                                <p className="text-white/50 text-xs uppercase tracking-[0.2em] mb-3">{t.aiThreat.ttlHeadline}</p>
                                <p className="text-4xl md:text-5xl font-black text-white tracking-tight">
                                    {results.finalHorizon} <span className="text-lg text-white/30">{t.aiThreat.months.toLowerCase()}</span>
                                </p>
                                <p className="text-white/40 text-xs mt-1">({results.yearsLeft} years)</p>
                                <div className={`inline-block px-4 py-2 rounded-full mt-4 ${colorStyle.bg} border ${colorStyle.border}`}>
                                    <p className={`text-[10px] md:text-xs font-bold uppercase tracking-widest ${colorStyle.text}`}>
                                        {t.aiThreat.statusLabels[results.displayColor]}
                                    </p>
                                </div>
                            </div>

                            {/* Modifier Breakdown */}
                            <div className="bg-carbon border border-white/10 rounded-xl p-6">
                                <h4 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-4">{t.visibility.gapsHeader.split('(')[0].trim()}</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between py-2 px-3 bg-white/5 rounded-lg">
                                        <span className="text-white/60">{t.aiThreat.baseMonths} ({results.riskBand})</span>
                                        <span className="text-white font-bold">{results.baseMonths} mo</span>
                                    </div>
                                    <div className="flex justify-between py-2 px-3 bg-white/5 rounded-lg">
                                        <span className="text-white/60">{t.aiThreat.modifiers}</span>
                                        <span className={`font-bold ${results.modifier >= 0 ? 'text-neon-green' : 'text-alert-red'}`}>
                                            {results.modifier >= 0 ? '+' : ''}{results.modifier} mo
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-2 px-3 bg-white/5 rounded-lg border border-white/10">
                                        <span className="text-white font-bold">{t.aiThreat.ttlHeadline}</span>
                                        <span className={`font-black ${colorStyle.text}`}>{results.finalHorizon} {t.aiThreat.months.toLowerCase()}</span>
                                    </div>
                                </div>
                                <p className="text-[9px] text-white/25 mt-4 leading-relaxed italic">{t.aiThreat.source}</p>
                            </div>
                        </>
                    ) : (
                        <div className="bg-carbon border border-white/10 rounded-xl p-12 text-center h-full flex flex-col items-center justify-center">
                            <span className="material-symbols-outlined text-6xl text-white/10 mb-4 animate-pulse">searching</span>
                            <p className="text-white/30 text-sm">{t.aiThreat.emptyState}</p>
                        </div>
                    )}
                </div>
            </div>
        </FeatureLayout>
    );
}

export default function AIThreatPage() {
    return (
        <Suspense fallback={<div className="text-white p-10">Loading...</div>}>
            <AIThreatContent />
        </Suspense>
    );
}
