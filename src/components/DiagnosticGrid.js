'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useDiagnosticStore } from '@/store/diagnosticStore';

export default function DiagnosticGrid({ business, t, locked, onStartAudit }) {
    const { lossAudit, nightLoss, missedCustomers, aiThreat } = useDiagnosticStore();
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

    const ModuleWrapper = ({ children, href }) => {
        return (
            <Link href={href} className="group cursor-pointer relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-xl transition-all duration-500 hover:bg-white/[0.04] hover:border-white/20 block">
                {children}
            </Link>
        );
    };


    return (
        <div className="space-y-8 relative">
            <div className="flex justify-between items-end px-4">
                <div className="flex items-center gap-2">
                    <span className="w-1 h-4 bg-ios-blue rounded-full"></span>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30">
                        {t.dashboard.risksTitle || 'SYSTEM DIAGNOSTICS'}
                    </h3>
                </div>
            </div>

            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 transition-all duration-1000 ${locked ? 'blur-2xl grayscale pointer-events-none opacity-40 scale-[0.98]' : ''}`}>
                {/* 1. OPERATIONAL WASTE */}
                <ModuleWrapper href={`/dashboard/loss-audit${business?.id ? `?id=${business.id}` : ''}`}>
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
                                <p className="text-lg font-bold text-white">₹{(lossAudit?.staff_waste || 0).toLocaleString()}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                <p className="text-[9px] font-bold text-white/30 uppercase mb-1">{ts.module01.marketing}</p>
                                <p className="text-lg font-bold text-white">₹{(lossAudit?.marketing_waste || 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </ModuleWrapper>

                {/* 2. NIGHT LOSS */}
                <ModuleWrapper href={`/dashboard/night-loss${business?.id ? `?id=${business.id}` : ''}`}>
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
                                <p className="text-[11px] font-bold text-purple-400">
                                    {nightLoss?.response_time === 'b2b' ? 20 : nightLoss?.response_time === 'b2c' ? 25 : 23}%
                                </p>
                            </div>
                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                                    style={{ width: `${nightLoss?.response_time === 'b2b' ? 20 : nightLoss?.response_time === 'b2c' ? 25 : 23}%` }}>
                                </div>
                            </div>
                        </div>
                    </div>
                </ModuleWrapper>

                {/* 3. VISIBILITY */}
                <ModuleWrapper href={`/dashboard/visibility${business?.id ? `?id=${business.id}` : ''}`}>
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
                </ModuleWrapper>

                {/* 4. EXTINCTION HORIZON */}
                <ModuleWrapper href={`/dashboard/ai-threat${business?.id ? `?id=${business.id}` : ''}`}>
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500 opacity-30"></div>
                    <div className="flex justify-between items-start mb-8 text-left">
                        <div>
                            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">{ts.module04.tag}</p>
                            <h3 className="text-xl font-bold text-white uppercase tracking-tighter group-hover:text-red-500 transition-colors">{ts.module04.title}</h3>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <div className="text-white/20 group-hover:text-red-500 transition-colors mb-2">
                                <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                            </div>
                            <p className="text-[10px] font-bold text-white/20 uppercase">{t.aiThreat.threatLevel}</p>
                            <p className="text-2xl font-black text-white">{aiThreat?.score || 0}%</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-left">
                                <p className="text-[9px] font-bold text-white/30 uppercase mb-1">{t.aiThreat.ttlHeadline}</p>
                                <p className="text-lg font-bold text-white">{aiThreat?.final_horizon || (aiThreat?.years_left ? Math.round(aiThreat.years_left * 12) : 0)} <span className="text-xs text-white/40 font-medium uppercase">{t.aiThreat.months}</span></p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-left">
                                <p className="text-[9px] font-bold text-white/30 uppercase mb-1">{t.aiThreat.riskAssessment}</p>
                                <p className="text-lg font-bold text-white">{aiThreat?.threat_level || 'UNKNOWN'}</p>
                            </div>
                        </div>
                    </div>
                </ModuleWrapper>
            </div>

            {/* Locked Overlay */}
            {locked && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pt-20">
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 p-10 rounded-[3rem] shadow-2xl text-center max-w-md mx-auto animate-bounce-in">
                        <div className="w-20 h-20 bg-ios-blue/10 border border-ios-blue/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-4xl text-ios-blue animate-pulse">lock_open</span>
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-3">
                            {t.dashboard.auditSummary.lockedTitle}
                        </h3>
                        <p className="text-white/40 text-sm mb-8 leading-relaxed">
                            {t.dashboard.auditSummary.lockedSub}
                        </p>
                        <button
                            onClick={onStartAudit}
                            className="w-full py-5 bg-ios-blue text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-[0_0_30px_rgba(0,122,255,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3"
                        >
                            <span className="material-symbols-outlined">analytics</span>
                            {t.dashboard.cards.loss.run}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
