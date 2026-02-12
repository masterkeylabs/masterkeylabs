"use client";

import { motion } from "framer-motion";
import { ArrowRight, Lock, TrendingUp, Zap, Target, BarChart3 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function SuccessScreen() {
    const { openRegistration } = useAuth();

    const stats = [
        { label: "Revenue Gap", color: "from-white/10 to-white/5", icon: TrendingUp },
        { label: "Automation Potential", color: "from-white/10 to-white/5", icon: Zap },
        { label: "Competitor Threat", color: "from-white/10 to-white/5", icon: Target },
        { label: "Market Dominance Score", color: "from-white/10 to-white/5", icon: BarChart3 },
    ];

    return (
        <div className="flex flex-col items-center text-center py-12">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-12"
            >
                <img
                    src="/branding-logo.png"
                    alt="Masterkey Logo"
                    className="w-24 h-24 object-contain mx-auto mb-6 pulse-cyan"
                />
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter silver-gradient-text mb-4">
                    Success Profile Generated
                </h2>
                <p className="text-silver/40 text-[10px] font-black uppercase tracking-[0.4em] max-w-lg mx-auto">
                    Algorithm has identified 3 critical system leaks. Your Unfair Advantage Blueprint is ready.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mb-16">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-8 border-white/5 relative overflow-hidden group"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <stat.icon className="w-5 h-5 text-white/20" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-silver/60">{stat.label}</span>
                            </div>
                            <Lock className="w-4 h-4 text-white/10" />
                        </div>

                        {/* Blurred Graph Representation */}
                        <div className="h-24 flex items-end gap-2 px-4 blur-xl opacity-30 group-hover:opacity-50 transition-opacity">
                            {[40, 70, 45, 90, 65, 80, 55].map((h, j) => (
                                <div
                                    key={j}
                                    className="flex-1 bg-white"
                                    style={{ height: `${h}%` }}
                                />
                            ))}
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white bg-black/80 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">Secure Data to Unlock</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="w-full max-w-md">
                <button
                    onClick={openRegistration}
                    className="btn-primary w-full py-6 flex items-center justify-center gap-4 group"
                >
                    View Full Report
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="mt-6 text-[10px] font-bold text-silver/30 uppercase tracking-[0.2em]">
                    "The path to the 1% is private. Secure your data to see your Blueprint."
                </p>
            </div>
        </div>
    );
}
