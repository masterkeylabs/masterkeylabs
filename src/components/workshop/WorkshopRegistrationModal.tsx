"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle } from "lucide-react";

interface WorkshopRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const streams = [
    "AI & Machine Learning",
    "Web Development",
    "Data Science",
    "Cloud Computing",
    "Cybersecurity",
    "Mobile Development",
    "DevOps",
];

export default function WorkshopRegistrationModal({ isOpen, onClose }: WorkshopRegistrationModalProps) {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        contactNumber: "",
        stream: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const res = await fetch("/api/workshop", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Registration failed");
            }

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
                setFormData({ fullName: "", email: "", contactNumber: "", stream: "" });
                window.location.href = "/";
            }, 2000);
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
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--cyan-accent)]/5 via-transparent to-[var(--orange-glow)]/5 pointer-events-none" />

                        {success ? (
                            <div className="relative z-10 flex flex-col items-center justify-center p-20 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="mb-6"
                                >
                                    <CheckCircle className="w-24 h-24 text-[var(--cyan-accent)]" />
                                </motion.div>
                                <h2 className="text-4xl font-black mb-4 tracking-tighter silver-gradient-text uppercase">
                                    Congratulations!
                                    Welcome to the future. We'll get back to you soon.
                                </h2>
                                <p className="text-silver/60 text-[10px] font-black uppercase tracking-[0.3em]">
                                    You will be redirected to home page...
                                </p>
                            </div>
                        ) : (
                            <div className="relative z-10 p-10 md:p-16">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h2 className="text-4xl font-black uppercase tracking-tighter silver-gradient-text mb-2">
                                            AI Revolution Workshop
                                        </h2>
                                        <p className="text-silver/60 text-[10px] font-black uppercase tracking-[0.3em]">
                                            5 Days Intensive Training | Limited Seats
                                        </p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="text-silver/40 hover:text-white transition-colors p-2"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            required
                                            type="text"
                                            placeholder="FULL NAME"
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-[10px] font-black tracking-widest focus:outline-none focus:border-white transition-all text-white"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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

                                    <input
                                        required
                                        type="tel"
                                        placeholder="CONTACT NUMBER"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-[10px] font-black tracking-widest focus:outline-none focus:border-white transition-all text-white"
                                        value={formData.contactNumber}
                                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                    />

                                    <select
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-[10px] font-black tracking-widest focus:outline-none focus:border-white transition-all text-white"
                                        value={formData.stream}
                                        onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                                    >
                                        <option value="">SELECT YOUR STREAM</option>
                                        {streams.map((stream) => (
                                            <option key={stream} value={stream}>
                                                {stream}
                                            </option>
                                        ))}
                                    </select>

                                    {error && (
                                        <p className="text-red-500 text-[9px] font-black uppercase text-center tracking-widest">
                                            {error}
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="btn-cyan w-full py-4 font-black uppercase tracking-[0.3em] text-[10px] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? "REGISTERING..." : "REGISTER NOW"}
                                    </button>
                                </form>

                                <p className="text-silver/40 text-[8px] font-black uppercase tracking-[0.2em] text-center mt-6">
                                    🔒 Your data is secure. We don't share your information.
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
