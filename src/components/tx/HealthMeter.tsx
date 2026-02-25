import React from 'react';

interface HealthMeterProps {
    months: number;
}

export function HealthMeter({ months }: HealthMeterProps) {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-[20px] shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] h-full min-h-[250px] flex flex-col justify-center">
            {/* Background Danger Accent */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-500/10 blur-[150px] rounded-full opacity-50 pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative z-10 w-full">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Extinction Horizon</h3>
                    <span className="text-red-500 text-[10px] font-black tracking-widest uppercase bg-red-950/40 px-3 py-1.5 rounded-full border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                        Critical Alert
                    </span>
                </div>

                <div className="flex flex-col mb-4">
                    <span className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
                        Estimated Market Relevance: <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 filter drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                            {months} Months
                        </span>
                    </span>
                    <p className="text-xs text-gray-400 mt-2 max-w-lg">Your operational systems are failing to adapt to modern algorithmic shifts. Market collapse imminent without infrastructure update.</p>
                </div>

                {/* Glassmorphism Gauge / Danger Bar */}
                <div className="w-full h-3 bg-black/80 rounded-full overflow-hidden border border-white/5 mt-8 relative shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]">
                    <div
                        className="h-full bg-gradient-to-r from-red-600 to-red-400 relative"
                        style={{ width: `${(months / 120) * 100}%` }}
                    >
                        <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-white/30 to-transparent"></div>
                    </div>
                </div>
                <div className="flex justify-between w-full text-[9px] text-gray-600 font-bold tracking-[0.2em] uppercase mt-3">
                    <span className="text-red-500/80">0 Months (Extinction)</span>
                    <span>120 Months (Secure)</span>
                </div>
            </div>
        </div>
    );
}
