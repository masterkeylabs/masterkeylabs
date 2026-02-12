"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, Users, Zap, Search, Lock } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function EfficiencyCalculator() {
    const { isRegistered, openRegistration } = useAuth();
    const [staff, setStaff] = useState(10);
    const [manualTasks, setManualTasks] = useState(50);
    const [showResult, setShowResult] = useState(false);

    // Efficiency = (Automated Tasks * 100) / Total Tasks
    // We mock the automated tasks based on staff and current manual task %
    const currentEfficiency = 100 - manualTasks;
    const optimizedEfficiency = 92; // AI-Optimized standard

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
                <h3 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <Calculator className="text-electric" />
                    Efficiency Calc
                </h3>
                <p className="text-silver mb-8 leading-relaxed">
                    Measure your current operational throughput against an AI-orchestrated infrastructure.
                    Use the sliders to calibrate your current team size and manual workload.
                </p>

                <div className="space-y-8">
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-bold text-silver uppercase tracking-widest flex items-center gap-2">
                                <Users className="w-4 h-4" /> Current Staff
                            </label>
                            <span className="text-electric font-bold">{staff} Members</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="500"
                            value={staff}
                            onChange={(e) => setStaff(parseInt(e.target.value))}
                            className="w-full accent-electric bg-white/10 rounded-lg h-2"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-bold text-silver uppercase tracking-widest flex items-center gap-2">
                                <Zap className="w-4 h-4" /> Manual Tasks (%)
                            </label>
                            <span className="text-electric font-bold">{manualTasks}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={manualTasks}
                            onChange={(e) => setManualTasks(parseInt(e.target.value))}
                            className="w-full accent-electric bg-white/10 rounded-lg h-2"
                        />
                    </div>

                    <button
                        onClick={() => setShowResult(true)}
                        className="btn-primary w-full py-4 text-lg"
                    >
                        Analyze Efficiency Gap
                    </button>
                </div>
            </div>

            <div className="relative">
                {!showResult ? (
                    <div className="aspect-square bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center justify-center p-8 text-center">
                        <Calculator className="text-silver/20 w-16 h-16 mb-6" />
                        <p className="text-silver/40">Calibrate sliders to view efficiency analytics</p>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="aspect-square glass-panel p-8 flex flex-col justify-center border-electric/30"
                    >
                        <div className="mb-8">
                            <h4 className="text-silver text-xs font-bold uppercase tracking-widest mb-4">Performance Comparison</h4>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>Current Efficiency</span>
                                        <span className="text-red-400 font-bold">{currentEfficiency}%</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${currentEfficiency}%` }}
                                            className="bg-red-500 h-full"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>AI-Optimized</span>
                                        <span className="text-electric font-bold">{optimizedEfficiency}%</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${optimizedEfficiency}%` }}
                                            className="bg-electric h-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-electric/10 border border-electric/20 rounded-2xl mb-8">
                            <div className="text-3xl font-black text-white mb-1">
                                +{optimizedEfficiency - currentEfficiency}%
                            </div>
                            <div className="text-sm text-silver">Potential Growth in Output</div>
                        </div>

                        <button
                            onClick={openRegistration}
                            className={`relative group overflow-hidden rounded-xl w-full transition-all ${isRegistered ? 'opacity-0 h-0 p-0 overflow-hidden' : 'opacity-100'}`}
                        >
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-md opacity-100 group-hover:opacity-0 transition-opacity" />
                            <div className="p-4 bg-white/5 border border-white/10 text-xs text-silver text-center">
                                Unlock workforce optimization roadmap.
                            </div>
                            <div className="absolute inset-x-0 bottom-0 top-0 flex items-center justify-center pointer-events-none">
                                <Lock className="w-4 h-4 text-white" />
                            </div>
                        </button>
                        {isRegistered && (
                            <div className="p-4 bg-electric/10 border border-electric/20 rounded-xl text-xs text-electric text-center">
                                AI Optimization Roadmap Generated. Check your email.
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
