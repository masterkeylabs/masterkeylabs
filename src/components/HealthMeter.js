export default function HealthMeter({
    zone = "Analyzing...",
    months = null,
    score = null,
    description = "Submit your business details on the landing page to see your AI threat assessment."
}) {
    const displayScore = score ?? 0;
    const displayMonths = months ?? 0;

    // Zone styling
    const isKhatra = zone?.includes('Critical') || displayScore >= 70;
    const isSavdhan = zone?.includes('Warning') || (displayScore >= 40 && displayScore < 70);
    const isSafe = zone?.includes('Safe') || displayScore < 40;

    const zoneColor = isKhatra ? 'text-alert-red' : isSavdhan ? 'text-alert-orange' : isSafe ? 'text-neon-green' : 'text-white/40';
    const arcColor = isKhatra ? '#ff3131' : isSavdhan ? '#ff5e00' : isSafe ? '#39ff14' : '#333';

    const threatLabel = isKhatra ? 'KHATRA' : isSavdhan ? 'SAVDHAN' : isSafe ? 'SAFE' : '';

    // Arc center at (50, 55) inside viewBox 0 0 100 62 — gives room for stroke
    const cx = 50, cy = 55, r = 40, needleR = 35;

    // Calculate gauge needle angle based on score (0-100 maps to 180-0 degrees)
    const angle = 180 - (displayScore / 100) * 180;
    const radians = (angle * Math.PI) / 180;
    const needleX = cx + needleR * Math.cos(radians);
    const needleY = cy - needleR * Math.sin(radians);

    // Calculate the arc endpoint for the fill based on score
    const fillRadians = (angle * Math.PI) / 180;
    const arcX = cx + r * Math.cos(fillRadians);
    const arcY = cy - r * Math.sin(fillRadians);
    const largeArc = displayScore > 50 ? 1 : 0;

    return (
        <div className="bg-carbon border border-white/10 rounded-xl p-6 md:p-8 relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full"></div>
            <div className="flex flex-col sm:flex-row justify-between items-start relative z-10 gap-4">
                <div>
                    <h3 className="text-lg font-bold mb-1">Business Health Meter</h3>
                    <p className={`${zoneColor} font-bold text-sm flex items-center gap-1`}>
                        <span className="material-symbols-outlined text-sm">emergency</span>
                        {zone}
                        {threatLabel && (
                            <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${isKhatra ? 'bg-alert-red/20 text-alert-red' :
                                isSavdhan ? 'bg-alert-orange/20 text-alert-orange' :
                                    'bg-neon-green/20 text-neon-green'
                                }`}>
                                {threatLabel}
                            </span>
                        )}
                    </p>
                </div>
                <div className="text-right">
                    <span className="text-5xl font-bold tracking-tighter text-white">
                        {score !== null ? displayScore : '—'}
                        <span className="text-white/20 text-2xl">/100</span>
                    </span>
                </div>
            </div>
            <div className="mt-8 flex flex-col items-center">
                <div className="relative w-full max-w-md">
                    <svg className="w-full" viewBox="0 0 100 62">
                        {/* Background track */}
                        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#1a1a1a" strokeLinecap="round" strokeWidth="8" />
                        {/* Filled arc */}
                        {displayScore > 0 && (
                            <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 ${largeArc} 1 ${arcX.toFixed(1)} ${arcY.toFixed(1)}`} fill="none" stroke={arcColor} strokeLinecap="round" strokeWidth="8" />
                        )}
                        {/* Needle */}
                        <line stroke="white" strokeLinecap="round" strokeWidth="2" x1={cx} x2={needleX.toFixed(1)} y1={cy} y2={needleY.toFixed(1)} />
                        <circle cx={cx} cy={cy} fill="white" r="3" />
                    </svg>
                </div>
                <div className="w-full text-center mt-6">
                    <h4 className="text-2xl font-bold text-white mb-2">
                        {months !== null ? (
                            <>Estimated Market Relevance: <span className={`${zoneColor} underline underline-offset-4`}>{displayMonths} Months</span></>
                        ) : (
                            <span className="text-white/40">Awaiting Assessment...</span>
                        )}
                    </h4>
                    <p className="text-white/60 max-w-lg mx-auto italic">&quot;{description}&quot;</p>
                </div>
            </div>
        </div>
    );
}
