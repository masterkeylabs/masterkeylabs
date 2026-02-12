"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, AlertTriangle, TrendingDown, Users, DollarSign } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useAuditData } from "@/lib/AuditDataContext";

export default function SurvivalClock() {
    const { isRegistered, openRegistration } = useAuth();
    const { updateAuditData } = useAuditData();
    const [riskLevel, setRiskLevel] = useState(30);

    const getRiskZone = (level: number) => {
        if (level <= 30) return { zone: "Safe", color: "cyan", message: "Aapke paas abhi waqt hai" };
        if (level <= 60) return { zone: "Warning", color: "orange", message: "Competitors aage badh rahe hain" };
        return { zone: "Danger", color: "red", message: "Turant action zaroori hai" };
    };

    const risk = getRiskZone(riskLevel);

    useEffect(() => {
        updateAuditData("survival", {
            riskLevel,
            zone: risk.zone,
            message: risk.message,
        });
    }, [riskLevel, risk.zone, risk.message, updateAuditData]);

    const getImpactDetails = (level: number) => {
        if (level <= 30) {
            return {
                title: "Aap Safe Zone Mein Hain",
                impacts: [
                    { icon: Users, text: "Customers abhi bhi aapke saath hain", severity: "low" },
                    { icon: DollarSign, text: "Revenue stable hai", severity: "low" },
                    { icon: TrendingDown, text: "Market share maintain ho raha hai", severity: "low" }
                ],
                action: "Lekin jald hi AI adopt karna shuru karein taaki aage rahein"
            };
        } else if (level <= 60) {
            return {
                title: "Warning: Competitors Aage Badh Rahe Hain",
                impacts: [
                    { icon: Users, text: "15-25% customers competitors ki taraf ja rahe hain", severity: "medium" },
                    { icon: DollarSign, text: "Revenue mein 10-20% ki kami", severity: "medium" },
                    { icon: TrendingDown, text: "Market share ghatt raha hai", severity: "medium" }
                ],
                action: "Agle 3-6 mahine critical hain - abhi AI transformation shuru karein"
            };
        } else {
            return {
                title: "Khatre Ki Ghanti: Immediate Action Required",
                impacts: [
                    { icon: Users, text: "40-60% customers kho chuke hain ya kho rahe hain", severity: "high" },
                    { icon: DollarSign, text: "Revenue mein 30-50% ki bhaari kami", severity: "high" },
                    { icon: TrendingDown, text: "Market relevance khatam hone ke kareeb", severity: "high" }
                ],
                action: "Aapke business ko bachane ke liye ABHI transformation zaroori hai"
            };
        }
    };

    const impact = getImpactDetails(riskLevel);

    return (
        <div className="flex flex-col items-center text-center">
            <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 text-white">
                Khatre Ki <span className="orange-signal-text">Ghanti</span>
            </h3>
            <p className="text-sm text-silver/60 mb-12 max-w-2xl">
                Aapki industry kitni jaldi obsolete ho sakti hai? Yeh tool aapko dikhata hai ki competitors ke mukable aap kahan khade hain.
            </p>

            <div className="relative w-72 h-72 mb-16 flex items-center justify-center">
                <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90 overflow-visible">
                    <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <motion.circle
                        cx="100" cy="100" r="90" fill="none"
                        stroke={risk.zone === "Safe" ? "var(--cyan-accent)" : risk.zone === "Warning" ? "var(--orange-signal)" : "#ef4444"}
                        strokeWidth="4" strokeLinecap="round"
                        style={{ pathLength: riskLevel / 100, filter: `drop-shadow(0 0 ${riskLevel / 5}px ${risk.zone === "Safe" ? "var(--cyan-glow)" : "var(--orange-glow)"})` }}
                        transition={{ type: "spring", stiffness: 50 }}
                    />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                        className={`text-7xl font-black tabular-nums leading-none mb-2 ${risk.zone === "Safe" ? "cyan-accent-text" : "orange-signal-text"}`}
                        key={riskLevel}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        {riskLevel}%
                    </motion.span>
                    <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/30">Obsolescence Risk</span>
                </div>
            </div>

            <div className="w-full max-w-2xl space-y-8">
                <div className="space-y-6">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.4em]">
                        <span className="text-[var(--cyan-accent)]">Safe (0-30%)</span>
                        <span className="text-[var(--orange-signal)]">Warning (31-60%)</span>
                        <span className="text-red-500">Danger (61-100%)</span>
                    </div>
                    <input
                        type="range" min="0" max="100" value={riskLevel}
                        onChange={(e) => setRiskLevel(parseInt(e.target.value))}
                        className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-[var(--orange-signal)]"
                    />
                    <div className="text-center">
                        <span className={`text-lg font-black uppercase ${risk.zone === "Safe" ? "text-[var(--cyan-accent)]" : risk.zone === "Warning" ? "text-[var(--orange-signal)]" : "text-red-500"}`}>
                            {risk.zone} Zone: {risk.message}
                        </span>
                    </div>
                </div>

                <div className="p-8 glass-card border-white/5 text-left space-y-6">
                    <h4 className="text-xl font-black uppercase tracking-tighter text-white">{impact.title}</h4>

                    <div className="space-y-4">
                        {impact.impacts.map((item, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border-l-4" style={{ borderLeftColor: item.severity === "high" ? "#ef4444" : item.severity === "medium" ? "var(--orange-signal)" : "var(--cyan-accent)" }}>
                                <item.icon className={`w-5 h-5 mt-0.5 ${item.severity === "high" ? "text-red-500" : item.severity === "medium" ? "text-[var(--orange-signal)]" : "text-[var(--cyan-accent)]"}`} />
                                <p className="text-sm text-silver font-bold">{item.text}</p>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-[var(--orange-signal)]/10 border border-[var(--orange-signal)]/20 rounded-2xl">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-[var(--orange-signal)] mt-0.5" />
                            <div>
                                <p className="text-xs font-black uppercase tracking-wider text-[var(--orange-signal)] mb-2">Aapko Kya Karna Chahiye</p>
                                <p className="text-sm text-white font-bold">{impact.action}</p>
                            </div>
                        </div>
                    </div>

                    {!isRegistered ? (
                        <button onClick={openRegistration} className="w-full py-5 btn-orange flex items-center justify-center gap-4 shadow-orange/20">
                            <Lock className="w-4 h-4 text-white" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Detailed Analysis Unlock Karein</span>
                        </button>
                    ) : (
                        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                            <div className="text-[10px] font-bold text-[var(--cyan-accent)] uppercase tracking-[0.5em] mb-3">Aapki Industry Ke Liye Critical Timeline</div>
                            <div className="text-3xl font-black text-white tracking-tighter mb-3">Agle 6-12 Mahine</div>
                            <p className="text-sm text-silver/60">
                                Industry data ke hisaab se, aapke sector mein AI adoption tezi se badh raha hai.
                                Jo companies abhi transform nahi karengi, woh agle saal tak 40-50% market share kho dengi.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
