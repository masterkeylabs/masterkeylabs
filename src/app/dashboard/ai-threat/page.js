'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import FeatureLayout from '@/components/FeatureLayout';
import { calculateAIThreat, BUSINESS_VERTICALS } from '@/lib/calculations';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { translations } from '@/lib/translations';

import { Suspense } from 'react';

function AIThreatContent() {
    const { business } = useAuth();
    const searchParams = useSearchParams();
    const businessId = business?.id || searchParams.get('id') || (typeof window !== 'undefined' ? localStorage.getItem('masterkey_business_id') : null);

    const [lang, setLang] = useState('en');
    const t = translations[lang];

    const [form, setForm] = useState({
        industry: 'retail',
        isOmnichannel: false,
    });
    const [results, setResults] = useState(null);
    const [saving, setSaving] = useState(false);

    // Load existing results
    useEffect(() => {
        if (!businessId) return;
        const load = async () => {
            const { data } = await supabase
                .from('ai_threat_results')
                .select('*')
                .eq('business_id', businessId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            if (data) {
                setForm({
                    industry: data.industry || 'retail',
                    isOmnichannel: data.is_omnichannel || false,
                });
                setResults({
                    score: data.score,
                    yearsLeft: data.years_left,
                    threatLevel: data.threat_level,
                    timelineDesc: data.timeline_desc
                });
            }
        };
        load();
    }, [businessId]);

    const handleCalculate = async (e) => {
        e.preventDefault();

        const score = calculateAIThreat(form.industry, form.isOmnichannel);
        // Basic calculation logic for other metadata
        const threatLevel = score >= 80 ? 'KHATRA' : score >= 50 ? 'SAVDHAN' : 'SAFE';
        const yearsLeft = Math.max(1, Math.round((100 - score) / 10));

        const calcResults = {
            score,
            yearsLeft,
            threatLevel,
            timelineDesc: score >= 80 ? 'Accelerated disruption' : 'Gradual transformation'
        };

        setResults(calcResults);

        if (businessId) {
            setSaving(true);
            const payload = {
                business_id: businessId,
                score: score,
                years_left: yearsLeft,
                threat_level: threatLevel,
                timeline_desc: calcResults.timelineDesc,
                industry: form.industry,
                is_omnichannel: form.isOmnichannel,
                created_at: new Date().toISOString()
            };

            const { error: saveErr } = await supabase.from('ai_threat_results').upsert(payload, { onConflict: 'business_id' });
            if (saveErr) {
                console.error('Save Error:', saveErr);
                alert(`Sync Failed: ${saveErr.message}`);
            }
            setSaving(false);
            setSaving(false);
        }
    };

    {
        BUSINESS_VERTICALS.map(ind => (
            <option key={ind.value} value={ind.value} className="bg-background-dark">{ind.label}</option>
        ))
    }

    return (
        <FeatureLayout
            title="Extinction Horizon"
            subtitle="Analyze the risk of AI disruption for your business model."
            backHref={businessId ? `/dashboard?id=${businessId}` : '/dashboard'}
            t={t}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Form */}
                <div className="bg-carbon border border-white/10 rounded-xl p-8">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-ios-blue">psychology</span>
                        Disruption Parameters
                    </h3>
                    <form onSubmit={handleCalculate} className="space-y-6">
                        <div>
                            <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-2">Industry Sector</label>
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all font-sans"
                                value={form.industry}
                                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                            >
                                {INDUSTRIES.map(ind => (
                                    <option key={ind.value} value={ind.value} className="bg-background-dark">{ind.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <label className="text-[10px] text-ios-blue uppercase tracking-widest block mb-4 font-bold">Resilience Factors</label>

                            <button
                                type="button"
                                onClick={() => setForm({ ...form, isOmnichannel: !form.isOmnichannel })}
                                className={`w-full flex items-center justify-between p-6 rounded-xl border transition-all ${form.isOmnichannel ? 'bg-ios-blue/10 border-ios-blue/50' : 'bg-white/5 border-white/10 opacity-60'}`}
                            >
                                <div className="text-left">
                                    <p className="text-sm font-bold text-white uppercase tracking-tight">Omnichannel Presence</p>
                                    <p className="text-xs text-white/40 mt-1">Selling across both physical and digital platforms</p>
                                </div>
                                <span className={`material-symbols-outlined text-2xl ${form.isOmnichannel ? 'text-ios-blue' : 'text-white/20'}`}>
                                    {form.isOmnichannel ? 'check_circle' : 'radio_button_unchecked'}
                                </span>
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-ios-blue hover:bg-ios-blue/80 text-white font-bold py-5 rounded-2xl uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(0,132,255,0.2)] mt-8"
                        >
                            <span className="material-symbols-outlined">radar</span>
                            {saving ? 'Analyzing...' : 'Calculate Extinction Risk'}
                        </button>
                    </form>
                </div>

                {/* Results */}
                <div className="space-y-6">
                    {results ? (
                        <>
                            <div className={`bg-black border-2 ${results.score >= 80 ? 'border-alert-red animate-pulse' : results.score >= 50 ? 'border-alert-orange' : 'border-neon-green'} rounded-2xl p-10 text-center shadow-2xl`}>
                                <p className="text-white/50 text-xs uppercase tracking-[0.3em] mb-4">Threat Level</p>
                                <p className={`text-7xl font-black tracking-tighter ${results.score >= 80 ? 'text-alert-red' : results.score >= 50 ? 'text-alert-orange' : 'text-neon-green'}`}>
                                    {results.score}<span className="text-2xl text-white/20">/100</span>
                                </p>
                                <p className={`text-xl font-bold uppercase tracking-[0.2em] mt-4 ${results.score >= 80 ? 'text-alert-red' : results.score >= 50 ? 'text-alert-orange' : 'text-neon-green'}`}>
                                    {results.threatLevel}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                                    <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Years to Disruption</p>
                                    <p className="text-3xl font-black text-white">{results.yearsLeft} <span className="text-sm text-white/30">Years</span></p>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                                    <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Timeline</p>
                                    <p className="text-sm font-bold text-ios-blue mt-2">{results.timelineDesc}</p>
                                </div>
                            </div>

                            <div className="bg-ios-blue/5 border border-ios-blue/20 rounded-xl p-6 italic text-sm text-white/60 text-center leading-relaxed">
                                "AI doesn't replace businesses, it replaces business models that refuse to evolve."
                            </div>
                        </>
                    ) : (
                        <div className="bg-carbon border border-white/10 rounded-xl p-12 text-center h-full flex flex-col items-center justify-center">
                            <span className="material-symbols-outlined text-6xl text-white/10 mb-4 animate-pulse">searching</span>
                            <p className="text-white/30 text-sm">Select your industry to analyze potential AI impact.</p>
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
