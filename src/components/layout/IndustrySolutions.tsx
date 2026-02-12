"use client";

import { motion } from "framer-motion";
import { Users, FileSearch, MessageCircle, BookOpen, Activity, ArrowRight } from "lucide-react";

const solutions = [
    { id: "01", title: "Job Design", desc: "Automated candidate-fit vacancy drafting.", icon: Users },
    { id: "02", title: "Candidate Scan", desc: "Neural matching of resumes to culture.", icon: FileSearch },
    { id: "03", title: "Intel-Interview", desc: "Dynamic questions based on AI profiling.", icon: MessageCircle },
    { id: "04", title: "Learning Paths", desc: "Personalized employee growth roadmaps.", icon: BookOpen },
];

export default function IndustrySolutions() {
    return (
        <section className="py-32 relative bg-obsidian">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-20 items-center">
                    <div className="lg:w-1/2">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                        >
                            <span className="text-electric font-black uppercase tracking-[0.3em] text-xs mb-4 block">Use Case Matrix</span>
                            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter uppercase">
                                AI-Driven <br /><span className="text-electric">HR Efficiency</span>
                            </h2>
                            <p className="text-silver/60 text-lg mb-8 leading-relaxed max-w-lg">
                                From recruitment automation to employee retention metrics. Transform your people operations into a data-driven engine.
                            </p>
                            <button className="btn-outline flex items-center gap-4 group">
                                Read Case Study
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    </div>

                    <div className="lg:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                        {/* Top Nodes */}
                        {solutions.map((sol, i) => (
                            <motion.div
                                key={i}
                                className="glass-card p-8 border-white/5 hover:bg-electric/5 group"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="flex justify-between mb-6">
                                    <span className="text-electric font-black text-xs opacity-50">{sol.id}</span>
                                    <sol.icon className="text-silver/30 group-hover:text-electric transition-colors" />
                                </div>
                                <h4 className="text-xl font-black uppercase tracking-tighter mb-2">{sol.title}</h4>
                                <p className="text-xs text-silver/40 font-bold uppercase tracking-widest leading-loose">
                                    {sol.desc}
                                </p>
                            </motion.div>
                        ))}

                        {/* eNPS Gauge (Representing card 05) */}
                        <motion.div
                            className="md:col-span-2 glass-card p-8 border-electric/20 flex flex-col md:flex-row items-center gap-12 bg-electric/5"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="58"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        className="text-white/5"
                                    />
                                    <motion.circle
                                        cx="64"
                                        cy="64"
                                        r="58"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        strokeDasharray="364.4"
                                        initial={{ strokeDashoffset: 364.4 }}
                                        whileInView={{ strokeDashoffset: 100 }}
                                        transition={{ duration: 2, ease: "easeOut" }}
                                        className="text-electric"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-black italic">eNPS</span>
                                    <span className="text-[10px] font-bold text-silver/60">+12.4%</span>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-2xl font-black uppercase tracking-tighter mb-2">Predictive Retention</h4>
                                <p className="text-sm text-silver/60 max-w-sm">
                                    AI-driven sentiment analysis to anticipate turnover and boost employee satisfaction scores.
                                </p>
                                <div className="flex gap-4 mt-6">
                                    <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-500 text-[8px] font-black uppercase rounded">Optimized</div>
                                    <div className="px-3 py-1 bg-white/5 border border-white/10 text-silver/40 text-[8px] font-black uppercase rounded">Neural Process</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
