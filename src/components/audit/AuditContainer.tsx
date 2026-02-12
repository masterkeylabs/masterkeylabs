"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Calculator, Globe, Laptop, Lock } from "lucide-react";
import SurvivalClock from "./SurvivalClock";
import EfficiencyCalculator from "./EfficiencyCalculator";
import PresenceScanner from "./PresenceScanner";
import WebPerformanceAudit from "./WebPerformanceAudit";

const tabs = [
    { id: "survival", name: "Survival Clock", icon: Clock },
    { id: "efficiency", name: "Efficiency Calc", icon: Calculator },
    { id: "presence", name: "Global Scanner", icon: Globe },
    { id: "web", name: "Web Audit", icon: Laptop },
];

export default function AuditContainer() {
    const [activeTab, setActiveTab] = useState("survival");

    return (
        <section id="audit" className="py-24 bg-obsidian relative">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tighter">
                        SURVIVAL AUDIT <span className="text-electric">SUITE</span>
                    </h2>
                    <p className="text-silver max-w-2xl mx-auto">
                        Analyze your business vulnerability and potential in the AI era.
                        Real-time data meets industry-level disruption metrics.
                    </p>
                </div>

                <div className="max-w-5xl mx-auto">
                    {/* Tabs */}
                    <div className="flex flex-wrap justify-center gap-2 mb-8 p-2 bg-white/5 rounded-2xl border border-white/10">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${activeTab === tab.id
                                            ? "bg-electric text-white shadow-[0_0_15px_rgba(0,102,255,0.4)]"
                                            : "text-silver hover:bg-white/5"
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="hidden sm:inline">{tab.name}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Content */}
                    <div className="glass-panel p-8 md:p-12 relative overflow-hidden min-h-[500px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                {activeTab === "survival" && <SurvivalClock />}
                                {activeTab === "efficiency" && <EfficiencyCalculator />}
                                {activeTab === "presence" && <PresenceScanner />}
                                {activeTab === "web" && <WebPerformanceAudit />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
}
