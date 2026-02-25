'use client';
import { useState, useEffect, useRef } from 'react';

export default function ExtinctionTimer({ targetDate, t }) {
    // 540 days fallback ONLY for dev/demo rendering if no ISO targetDate is provided
    // eslint-disable-next-line react-hooks/purity
    const fallbackTarget = useRef(new Date(Date.now() + 540 * 24 * 60 * 60 * 1000).toISOString()).current;

    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const reqRef = useRef();

    useEffect(() => {
        // Enforce strict strictness by parsing target once and letting rAF handle the gap math natively
        const endTimestamp = new Date(targetDate || fallbackTarget).getTime();

        const updateTimer = () => {
            const now = Date.now();
            const difference = endTimestamp - now;

            if (difference <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            // Using pure math off the timestamp directly instead of repeatedly parsing dates
            setTimeLeft({
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            });

            // Re-request frame
            reqRef.current = requestAnimationFrame(updateTimer);
        };

        // Start animation loop
        reqRef.current = requestAnimationFrame(updateTimer);

        return () => {
            if (reqRef.current) cancelAnimationFrame(reqRef.current);
        };
    }, [targetDate, fallbackTarget]);

    return (
        <div className="system-card border border-white/5 p-8 flex flex-col lg:flex-row items-center justify-between gap-12 bg-white/[0.01]">
            <div className="flex-1 max-w-sm">
                <div className="flex items-center gap-2 mb-3">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#FFAB00', boxShadow: '0 0 10px #FFAB00, 0 0 20px #FFAB00' }}></span>
                    <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-white/40 leading-none">{t.dashboard.extinctionTimer.marketTTL}</h3>
                </div>
                <p className="text-[13px] text-white/30 font-medium leading-relaxed italic">
                    {t.dashboard.extinctionTimer.extinctionSub}
                </p>
            </div>

            <div className="flex items-center gap-8 lg:gap-12">
                <div className="flex items-baseline gap-2">
                    {/* Pulsing Copper Gold text shadow setup via custom style for robust rendering */}
                    <span
                        className="text-5xl font-black tracking-tight tabular-nums transition-all"
                        style={{ color: '#FFAB00', textShadow: '0 0 15px rgba(255, 171, 0, 0.4)' }}
                    >
                        {timeLeft.days}
                    </span>
                    <span className="text-[10px] font-bold text-white/10 uppercase tracking-widest">{t.dashboard.extinctionTimer.days}</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-white/80 tabular-nums">{timeLeft.hours.toString().padStart(2, '0')}</span>
                        <span className="text-[8px] font-bold text-white/10 uppercase tracking-widest">H</span>
                    </div>
                    <span className="text-3xl font-light text-white/10">:</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-white/80 tabular-nums">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                        <span className="text-[8px] font-bold text-white/10 uppercase tracking-widest">M</span>
                    </div>
                    <span className="text-3xl font-light text-white/10">:</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-[#FFAB00]/80 tabular-nums animate-pulse">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                        <span className="text-[8px] font-bold text-white/10 uppercase tracking-widest">S</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
