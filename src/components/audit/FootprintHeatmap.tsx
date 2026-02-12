"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import { useAuditData } from "@/lib/AuditDataContext";
import { Lock, Search, Globe, Facebook, Instagram, Linkedin, Star, Users, TrendingUp, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

type Platform = {
    name: string;
    icon: any;
    status: "strong" | "weak" | "missing";
    metric: string;
    detail: string;
    color: string;
};

export default function FootprintHeatmap() {
    const { isRegistered, openRegistration } = useAuth();
    const { updateAuditData } = useAuditData();
    const [brand, setBrand] = useState("");
    const [scanState, setScanState] = useState<"IDLE" | "SCANNING" | "RESULT">("IDLE");
    const [scanProgress, setScanProgress] = useState(0);

    const platforms: Platform[] = [
        { name: "Google Business", icon: Search, status: "weak", metric: "2.8 ★ Rating", detail: "Sirf 12 reviews hain - competitors ke 50+ hain", color: "orange" },
        { name: "Facebook", icon: Facebook, status: "missing", metric: "Page Nahi Hai", detail: "Aapke competitors ke 5000+ followers hain", color: "red" },
        { name: "Instagram", icon: Instagram, status: "weak", metric: "340 Followers", detail: "Last post 3 mahine pehle - engagement bahut kam", color: "orange" },
        { name: "LinkedIn", icon: Linkedin, status: "strong", metric: "Company Page Active", detail: "850 followers, regular updates", color: "cyan" },
        { name: "Website", icon: Globe, status: "weak", metric: "Slow Loading", detail: "Mobile par 6 sec load time - 60% visitors chale jaate hain", color: "orange" },
    ];

    const overallScore = platforms.filter(p => p.status === "strong").length;
    const totalPlatforms = platforms.length;

    useEffect(() => {
        if (scanState === "RESULT" && brand) {
            updateAuditData("presence", {
                brand,
                score: `${overallScore}/${totalPlatforms}`,
                platforms: platforms.map(p => ({ name: p.name, status: p.status })),
            });
        }
    }, [scanState, brand, overallScore, totalPlatforms, updateAuditData]);

    const startScan = () => {
        if (!brand) return;
        setScanState("SCANNING");
        setScanProgress(0);

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => setScanState("RESULT"), 500);
            }
            setScanProgress(progress);
        }, 300);
    };

    const getStatusIcon = (status: string) => {
        if (status === "strong") return <CheckCircle2 className="w-5 h-5 text-[var(--cyan-accent)]" />;
        if (status === "weak") return <AlertCircle className="w-5 h-5 text-[var(--orange-signal)]" />;
        return <XCircle className="w-5 h-5 text-red-500" />;
    };

    return (
        <div className="flex flex-col items-center w-full">
            <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 text-white">
                Digital <span className="cyan-accent-text">Presence</span> Check
            </h3>
            <p className="text-sm text-silver/60 mb-12 max-w-2xl text-center">
                Aapki online presence kitni strong hai? Dekho ki aap important platforms par kahan khade ho.
            </p>

            <div className="w-full max-w-4xl space-y-8">
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="APNA BRAND NAME ENTER KAREIN"
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-[10px] font-black tracking-[0.3em] focus:outline-none focus:border-[var(--cyan-accent)] transition-all text-white placeholder:text-white/20"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                    />
                    <button
                        onClick={startScan}
                        disabled={scanState === "SCANNING" || !brand}
                        className="btn-cyan px-10 shadow-cyan uppercase font-black tracking-widest text-[10px]"
                    >
                        Scan Karein
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {scanState === "SCANNING" && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="glass-card p-12 border-white/5"
                        >
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-6">
                                <motion.div
                                    className="h-full bg-[var(--cyan-accent)] shadow-cyan"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${scanProgress}%` }}
                                />
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white text-center">
                                {scanProgress < 30 ? "Google par search kar rahe hain..." : scanProgress < 60 ? "Social media platforms check kar rahe hain..." : "Final analysis kar rahe hain..."}
                            </div>
                        </motion.div>
                    )}

                    {scanState === "RESULT" && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            <div className="glass-card p-8 border-white/5">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h4 className="text-2xl font-black text-white mb-2">Overall Digital Score</h4>
                                        <p className="text-sm text-silver/60">Aapki platforms par presence</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-5xl font-black cyan-accent-text">{overallScore}/{totalPlatforms}</div>
                                        <div className="text-xs text-silver/40 uppercase tracking-wider mt-1">Platforms Strong</div>
                                    </div>
                                </div>

                                {overallScore < 3 && (
                                    <div className="p-4 bg-[var(--orange-signal)]/10 border border-[var(--orange-signal)]/20 rounded-xl">
                                        <p className="text-sm text-white font-bold">
                                            ⚠️ Warning: Aapki digital presence weak hai. Customers aapko online nahi dhundh pa rahe!
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {platforms.map((platform, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className={`glass-card p-6 border-l-4 ${platform.status === "strong" ? "border-[var(--cyan-accent)]" :
                                                platform.status === "weak" ? "border-[var(--orange-signal)]" :
                                                    "border-red-500"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <platform.icon className={`w-6 h-6 ${platform.status === "strong" ? "text-[var(--cyan-accent)]" :
                                                        platform.status === "weak" ? "text-[var(--orange-signal)]" :
                                                            "text-red-500"
                                                    }`} />
                                                <h5 className="text-sm font-black text-white uppercase tracking-wider">{platform.name}</h5>
                                            </div>
                                            {getStatusIcon(platform.status)}
                                        </div>

                                        <div className={`text-2xl font-black mb-2 ${platform.status === "strong" ? "text-[var(--cyan-accent)]" :
                                                platform.status === "weak" ? "text-[var(--orange-signal)]" :
                                                    "text-red-500"
                                            }`}>
                                            {platform.metric}
                                        </div>

                                        <p className="text-xs text-silver/60 leading-relaxed">{platform.detail}</p>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="glass-card p-8 border-white/5">
                                <h4 className="text-xl font-black text-white mb-6 uppercase tracking-tight">Aapko Kya Karna Chahiye</h4>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl">
                                        <div className="w-6 h-6 rounded-full bg-[var(--cyan-accent)] flex items-center justify-center text-black font-black text-xs flex-shrink-0">1</div>
                                        <p className="text-sm text-silver">
                                            <span className="text-white font-bold">Google Business Profile complete karein</span> - Reviews badhao, photos add karo
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl">
                                        <div className="w-6 h-6 rounded-full bg-[var(--cyan-accent)] flex items-center justify-center text-black font-black text-xs flex-shrink-0">2</div>
                                        <p className="text-sm text-silver">
                                            <span className="text-white font-bold">Facebook page banao</span> - Competitors se peeche mat raho
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl">
                                        <div className="w-6 h-6 rounded-full bg-[var(--cyan-accent)] flex items-center justify-center text-black font-black text-xs flex-shrink-0">3</div>
                                        <p className="text-sm text-silver">
                                            <span className="text-white font-bold">Website speed optimize karo</span> - Slow website = customers ka loss
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {!isRegistered ? (
                                <button
                                    onClick={openRegistration}
                                    className="w-full py-6 btn-cyan shadow-cyan flex items-center justify-center gap-4"
                                >
                                    <Lock className="w-4 h-4 text-black" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black">Detailed Strategy Report Unlock Karein</span>
                                </button>
                            ) : (
                                <div className="p-8 bg-white/5 border border-[var(--cyan-accent)]/20 rounded-2xl text-center">
                                    <div className="text-[11px] font-black cyan-accent-text uppercase tracking-[0.5em] animate-pulse">Platform Optimization Strategy Unlocked</div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {scanState === "IDLE" && (
                        <div className="h-[400px] flex items-center justify-center border border-white/5 rounded-3xl border-dashed bg-white/[0.01]">
                            <div className="text-center">
                                <Globe className="w-16 h-16 mx-auto mb-6 text-[var(--cyan-accent)] opacity-20" />
                                <div className="text-[12px] font-black uppercase tracking-[0.6em] text-silver/20">Apna brand name enter karke scan karein</div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
