'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import FeatureLayout from '@/components/FeatureLayout';
import { calculateLossAudit, formatINR, formatINRFull } from '@/lib/calculations';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { translations } from '@/lib/translations';

export default function LossAuditPage() {
    const { business, loading } = useAuth();
    const businessId = business?.id;

    const [lang, setLang] = useState('en');
    const t = translations[lang];

    const [form, setForm] = useState({
        staffSalary: '',
        marketingBudget: '',
        opsOverheads: '',
        industry: 'manufacturing',
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
                .single();
            if (data) {
                setForm({
                    staffSalary: data.staff_salary || '',
                    marketingBudget: data.marketing_budget || '',
                    opsOverheads: data.ops_overheads || '',
                    industry: data.industry || 'manufacturing',
                });
                setResults(data);
            }
        };
        load();
    }, [businessId]);

    const handleCalculate = async (e) => {
        e.preventDefault();
        const staff = parseInt(form.staffSalary) || 0;
        const marketing = parseInt(form.marketingBudget) || 0;
        const ops = parseInt(form.opsOverheads) || 0;

        const calc = calculateLossAudit(staff, marketing, ops, form.industry);
        setResults(calc);

        if (businessId) {
            setSaving(true);
            await supabase.from('loss_audit_results').insert({
                business_id: businessId,
                staff_salary: staff,
                marketing_budget: marketing,
                ops_overheads: ops,
                industry: form.industry,
                staff_waste: calc.staffWaste,
                marketing_waste: calc.marketingWaste,
                ops_waste: calc.opsWaste,
                total_burn: calc.totalBurn,
                annual_burn: calc.annualBurn,
                saving_target: calc.savingTarget,
                five_year_cost: calc.fiveYearCost,
            });
            setSaving(false);
        }
    };

    const maxWaste = results ? Math.max(results.staffWaste || results.staff_waste, results.marketingWaste || results.marketing_waste, results.opsWaste || results.ops_waste, 1) : 1;

    return (
        <FeatureLayout
            title="Loss Audit"
            subtitle="Find out how much capital your business is silently burning every month."
            backHref={businessId ? `/dashboard?id=${businessId}` : '/dashboard'}
            t={t}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Form */}
                <div className="bg-carbon border border-white/10 rounded-xl p-8">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-alert-red">trending_down</span>
                        Enter Your Monthly Costs
                    </h3>
                    <form onSubmit={handleCalculate} className="space-y-5">
                        <div>
                            <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-2">Staff Salary (Monthly Total)</label>
                            <input
                                type="number"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all"
                                placeholder="₹ 3,00,000"
                                min="5000" max="5000000"
                                value={form.staffSalary}
                                onChange={(e) => setForm({ ...form, staffSalary: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-2">Marketing Budget (Monthly)</label>
                            <input
                                type="number"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all"
                                placeholder="₹ 50,000"
                                min="1000" max="2000000"
                                value={form.marketingBudget}
                                onChange={(e) => setForm({ ...form, marketingBudget: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-2">Operations & Overheads</label>
                            <input
                                type="number"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all"
                                placeholder="₹ 2,00,000"
                                min="1000" max="5000000"
                                value={form.opsOverheads}
                                onChange={(e) => setForm({ ...form, opsOverheads: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-2">Industry</label>
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 appearance-none cursor-pointer"
                                value={form.industry}
                                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                            >
                                <option value="manufacturing" className="bg-background-dark">Manufacturing</option>
                                <option value="retail" className="bg-background-dark">Retail</option>
                                <option value="services" className="bg-background-dark">Services</option>
                                <option value="fb" className="bg-background-dark">Food & Beverage</option>
                                <option value="realestate" className="bg-background-dark">Real Estate</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-alert-red hover:bg-red-500 text-white font-bold py-4 rounded-lg uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">calculate</span>
                            {saving ? 'Saving...' : 'Calculate Monthly Burn'}
                        </button>
                    </form>
                </div>

                {/* Results */}
                <div className="space-y-6">
                    {results ? (
                        <>
                            {/* Headline */}
                            <div className="bg-black border-2 border-alert-red/30 rounded-xl p-8 glow-red text-center">
                                <p className="text-white/50 text-sm uppercase tracking-widest mb-2">You Are Burning</p>
                                <p className="text-5xl font-black text-alert-red tracking-tight">
                                    {formatINRFull(results.totalBurn ?? results.total_burn)}<span className="text-xl text-white/30">/month</span>
                                </p>
                                <p className="text-white/40 mt-2">That is <span className="text-white font-bold">{formatINR((results.annualBurn ?? results.annual_burn))}</span> every year</p>
                            </div>

                            {/* Breakdown Bars */}
                            <div className="bg-carbon border border-white/10 rounded-xl p-6">
                                <h4 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-4">Waste Breakdown</h4>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Staff Waste', value: results.staffWaste ?? results.staff_waste, color: 'bg-alert-red' },
                                        { label: 'Marketing Waste', value: results.marketingWaste ?? results.marketing_waste, color: 'bg-alert-orange' },
                                        { label: 'Ops Waste', value: results.opsWaste ?? results.ops_waste, color: 'bg-primary' },
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
                            </div>

                            {/* Recoverable + 5-year */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-neon-green/10 border border-neon-green/30 rounded-xl p-6 text-center">
                                    <p className="text-[10px] uppercase tracking-widest text-neon-green font-bold mb-2">Recoverable Savings</p>
                                    <p className="text-2xl font-black text-neon-green">{formatINRFull(results.savingTarget ?? results.saving_target)}<span className="text-sm text-neon-green/60">/mo</span></p>
                                </div>
                                <div className="bg-alert-red/10 border border-alert-red/30 rounded-xl p-6 text-center">
                                    <p className="text-[10px] uppercase tracking-widest text-alert-red font-bold mb-2">5-Year Cost of Inaction</p>
                                    <p className="text-2xl font-black text-alert-red">{formatINR(results.fiveYearCost ?? results.five_year_cost)}</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-carbon border border-white/10 rounded-xl p-12 text-center">
                            <span className="material-symbols-outlined text-6xl text-white/10 mb-4">analytics</span>
                            <p className="text-white/30 text-sm">Enter your costs to see the breakdown</p>
                        </div>
                    )}
                </div>
            </div>
        </FeatureLayout>
    );
}
