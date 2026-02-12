"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, ChevronRight, Loader2, CheckCircle2 } from "lucide-react";

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        company: "",
        preferredDate: "",
        preferredTime: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const response = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.details || "Failed to submit booking");
            }

            setIsSuccess(true);
            setTimeout(() => {
                onClose();
                setIsSuccess(false);
                setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    company: "",
                    preferredDate: "",
                    preferredTime: "",
                    message: "",
                });
            }, 2500);
        } catch (err: any) {
            console.error("Booking error:", err);
            setError(err.message || "Failed to submit booking. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            onClose();
            setError("");
            setIsSuccess(false);
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
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/95 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl bg-black border border-white/10 rounded-[2.5rem] overflow-hidden shadow-chrome"
                    >
                        <button
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="absolute top-8 right-8 text-silver hover:text-white transition-colors z-10 disabled:opacity-50"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="p-8 md:p-12">
                            {isSuccess ? (
                                <div className="flex flex-col items-center py-12">
                                    <div className="w-20 h-20 bg-[var(--cyan-accent)] rounded-full flex items-center justify-center mb-8 shadow-cyan">
                                        <CheckCircle2 className="w-10 h-10 text-black" />
                                    </div>
                                    <h2 className="text-3xl font-black uppercase tracking-tighter cyan-accent-text mb-4 text-center">
                                        Booking Confirmed!
                                    </h2>
                                    <p className="text-silver/60 text-[10px] font-black uppercase tracking-[0.3em] text-center">
                                        We'll contact you within 24 hours to confirm your deep dive session.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 bg-white flex items-center justify-center rounded-2xl mb-8 shadow-chrome">
                                        <Calendar className="text-black w-8 h-8" />
                                    </div>

                                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter silver-gradient-text mb-4 text-center">
                                        Book Your 60-Minute Deep Dive
                                    </h2>
                                    <p className="text-silver/60 text-[10px] font-black uppercase tracking-[0.3em] text-center mb-12">
                                        Schedule your strategy session with our AI transformation experts.
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input
                                                required
                                                type="date"
                                                placeholder="PREFERRED DATE"
                                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-[10px] font-black tracking-widest focus:outline-none focus:border-white transition-all text-white"
                                                value={formData.preferredDate}
                                                onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                            <select
                                                required
                                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-[10px] font-black tracking-widest focus:outline-none focus:border-white transition-all text-white"
                                                value={formData.preferredTime}
                                                onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                                            >
                                                <option value="">SELECT TIME SLOT</option>
                                                <option value="09:00 AM">09:00 AM</option>
                                                <option value="11:00 AM">11:00 AM</option>
                                                <option value="02:00 PM">02:00 PM</option>
                                                <option value="04:00 PM">04:00 PM</option>
                                            </select>
                                        </div>
                                        <textarea
                                            placeholder="ADDITIONAL MESSAGE (OPTIONAL)"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-[10px] font-black tracking-widest focus:outline-none focus:border-white transition-all text-white resize-none"
                                            rows={3}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        />

                                        {error && (
                                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                                <p className="text-sm text-red-500 font-bold">{error}</p>
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="btn-primary w-full py-5 text-[12px] mt-6 flex items-center justify-center gap-4"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    CONFIRMING BOOKING...
                                                </>
                                            ) : (
                                                <>
                                                    CONFIRM BOOKING
                                                    <ChevronRight className="w-5 h-5" />
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    <p className="text-[9px] text-silver/30 mt-8 text-center uppercase font-black tracking-[0.2em] leading-relaxed">
                                        Secure Booking Protocol Active. <br />
                                        Your information is protected by corporate-grade encryption.
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
