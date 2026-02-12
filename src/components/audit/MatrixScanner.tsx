"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import { useAuditData } from "@/lib/AuditDataContext";
import { Lock, Terminal } from "lucide-react";

export default function MatrixScanner() {
    const { isRegistered, openRegistration } = useAuth();
    const { updateAuditData } = useAuditData();
    const [url, setUrl] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        if (showResult && url) {
            updateAuditData("web", {
                url,
                metrics: { LCP: "0.8s", FID: "1.2ms", CLS: "0.01", Resilience: "High" },
            });
        }
    }, [showResult, url, updateAuditData]);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!isScanning) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = canvas.parentElement?.clientWidth || 600;
        canvas.height = 300;

        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#%&*+=@アイウエオカキクケコサシスセソタチツテトナニヌネノ";
        const fontSize = 12;
        const columns = canvas.width / fontSize;
        const drops: number[] = [];

        for (let i = 0; i < columns; i++) {
            drops[i] = 1;
        }

        const draw = () => {
            ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "rgba(0, 245, 255, 0.8)";
            ctx.shadowBlur = 15;
            ctx.shadowColor = "rgba(0, 245, 255, 0.5)";
            ctx.font = `bold ${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = characters.charAt(Math.floor(Math.random() * characters.length));
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.98) {
                    drops[i] = 0;
                }
                drops[i] += 0.8;
            }
        };

        const interval = setInterval(draw, 33);
        return () => clearInterval(interval);
    }, [isScanning]);

    const startScan = () => {
        if (!url) return;
        setIsScanning(true);
        setShowResult(false);
        setTimeout(() => {
            setIsScanning(false);
            setShowResult(true);
        }, 4000);
    };

    return (
        <div className="flex flex-col items-center text-center">
            <h3 className="text-3xl font-black uppercase tracking-tighter mb-12 text-white">
                Matrix <span className="cyan-accent-text">Surgeon</span>
            </h3>

            <div className="relative w-full max-w-2xl h-[320px] mb-12 overflow-hidden rounded-[2.5rem] border border-white/5 bg-black shadow-cyan/20">
                {isScanning && (
                    <canvas ref={canvasRef} className="absolute inset-0 z-10" />
                )}

                <AnimatePresence mode="wait">
                    {!isScanning && !showResult ? (
                        <motion.div
                            key="idle"
                            className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-white/20"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="relative">
                                <Terminal className="w-16 h-16 text-[var(--cyan-accent)] shadow-cyan" />
                                <motion.div
                                    className="absolute inset-0 bg-[var(--cyan-accent)]/20 blur-2xl rounded-full"
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.6em]">Initialize Surgery Protocals</span>
                        </motion.div>
                    ) : showResult && !isScanning && (
                        <motion.div
                            key="result"
                            className="absolute inset-0 flex items-center justify-center p-12 z-20"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-16 w-full">
                                {[
                                    { label: "LCP", value: "0.8s", color: "cyan-accent-text" },
                                    { label: "FID", value: "1.2ms", color: "text-white" },
                                    { label: "CLS", value: "0.01", color: "cyan-accent-text" },
                                    { label: "Resilience", value: "High", color: "orange-signal-text" },
                                ].map((m, i) => (
                                    <motion.div
                                        key={i}
                                        className="text-center group"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <div className={`text-4xl font-black tracking-tighter mb-2 ${m.color}`}>{m.value}</div>
                                        <div className="text-[9px] font-black uppercase tracking-[0.3em] text-silver/40">{m.label}</div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {isScanning && (
                    <motion.div
                        className="absolute inset-x-0 h-px bg-[var(--cyan-accent)] z-20 shadow-[0_0_30px_var(--cyan-accent)]"
                        animate={{ top: [0, 320, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                )}
            </div>

            <div className="w-full max-w-md space-y-10">
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="ENTER-SYSTEM-URL.EXE"
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-[10px] font-black tracking-[0.3em] focus:outline-none focus:border-[var(--cyan-accent)] transition-all text-white placeholder:text-white/10"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    <button
                        onClick={startScan}
                        disabled={isScanning || !url}
                        className="btn-cyan px-10 shadow-cyan uppercase font-black tracking-widest text-[10px]"
                    >
                        Surge
                    </button>
                </div>

                <div className="p-10 glass-card border-white/5 relative overflow-hidden group shadow-cyan/5">
                    <div className="relative z-10 flex items-center gap-6 text-left">
                        <div className="flex-1">
                            <p className="text-silver/60 text-lg font-black uppercase tracking-tighter mb-8 leading-tight">
                                "Speed ek khatarnaak hathiyar hai. <br />
                                <span className="text-white text-3xl font-bold tracking-tight">Legacy pe attack karein.</span>"
                            </p>

                            {!isRegistered ? (
                                <button
                                    onClick={openRegistration}
                                    className="w-full py-5 btn-outline flex items-center justify-center gap-4 transition-all"
                                >
                                    <Lock className="w-4 h-4 text-white" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Secure Code Analysis Unlock</span>
                                </button>
                            ) : (
                                <div className="text-[10px] font-bold text-[var(--cyan-accent)] uppercase tracking-[0.4em] text-center bg-[var(--cyan-accent)]/10 py-3 rounded-xl border border-[var(--cyan-accent)]/20 animate-pulse">
                                    Injection Protocol Ready.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
