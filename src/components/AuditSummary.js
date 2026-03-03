'use client';
import { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

export default function AuditSummary({ data, business }) {
    const { t } = useLanguage();
    const { lossAudit, nightLoss, missedCustomers, aiThreat } = data || {};
    const [exporting, setExporting] = useState(false);

    const ts = t.dashboard.auditSummary;

    // Helpers for Visibility Signal mapping
    const getSigVal = (id) => {
        if (!missedCustomers?.signals) return 0;
        // If it's an array (old format)
        if (Array.isArray(missedCustomers.signals)) {
            return missedCustomers.signals.includes(id) ? 100 : 0;
        }
        // If it's an object (new format)
        return missedCustomers.signals[id] ? 100 : 0;
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
        <section className="mt-12 space-y-8 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-ios-blue animate-pulse"></span>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{ts.header.log}</h2>
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">
                        {ts.header.overview.split(' ').slice(0, -1).join(' ')} <span className="text-ios-blue">{ts.header.overview.split(' ').pop()}</span>
                    </h2>
                </div>

                <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="group relative px-6 py-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-ios-blue/50 hover:bg-ios-blue/5 transition-all duration-300 overflow-hidden"
                >
                    <div className="relative z-10 flex items-center gap-3">
                        <span className={`material-symbols-outlined text-ios-blue text-xl transition-transform duration-500 ${exporting ? 'animate-bounce' : 'group-hover:translate-x-1'}`}>
                            {exporting ? 'sync' : 'forward_to_inbox'}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-widest text-white/90">
                            {exporting ? ts.header.exporting : ts.header.exportBtn}
                        </span>
                    </div>
                    {exporting && (
                        <div className="absolute inset-0 bg-ios-blue/10 animate-pulse"></div>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                {/* 1. OPERATIONAL WASTE */}
                <div className="relative overflow-hidden rounded-2xl bg-[#0D0D0D] border border-white/5 pt-[3px] transition-all hover:bg-[#111111] group">
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-ios-cyan shadow-[0_0_15px_rgba(0,229,255,0.4)]"></div>
                    <div className="p-7">
                        <div className="flex justify-between items-start mb-10">
                            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] leading-tight max-w-[150px]">
                                {ts.module01.title}
                            </h4>
                            <a href={`/dashboard/loss-audit${business?.id ? `?id=${business.id}` : ''}`} className="text-white/20 hover:text-ios-cyan transition-colors">
                                <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                            </a>
                        </div>
                        <div className="mb-2">
                            <p className="text-3xl font-black text-white tracking-tighter">
                                ₹{(lossAudit?.saving_target || 0).toLocaleString()}
                            </p>
                        </div>
                        <p className="text-[11px] font-bold text-white/30 uppercase tracking-tight">
                            {ts.module01.hole}
                        </p>
                    </div>
                </div>

                {/* 2. NIGHT LOSS (MISSED AFTER-HOURS REVENUE) */}
                <div className="relative overflow-hidden rounded-2xl bg-[#0D0D0D] border border-white/5 pt-[3px] transition-all hover:bg-[#111111] group">
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-ios-cyan shadow-[0_0_15px_rgba(0,229,255,0.4)]"></div>
                    <div className="p-7">
                        <div className="flex justify-between items-start mb-10">
                            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] leading-tight max-w-[150px]">
                                {ts.module02.title}
                            </h4>
                            <a href={`/dashboard/night-loss${business?.id ? `?id=${business.id}` : ''}`} className="text-white/20 hover:text-ios-cyan transition-colors">
                                <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                            </a>
                        </div>
                        <div className="mb-2">
                            <p className="text-3xl font-black text-white tracking-tighter">
                                ₹{(nightLoss?.monthly_loss || 0).toLocaleString()}
                            </p>
                        </div>
                        <p className="text-[11px] font-bold text-white/30 uppercase tracking-tight">
                            {ts.module02.decay}
                        </p>
                    </div>
                </div>

                {/* 3. VISIBILITY (MISSED LOCAL CUSTOMERS) */}
                <div className="relative overflow-hidden rounded-2xl bg-[#0D0D0D] border border-white/5 pt-[3px] transition-all hover:bg-[#111111] group">
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-ios-cyan shadow-[0_0_15px_rgba(0,229,255,0.4)]"></div>
                    <div className="p-7">
                        <div className="flex justify-between items-start mb-10">
                            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] leading-tight max-w-[150px]">
                                {ts.module03.title}
                            </h4>
                            <a href={`/dashboard/visibility${business?.id ? `?id=${business.id}` : ''}`} className="text-white/20 hover:text-ios-cyan transition-colors">
                                <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                            </a>
                        </div>
                        <div className="mb-2">
                            <p className="text-3xl font-black text-white tracking-tighter">
                                {Math.round(missedCustomers?.missed_customers || 0).toLocaleString()}
                            </p>
                        </div>
                        <p className="text-[11px] font-bold text-white/30 uppercase tracking-tight">
                            {ts.module03.missed}
                        </p>
                    </div>
                </div>

                {/* 4. EXTINCTION HORIZON */}
                <div className="relative overflow-hidden rounded-2xl bg-[#0D0D0D] border border-white/5 pt-[3px] transition-all hover:bg-[#111111] group">
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-ios-cyan shadow-[0_0_15px_rgba(0,229,255,0.4)]"></div>
                    <div className="p-7">
                        <div className="flex justify-between items-start mb-10">
                            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] leading-tight max-w-[150px]">
                                {ts.module04.title}
                            </h4>
                            <a href={`/dashboard/ai-threat${business?.id ? `?id=${business.id}` : ''}`} className="text-white/20 hover:text-ios-cyan transition-colors">
                                <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                            </a>
                        </div>
                        <div className="mb-2">
                            <p className="text-3xl font-black text-white tracking-tighter">
                                {(aiThreat?.score || aiThreat?.risk_pct || 0)}/100
                            </p>
                        </div>
                        <p className={`text-[11px] font-black uppercase tracking-widest ${(aiThreat?.score > 70 || aiThreat?.risk_band === 'CRITICAL') ? 'text-ios-orange' : 'text-white/30'}`}>
                            {aiThreat?.risk_band || 'LOW RISK'}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
