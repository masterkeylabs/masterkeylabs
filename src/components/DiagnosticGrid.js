'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function DiagnosticGrid({ data, business, t }) {
    const { lossAudit, nightLoss, missedCustomers, aiThreat } = data || {};
    const [exporting, setExporting] = useState(false);
    const ts = t.dashboard.auditSummary;

    // Helpers for Visibility Signal mapping
    const visibilityMap = {
        'GMB': 'hasGoogleMyBusiness',
        'WEB': 'hasWebsite',
        'SOC': 'activeSocialMedia',
        'ADS': 'runsAds'
    };

    const getSigVal = (sigLabel) => {
        if (!missedCustomers?.signals) return 0;
        const mappedId = visibilityMap[sigLabel];

        if (Array.isArray(missedCustomers.signals)) {
            return missedCustomers.signals.includes(mappedId) ? 100 : 0;
        }
        return missedCustomers.signals[mappedId] ? 100 : 0;
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const response = await fetch('/api/export-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ business, data })
            });
            const result = await response.json();
            if (result.success) {
                alert(t.dashboard.rescue.booking.btn.success || 'Report exported.');
            } else {
                alert('Export failed: ' + result.error);
            }
        } catch (error) {
            console.error('Export Error:', error);
            alert('Export failed.');
        } finally {
            setExporting(false);
        }
    };

    if (!data) return null;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end px-4">
                <div className="flex items-center gap-2">
                    <span className="w-1 h-4 bg-ios-blue rounded-full"></span>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30">
                        {t.dashboard.risksTitle || 'SYSTEM DIAGNOSTICS'}
                    </h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4">
                {/* 1. OPERATIONAL WASTE */}
                <Link
                    href={`/dashboard/loss-audit${business?.id ? `?id=${business.id}` : ''}`}
                    className="group cursor-pointer relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-xl transition-all duration-500 hover:bg-white/[0.04] hover:border-white/20 block"
                >
                    <div className="absolute top-0 left-0 w-1 h-full bg-ios-blue opacity-30"></div>
                    <div className="flex justify-between items-start mb-8 text-left">
                        <div>
                            <p className="text-[10px] font-black text-ios-blue uppercase tracking-widest mb-1">{ts.module01.tag}</p>
                            <h3 className="text-xl font-bold text-white uppercase tracking-tighter group-hover:text-ios-blue transition-colors">{ts.module01.title}</h3>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <div className="text-white/20 group-hover:text-ios-blue transition-colors mb-2">
                                <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                            </div>
                            <p className="text-[10px] font-bold text-white/20 uppercase">{ts.module01.hole}</p>
                            <p className="text-2xl font-black text-white">₹{(lossAudit?.saving_target || 0).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                <p className="text-[9px] font-bold text-white/30 uppercase mb-1">{ts.module01.payroll}</p>
                                <p className="text-lg font-bold text-white">₹{(lossAudit?.payroll_waste || 0).toLocaleString()}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                <p className="text-[9px] font-bold text-white/30 uppercase mb-1">{ts.module01.marketing}</p>
                                <p className="text-lg font-bold text-white">₹{(lossAudit?.marketing_waste || 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </Link>

                {/* 2. NIGHT LOSS */}
                <Link
                    href={`/dashboard/night-loss${business?.id ? `?id=${business.id}` : ''}`}
                    className="group cursor-pointer relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-xl transition-all duration-500 hover:bg-white/[0.04] hover:border-white/20 block"
                >
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 opacity-30"></div>
                    <div className="flex justify-between items-start mb-8 text-left">
                        <div>
                            <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">{ts.module02.tag}</p>
                            <h3 className="text-xl font-bold text-white uppercase tracking-tighter">{ts.module02.title}</h3>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <div className="text-white/20 group-hover:text-purple-400 transition-colors mb-2">
                                <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                            </div>
                            <p className="text-[10px] font-bold text-white/20 uppercase">{ts.module02.decay || 'LEAKAGE / MO'}</p>
                            <p className="text-2xl font-black text-white">₹{(nightLoss?.monthly_loss || 0).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="space-y-6 text-left">
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/5 to-transparent border border-purple-500/10">
                            <div className="flex justify-between mb-2">
                                <p className="text-[11px] font-bold text-white/60 uppercase">{ts.module02.gap || 'CONVERSION GAP'}</p>
                                <p className="text-[11px] font-bold text-purple-400">{nightLoss?.conversion_gap || 0}%</p>
                            </div>
                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" style={{ width: `${nightLoss?.conversion_gap || 0}%` }}></div>
                            </div>
                        </div>
                    </div>
                </Link>

                {/* 3. VISIBILITY */}
                <Link
                    href={`/dashboard/visibility${business?.id ? `?id=${business.id}` : ''}`}
                    className="group cursor-pointer relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-xl transition-all duration-500 hover:bg-white/[0.04] hover:border-white/20 block"
                >
                    <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 opacity-30"></div>
                    <div className="flex justify-between items-start mb-8 text-left">
                        <div>
                            <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">{ts.module03.tag}</p>
                            <h3 className="text-xl font-bold text-white uppercase tracking-tighter">{ts.module03.title}</h3>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <div className="text-white/20 group-hover:text-cyan-400 transition-colors mb-2">
                                <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                            </div>
                            <p className="text-[10px] font-bold text-white/20 uppercase">{ts.module03.opp || 'MISSED CUSTOMERS'}</p>
                            <p className="text-2xl font-black text-white">{Math.round(missedCustomers?.missed_customers || 0).toLocaleString()}+</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mb-6 text-left">
                        {['GMB', 'WEB', 'SOC', 'ADS'].map((sig, i) => {
                            const val = getSigVal(sig);
                            return (
                                <div key={i} className="text-center p-2 rounded-lg bg-white/[0.02] border border-white/5">
                                    <p className="text-[8px] font-bold text-white/20 uppercase mb-1">{sig}</p>
                                    <p className={`text-xs font-bold ${val > 0 ? 'text-cyan-400' : 'text-white/20'}`}>{val}%</p>
                                </div>
                            );
                        })}
                    </div>
                </Link>

                {/* 4. EXTINCTION HORIZON */}
                <Link
                    href={`/dashboard/ai-threat${business?.id ? `?id=${business.id}` : ''}`}
                    className="group cursor-pointer relative overflow-hidden rounded-3xl border border-red-500/20 bg-red-500/[0.02] p-8 backdrop-blur-xl transition-all duration-500 hover:bg-red-500/[0.04] hover:border-red-500/30 block"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[60px] rounded-full"></div>
                    <div className="flex justify-between items-start mb-8 text-left">
                        <div>
                            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">{ts.module04.tag}</p>
                            <h3 className="text-xl font-bold text-white uppercase tracking-tighter">{ts.module04.title}</h3>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="text-white/20 group-hover:text-red-500 transition-colors mb-2">
                                <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                            </div>
                            <div className="text-center px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
                                <p className="text-[8px] font-black text-red-500 uppercase leading-none mt-0.5">LIVE SCANNING</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 text-left">
                        <div className="flex-1">
                            <p className="text-[10px] font-bold text-white/20 uppercase mb-1">MARKET RELEVANCE TTL</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-white">{aiThreat?.score || 30}</span>
                                <span className="text-sm font-bold text-white/40 uppercase">MONTHS</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-bold text-white/20 uppercase mb-1">SURVIVAL COMPLEXITY</p>
                            <p className="text-2xl font-bold text-white tracking-tight">{aiThreat?.risk_pct || aiThreat?.score || 0}% <span className="text-xs text-white/20">THREAT</span></p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
