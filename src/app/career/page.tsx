"use client";

import Header from "@/components/layout/Header";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Upload, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

export default function CareerPage() {
    const [status, setStatus] = useState<"IDLE" | "SUBMITTING" | "SUCCESS" | "ERROR">("IDLE");
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        vision: "",
        cvData: ""
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, cvData: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("SUBMITTING");

        try {
            const res = await fetch("/api/apply", {
                method: "POST",
                body: JSON.stringify(formData),
                headers: { "Content-Type": "application/json" }
            });

            console.log("Transmission Response Status:", res.status);

            if (res.ok) {
                setStatus("SUCCESS");
                setFormData({ fullName: "", email: "", vision: "", cvData: "" });
            } else {
                const data = await res.json();
                console.error("Submission failed with data:", data);
                alert(`Submission failed: ${data.details || data.error || 'Unknown error'}`);
                setStatus("ERROR");
            }
        } catch (err: any) {
            console.error("Network error during application submission:", {
                message: err.message,
                stack: err.stack,
                name: err.name
            });
            setStatus("ERROR");
        }
    };

    return (
        <main className="min-h-screen pt-32 bg-black pb-20">
            <Header />
            <div className="container mx-auto px-6 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--cyan-accent)]/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-3xl mx-auto relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-8xl font-black mb-10 tracking-tighter uppercase leading-[0.9]"
                    >
                        Future <br /><span className="dual-accent-text">Build Karein?</span>
                    </motion.h1>

                    <p className="text-lg md:text-xl text-silver/60 mb-20 font-bold uppercase tracking-widest max-w-2xl mx-auto">
                        Humein chahiye woh leaders jo kal ki technology aaj hi design kar sakein. <br />
                        <span className="text-white">Join the Neural Architects of Bharat.</span>
                    </p>

                    <div className="glass-card p-12 text-left shadow-cyan/20">
                        <AnimatePresence mode="wait">
                            {status === "SUCCESS" ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-20 text-center space-y-6"
                                >
                                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
                                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">Application Received!</h3>
                                        <p className="text-silver/60 text-sm font-bold uppercase tracking-widest">Humari team aapse jald hi contact karegi.</p>
                                    </div>
                                    <button
                                        onClick={() => setStatus("IDLE")}
                                        className="text-white bg-white/5 border border-white/10 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                                    >
                                        Apply for another role
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.form
                                    onSubmit={handleSubmit}
                                    className="space-y-8"
                                    initial={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-silver/40 px-1">Aapka Pura Naam</label>
                                            <input
                                                required
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                type="text"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:border-[var(--cyan-accent)] focus:bg-white/[0.08] outline-none transition-all text-white font-bold"
                                                placeholder="JOHN DOE"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-silver/40 px-1">Email ID</label>
                                            <input
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                type="email"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:border-[var(--cyan-accent)] focus:bg-white/[0.08] outline-none transition-all text-white font-bold"
                                                placeholder="JOHN@FUTURE.COM"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-silver/40 px-1">Aap Future kyun build karna chahte hain? (Your Vision)</label>
                                        <textarea
                                            required
                                            value={formData.vision}
                                            onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                                            rows={6}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:border-[var(--cyan-accent)] focus:bg-white/[0.08] outline-none transition-all text-white font-bold resize-none"
                                            placeholder="Tell us your mission..."
                                        ></textarea>
                                    </div>

                                    <div
                                        onClick={() => document.getElementById('cv-upload')?.click()}
                                        className={`p-10 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group ${formData.cvData ? 'border-[var(--cyan-accent)] bg-[var(--cyan-accent)]/5' : 'border-white/5 hover:border-[var(--cyan-accent)]/30 hover:bg-white/5'}`}
                                    >
                                        <input
                                            id="cv-upload"
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                        <Upload className={`${formData.cvData ? 'text-[var(--cyan-accent)]' : 'text-silver/40 group-hover:text-[var(--cyan-accent)]'} transition-colors w-10 h-10`} />
                                        <span className={`${formData.cvData ? 'text-white' : 'text-silver/30'} uppercase text-[10px] font-black tracking-[0.3em]`}>
                                            {formData.cvData ? 'CV Uploaded Successfully' : 'Drop your CV (PDF)'}
                                        </span>
                                    </div>

                                    <button
                                        disabled={status === "SUBMITTING"}
                                        type="submit"
                                        className="btn-cyan w-full py-6 flex items-center justify-center gap-4 text-sm shadow-cyan disabled:opacity-50"
                                    >
                                        {status === "SUBMITTING" ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                TRANSMITTING...
                                            </>
                                        ) : (
                                            <>
                                                SUBMIT APPLICATION
                                                <Send className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>

                                    {status === "ERROR" && (
                                        <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">Failed to connect to Neural Bridge. Try again.</p>
                                    )}
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </main>
    );
}
