"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Shield, BarChart3, Zap, Globe, ArrowRight, Brain, Calendar } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import BookingModal from "./BookingModal";

export default function UserDashboard() {
    const { isRegistered } = useAuth();
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    if (!isRegistered) return null;

    const insights = [
        { label: "Efficiency Gain", value: "84%", trend: "+12.4%", desc: "Potential throughput increase with Neural Engines." },
        { label: "Market Resonance", value: "A+", trend: "Dominant", desc: "Global digital footprint score vs competitors." },
        { label: "Obsolescence", value: "2027", trend: "Critical", desc: "Estimated window for neural transition." },
    ];

    return (
        <section className="pt-32 pb-24 relative overflow-hidden bg-black">
            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 text-left">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 text-white text-[8px] font-black tracking-[0.5em] uppercase mb-6"
                        >
                            <Shield className="w-3 h-3 text-white" />
                            Client Portal | UNFAIR ADVANTAGE PROTOCOL
                        </motion.div>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter silver-gradient-text">
                            Your <span className="text-white">Blueprint</span>
                        </h2>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="text-[10px] font-black uppercase tracking-widest text-silver/40 mb-2">Access Level</div>
                        <div className="flex gap-2">
                            {[1, 1, 1, 0, 0].map((v, i) => (
                                <div key={i} className={`w-8 h-1 rounded-full ${v ? 'bg-white' : 'bg-white/10'}`} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {insights.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card p-10 border-white/5"
                        >
                            <div className="text-[10px] font-black uppercase tracking-widest text-silver/40 mb-2">{item.label}</div>
                            <div className="text-4xl font-black silver-gradient-text mb-4 tracking-tighter">{item.value}</div>
                            <div className="text-[10px] font-bold text-white mb-6 bg-white/5 py-1 px-3 rounded-full inline-block">{item.trend}</div>
                            <p className="text-[10px] text-silver/40 uppercase tracking-widest leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Locked Solutions Section */}
                    <div className="glass-card p-12 md:p-16 border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8">
                            <Lock className="w-12 h-12 text-white/5" />
                        </div>
                        <div className="relative z-10 blur-[10px] opacity-10 group-hover:blur-[15px] transition-all">
                            <div className="h-4 bg-white/20 w-3/4 mb-4 rounded" />
                            <div className="h-4 bg-white/20 w-1/2 mb-8 rounded" />
                            <div className="space-y-4">
                                <div className="h-20 bg-white/10 rounded-2xl" />
                                <div className="h-20 bg-white/10 rounded-2xl" />
                            </div>
                        </div>

                        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                            <div className="w-16 h-16 bg-white flex items-center justify-center rounded-2xl mb-8 shadow-chrome animate-pulse">
                                <Brain className="text-black w-8 h-8" />
                            </div>
                            <h4 className="text-2xl font-black uppercase tracking-tighter silver-gradient-text mb-4">Solution Engineered</h4>
                            <p className="text-silver/60 text-[10px] font-black uppercase tracking-[0.3em] mb-12 max-w-xs mx-auto">
                                We have found 3 major leaks in your current system. Unlock the audit to see the AI solutions we've engineered for you.
                            </p>
                            <button
                                onClick={() => setIsBookingModalOpen(true)}
                                className="btn-primary w-full py-6 flex items-center justify-center gap-4 group shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] transition-all"
                            >
                                <Calendar className="w-5 h-5" />
                                Book Your 60-Minute Deep Dive
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Progress Card */}
                    <div className="glass-card p-12 border-white/5 flex flex-col justify-center items-center text-center">
                        <div className="relative w-48 h-48 mb-12">
                            {/* Simple Circular Progress SVG */}
                            <svg className="w-full h-full rotate-[-90deg]">
                                <circle cx="96" cy="96" r="88" fill="transparent" stroke="white" strokeWidth="2" strokeOpacity="0.05" />
                                <motion.circle
                                    cx="96" cy="96" r="88"
                                    fill="transparent"
                                    stroke="white"
                                    strokeWidth="4"
                                    strokeDasharray="552.92"
                                    initial={{ strokeDashoffset: 552.92 }}
                                    animate={{ strokeDashoffset: 552.92 * 0.2 }}
                                    transition={{ duration: 2, ease: "easeOut" }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="text-4xl font-black silver-gradient-text">80%</div>
                                <div className="text-[8px] font-black uppercase tracking-widest text-silver/40">Complete</div>
                            </div>
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                                <Lock className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h4 className="text-xl font-black uppercase tracking-tighter text-white mb-2">Empire Building Blueprint</h4>
                        <p className="text-[10px] text-silver/40 uppercase tracking-widest max-w-xs mx-auto">
                            Your roadmap to the elite 1% is 80% calculated. Complete the Deep Dive to finalize the deployment.
                        </p>
                    </div>
                </div>
            </div>

            {/* Background Atmosphere */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-[150px] -z-10" />

            {/* Booking Modal */}
            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
            />
        </section>
    );
}
