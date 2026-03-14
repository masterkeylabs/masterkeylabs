'use client';
import React from 'react';
import { formatIndian } from '@/utils/formatIndian';
import { useDiagnosticStore } from '@/store/diagnosticStore';

export default function BleedSummaryCard({ t, locked }) {
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => { setMounted(true); }, []);

    const totalAnnualBleed = useDiagnosticStore((state) => state.totalAnnualBleed || 0);

    if (!mounted || locked) return null;

    // Estimate recoverable as 50%
    const recoverablePotential = totalAnnualBleed * 0.5;

    const scrollToSection = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="w-full bg-black/40 border border-alert-red/30 rounded-3xl p-8 md:p-12 mb-10 overflow-hidden relative shadow-[0_0_80px_rgba(239,68,68,0.1)]">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-alert-red/5 to-transparent pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-alert-red/10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="text-center lg:text-left space-y-4 w-full lg:w-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-alert-red/10 border border-alert-red/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-alert-red animate-pulse"></span>
                        <span className="text-[10px] font-black text-alert-red uppercase tracking-[0.2em]">
                            {t?.dashboard?.bleedCard?.liveBurn || "Live Burn Detected"}
                        </span>
                    </div>
                    <h2
                        className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter uppercase leading-none"
                        dangerouslySetInnerHTML={{ __html: t?.dashboard?.bleedCard?.annualBleed || "Total Annual<br />Capital Bleed" }}
                    />
                    <p className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tighter">
                        {formatIndian(totalAnnualBleed)}
                    </p>
                    <div className="pt-2">
                        <p className="text-green-400 font-bold text-sm md:text-lg lg:text-xl flex flex-wrap items-center justify-center lg:justify-start gap-2">
                            <span className="material-symbols-outlined text-sm md:text-base">verified</span>
                            {t?.dashboard?.bleedCard?.recoverable?.replace('{amount}', formatIndian(recoverablePotential)) || `Recoverable with AI: ${formatIndian(recoverablePotential)} / yr`}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-4 w-full max-w-sm">
                    <button
                        onClick={() => scrollToSection('comprehensive-report')}
                        className="w-full h-14 md:h-16 bg-white text-black font-black uppercase tracking-[0.1em] rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-200 transition-all active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.1)] text-xs md:text-sm"
                    >
                        <span className="material-symbols-outlined text-lg">description</span>
                        {t?.dashboard?.bleedCard?.unlockReport || "Unlock Full Report"}
                    </button>

                    <button
                        onClick={() => scrollToSection('schedule-review')}
                        className="w-full h-14 md:h-16 bg-alert-red text-white font-black uppercase tracking-[0.1em] rounded-2xl flex items-center justify-center gap-3 hover:bg-alert-red/90 transition-all active:scale-95 shadow-[0_20px_40px_rgba(239,68,68,0.2)] text-xs md:text-sm"
                    >
                        <span className="material-symbols-outlined text-lg">calendar_month</span>
                        {t?.dashboard?.bleedCard?.bookCall || "Book a Call"}
                    </button>

                    <p className="text-[9px] md:text-[10px] text-center text-white/30 uppercase tracking-widest font-medium">
                        {t?.dashboard?.bleedCard?.secureBlueprint || "Secure your technical blueprint today."}
                    </p>
                </div>
            </div>
        </div>
    );
}
