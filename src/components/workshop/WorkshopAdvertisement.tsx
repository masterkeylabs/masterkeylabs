"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { QrCode, Zap } from "lucide-react";
import WorkshopRegistrationModal from "./WorkshopRegistrationModal";

export default function WorkshopAdvertisement() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <section className="py-32 relative overflow-hidden bg-gradient-to-r from-[var(--cyan-accent)]/10 via-transparent to-[var(--orange-glow)]/10 border-y border-white/5">
                {/* Background Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[var(--cyan-accent)]/5 blur-[150px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[var(--orange-glow)]/5 blur-[150px] rounded-full pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
                        {/* Left: Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <Zap className="w-6 h-6 text-[var(--orange-glow)]" />
                                <span className="text-[9px] font-black uppercase tracking-[0.5em] text-silver/40">LIMITED SEATS</span>
                            </div>

                            <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter uppercase">
                                <span className="silver-gradient-text">AI Revolution</span>
                                <br />
                                <span className="orange-signal-text drop-shadow-[0_0_20px_var(--orange-glow)]">5-Day Workshop</span>
                            </h2>

                            <p className="text-silver/70 text-lg mb-8 leading-relaxed font-medium">
                                Master the future of artificial intelligence. Join elite innovators from across India for an intensive hands-on workshop covering cutting-edge AI technologies, machine learning, and real-world applications.
                            </p>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-[var(--cyan-accent)] rounded-full mt-2 flex-shrink-0" />
                                    <p className="text-silver/60 font-bold">Live Expert Training from Industry Leaders</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-[var(--cyan-accent)] rounded-full mt-2 flex-shrink-0" />
                                    <p className="text-silver/60 font-bold">Hands-on Projects & Real-World Case Studies</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-[var(--cyan-accent)] rounded-full mt-2 flex-shrink-0" />
                                    <p className="text-silver/60 font-bold">Certificate of Completion</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-[var(--cyan-accent)] rounded-full mt-2 flex-shrink-0" />
                                    <p className="text-silver/60 font-bold">Lifetime Access to Workshop Materials</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="btn-cyan px-8 py-4 text-lg font-black uppercase tracking-widest shadow-cyan/20 hover:shadow-cyan/40 transition-all"
                            >
                                Register for Workshop
                            </button>
                        </motion.div>

                        {/* Right: QR Code */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center justify-center"
                        >
                            <div className="relative w-72 h-72 bg-white p-4 rounded-3xl shadow-2xl">
                                {/* QR Code Image - Replace with actual QR code */}
                                <div className="w-full h-full bg-gradient-to-br from-white to-gray-100 rounded-2xl flex items-center justify-center">
                                    <QrCode className="w-32 h-32 text-gray-400" />
                                </div>
                            </div>

                            <div className="text-center mt-8">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-silver/40 mb-4">SCAN TO REGISTER</p>
                                <p className="text-silver/60 font-medium max-w-sm">
                                    Use your phone camera to scan this QR code and instantly register for the workshop
                                </p>
                            </div>

                            <div className="mt-8 text-center">
                                <p className="text-[12px] font-black text-[var(--cyan-accent)]">📅 Dates: Feb 20 - Feb 24, 2026</p>
                                <p className="text-[12px] font-bold text-silver/60 mt-2">Only 50 Seats Available</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <WorkshopRegistrationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}
