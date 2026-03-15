'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

export default function RescueArchitecture({ businessId, t }) {
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [dynamicSlots, setDynamicSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isFetchingSlots, setIsFetchingSlots] = useState(true);

    useEffect(() => {
        const fetchSlots = async () => {
            try {
                const res = await fetch('/api/google-calendar');
                const data = await res.json();
                if (data.availableSlots) {
                    setDynamicSlots(data.availableSlots);
                    setSelectedSlot(data.availableSlots[0]);
                }
            } catch (err) {
                console.error("Failed to fetch calendar slots", err);
            } finally {
                setIsFetchingSlots(false);
            }
        };
        fetchSlots();
    }, []);

    const rescueT = t?.dashboard?.rescue || {
        badge: "Protocol Override Available",
        title1: "Stop bleeding capital.",
        title2: "Claim your unfair advantage.",
        sub: "Your algorithmic diagnostic is complete. Book a secure session with a MasterKey System Architect to decipher your custom growth infrastructure.",
        founders: "Join 150+ Founders",
        deploying: "Deploying systems today",
        booking: {
            title: "Schedule Architecture Review",
            slot: "45 Min Slot",
            times: {
                today: "Today",
                tmrw: "Tmrw"
            },
            btn: {
                idle: "Book System Architect",
                loading: "Securing Slot...",
                success: "Slot Confirmed",
                error: "System Error"
            }
        }
    };

    const handleBooking = async () => {
        if (!selectedSlot) return;
        
        setStatus('loading');

        try {
            // 1. Create Google Calendar Event
            const calRes = await fetch('/api/google-calendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    startTime: selectedSlot.start,
                    endTime: selectedSlot.end,
                    summary: `Architecture Review - Business ID: ${businessId || 'N/A'}`,
                    description: `Automated booking from MasterKey Diagnostic Terminal.`,
                }),
            });

            if (!calRes.ok) throw new Error('Failed to create calendar event');

            // 2. Log Intent in Supabase
            if (businessId) {
                const { error } = await supabase.from('intent_logs').insert({
                    business_id: businessId,
                    intent: 'Intent to Buy',
                    source: 'RescueArchitecture',
                    metadata: { slot: selectedSlot }
                });

                if (error && error.code !== '42P01') {
                    console.error("Supabase booking error", error);
                }
            }

            setStatus('success');
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -50px 0px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="w-full relative flex flex-col items-center z-20 mb-8"
            id="schedule-review"
        >
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#020617]/90 backdrop-blur-2xl p-1 shadow-[0_0_120px_rgba(0,122,255,0.15)] w-full">
                {/* Visual Flair */}
                <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute -top-40 right-0 w-[600px] h-[600px] bg-ios-blue/10 blur-[120px] rounded-full pointer-events-none"></div>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 p-8 md:p-14 items-center">

                    {/* Copy Section */}
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ios-blue/10 border border-ios-blue/20">
                            <span className="w-2 h-2 rounded-full bg-ios-blue animate-pulse shadow-[0_0_10px_#00E5FF]"></span>
                            <span className="text-[10px] font-bold text-ios-blue uppercase tracking-widest">{rescueT.badge}</span>
                        </div>

                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-[1.1] text-balance">
                            {rescueT.title1}<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ios-blue to-cyan-300 drop-shadow-[0_0_15px_rgba(0,229,255,0.3)]">
                                {rescueT.title2}
                            </span>
                        </h2>

                        <p className="text-white/50 text-sm md:text-base max-w-md leading-relaxed">
                            {rescueT.sub}
                        </p>

                        <div className="flex gap-4 pt-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className={`size-10 rounded-full border-2 border-[#020617] bg-white/5 flex items-center justify-center`}>
                                        <span className="material-symbols-outlined text-[16px] text-white/40">person</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col justify-center">
                                <span className="text-xs font-bold text-white tracking-wider">{rescueT.founders}</span>
                                <span className="text-[10px] text-white/40 uppercase tracking-widest">{rescueT.deploying}</span>
                            </div>
                        </div>
                    </div>

                    {/* Booking Interface */}
                    <div className="glass rounded-2xl p-6 md:p-8 border border-white/10 bg-black/40 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50 pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="border-b border-white/5 pb-4 mb-6 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-white/40">calendar_month</span>
                                    <span className="text-white font-bold tracking-wide">{rescueT.booking.title}</span>
                                </div>
                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest border border-white/10 px-2 py-1 rounded-md">{rescueT.booking.slot}</span>
                            </div>

                            <div className="space-y-4 mb-8">
                                {/* Stylized calendar slots */}
                                <div className="grid grid-cols-3 gap-3">
                                    {isFetchingSlots ? (
                                        [1, 2, 3].map(i => (
                                            <div key={i} className="p-3 rounded-xl border border-white/5 bg-white/5 animate-pulse h-[68px]"></div>
                                        ))
                                    ) : dynamicSlots.length > 0 ? (
                                        dynamicSlots.map((slot, i) => {
                                            const [day, time] = slot.label.split(', ');
                                            const isSelected = selectedSlot?.start === slot.start;
                                            return (
                                                <div 
                                                    key={i} 
                                                    onClick={() => setSelectedSlot(slot)}
                                                    className={`p-3 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all ${isSelected ? 'bg-ios-blue/10 border-ios-blue/30 text-ios-blue' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white/80'}`}
                                                >
                                                    <span className="text-[10px] md:text-[11px] font-bold tracking-wider uppercase">{day}</span>
                                                    <span className="text-[10px] md:text-xs font-medium mt-1 whitespace-nowrap">{time}</span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="col-span-3 text-center py-4 text-white/20 text-[10px] uppercase tracking-widest border border-dashed border-white/10 rounded-xl">
                                            No slots available
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handleBooking}
                                disabled={status === 'loading' || status === 'success'}
                                className={`w-full py-4.5 rounded-xl flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-widest transition-all ${status === 'success'
                                    ? 'bg-ios-cyan/20 text-ios-cyan border border-ios-cyan/30'
                                    : 'ios-button-primary bg-ios-blue shadow-[0_0_20px_rgba(0,122,255,0.3)] hover:shadow-[0_0_30px_rgba(0,122,255,0.5)] border border-transparent hover:scale-[1.02] active:scale-[0.98]'
                                    }`}
                            >
                                {status === 'idle' && (
                                    <>
                                        <span className="material-symbols-outlined text-[18px]">engineering</span>
                                        {rescueT.booking.btn.idle}
                                    </>
                                )}
                                {status === 'loading' && (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                                        {rescueT.booking.btn.loading}
                                    </>
                                )}
                                {status === 'success' && (
                                    <>
                                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                        {rescueT.booking.btn.success}
                                    </>
                                )}
                                {status === 'error' && (
                                    <>
                                        <span className="material-symbols-outlined text-[18px]">warning</span>
                                        {rescueT.booking.btn.error}
                                    </>
                                )}
                            </button>

                            <p className="text-[9px] text-center text-white/30 mt-4 leading-relaxed tracking-wider uppercase">
                                No sales pitch. No strings attached.<br />
                                Just a technical blueprint for your survival.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
