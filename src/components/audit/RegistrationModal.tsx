"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, ChevronRight, Loader2 } from "lucide-react";
import type { User } from "@/lib/AuthContext";

interface RegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (user: User) => void;
}

export default function RegistrationModal({ isOpen, onClose, onSuccess }: RegistrationModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        company: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");
        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.details || data.error || "Registration failed");
            onSuccess({ name: formData.name, email: formData.email, phone: formData.phone, company: formData.company });
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Registration failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/95 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl bg-black border border-white/10 rounded-[2.5rem] overflow-hidden shadow-chrome"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-8 right-8 text-silver hover:text-white transition-colors z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="p-8 md:p-12">
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 bg-white flex items-center justify-center rounded-2xl mb-8 shadow-chrome">
                                    <Shield className="text-black w-8 h-8" />
                                </div>

                                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter silver-gradient-text mb-4 text-center">
                                    The Unfair Advantage Blueprint
                                </h2>
                                <p className="text-silver/60 text-[10px] font-black uppercase tracking-[0.3em] text-center mb-12">
                                    The path to the 1% is private. Secure your data to see your Blueprint.
                                </p>

                                <form onSubmit={handleSubmit} className="w-full space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            required
                                            type="text"
                                            placeholder="FULL NAME"
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-[10px] font-black tracking-widest focus:outline-none focus:border-white transition-all text-white"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                        <input
                                            required
                                            type="email"
                                            placeholder="BUSINESS EMAIL"
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-[10px] font-black tracking-widest focus:outline-none focus:border-white transition-all text-white"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            required
                                            type="tel"
                                            placeholder="PHONE NUMBER"
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-[10px] font-black tracking-widest focus:outline-none focus:border-white transition-all text-white"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                        <input
                                            required
                                            type="text"
                                            placeholder="COMPANY NAME"
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-[10px] font-black tracking-widest focus:outline-none focus:border-white transition-all text-white"
                                            value={formData.company}
                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        />
                                    </div>
                                    {error && (
                                        <p className="text-red-500 text-[10px] font-bold">{error}</p>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="btn-primary w-full py-5 text-[12px] mt-6 flex items-center justify-center gap-4"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                CRUNCHING DATA...
                                            </>
                                        ) : (
                                            <>
                                                GENERATE UNFAIR ADVANTAGE
                                                <ChevronRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <p className="text-[9px] text-silver/30 mt-8 text-center uppercase font-black tracking-[0.2em] leading-relaxed">
                                    Secure Transmission Protocol Active. <br />
                                    Your audit data is protected by corporate-grade encryption.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
