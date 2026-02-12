"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, Search, Loader2, CheckCircle, Smartphone, BarChart, Lock } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function PresenceScanner() {
    const { isRegistered, openRegistration } = useAuth();
    const [handle, setHandle] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [scanStep, setScanStep] = useState(0);

    const steps = [
        "Indexing Social Proof...",
        "Analyzing Brand Authority...",
        "Querying SEO Global Rank...",
        "Verifying Domain Influence..."
    ];

    const handleScan = () => {
        setIsScanning(true);
        setScanStep(0);

        const interval = setInterval(() => {
            setScanStep(prev => {
                if (prev === steps.length - 1) {
                    clearInterval(interval);
                    setIsScanning(false);
                    setShowResult(true);
                    return prev;
                }
                return prev + 1;
            });
        }, 1200);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
                <h3 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <Globe className="text-electric" />
                    Global Presence Scanner
                </h3>
                <p className="text-silver mb-8 leading-relaxed">
                    Input your brand name or social handles to simulate a global authority scan.
                    The system will evaluate your visibility across major AI scraping engines.
                </p>

                <div className="space-y-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-silver/50" />
                        <input
                            type="text"
                            placeholder="Enter Brand Name or Handle (e.g. @brand)"
                            value={handle}
                            onChange={(e) => setHandle(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-electric transition-colors"
                        />
                    </div>

                    <button
                        onClick={handleScan}
                        disabled={!handle || isScanning}
                        className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
                    >
                        {isScanning ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Scanning...
                            </>
                        ) : "Initiate Global Scan"}
                    </button>
                </div>
            </div>

            <div className="relative">
                {!showResult && !isScanning ? (
                    <div className="aspect-square bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center justify-center p-8 text-center">
                        <Globe className="text-silver/20 w-16 h-16 mb-6" />
                        <p className="text-silver/40">Enter handles to start brand authority analysis</p>
                    </div>
                ) : isScanning ? (
                    <div className="aspect-square glass-panel p-8 flex flex-col items-center justify-center text-center">
                        <div className="relative w-32 h-32 mb-8">
                            <motion.div
                                className="absolute inset-0 border-2 border-electric rounded-full"
                                animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Search className="text-electric w-10 h-10" />
                            </div>
                        </div>
                        <h4 className="text-xl font-bold mb-2">{steps[scanStep]}</h4>
                        <p className="text-silver/60 animate-pulse">Running neural scan on {handle}...</p>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="aspect-square glass-panel p-8 flex flex-col justify-center border-electric/30"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-electric/10 rounded-2xl flex items-center justify-center">
                                <BarChart className="text-electric w-8 h-8" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold">{handle}</h4>
                                <p className="text-silver text-sm">Scan Complete</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                <span className="text-silver text-sm">Global Visibility Score</span>
                                <span className="text-electric font-black text-xl">74/100</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                <span className="text-silver text-sm">AI Index Rank</span>
                                <span className="text-silver font-bold">Top 12%</span>
                            </div>
                        </div>

                        <button
                            onClick={openRegistration}
                            className={`relative group overflow-hidden rounded-xl w-full transition-all ${isRegistered ? 'opacity-0 h-0 p-0 overflow-hidden' : 'opacity-100'}`}
                        >
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-md opacity-100 group-hover:opacity-0 transition-opacity" />
                            <div className="p-4 bg-white/5 border border-white/10 text-xs text-silver text-center">
                                Detailed semantic analysis & keyword footprint locked.
                            </div>
                            <div className="absolute inset-x-0 bottom-0 top-0 flex items-center justify-center pointer-events-none">
                                <Lock className="w-4 h-4 text-white" />
                            </div>
                        </button>
                        {isRegistered && (
                            <div className="p-4 bg-electric/10 border border-electric/20 rounded-xl text-xs text-electric text-center">
                                Full Semantic Profile Unlocked.
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
