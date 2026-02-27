'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import FeatureLayout from '@/components/FeatureLayout';
import { calculateNightLoss, formatINR, formatINRFull } from '@/lib/calculations';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { translations } from '@/lib/translations';

import { Suspense } from 'react';

function NightLossContent() {
    const { business } = useAuth();
    const searchParams = useSearchParams();
    const businessId = business?.id || searchParams.get('id') || (typeof window !== 'undefined' ? localStorage.getItem('masterkey_business_id') : null);

    const [lang, setLang] = useState('en');
    const t = translations[lang];

    const [form, setForm] = useState({
        dailyInquiries: 20,
        closingTime: '8pm',
        profitPerSale: '',
        responseTime: 'none',
        monthlyDays: 26,
    });
    const [results, setResults] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!businessId) return;
        const load = async () => {
            const { data } = await supabase
                .from('night_loss_results')
                .select('*')
                .eq('business_id', businessId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            if (data) {
                setForm({
                    dailyInquiries: data.daily_inquiries || 20,
                    closingTime: data.closing_time || '8pm',
                    profitPerSale: data.profit_per_sale || '',
                    responseTime: data.response_time || 'none',
                    monthlyDays: data.monthly_days || 26,
                });
                setResults(data);
            }
        };
        load();
    }, [businessId]);

    const handleCalculate = async (e) => {
        e.preventDefault();
        const profit = parseInt(form.profitPerSale) || 0;

        const calc = calculateNightLoss(form.dailyInquiries, form.closingTime, profit, form.responseTime, form.monthlyDays);
        setResults(calc);

        if (businessId) {
            setSaving(true);
            const payload = {
                business_id: businessId,
                daily_inquiries: form.dailyInquiries,
                closing_time: form.closingTime,
                profit_per_sale: profit,
                response_time: form.responseTime,
                monthly_days: form.monthlyDays,
                night_inquiries: calc.nightInquiries,
                current_revenue: calc.currentRevenue,
                potential_revenue: calc.potentialRevenue,
                monthly_loss: calc.monthlyLoss,
                annual_loss: calc.annualLoss,
                created_at: new Date().toISOString()
            };

            await supabase.from('night_loss_results').upsert(payload, { onConflict: 'business_id' });
            setSaving(false);
            setSaving(false);
        }
    };

    const CLOSING_TIMES = [
        { value: '6pm', label: '6 PM', desc: '38% night inquiries' },
        { value: '8pm', label: '8 PM', desc: '25% night inquiries' },
        { value: '10pm', label: '10 PM', desc: '14% night inquiries' },
    ];

    const RESPONSE_TIMES = [
        { value: 'instant', label: 'Instant (AI)', cvr: '28%' },
        { value: '<30min', label: '< 30 min', cvr: '18%' },
        { value: '1-4hrs', label: '1-4 hours', cvr: '8%' },
        { value: 'nextday', label: 'Next day', cvr: '3%' },
        { value: 'none', label: 'No WhatsApp', cvr: '0%' },
    ];

    const potRev = results?.potentialRevenue ?? results?.potential_revenue ?? 0;
    const curRev = results?.currentRevenue ?? results?.current_revenue ?? 0;
    const maxRev = Math.max(potRev, curRev, 1);

    return (
        <FeatureLayout
            title="Night Loss Calculator"
            subtitle="How much revenue are you losing while you sleep?"
            backHref="/dashboard"
            t={t}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Form */}
                <div className="bg-carbon border border-white/10 rounded-xl p-8">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-alert-orange">nightlight</span>
                        Your Business Hours
                    </h3>
                    <form onSubmit={handleCalculate} className="space-y-5">
                        <div>
                            <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-2">Average Daily Inquiries</label>
                            <input
                                type="range" min="1" max="200" step="1"
                                className="w-full accent-primary"
                                value={form.dailyInquiries}
                                onChange={(e) => setForm({ ...form, dailyInquiries: parseInt(e.target.value) })}
                            />
                            <p className="text-right text-primary font-bold text-lg">{form.dailyInquiries} / day</p>
                        </div>
                        <div>
                            <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-2">Business Closing Time</label>
                            <div className="grid grid-cols-3 gap-3">
                                {CLOSING_TIMES.map(t => (
                                    <button key={t.value} type="button"
                                        className={`py-3 rounded-lg text-center transition-all border ${form.closingTime === t.value
                                            ? 'bg-alert-orange/20 border-alert-orange/50 text-alert-orange'
                                            : 'bg-white/5 border-white/10 text-white/50 hover:border-white/30'}`}
                                        onClick={() => setForm({ ...form, closingTime: t.value })}
                                    >
                                        <p className="font-bold text-sm">{t.label}</p>
                                        <p className="text-[9px] opacity-60">{t.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-2">Avg Profit Per Sale (₹)</label>
                            <input
                                type="number" min="50" max="500000" required
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all"
                                placeholder="₹ 1,500"
                                value={form.profitPerSale}
                                onChange={(e) => setForm({ ...form, profitPerSale: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-2">Current WhatsApp Response Time</label>
                            <div className="space-y-2">
                                {RESPONSE_TIMES.map(r => (
                                    <button key={r.value} type="button"
                                        className={`w-full flex justify-between items-center py-3 px-4 rounded-lg transition-all border text-left ${form.responseTime === r.value
                                            ? 'bg-primary/10 border-primary/30 text-primary'
                                            : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'}`}
                                        onClick={() => setForm({ ...form, responseTime: r.value })}
                                    >
                                        <span className="text-sm">{r.label}</span>
                                        <span className="text-[10px] font-bold opacity-60">CVR: {r.cvr}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button
                            type="submit" disabled={saving}
                            className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-4 rounded-lg uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                        >
                            <span className="material-symbols-outlined">calculate</span>
                            {saving ? 'Saving...' : 'Calculate Night Loss'}
                        </button>
                    </form>
                </div>

                {/* Results */}
                <div className="space-y-6">
                    {results ? (
                        <>
                            <div className="bg-black border-2 border-alert-orange/30 rounded-xl p-8 text-center">
                                <p className="text-white/50 text-sm uppercase tracking-widest mb-2">You Are Losing Every Night</p>
                                <p className="text-5xl font-black text-alert-orange tracking-tight">
                                    {formatINRFull(results.monthlyLoss ?? results.monthly_loss)}<span className="text-xl text-white/30">/month</span>
                                </p>
                                <p className="text-white/40 mt-2">Annual Loss: <span className="text-white font-bold">{formatINR(results.annualLoss ?? results.annual_loss)}</span></p>
                            </div>

                            <div className="bg-carbon border border-white/10 rounded-xl p-6">
                                <h4 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-4">Night Inquiries: {results.nightInquiries ?? results.night_inquiries} / month</h4>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-white/60">Current Capture</span>
                                            <span className="text-alert-red font-bold">{formatINRFull(curRev)}</span>
                                        </div>
                                        <div className="h-4 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-alert-red rounded-full transition-all duration-1000" style={{ width: `${(curRev / maxRev) * 100}%` }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-white/60">Potential with AI</span>
                                            <span className="text-neon-green font-bold">{formatINRFull(potRev)}</span>
                                        </div>
                                        <div className="h-4 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-neon-green rounded-full transition-all duration-1000" style={{ width: `${(potRev / maxRev) * 100}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-alert-orange/10 border border-alert-orange/30 rounded-xl p-6 text-center">
                                <span className="material-symbols-outlined text-alert-orange text-4xl mb-2">schedule</span>
                                <p className="text-alert-orange font-bold text-lg">Losing {formatINRFull(results.hourlyLoss ?? Math.round((results.monthly_loss || 0) / 312))} every hour</p>
                                <p className="text-white/40 text-xs">from closing time to 8 AM</p>
                            </div>
                        </>
                    ) : (
                        <div className="bg-carbon border border-white/10 rounded-xl p-12 text-center">
                            <span className="material-symbols-outlined text-6xl text-white/10 mb-4">nightlight</span>
                            <p className="text-white/30 text-sm">Configure your business hours to see the loss</p>
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
