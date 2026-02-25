'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import FeatureLayout from '@/components/FeatureLayout';
import { calculateVisibility, VISIBILITY_SIGNALS, formatINR } from '@/lib/calculations';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { translations } from '@/lib/translations';

const STATUS_COLORS = {
    DOMINANT: { bg: 'bg-neon-green/10', border: 'border-neon-green/30', text: 'text-neon-green', fill: '#39ff14' },
    VISIBLE: { bg: 'bg-primary/10', border: 'border-primary/30', text: 'text-primary', fill: '#00e5ff' },
    OKAY: { bg: 'bg-premium-gold/10', border: 'border-premium-gold/30', text: 'text-premium-gold', fill: '#ffd700' },
    GHOST: { bg: 'bg-alert-orange/10', border: 'border-alert-orange/30', text: 'text-alert-orange', fill: '#ff5e00' },
    INVISIBLE: { bg: 'bg-alert-red/10', border: 'border-alert-red/30', text: 'text-alert-red', fill: '#ff3131' },
};

export default function VisibilityPage() {
    const { business, loading } = useAuth();
    const businessId = business?.id;

    const [lang, setLang] = useState('en');
    const t = translations[lang];

    const [answers, setAnswers] = useState(
        Object.fromEntries(VISIBILITY_SIGNALS.map(s => [s.id, false]))
    );
    const [city, setCity] = useState('');
    const [results, setResults] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!businessId) return;
        const load = async () => {
            const { data } = await supabase
                .from('visibility_results')
                .select('*')
                .eq('business_id', businessId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            if (data) {
                setAnswers(data.signals || {});
                setCity(data.city || '');
                setResults(data);
            }
        };
        load();
    }, [businessId]);

    const handleScan = async () => {
        const calc = calculateVisibility(answers, city);
        setResults(calc);

        if (businessId) {
            setSaving(true);
            await supabase.from('visibility_results').insert({
                business_id: businessId,
                city,
                signals: answers,
                percent: calc.percent,
                status: calc.status,
                missed_customers: calc.missedCustomers,
                gaps: calc.gaps,
            });
            setSaving(false);
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

    return (
        <FeatureLayout
            title="Digital Visibility Scanner"
            subtitle="Are customers finding you — or your competitors?"
            backHref="/dashboard"
            t={t}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Checklist */}
                <div className="bg-carbon border border-white/10 rounded-xl p-8">
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">checklist</span>
                        10-Signal Audit
                    </h3>
                    <p className="text-white/40 text-xs mb-6">Check all that apply to your business</p>

                    <div>
                        <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-2">Your City</label>
                        <input
                            type="text"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all mb-5"
                            placeholder="e.g. Indore, Mumbai"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2 mb-6">
                        {VISIBILITY_SIGNALS.map(signal => (
                            <button key={signal.id} type="button"
                                className={`w-full flex items-center justify-between py-3 px-4 rounded-lg transition-all border text-left ${answers[signal.id]
                                    ? 'bg-primary/10 border-primary/30'
                                    : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                                onClick={() => toggleSignal(signal.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${answers[signal.id]
                                        ? 'border-primary bg-primary'
                                        : 'border-white/30'}`}>
                                        {answers[signal.id] && <span className="material-symbols-outlined text-background-dark text-sm">check</span>}
                                    </div>
                                    <span className={`text-sm ${answers[signal.id] ? 'text-white' : 'text-white/60'}`}>{signal.label}</span>
                                </div>
                                <span className={`text-[10px] font-bold ${answers[signal.id] ? 'text-primary' : 'text-white/20'}`}>{signal.points} pts</span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleScan}
                        disabled={saving}
                        className="w-full bg-primary hover:bg-cyan-400 text-background-dark font-bold py-4 rounded-lg uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">radar</span>
                        {saving ? 'Saving...' : 'Run Visibility Scan'}
                    </button>
                </div>

                {/* Results */}
                <div className="space-y-6">
                    {results ? (
                        <>
                            {/* Score Gauge */}
                            <div className={`${statusStyle.bg} border ${statusStyle.border} rounded-xl p-8 text-center`}>
                                <div className="relative w-48 h-28 mx-auto mb-4">
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
                                    <p className={`text-sm font-black uppercase tracking-widest ${statusStyle.text}`}>
                                        {results.status} {results.statusHindi && `/ ${results.statusHindi}`}
                                    </p>
                                </div>
                            </div>

                            {/* Missed Customers */}
                            <div className="bg-alert-red/10 border border-alert-red/30 rounded-xl p-6 text-center">
                                <p className="text-[10px] uppercase tracking-widest text-alert-red font-bold mb-1">Estimated Missed Customers</p>
                                <p className="text-3xl font-black text-alert-red">~{results.missedCustomers ?? results.missed_customers}</p>
                                <p className="text-white/40 text-xs">potential customers / month not finding you</p>
                            </div>

                            {/* Gap Analysis */}
                            {results.gaps && results.gaps.length > 0 && (
                                <div className="bg-carbon border border-white/10 rounded-xl p-6">
                                    <h4 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-4">
                                        Gap Analysis ({results.gaps.length} signals missing)
                                    </h4>
                                    <div className="space-y-2">
                                        {results.gaps.map((gap, i) => (
                                            <div key={i} className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-alert-red text-sm">close</span>
                                                    <span className="text-sm text-white/70">{gap.label}</span>
                                                </div>
                                                <span className="text-[10px] font-bold text-alert-red">-{gap.points} pts</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-carbon border border-white/10 rounded-xl p-12 text-center">
                            <span className="material-symbols-outlined text-6xl text-white/10 mb-4">radar</span>
                            <p className="text-white/30 text-sm">Complete the checklist to scan your visibility</p>
                        </div>
                    )}
                </div>
            </div>
        </FeatureLayout>
    );
}
