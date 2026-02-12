"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Zap, Globe, Cpu, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { AuditDataProvider, useAuditData } from "@/lib/AuditDataContext";
import { useAuth } from "@/lib/AuthContext";
import SurvivalClock from "./SurvivalClock";
import EfficiencyNeuralMap from "./EfficiencyNeuralMap";
import FootprintHeatmap from "./FootprintHeatmap";
import MatrixScanner from "./MatrixScanner";
import SuccessScreen from "./SuccessScreen";

const tools = [
    { id: "survival", name: "Khatre ki Ghanti", icon: Clock, desc: "Industry kab khatam hogi?" },
    { id: "efficiency", name: "System Ka Naksha", icon: Zap, desc: "Neural efficiency audit" },
    { id: "presence", name: "Duniya ki Dhadkan", icon: Globe, desc: "Market resonance scan" },
    { id: "web", name: "Matrix Surgeon", icon: Cpu, desc: "Technical resilience check" },
];

function AuditSuiteInner() {
    const { user, isRegistered } = useAuth();
    const { auditData, clearAuditData } = useAuditData();
    const [activeTab, setActiveTab] = useState("survival");
    const [isFinalized, setIsFinalized] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async () => {
        if (!isRegistered || !user) {
            setIsFinalized(true);
            return;
        }
        setIsSaving(true);
        try {
            const tabs: Array<{ id: string; type: string; data: Record<string, unknown> }> = [
                { id: "survival", type: "Survival Clock", data: auditData.survival || {} },
                { id: "efficiency", type: "Efficiency Map", data: auditData.efficiency || {} },
                { id: "presence", type: "Digital Presence", data: auditData.presence || {} },
                { id: "web", type: "Matrix Scanner", data: auditData.web || {} },
            ];
            for (const tab of tabs) {
                if (Object.keys(tab.data).length > 0) {
                    await fetch("/api/audits", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            userEmail: user.email,
                            userName: user.name,
                            userCompany: user.company,
                            auditType: tab.type,
                            auditData: tab.data,
                        }),
                    });
                }
            }
            clearAuditData();
            setIsFinalized(true);
        } catch (err) {
            console.error("Failed to save audit:", err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <section id="audit" className="py-24 relative overflow-hidden">
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--cyan-accent)]/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 text-white text-[8px] font-black tracking-[0.5em] uppercase mb-8"
                    >
                        <ShieldCheck className="w-3 h-3 text-[var(--cyan-accent)]" />
                        Neural Protocol: <span className="text-[var(--cyan-accent)]">Active</span>
                    </motion.div>
                    <h2 className="text-4xl md:text-7xl font-black mb-6 tracking-tighter uppercase text-white">
                        System <span className="dual-accent-text">Diagnosis</span>
                    </h2>
                    <p className="text-silver/40 max-w-xl mx-auto uppercase text-[10px] font-bold tracking-[0.4em]">
                        Real-time analytics to safeguard your business legacy.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Navigation Bento */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-3">Diagnostic Shell</h2>
                            <p className="text-silver/40 text-[9px] font-black uppercase tracking-[0.3em]">Select a neural tool to begin scan.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {tools.map((tool) => (
                                <button
                                    key={tool.id}
                                    onClick={() => !isFinalized && setActiveTab(tool.id)}
                                    className={`group p-6 rounded-[2rem] border transition-all text-left relative overflow-hidden ${activeTab === tool.id
                                        ? "bg-white/10 border-[var(--cyan-accent)] shadow-cyan"
                                        : "bg-white/5 border-white/5 hover:border-white/20"
                                        } ${isFinalized ? "opacity-30 cursor-not-allowed" : ""}`}
                                >
                                    <div className="flex items-center gap-5 relative z-10">
                                        <div className={`p-4 rounded-2xl transition-all ${activeTab === tool.id ? "bg-[var(--cyan-accent)] text-black shadow-cyan" : "bg-white/5 text-silver"
                                            }`}>
                                            <tool.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-black uppercase tracking-widest text-white mb-1">{tool.name}</div>
                                            <div className="text-[9px] font-bold text-silver/40 uppercase tracking-widest leading-relaxed">{tool.desc}</div>
                                        </div>
                                    </div>

                                    {activeTab === tool.id && (
                                        <motion.div
                                            layoutId="glow"
                                            className="absolute inset-0 bg-gradient-to-r from-[var(--cyan-accent)]/10 to-transparent pointer-events-none"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {!isFinalized && (
                            <button
                                onClick={isRegistered && user ? handleSubmit : () => setIsFinalized(true)}
                                disabled={isSaving}
                                className="w-full mt-8 btn-cyan shadow-cyan flex items-center justify-center gap-4 py-8 group uppercase font-black tracking-[0.2em] text-xs disabled:opacity-70"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving Audit...
                                    </>
                                ) : (
                                    <>
                                        Submit for Neural Review
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Content Bento */}
                    <div className="lg:col-span-8">
                        <div className="glass-card min-h-[650px] p-8 md:p-16 relative flex flex-col justify-center border-white/5 shadow-inner">
                            {/* HUD Elements */}
                            <div className="absolute top-10 left-10 flex gap-4 opacity-10">
                                <div className="w-px h-10 bg-white" />
                                <div className="text-[9px] font-black uppercase tracking-[0.5em]">Diagnostic Core v2.4</div>
                            </div>

                            <AnimatePresence mode="wait">
                                {isFinalized ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.05 }}
                                    >
                                        <SuccessScreen />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        {activeTab === "survival" && <SurvivalClock />}
                                        {activeTab === "efficiency" && <EfficiencyNeuralMap />}
                                        {activeTab === "presence" && <FootprintHeatmap />}
                                        {activeTab === "web" && <MatrixScanner />}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="absolute bottom-12 right-12 flex items-center gap-6 opacity-20">
                                <div className="text-right">
                                    <div className="text-[8px] font-black uppercase tracking-[0.4em] mb-1">Status</div>
                                    <div className="text-[10px] font-black uppercase text-[var(--cyan-accent)]">Synchronized</div>
                                </div>
                                <img src="/branding-logo.png" alt="Logo" className="w-12 h-12 object-contain opacity-20 grayscale" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function AuditSuite() {
    return (
        <AuditDataProvider>
            <AuditSuiteInner />
        </AuditDataProvider>
    );
}
