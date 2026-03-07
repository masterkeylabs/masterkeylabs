'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import FeatureLayout from '@/components/FeatureLayout';
import { calculateNightLoss, formatINR, formatINRFull, parseNumericalRange } from '@/lib/calculations';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import {
    RangeSelector,
    DAILY_LEADS_OPTIONS,
    TXN_VALUE_OPTIONS
} from '@/components/RangeSelector';

import { Suspense } from 'react';

const SEARCH_STEPS = [
    "MONITORING AFTER-HOURS TRAFFIC...",
    "TRACING CONNECTION DECAY...",
    "QUANTIFYING SLEEP-MODE WASTE...",
    "ANALYZING MISSED CONVERSIONS...",
    "CALCULATING NIGHTLY REVENUE LEAK...",
    "FINALIZING NIGHT LOSS DATA..."
];

function NightLossContent() {
    const { business } = useAuth();
    const { lang, t } = useLanguage();
    const searchParams = useSearchParams();
    const router = useRouter();
    const businessId = business?.id;

    const [form, setForm] = useState({
        dailyInquiries: 0,
        closingTime: '6pm',
        avgTransactionValue: '',
        businessType: 'both',
    });
    const [results, setResults] = useState(null);
    const [saving, setSaving] = useState(false);
    const [searchIndex, setSearchIndex] = useState(0);

    useEffect(() => {
        if (!businessId) return;
        const load = async () => {
            const { data } = await supabase
                .from('night_loss_results')
                .select('*')
                .eq('business_id', businessId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
            if (data) {
                setForm({
                    dailyInquiries: data.daily_inquiries || 0,
                    closingTime: data.closing_time || '6pm',
                    avgTransactionValue: data.profit_per_sale || data.avg_transaction_value || '',
                    businessType: data.response_time || data.business_type || 'both',
                });

                // Recalculate with parsing for accurate display
                const dailyLeads = parseNumericalRange(data.daily_inquiries);
                const avgValue = parseNumericalRange(data.profit_per_sale || data.avg_transaction_value);

                if (avgValue > 0) {
                    const calc = calculateNightLoss(
                        dailyLeads,
                        data.closing_time || '6pm',
                        avgValue,
                        data.response_time || data.business_type || 'both'
                    );
                    setResults(calc);
                } else {
                    setResults(data);
                }
            }
        };
        load();
    }, [businessId]);

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
        const dailyLeads = parseNumericalRange(form.dailyInquiries);
        const avgValue = parseNumericalRange(form.avgTransactionValue);

        if (avgValue <= 0) {
            alert('Please enter your average transaction value (₹). This is required to calculate revenue loss.');
            return;
        }

        const calc = calculateNightLoss(dailyLeads, form.closingTime, avgValue, form.businessType);
        setResults(calc);

        if (businessId) {
            setSaving(true);
            const payload = {
                business_id: businessId,
                daily_inquiries: Math.round(dailyLeads),
                closing_time: form.closingTime,
                profit_per_sale: avgValue,
                response_time: form.businessType,
                monthly_days: 30,
                night_inquiries: calc.nightInquiries,
                current_revenue: calc.currentRevenue,
                potential_revenue: calc.potentialRevenue,
                monthly_loss: calc.monthlyLoss,
                annual_loss: calc.annualLoss,
                created_at: new Date().toISOString()
            };

            const { error: saveErr } = await supabase.from('night_loss_results').upsert(payload, { onConflict: 'business_id' });
            if (saveErr) {
                console.error('Save Error:', saveErr);
                alert(`Sync Failed: ${saveErr.message}`);
            } else {
                router.push(`/dashboard/visibility?id=${businessId}`);
            }
            setSaving(false);
        }
    };

    const CLOSING_TIMES = [
        { value: '12am', label: '12 AM', desc: '75% night traffic' },
        { value: '6pm', label: '6 PM', desc: '42% night traffic' },
        { value: '8pm', label: '8 PM', desc: '22% night traffic' },
        { value: '10pm', label: '10 PM', desc: '12% night traffic' },
        { value: '24x7', label: '24/7', desc: '0% night traffic' },
    ];

    const BUSINESS_TYPES = [
        { value: 'b2b', label: 'B2B', gap: '20% gap', aiCvr: '22%', delayCvr: '2%' },
        { value: 'b2c', label: 'B2C', gap: '25% gap', aiCvr: '28%', delayCvr: '3%' },
        { value: 'both', label: 'Both (Avg)', gap: '22.5% gap', aiCvr: '25%', delayCvr: '2.5%' },
    ];

    const potRev = results?.potentialRevenue ?? results?.potential_revenue ?? 0;
    const curRev = results?.currentRevenue ?? results?.current_revenue ?? 0;
    const maxRev = Math.max(potRev, curRev, 1);

    return (
        <FeatureLayout
            title={t.nightLoss.title}
            subtitle={t.nightLoss.subTitle}
            backHref={businessId ? `/dashboard?id=${businessId}` : '/dashboard'}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Input Form */}
                <div className="bg-carbon border border-white/10 rounded-xl p-5 md:p-8">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-alert-orange">nightlight</span>
                        {t.nightLoss.formHeader}
                    </h3>
                    <form onSubmit={handleCalculate} className="space-y-5">
                        <RangeSelector
                            label={t.nightLoss.dailyInquiriesLabel}
                            options={DAILY_LEADS_OPTIONS}
                            value={form.dailyInquiries}
                            onChange={val => setForm({ ...form, dailyInquiries: val })}
                            colorClass="alert-orange"
                        />
                        <div>
                            <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-2">{t.nightLoss.closingTimeLabel}</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                {CLOSING_TIMES.map(time => (
                                    <button key={time.value} type="button"
                                        className={`py-3 rounded-lg text-center transition-all border ${form.closingTime === time.value
                                            ? 'bg-alert-orange/20 border-alert-orange/50 text-alert-orange shadow-[0_0_10px_rgba(255,165,0,0.2)]'
                                            : 'bg-white/5 border-white/10 text-white/50 hover:border-white/30'}`}
                                        onClick={() => setForm({ ...form, closingTime: time.value })}
                                    >
                                        <p className="font-bold text-[11px]">{t.nightLoss.closingTimes[time.value]?.label || time.label}</p>
                                        <p className="text-[8px] opacity-60 uppercase">{t.nightLoss.closingTimes[time.value]?.desc || time.desc}</p>
                                    </button>
                                ))}
                            </div>

                        </div>
                        <RangeSelector
                            label={t.nightLoss.avgTransactionLabel}
                            options={TXN_VALUE_OPTIONS}
                            value={form.avgTransactionValue}
                            onChange={val => setForm({ ...form, avgTransactionValue: val })}
                            colorClass="alert-orange"
                        />
                        <div>
                            <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-2">{t.nightLoss.businessTypeLabel}</label>
                            <div className="grid grid-cols-3 gap-3">
                                {BUSINESS_TYPES.map(bt => (
                                    <button key={bt.value} type="button"
                                        className={`py-3 px-2 rounded-lg text-center transition-all border ${form.businessType === bt.value
                                            ? 'bg-primary/10 border-primary/30 text-primary'
                                            : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'}`}
                                        onClick={() => setForm({ ...form, businessType: bt.value })}
                                    >
                                        <p className="font-bold text-sm">{t.nightLoss.businessTypes[bt.value]?.label || bt.label}</p>
                                        <p className="text-[9px] opacity-60">AI: {bt.aiCvr} → Next-day: {bt.delayCvr}</p>
                                        <p className="text-[8px] font-bold opacity-40 mt-0.5">{bt.gap}</p>
                                    </button>
                                ))}
                            </div>

                        </div>
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full relative overflow-hidden bg-orange-500 hover:bg-orange-400 text-white font-bold py-3.5 md:py-4 rounded-lg uppercase tracking-tight md:tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.3)]"
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
                                        <span className="material-symbols-outlined text-sm md:text-base">calculate</span>
                                        {t.nightLoss.btnText}
                                    </>
                                )}
                            </span>
                        </button>
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
                            <div className="bg-black border-2 border-alert-orange/30 rounded-xl p-6 md:p-8 text-center">
                                <p className="text-white/50 text-xs md:text-sm uppercase tracking-widest mb-2">{t.nightLoss.loseHeadline}</p>
                                <p className="text-3xl md:text-5xl font-black text-alert-orange tracking-tight">
                                    {formatINRFull(results.monthlyLoss ?? results.monthly_loss)}<span className="text-lg md:text-xl text-white/30">{t.nightLoss.perMonth}</span>
                                </p>
                                <p className="text-white/40 mt-2 text-xs md:text-sm">{t.nightLoss.annualLossLine.replace('{amount}', formatINR(results.annualLoss ?? results.annual_loss))}</p>
                            </div>

                            <div className="bg-carbon border border-white/10 rounded-xl p-6">
                                <h4 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-1">{t.nightLoss.leadsLabel.replace('{count}', results.nightInquiries ?? results.night_inquiries)}</h4>
                                <p className="text-[10px] text-white/30 mb-4">{t.nightLoss.conversionsLabel.replace('{count}', results.monthlyLostConversions ?? '—').replace('{gap}', results.conversionGap ?? '22.5')}</p>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-white/60">{t.nightLoss.nextDayRevenue}</span>
                                            <span className="text-alert-red font-bold">{formatINRFull(curRev)}</span>
                                        </div>
                                        <div className="h-4 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-alert-red rounded-full transition-all duration-1000" style={{ width: `${(curRev / maxRev) * 100}%` }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-white/60">{t.nightLoss.aiRevenue}</span>
                                            <span className="text-neon-green font-bold">{formatINRFull(potRev)}</span>
                                        </div>
                                        <div className="h-4 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-neon-green rounded-full transition-all duration-1000" style={{ width: `${(potRev / maxRev) * 100}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[9px] text-white/25 mt-4 leading-relaxed italic">{t.nightLoss.source}</p>
                            </div>

                            <div className="bg-alert-orange/10 border border-alert-orange/30 rounded-xl p-6 text-center">
                                <span className="material-symbols-outlined text-alert-orange text-4xl mb-2">schedule</span>
                                <p className="text-alert-orange font-bold text-lg">{t.nightLoss.hourlyLossText.replace('{amount}', formatINRFull(results.hourlyLoss ?? Math.round((results.monthly_loss || 0) / 420)))}</p>
                                <p className="text-white/40 text-xs">{t.nightLoss.hourlyLossSub}</p>
                            </div>
                        </>
                    ) : (
                        <div className="bg-carbon border border-white/10 rounded-xl p-12 text-center">
                            <span className="material-symbols-outlined text-6xl text-white/10 mb-4">nightlight</span>
                            <p className="text-white/30 text-sm">{t.nightLoss.emptyState}</p>
                        </div>
                    )}
                </div>
            </div>
        </FeatureLayout>
    );
}

export default function NightLossPage() {
    return (
        <Suspense fallback={<div className="text-white p-10">Loading...</div>}>
            <NightLossContent />
        </Suspense>
    );
}
