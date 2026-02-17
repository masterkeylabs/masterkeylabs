'use client';
import { useState, useEffect, useCallback } from 'react';

export default function ExtinctionTimer({ targetDate }) {
    const calculateTimeLeft = useCallback(() => {
        const target = targetDate ? new Date(targetDate) : new Date(Date.now() + 540 * 24 * 60 * 60 * 1000);
        const difference = target - new Date();

        if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
        };
    }, [targetDate]);

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearInterval(timer);
    }, [calculateTimeLeft]);

    return (
        <div className="bg-black border-2 border-alert-red/20 rounded-xl p-8 glow-red flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-alert-red">timer</span>
                    <h3 className="text-xl font-bold uppercase tracking-tighter text-alert-red">Extinction Timer</h3>
                </div>
                <p className="text-white/50 max-w-sm">Time until projected market irrelevance if no survival action is taken. This is non-negotiable data.</p>
            </div>

            <div className="flex-1 flex justify-center w-full">
                <div className="flex gap-2 md:gap-4 items-start">
                    <div className="flex flex-col items-center">
                        <div className="bg-white/5 border border-white/10 rounded-lg min-w-[4rem] sm:min-w-[5.5rem] md:min-w-[7rem] h-16 sm:h-20 md:h-24 px-2 sm:px-4 flex items-center justify-center text-2xl sm:text-3xl md:text-5xl font-mono font-bold text-alert-orange tracking-tighter shadow-inner">
                            {timeLeft.days}
                        </div>
                        <span className="text-[8px] md:text-[10px] uppercase font-bold text-white/40 mt-2 tracking-widest">Days</span>
                    </div>
                    <div className="text-2xl sm:text-3xl md:text-5xl font-mono font-bold pt-3 sm:pt-4 text-alert-orange/50">:</div>
                    <div className="flex flex-col items-center">
                        <div className="bg-white/5 border border-white/10 rounded-lg w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center text-2xl sm:text-3xl md:text-5xl font-mono font-bold text-alert-orange tracking-tighter shadow-inner">
                            {timeLeft.hours.toString().padStart(2, '0')}
                        </div>
                        <span className="text-[8px] md:text-[10px] uppercase font-bold text-white/40 mt-2 tracking-widest">Hours</span>
                    </div>
                    <div className="text-2xl sm:text-3xl md:text-5xl font-mono font-bold pt-3 sm:pt-4 text-alert-orange/50">:</div>
                    <div className="flex flex-col items-center">
                        <div className="bg-white/5 border border-white/10 rounded-lg w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center text-2xl sm:text-3xl md:text-5xl font-mono font-bold text-alert-orange tracking-tighter shadow-inner">
                            {timeLeft.minutes.toString().padStart(2, '0')}
                        </div>
                        <span className="text-[8px] md:text-[10px] uppercase font-bold text-white/40 mt-2 tracking-widest">Mins</span>
                    </div>
                </div>
            </div>

            <div className="w-full md:w-auto flex justify-center md:justify-end">
                <button className="bg-primary hover:bg-cyan-400 text-background-dark px-8 py-4 md:px-10 md:py-5 rounded-lg font-black text-sm md:text-lg tracking-widest uppercase transition-all glow-cyan flex items-center gap-3 active:scale-95">
                    <span className="material-symbols-outlined">security</span>
                    Survival Protocol
                </button>
            </div>
        </div>
    );
}
