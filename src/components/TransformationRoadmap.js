'use client';
import { motion } from 'framer-motion';

export default function TransformationRoadmap() {
    const steps = [
        {
            title: "Cloud Infrastructure Migration",
            description: "Transition legacy operations to secure, high-availability architecture.",
            icon: "cloud_sync",
            timeframe: "Week 1-2"
        },
        {
            title: "AI Workflow Automation",
            description: "Deploy autonomous systems to manage post-6PM inquiries and operational bleed.",
            icon: "memory",
            timeframe: "Week 3-4"
        },
        {
            title: "Performance & Visibility Scaling",
            description: "Inject data-driven marketing protocols to capture missed customer volumes.",
            icon: "rocket_launch",
            timeframe: "Week 5-6"
        }
    ];

    return (
        <div className="relative pt-4">
            {/* The vertical cyan timeline line */}
            <div className="absolute left-6 top-8 bottom-4 w-px bg-gradient-to-b from-ios-blue via-ios-blue/50 to-transparent"></div>

            <div className="space-y-10 relative z-10">
                {steps.map((step, idx) => (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: idx * 0.2 }}
                        key={idx}
                        className="flex gap-6 relative"
                    >
                        {/* Timeline Node */}
                        <div className="relative shrink-0">
                            <div className="w-12 h-12 rounded-full border border-ios-blue/30 bg-[#020617] flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.2)] z-10 relative">
                                <span className="material-symbols-outlined text-ios-blue text-[20px]">{step.icon}</span>
                            </div>
                            {/* Glowing dot effect */}
                            <div className="absolute inset-0 bg-ios-blue/20 blur-md rounded-full pointer-events-none"></div>
                        </div>

                        {/* Content */}
                        <div className="pt-1">
                            <div className="flex items-center gap-3 mb-1">
                                <h4 className="text-[15px] font-bold text-white tracking-wide">{step.title}</h4>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-ios-blue/60 border border-ios-blue/20 rounded px-2 py-0.5 bg-ios-blue/5">
                                    {step.timeframe}
                                </span>
                            </div>
                            <p className="text-[12px] text-white/50 leading-relaxed font-medium max-w-sm">
                                {step.description}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between"
            >
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-ios-cyan animate-pulse"></span>
                    <span className="text-[10px] font-bold text-ios-cyan uppercase tracking-widest">Systemic Cure</span>
                </div>
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Estimated ROI: 300%+</span>
            </motion.div>
        </div>
    );
}
