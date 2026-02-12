"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import { useAuditData } from "@/lib/AuditDataContext";
import { Lock, Plus, Check, Info } from "lucide-react";

interface Module {
    id: string;
    name: string;
    chaos: number;
    impact: string;
}

const modules: Module[] = [
    { id: "sales", name: "Lead Lifecycle", chaos: 70, impact: "40% Zyaada Conversion" },
    { id: "ops", name: "Process Ops", chaos: 85, impact: "2.5x Tez Kaam" },
    { id: "customer", name: "Client Sync", chaos: 60, impact: "90% Autopilot" },
    { id: "data", name: "Data Intel", chaos: 90, impact: "Zero Latency" },
];

export default function EfficiencyNeuralMap() {
    const { isRegistered, openRegistration } = useAuth();
    const { updateAuditData } = useAuditData();
    const [selectedModules, setSelectedModules] = useState<string[]>([]);

    const systemOrder = useMemo(() => {
        if (selectedModules.length === 0) return 15;
        const baseOrder = 30;
        const bonus = selectedModules.length * 15;
        return Math.min(98, baseOrder + bonus);
    }, [selectedModules]);

    useEffect(() => {
        updateAuditData("efficiency", {
            selectedModules,
            systemOrder,
        });
    }, [selectedModules, systemOrder, updateAuditData]);

    const [nodes, setNodes] = useState<{ id: number; x: number; y: number; isHot: boolean }[]>([]);

    useEffect(() => {
        const generatedNodes = Array.from({ length: 50 }).map((_, i) => {
            const angle = (i / 50) * Math.PI * 2;
            const radius = 100 + Math.random() * 50;
            const disorder = (100 - systemOrder) / 100 * 180;
            return {
                id: i,
                x: Math.cos(angle) * (radius + (Math.random() - 0.5) * disorder),
                y: Math.sin(angle) * (radius + (Math.random() - 0.5) * disorder),
                isHot: Math.random() > (systemOrder / 100),
            };
        });
        setNodes(generatedNodes);
    }, [systemOrder]);

    const toggleModule = (id: string) => {
        setSelectedModules(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    return (
        <div className="flex flex-col lg:flex-row items-center gap-12 w-full">
            <div className="flex-1 flex flex-col items-center">
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 text-white w-full text-center lg:text-left">
                    Efficiency <span className="cyan-accent-text">Ka Naksha</span>
                </h3>

                <div className="relative w-[320px] h-[320px] lg:w-[400px] lg:h-[400px] mb-8 flex items-center justify-center">
                    <svg viewBox="-200 -200 400 400" className="w-full h-full overflow-visible">
                        {nodes.map((node, i) => {
                            const nextNode = nodes[(i + 1) % nodes.length];
                            return (
                                <motion.line
                                    key={`line-${i}`}
                                    x1={node.x}
                                    y1={node.y}
                                    x2={nextNode.x}
                                    y2={nextNode.y}
                                    stroke={systemOrder > 70 ? "var(--cyan-accent)" : "var(--orange-signal)"}
                                    strokeWidth={node.isHot ? "1" : "0.3"}
                                    animate={{
                                        opacity: [0.05, 0.2, 0.05],
                                        x1: node.x, y1: node.y, x2: nextNode.x, y2: nextNode.y
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            );
                        })}

                        {nodes.map((node) => (
                            <motion.circle
                                key={node.id}
                                cx={node.x}
                                cy={node.y}
                                r={node.isHot ? "3" : "1.5"}
                                fill={node.isHot ? "var(--orange-signal)" : "white"}
                                animate={{
                                    cx: node.x,
                                    cy: node.y,
                                    opacity: node.isHot ? [0.2, 0.8, 0.2] : [0.1, 0.4, 0.1],
                                    scale: node.isHot ? [1, 1.5, 1] : [1, 1.2, 1]
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                            />
                        ))}

                        <circle r="50" fill="white" fillOpacity="0.02" />
                        <motion.circle
                            r="40"
                            fill="url(#coreGradient)"
                            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
                            transition={{ duration: 4, repeat: Infinity }}
                        />
                        <defs>
                            <radialGradient id="coreGradient">
                                <stop offset="0%" stopColor="var(--cyan-accent)" />
                                <stop offset="100%" stopColor="transparent" />
                            </radialGradient>
                        </defs>
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <motion.span
                            key={systemOrder}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`${systemOrder > 70 ? "cyan-accent-text" : "orange-signal-text"} text-6xl font-black tabular-nums leading-none mb-1 shadow-cyan`}
                        >
                            {systemOrder}%
                        </motion.span>
                        <span className="text-[8px] font-black uppercase tracking-[0.4em] opacity-30 text-white">Efficiency Index</span>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-[400px] flex flex-col gap-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-silver/60">Module Assessment</span>
                        <span className="text-[10px] font-bold text-[var(--cyan-accent)] bg-[var(--cyan-accent)]/5 px-3 py-1 rounded-full">{selectedModules.length} Active</span>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {modules.map((mod) => (
                            <button
                                key={mod.id}
                                onClick={() => toggleModule(mod.id)}
                                className={`p-6 rounded-3xl border transition-all text-left group flex items-center justify-between ${selectedModules.includes(mod.id)
                                    ? "bg-[var(--cyan-accent)]/10 border-[var(--cyan-accent)] shadow-cyan"
                                    : "bg-white/5 border-white/5 hover:border-white/20"
                                    }`}
                            >
                                <div>
                                    <div className="text-xs font-black uppercase tracking-widest text-white mb-1 group-hover:cyan-accent-text transition-colors">{mod.name}</div>
                                    <div className="text-[8px] font-bold text-silver/40 uppercase tracking-widest">{mod.impact}</div>
                                </div>
                                <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${selectedModules.includes(mod.id)
                                    ? "bg-[var(--cyan-accent)] border-[var(--cyan-accent)] shadow-cyan"
                                    : "bg-transparent border-white/10"
                                    }`}>
                                    {selectedModules.includes(mod.id) ? (
                                        <Check className="w-4 h-4 text-black" />
                                    ) : (
                                        <Plus className="w-4 h-4 text-white/20" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-10 glass-card border-white/5 relative overflow-hidden group shadow-cyan/5">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4 text-[var(--cyan-accent)]">
                            <Info className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">ROI Optimization</span>
                        </div>

                        {selectedModules.length === 0 ? (
                            <p className="text-silver/40 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                Assess karein aapka <span className="text-white">Business Potential</span>. Modules select karein aur AI impact check karein.
                            </p>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex justify-between items-end border-b border-white/5 pb-6">
                                    <div>
                                        <div className="text-[8px] font-black uppercase tracking-widest text-silver/40 mb-1">Time Reclaimed</div>
                                        <div className="text-2xl font-black text-white">+{selectedModules.length * 280} Hrs/Yr</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[8px] font-black uppercase tracking-widest text-silver/40 mb-1">Efficiency Gain</div>
                                        <div className="text-2xl font-black cyan-accent-text">{(selectedModules.length * 20 + 10)}%</div>
                                    </div>
                                </div>

                                {!isRegistered ? (
                                    <button
                                        onClick={openRegistration}
                                        className="w-full py-5 btn-cyan flex items-center justify-center gap-4 shadow-cyan"
                                    >
                                        <Lock className="w-4 h-4 text-black" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-black">Full Report Karein</span>
                                    </button>
                                ) : (
                                    <div className="text-[10px] font-bold text-[var(--cyan-accent)] uppercase tracking-[0.3em] text-center bg-[var(--cyan-accent)]/10 py-3 rounded-xl border border-[var(--cyan-accent)]/20 animate-pulse">
                                        Roadmap Ready in Dashboard.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-[var(--cyan-accent)]/5 blur-3xl rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none" />
                </div>
            </div>
        </div>
    );
}
