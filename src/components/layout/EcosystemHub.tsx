"use client";

import { motion } from "framer-motion";
import { Cpu, MessageSquare, Zap, Globe, Sparkles, Binary } from "lucide-react";

const integrations = [
    { name: "ChatGPT", icon: MessageSquare, color: "text-green-500", pos: "top-[-80%] left-[-120%]" },
    { name: "Claude", icon: Zap, color: "text-orange-500", pos: "top-[-20%] left-[-150%]" },
    { name: "Gemini", icon: Sparkles, color: "text-blue-400", pos: "bottom-[-20%] left-[-120%]" },
    { name: "DeepL", icon: Globe, color: "text-blue-600", pos: "top-[-80%] right-[-120%]" },
    { name: "HeyGen", icon: Binary, color: "text-purple-500", pos: "top-[-20%] right-[-150%]" },
    { name: "Midjourney", icon: Cpu, color: "text-white", pos: "bottom-[-20%] right-[-120%]" },
];

export default function EcosystemHub() {
    return (
        <section className="py-40 relative overflow-hidden bg-obsidian">
            {/* Ambient background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-electric/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="container mx-auto px-6 text-center relative z-10">
                <h2 className="text-4xl md:text-6xl font-black mb-24 tracking-tighter uppercase">
                    Unified AI <span className="text-electric">Ecosystem</span>
                </h2>

                <div className="relative max-w-4xl mx-auto h-[400px] flex items-center justify-center">
                    {/* Central Base */}
                    <motion.div
                        className="relative z-20 w-24 h-24 bg-white/5 border border-white/20 rounded-2xl flex items-center justify-center backdrop-blur-xl shadow-[0_0_50px_rgba(255,255,255,0.05)]"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <div className="w-12 h-12 bg-electric rounded-lg flex items-center justify-center animate-pulse">
                            <Cpu className="text-white w-8 h-8" />
                        </div>

                        {/* Pulsing rings around base */}
                        <div className="absolute inset-[-20px] border border-white/5 rounded-3xl animate-ping-slow opacity-20" />
                    </motion.div>

                    {/* Integration Nodes */}
                    {integrations.map((item, i) => (
                        <motion.div
                            key={i}
                            className={`absolute ${item.pos} z-10`}
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                        >
                            <div className="glass-card p-4 py-3 flex items-center gap-4 group cursor-pointer border-white/10 hover:border-electric/40 min-w-[180px]">
                                <div className={`w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center ${item.color} group-hover:bg-electric/20 transition-all`}>
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <span className="block text-xs font-black uppercase tracking-widest text-silver group-hover:text-white transition-colors">{item.name}</span>
                                    <span className="text-[8px] font-bold text-silver/30 uppercase tracking-tighter">Integration Ready</span>
                                </div>

                                {/* Connecting Line to Center (SVG) */}
                                <svg className="absolute pointer-events-none" style={{ width: '200px', height: '100px', overflow: 'visible', top: '50%', left: '50%' }}>
                                    {/* This is a simplified visual; for perfect lines we'd need dynamic coordinates */}
                                </svg>
                            </div>
                        </motion.div>
                    ))}

                    {/* Grid Overlay for technical feel */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] opacity-10 pointer-events-none" />
                </div>

                <p className="mt-32 text-silver/40 text-[10px] font-black uppercase tracking-[0.5em]">
                    Neural Bridge Interface v2.0 // Active Protocols
                </p>
            </div>
        </section>
    );
}
