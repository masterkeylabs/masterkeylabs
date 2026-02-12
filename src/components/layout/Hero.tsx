"use client";

import { motion } from "framer-motion";
import { ChevronRight, Play, Shield, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden">
            <div className="container mx-auto px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-6xl mx-auto"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/[0.03] border border-white/10 text-silver-light text-[10px] font-black tracking-[0.4em] uppercase mb-16 backdrop-blur-md"
                    >
                        <span className="w-2 h-2 rounded-full bg-[var(--cyan-accent)] animate-pulse shadow-cyan" />
                        Neural Bridge <span className="text-white">: Active Mode</span>
                    </motion.div>

                    <h1 className="massive-headline mb-10 leading-[0.9]">
                        <span className="dual-accent-text drop-shadow-[0_0_25px_rgba(0,245,255,0.2)]">Elite 1% League</span> <br />
                        <span className="text-white">ya Outdated History?</span>
                    </h1>

                    <p className="text-silver/60 text-lg md:text-2xl font-black uppercase tracking-widest mb-20 max-w-4xl mx-auto leading-tight border-l-2 border-r-2 border-[var(--cyan-accent)]/20 px-12">
                        Duniya tezi se badal rahi hai, <span className="orange-signal-text drop-shadow-[0_0_15px_var(--orange-glow)]">aap kab badlenge?</span> <br />
                        <span className="text-white/40 block mt-4 text-sm font-bold tracking-[0.3em]">Abhi action lein, Control Karein Apna Future.</span>
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-24">
                        <Link href="/#audit" className="btn-cyan flex items-center gap-4 group px-12 py-6 shadow-cyan text-xs font-black tracking-widest">
                            Safar Shuru Karein
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </Link>
                        <button className="btn-outline flex items-center gap-4 px-12 py-6 border-white/10 hover:border-[var(--orange-signal)] hover:shadow-orange group transition-all text-xs font-black tracking-widest">
                            <Play className="w-4 h-4 text-white group-hover:text-[var(--orange-signal)] fill-white/10" />
                            Intelligence Dekhein
                        </button>
                    </div>

                    <div className="pt-20 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-12 max-w-5xl mx-auto">
                        <div className="text-center group">
                            <div className="text-5xl font-black silver-gradient-text tracking-tighter group-hover:cyan-accent-text transition-colors">0.01s</div>
                            <div className="text-[9px] font-black uppercase tracking-[0.4em] mt-3 text-silver/40">Latency</div>
                        </div>
                        <div className="text-center group">
                            <div className="text-5xl font-black silver-gradient-text tracking-tighter group-hover:cyan-accent-text transition-colors">99.9%</div>
                            <div className="text-[9px] font-black uppercase tracking-[0.4em] mt-3 text-silver/40">Accuracy</div>
                        </div>
                        <div className="text-center group">
                            <div className="text-5xl font-black silver-gradient-text tracking-tighter group-hover:cyan-accent-text transition-colors">2.4B</div>
                            <div className="text-[9px] font-black uppercase tracking-[0.4em] mt-3 text-silver/40">Neural Syncs</div>
                        </div>
                        <div className="text-center group">
                            <div className="text-5xl font-black silver-gradient-text tracking-tighter group-hover:cyan-accent-text transition-colors">∞</div>
                            <div className="text-[9px] font-black uppercase tracking-[0.4em] mt-3 text-silver/40">Scale Potential</div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Backdrop Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--cyan-accent)]/[0.02] rounded-full blur-[150px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--cyan-accent)]/20 to-transparent" />
        </section>
    );
}
