'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import FeatureLayout from '@/components/FeatureLayout';
import { calculateExportOpportunity, EXPORT_CATEGORIES, formatINR, formatINRFull } from '@/lib/calculations';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { translations } from '@/lib/translations';

import { Suspense } from 'react';

function ExportContent() {
    const { business, loading } = useAuth();
    const businessId = business?.id;

    const [lang, setLang] = useState('en');
    const t = translations[lang];

    const [form, setForm] = useState({
        productName: '',
        category: 'spices',
        localPrice: '',
        monthlyQty: '',
        unit: 'kg',
        destination: 'UAE',
    });
    const [results, setResults] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!businessId) return;
        const load = async () => {
            const { data } = await supabase
                .from('export_results')
                .select('*')
                .eq('business_id', businessId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            if (data) {
                setForm({
                    productName: data.product_name || '',
                    category: data.product_category || 'spices',
                    localPrice: data.local_price || '',
                    monthlyQty: data.monthly_qty || '',
                    unit: data.unit_of_measure || 'kg',
                    destination: data.destination || 'UAE',
                });
                setResults(data);
            }
        };
        load();
    }, [businessId]);

    const handleCalculate = async (e) => {
        e.preventDefault();
        const price = parseInt(form.localPrice) || 0;
        const qty = parseInt(form.monthlyQty) || 0;

        const calc = calculateExportOpportunity(price, qty, form.category, form.destination);
        setResults(calc);

        if (businessId) {
            setSaving(true);
            await supabase.from('export_results').insert({
                business_id: businessId,
                product_name: form.productName,
                product_category: form.category,
                local_price: price,
                monthly_qty: qty,
                unit_of_measure: form.unit,
                destination: form.destination,
                multiplier: calc.multiplier,
                export_revenue: calc.exportRevenue,
                local_revenue: calc.localRevenue,
                export_cost: calc.exportCost,
                net_profit: calc.netExportProfit,
                additional_income: calc.additionalIncome,
                roi_percent: calc.roiPercent,
                annual_additional: calc.annualAdditional,
            });
            setSaving(false);
        }
    };

    const DESTINATIONS = [
        { value: 'UAE', label: '🇦🇪 United Arab Emirates' },
        { value: 'USA', label: '🇺🇸 United States' },
        { value: 'UK', label: '🇬🇧 United Kingdom' },
        { value: 'Germany', label: '🇩🇪 Germany' },
        { value: 'Australia', label: '🇦🇺 Australia' },
        { value: 'Singapore', label: '🇸🇬 Singapore' },
        { value: 'Japan', label: '🇯🇵 Japan' },
        { value: 'Canada', label: '🇨🇦 Canada' },
        { value: 'France', label: '🇫🇷 France' },
        { value: 'Saudi Arabia', label: '🇸🇦 Saudi Arabia' },
        { value: 'Qatar', label: '🇶🇦 Qatar' },
        { value: 'South Africa', label: '🇿🇦 South Africa' },
        { value: 'Kenya', label: '🇰🇪 Kenya' },
        { value: 'Netherlands', label: '🇳🇱 Netherlands' },
        { value: 'Italy', label: '🇮🇹 Italy' },
        { value: 'Spain', label: '🇪🇸 Spain' },
        { value: 'Mexico', label: '🇲🇽 Mexico' },
        { value: 'Egypt', label: '🇪🇬 Egypt' },
        { value: 'Nigeria', label: '🇳🇬 Nigeria' },
        { value: 'South Korea', label: '🇰🇷 South Korea' },
        { value: 'New Zealand', label: '🇳🇿 New Zealand' },
    ];

    return (
        <FeatureLayout
            title="Global Trade Route"
            subtitle="Discover how much more your products are worth in international markets."
            backHref="/dashboard"
            t={t}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Form */}
                <div className="bg-carbon border border-white/10 rounded-xl p-8">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-neon-green">public</span>
                        Product Details
                    </h3>
                    <form onSubmit={handleCalculate} className="space-y-5">
                        <div>
                            <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-2">Product Name</label>
                            <input
                                type="text" maxLength="60" required
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all"
                                placeholder="e.g. Basmati Rice, Cotton Sarees"
                                value={form.productName}
                                onChange={(e) => setForm({ ...form, productName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-2">Product Category</label>
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 appearance-none cursor-pointer"
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                            >
                                {EXPORT_CATEGORIES.map(c => (
                                    <option key={c.value} value={c.value} className="bg-background-dark">{c.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-2">Local Price / Unit (₹)</label>
                                <input
                                    type="number" min="10" max="500000" required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all"
                                    placeholder="₹ 150"
                                    value={form.localPrice}
                                    onChange={(e) => setForm({ ...form, localPrice: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-2">Monthly Qty</label>
                                <input
                                    type="number" min="1" max="1000000" required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all"
                                    placeholder="500"
                                    value={form.monthlyQty}
                                    onChange={(e) => setForm({ ...form, monthlyQty: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-2">Export Destination</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 appearance-none cursor-pointer pr-10"
                                    value={form.destination}
                                    onChange={(e) => setForm({ ...form, destination: e.target.value })}
                                >
                                    {DESTINATIONS.map(d => (
                                        <option key={d.value} value={d.value} className="bg-background-dark">
                                            {d.label}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                                    <span className="material-symbols-outlined">expand_more</span>
                                </div>
                            </div>
                        </div>
                        <button
                            type="submit" disabled={saving}
                            className="w-full bg-neon-green hover:bg-green-400 text-background-dark font-bold py-4 rounded-lg uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">rocket_launch</span>
                            {saving ? 'Saving...' : 'Calculate Export Opportunity'}
                        </button>
                    </form>
                </div>

                {/* Results */}
                <div className="space-y-6">
                    {results ? (
                        <>
                            {/* Revenue Comparison */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                                    <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Local Revenue</p>
                                    <p className="text-2xl font-black text-white">{formatINR(results.localRevenue ?? results.local_revenue)}<span className="text-sm text-white/30">/mo</span></p>
                                </div>
                                <div className="bg-neon-green/10 border border-neon-green/30 rounded-xl p-6 text-center relative overflow-hidden">
                                    <div className="absolute top-2 right-2 bg-neon-green text-background-dark text-[10px] font-black px-2 py-0.5 rounded-full">{results.multiplier}x</div>
                                    <p className="text-[10px] uppercase tracking-widest text-neon-green font-bold mb-2">Export Revenue</p>
                                    <p className="text-2xl font-black text-neon-green">{formatINR(results.exportRevenue ?? results.export_revenue)}<span className="text-sm text-neon-green/60">/mo</span></p>
                                </div>
                            </div>

                            {/* Cost Breakdown */}
                            <div className="bg-carbon border border-white/10 rounded-xl p-6">
                                <h4 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-4">Export Cost Breakdown</h4>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-sm text-white/50">Freight + DGFT + Packaging</span>
                                    <span className="text-sm text-white font-bold">{formatINRFull(results.exportCost ?? results.export_cost)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-sm text-white/50">Net Export Profit</span>
                                    <span className="text-sm text-neon-green font-bold">{formatINRFull(results.netExportProfit ?? results.net_profit)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm text-white/50">ROI vs Local Sales</span>
                                    <span className="text-sm text-premium-gold font-bold">{results.roiPercent ?? results.roi_percent}%</span>
                                </div>
                            </div>

                            {/* Additional Income */}
                            <div className="bg-premium-gold/10 border border-premium-gold/30 rounded-xl p-8 text-center glow-gold">
                                <p className="text-[10px] uppercase tracking-widest text-premium-gold font-bold mb-2">Additional Monthly Income</p>
                                <p className="text-4xl font-black text-premium-gold">{formatINRFull(results.additionalIncome ?? results.additional_income)}</p>
                                <p className="text-white/40 mt-2 text-sm">
                                    Annual: <span className="text-white font-bold">{formatINR(results.annualAdditional ?? results.annual_additional)}</span>
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="bg-carbon border border-white/10 rounded-xl p-12 text-center">
                            <span className="material-symbols-outlined text-6xl text-white/10 mb-4">public</span>
                            <p className="text-white/30 text-sm">Enter product details to see export opportunity</p>
                        </div>
                    )}
                </div>
            </div>
        </FeatureLayout>
    );
}

export default function ExportPage() {
    return (
        <Suspense fallback={<div className="text-white p-10">Loading...</div>}>
            <ExportContent />
        </Suspense>
    );
}
