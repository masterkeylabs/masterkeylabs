'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import FeatureLayout from '@/components/FeatureLayout';
import { calculateVisibility, VISIBILITY_SIGNALS, formatINR, formatINRFull, parseNumericalRange } from '@/lib/calculations';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { useDiagnosticStore } from '@/store/diagnosticStore';
import { RangeSelector, TXN_VALUE_OPTIONS } from '@/components/RangeSelector';

import { FINAL_COUNTRIES, GET_CITIES } from '@/lib/countries';

const STATUS_COLORS = {
    DOMINANT: { bg: 'bg-neon-green/10', border: 'border-neon-green/30', text: 'text-neon-green', fill: '#39ff14' },
    VISIBLE: { bg: 'bg-primary/10', border: 'border-primary/30', text: 'text-primary', fill: '#00e5ff' },
    OKAY: { bg: 'bg-premium-gold/10', border: 'border-premium-gold/30', text: 'text-premium-gold', fill: '#ffd700' },
    GHOST: { bg: 'bg-alert-orange/10', border: 'border-alert-orange/30', text: 'text-alert-orange', fill: '#ff5e00' },
    INVISIBLE: { bg: 'bg-alert-red/10', border: 'border-alert-red/30', text: 'text-alert-red', fill: '#ff3131' },
};

import { Suspense } from 'react';

const SEARCH_STEPS = [
    "CRAWLING SEARCH ENGINES...",
    "MAPPING COMPETITOR FOOTPRINT...",
    "DETECTING VISIBILITY GAPS...",
    "ANALYZING MARKET SIGNALS...",
    "QUANTIFYING MISSED OPPORTUNITY...",
    "FINALIZING MARKET SCAN..."
];

function VisibilityContent() {
    const { business } = useAuth();
    const { lang, t } = useLanguage();
    const searchParams = useSearchParams();
    const router = useRouter();
    const businessId = business?.id;

    const [answers, setAnswers] = useState(
        Object.fromEntries(VISIBILITY_SIGNALS.map(s => [s.id, false]))
    );
    const [city, setCity] = useState(useDiagnosticStore.getState().city || '');
    const [country, setCountry] = useState('India');
    const [avgTransactionValue, setAvgTransactionValue] = useState('');
    const [results, setResults] = useState(null);
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [searchIndex, setSearchIndex] = useState(0);

    useEffect(() => {
        if (!businessId) return;
        const load = async () => {
            // 1. Try to load existing Visibility results
            const { data } = await supabase
                .from('visibility_results')
                .select('*')
                .eq('business_id', businessId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (data) {
                const defaultAnswers = Object.fromEntries(VISIBILITY_SIGNALS.map(s => [s.id, false]));
                const savedSignals = data.signals || {};
                setAnswers({ ...defaultAnswers, ...savedSignals });
                setCity(data.city || '');
                setCountry(data.country || 'India');
                setAvgTransactionValue(data.avg_transaction_value ? data.avg_transaction_value.toString() : '');

                // Recalculate with parsing
                const avgNum = parseNumericalRange(data.avg_transaction_value);
                const calc = calculateVisibility(
                    { ...defaultAnswers, ...savedSignals },
                    data.city || '',
                    avgNum
                );
                setResults(calc);
                if (data.city) {
                    useDiagnosticStore.getState().updateCity(data.city);
                }
            } else {
                // 2. Fetch fallback from other modules or business profile
                const { data: lossData } = await supabase
                    .from('loss_audit_results')
                    .select('ops_overheads')
                    .eq('business_id', businessId)
                    .maybeSingle();

                if (lossData?.ops_overheads) {
                    setAvgTransactionValue(lossData.ops_overheads.toString());
                } else if (businessId) {
                    // Try business metadata
                    const { data: biz } = await supabase.from('businesses').select('avg_transaction_value').eq('id', businessId).single();
                    if (biz?.avg_transaction_value) setAvgTransactionValue(biz.avg_transaction_value.toString());
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

    const handleScan = async () => {
        const avgValue = parseNumericalRange(avgTransactionValue);
        const calc = calculateVisibility(answers, city, avgValue);
        setResults(calc);

        if (businessId) {
            setSaving(true);
            try {
                const payload = {
                    business_id: businessId,
                    city,
                    country,
                    signals: answers,
                    avg_transaction_value: avgValue,
                    percent: calc.percent,
                    status: calc.status,
                    missed_customers: calc.missedCustomers,
                    missed_revenue: calc.monthlyLoss,
                    annual_loss: calc.annualLoss,
                    gaps: calc.gaps,
                    created_at: new Date().toISOString()
                };

                const { error: saveErr } = await supabase.from('visibility_results').upsert(payload, { onConflict: 'business_id' });
                if (saveErr) {
                    console.error('Save Error:', saveErr);
                    alert(`Sync Failed: ${saveErr.message}`);
                } else {
                    console.log('--- Visibility Audit: Sync Success ---');
                    // Sync with global store
                    useDiagnosticStore.getState().updateMissedCustomers(payload);
                    useDiagnosticStore.getState().updateCity(payload.city);
                    
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 3000);
                }
            } catch (err) {
                console.error('Unexpected Visibility Error:', err);
                alert('An unexpected error occurred while saving. Please try again.');
            } finally {
                setSaving(false);
            }
        }
    };

    const toggleSignal = (id) => {
        setAnswers(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const statusStyle = results ? STATUS_COLORS[results.status] || STATUS_COLORS.INVISIBLE : null;
    const percent = results?.percent ?? 0;

    // SVG gauge calculations
    const radius = 80;
    const circumference = Math.PI * radius;
    const dashOffset = circumference - (percent / 100) * circumference;

    const cityList = GET_CITIES(country);

    return (
        <FeatureLayout
            title={t.visibility.title}
            subtitle={t.visibility.subTitle}
            backHref={businessId ? `/dashboard?id=${businessId}` : '/dashboard'}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Checklist */}
                <div className="bg-carbon border border-white/10 rounded-xl p-5 md:p-8">
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">checklist</span>
                        {t.dashboard.auditSummary.header.log}
                    </h3>
                    <p className="text-white/40 text-xs mb-6">{t.visibility.formHeader}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                        <div>
                            <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-2">{t.visibility.cityLabel.split('(')[0].trim() || 'Country'}</label>
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all appearance-none cursor-pointer"
                                value={country}
                                onChange={(e) => {
                                    setCountry(e.target.value);
                                    setCity(''); // Reset city when country changes
                                }}
                            >
                                {FINAL_COUNTRIES.map(c => (
                                    <option key={c} value={c} className="bg-[#050505]">{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-2">{t.visibility.cityLabel}</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all uppercase placeholder:text-white/10"
                                placeholder={t.visibility.placeholders.cityInput || "e.g. MUMBAI"}
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            />
                        </div>
                    </div>

                    <RangeSelector
                        label={t.nightLoss.avgTransactionLabel}
                        options={TXN_VALUE_OPTIONS}
                        value={parseFloat(avgTransactionValue) || ''}
                        onChange={val => setAvgTransactionValue(val.toString())}
                        colorClass="ios-cyan"
                    />

                    <div className="space-y-2 mb-6">
                        {VISIBILITY_SIGNALS.map(signal => (
                            <button key={signal.id} type="button"
                                alt-label={signal.label}
                                className={`w-full flex items-center justify-between py-2.5 px-3 md:py-3 md:px-4 rounded-lg transition-all border text-left ${answers[signal.id]
                                    ? 'bg-primary/10 border-primary/30'
                                    : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                                onClick={() => toggleSignal(signal.id)}
                            >
                                <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
                                    <div className={`w-4 h-4 md:w-5 md:h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${answers[signal.id]
                                        ? 'border-cyan-500 bg-cyan-500'
                                        : 'border-white/30 bg-transparent'}`}>
                                        {answers[signal.id] && (
                                            <svg viewBox="0 0 12 12" className="w-2.5 h-2.5" fill="none">
                                                <path d="M2 6l3 3 5-5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className={`text-[12px] md:text-sm truncate ${answers[signal.id] ? 'text-white' : 'text-white/60'}`}>{t.visibility.signals[signal.id] || signal.label}</span>
                                </div>
                                <span className={`text-[9px] md:text-[10px] font-bold flex-shrink-0 ${answers[signal.id] ? 'text-primary' : 'text-white/20'}`}>{signal.points} pts</span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleScan}
                        disabled={saving}
                        className="w-full relative overflow-hidden bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3.5 md:py-4 rounded-lg uppercase tracking-tight md:tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                    >
                        {saving && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-transparent bg-[length:200%_100%] animate-scan" style={{ animation: 'scan 1.5s linear infinite' }} />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            {saving ? (
                                <>
                                    <span className="animate-spin text-sm">⌛</span>
                                    {SEARCH_STEPS[searchIndex]}
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-sm md:text-base">radar</span>
                                    {t.visibility.btnText}
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
                </div>

                {/* Results */}
                <div className="space-y-6">
                    {results ? (
                        <>
                            {/* Score Gauge */}
                            <div className={`${statusStyle.bg} border ${statusStyle.border} rounded-xl p-6 md:p-8 text-center`}>
                                <div className="relative w-40 h-24 md:w-48 md:h-28 mx-auto mb-4">
                                    <svg viewBox="0 0 200 110" className="w-full">
                                        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" strokeLinecap="round" />
                                        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke={statusStyle.fill} strokeWidth="12" strokeLinecap="round"
                                            strokeDasharray={circumference}
                                            strokeDashoffset={dashOffset}
                                            style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                                        />
                                        <text x="100" y="90" textAnchor="middle" fill="white" fontSize="36" fontWeight="900">{percent}</text>
                                        <text x="100" y="108" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="11">/100</text>
                                    </svg>
                                </div>
                                <div className={`inline-block px-4 py-1.5 rounded-full ${statusStyle.bg} border ${statusStyle.border}`}>
                                    <p className={`text-xs md:text-sm font-black uppercase tracking-widest ${statusStyle.text}`}>
                                        {t.common.statuses[results.status] || results.status}
                                    </p>
                                </div>
                                <p className="text-white/30 text-[10px] mt-2">{t.visibility.marketScore}: {results.invisibilityRate ?? (100 - percent)}%</p>
                            </div>

                            {/* Missed Customers + Searches */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-alert-red/10 border border-alert-red/30 rounded-xl p-5 text-center">
                                    <p className="text-[10px] uppercase tracking-widest text-alert-red font-bold mb-1">{t.visibility.searchTermLabel}</p>
                                    <p className="text-2xl font-black text-alert-red">~{(results.missedSearches ?? 0).toLocaleString('en-IN')}</p>
                                    <p className="text-white/30 text-[9px] mt-1">{t.visibility.monthlyVolumeLabel}: {(results.cityMonthlySearches ?? 0).toLocaleString('en-IN')}/mo</p>
                                </div>
                                <div className="bg-alert-orange/10 border border-alert-orange/30 rounded-xl p-5 text-center">
                                    <p className="text-[10px] uppercase tracking-widest text-alert-orange font-bold mb-1">{t.visibility.highIntent}</p>
                                    <p className="text-2xl font-black text-alert-orange">~{results.missedCustomers ?? results.missed_customers}</p>
                                    <p className="text-white/30 text-[9px] mt-1">{t.visibility.conversionRate}</p>
                                </div>
                            </div>

                            {/* Revenue Loss (only if avg transaction value provided) */}
                            {(results.monthlyLoss > 0) && (
                                <div className="bg-black border-2 border-alert-red/30 rounded-xl p-6 text-center">
                                    <p className="text-white/50 text-xs uppercase tracking-widest mb-2">{t.visibility.lostRevenue}</p>
                                    <p className="text-3xl font-black text-alert-red tracking-tight">
                                        {formatINRFull(results.monthlyLoss)}<span className="text-lg text-white/30">{t.nightLoss.perMonth}</span>
                                    </p>
                                    <p className="text-white/40 mt-2 text-xs">{t.nightLoss.annualLossLine.replace('{amount}', formatINR(results.annualLoss))}</p>
                                </div>
                            )}

                            {/* Gap Analysis */}
                            {results.gaps && results.gaps.length > 0 && (
                                <div className="bg-carbon border border-white/10 rounded-xl p-6">
                                    <h4 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-4">
                                        {t.visibility.gapsHeader.replace('{count}', results.gaps.length)}
                                    </h4>
                                    <div className="space-y-2">
                                        {results.gaps.map((gap, i) => (
                                            <div key={i} className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-alert-red text-sm">close</span>
                                                    <span className="text-sm text-white/70">{t.visibility.signals[gap.id] || gap.label}</span>
                                                </div>
                                                <span className="text-[10px] font-bold text-alert-red">-{gap.points} pts</span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[9px] text-white/25 mt-4 leading-relaxed italic">{t.visibility.source}</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-carbon border border-white/10 rounded-xl p-12 text-center">
                            <span className="material-symbols-outlined text-6xl text-white/10 mb-4">radar</span>
                            <p className="text-white/30 text-sm">{t.visibility.emptyState}</p>
                        </div>
                    )}
                </div>
            </div>
        </FeatureLayout>
    );
}

export default function VisibilityPage() {
    return (
        <Suspense fallback={<div className="text-white p-10">Loading...</div>}>
            <VisibilityContent />
        </Suspense>
    );
}
