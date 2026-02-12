"use client";

import { motion } from "framer-motion";
import { Shield, Database, Cpu, Globe, Zap, Network } from "lucide-react";

export default function OrbitalHub() {
    const nodes = [
        { icon: Database, label: "Data Architecture", angle: 0 },
        { icon: Cpu, label: "Neural Engine", angle: 72 },
        { icon: Globe, label: "Global Reach", angle: 144 },
        { icon: Shield, label: "Security Hub", angle: 216 },
        { icon: Zap, label: "Efficiency", angle: 288 },
    ];

    return (
        <div className="relative w-full aspect-square max-w-[600px] mx-auto flex items-center justify-center">
            {/* Central Hub */}
            <motion.div
                className="relative z-20 w-32 h-32 md:w-48 md:h-48 bg-electric rounded-full flex items-center justify-center shadow-[0_0_80px_rgba(0,102,255,0.6)]"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
            >
                <div className="absolute inset-0 bg-white/20 rounded-full animate-ping-slow" />
                <Network className="w-16 h-16 md:w-24 md:h-24 text-white" />
            </motion.div>

            {/* Orbital Rings */}
            <div className="absolute orbital-ring w-[60%] h-[60%]" />
            <div className="absolute orbital-ring w-[85%] h-[85%]" />
            <div className="absolute orbital-ring w-[110%] h-[110%] border-dashed border-white/10 animate-orbit" />

            {/* Peripheral Nodes */}
            {nodes.map((node, i) => {
                const angle = (node.angle * Math.PI) / 180;
                const radius = 42.5; // percent
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                    <motion.div
                        key={i}
                        className="absolute z-30"
                        style={{
                            left: `${50 + x}%`,
                            top: `${50 + y}%`,
                            transform: 'translate(-50%, -50%)'
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                    >
                        <div className="group relative flex flex-col items-center">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-obsidian-light border border-white/10 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:border-electric group-hover:shadow-[0_0_20px_rgba(0,102,255,0.3)]">
                                <node.icon className="w-6 h-6 md:w-8 md:h-8 text-silver group-hover:text-electric transition-colors" />
                            </div>
                            <span className="mt-3 text-[10px] md:text-xs font-bold text-silver/50 tracking-widest uppercase group-hover:text-white transition-colors">
                                {node.label}
                            </span>

                            {/* Connecting Line (CSS visualization) */}
                            <div
                                className="absolute z-10 w-px bg-gradient-to-t from-electric/40 to-transparent top-full"
                                style={{
                                    height: '40px',
                                    transform: `rotate(${node.angle + 90}deg)`,
                                    transformOrigin: 'top center',
                                    opacity: 0.3
                                }}
                            />
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
