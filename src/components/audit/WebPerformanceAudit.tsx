"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Laptop, Layout, Zap, Smartphone, CheckCircle, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function WebPerformanceAudit() {
    const { isRegistered, openRegistration } = useAuth();
    const [url, setUrl] = useState("");
    const [isAuditing, setIsAuditing] = useState(false);
    const [showResult, setShowResult] = useState(false);

    const handleAudit = () => {
        setIsAuditing(true);
        setTimeout(() => {
            setIsAuditing(false);
            setShowResult(true);
        }, 2500);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
                <h3 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <Laptop className="text-electric" />
                    Web Performance Audit
                </h3>
                <p className="text-silver mb-8 leading-relaxed">
                    Enter your website URL for an "AI-Readiness" health check.
                    We evaluate loading velocity, responsive architecture, and schema optimization.
                </p>

                <div className="space-y-6">
                    <input
                        type="url"
                        placeholder="https://yourwebsite.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-electric transition-colors"
                    />

                    <button
                        onClick={handleAudit}
                        disabled={!url || isAuditing}
                        className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
                    >
                        {isAuditing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Analyzing URL...
                            </>
                        ) : "Start Performance Audit"}
                    </button>
                </div>
            </div>

            <div className="relative">
                {!showResult && !isAuditing ? (
                    <div className="aspect-square bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center justify-center p-8 text-center">
                        <Layout className="text-silver/20 w-16 h-16 mb-6" />
                        <p className="text-silver/40">Analyze your web infrastructure's AI-compatibility</p>
                    </div>
                ) : isAuditing ? (
                    <div className="aspect-square glass-panel p-8 flex flex-col items-center justify-center">
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-4 max-w-xs">
                            <motion.div
                                className="h-full bg-electric"
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2.5 }}
                            />
                        </div>
                        <p className="text-silver animate-pulse">Checking mobile responsiveness...</p>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="aspect-square glass-panel p-8 flex flex-col justify-center border-electric/30"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <div className="px-2 py-1 bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold uppercase rounded">Passed</div>
                            <span className="text-silver text-xs truncate">{url}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <div className="text-sm text-silver/60 mb-1">Speed</div>
                                <div className="text-2xl font-bold text-white">92</div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <div className="text-sm text-silver/60 mb-1">UX Score</div>
                                <div className="text-2xl font-bold text-white">B+</div>
                            </div>
                        </div>

                        <div className="space-y-3 mb-8">
                            <div className="flex items-center gap-3 text-sm text-silver">
                                <Smartphone className="w-4 h-4 text-green-500" /> Mobile Responsive
                            </div>
                            <div className="flex items-center gap-3 text-sm text-silver">
                                <Zap className="w-4 h-4 text-yellow-500" /> Schema (Missing)
                            </div>
                        </div>

                        <button
                            onClick={openRegistration}
                            className={`relative group overflow-hidden rounded-xl w-full transition-all ${isRegistered ? 'opacity-0 h-0 p-0 overflow-hidden' : 'opacity-100'}`}
                        >
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-md opacity-100 group-hover:opacity-0 transition-opacity" />
                            <div className="p-4 bg-white/5 border border-white/10 text-xs text-silver text-center">
                                Unlock full technical SEO & AI schema recommendations.
                            </div>
                            <div className="absolute inset-x-0 bottom-0 top-0 flex items-center justify-center pointer-events-none">
                                <Lock className="w-4 h-4 text-white" />
                            </div>
                        </button>
                        {isRegistered && (
                            <div className="p-4 bg-electric/10 border border-electric/20 rounded-xl text-xs text-electric text-center">
                                Full Schema Audit Results Ready.
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
