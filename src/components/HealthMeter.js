export default function HealthMeter({
    zone = null,
    months = null,
    score = null,
    description = null,
    t
}) {
    const displayScore = score ?? 0;
    const displayMonths = months ?? 0;

    // Translation fallbacks
    const defaultZone = zone || t.dashboard.healthMeter.analyzing;
    const defaultDesc = description || t.dashboard.healthMeter.sub;

    // Zone styling
    const isKhatra = defaultZone?.includes('Critical') || defaultZone?.includes('Khatra') || displayScore >= 70;
    const isSavdhan = defaultZone?.includes('Warning') || defaultZone?.includes('Caution') || (displayScore >= 40 && displayScore < 70);
    const isSafe = defaultZone?.includes('Safe') || defaultZone?.includes('Optimized') || displayScore < 40;

    const zoneColor = isKhatra ? 'text-ios-orange' : isSavdhan ? 'text-ios-orange/60' : isSafe ? 'text-ios-blue' : 'text-white/20';
    const threatLabel = isKhatra ? t.dashboard.healthMeter.risk : isSavdhan ? t.dashboard.healthMeter.watch : isSafe ? t.dashboard.healthMeter.verified : t.dashboard.healthMeter.scanning;

    return (
        <div className="system-card border border-white/5 p-8 relative overflow-hidden h-full flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-ios-blue/5 blur-[50px] rounded-full"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isKhatra ? 'bg-ios-orange animate-pulse' : 'bg-ios-blue shadow-[0_0_8px_rgba(0,122,255,0.4)]'}`}></span>
                        <h3 className="text-[12px] font-bold text-white/40 uppercase tracking-[0.2em]">{t.dashboard.healthMeter.healthVector}</h3>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isKhatra ? 'bg-ios-orange/10 text-ios-orange' : 'bg-ios-blue/10 text-ios-blue'}`}>
                        {threatLabel}
                    </span>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-6xl font-bold tracking-tighter text-white">
                        {score !== null ? displayScore : '--'}
                    </span>
                    <span className="text-white/20 text-lg font-medium">/100</span>
                </div>
                <p className={`text-[13px] font-bold ${zoneColor} uppercase tracking-widest`}>{defaultZone}</p>
            </div>

            <div className="mt-12 relative z-10">
                <div className="w-full bg-white/[0.03] h-1.5 rounded-full overflow-hidden mb-6">
                    <div
                        className={`h-full transition-all duration-1000 ease-out rounded-full ${isKhatra ? 'bg-ios-orange' : 'bg-ios-blue'}`}
                        style={{ width: `${displayScore}%` }}
                    ></div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-none">{t.dashboard.healthMeter.relevanceHorizon}</p>
                            <p className="text-2xl font-bold text-white tracking-tight">
                                {months !== null ? `${displayMonths} ${t.dashboard.healthMeter.months}` : t.dashboard.healthMeter.awaitScan}
                            </p>
                        </div>
                    </div>
                    <p className="text-white/40 text-[12px] leading-relaxed italic border-l-2 border-white/5 pl-4">&quot;{defaultDesc}&quot;</p>
                </div>
            </div>
        </div>
    );
}
