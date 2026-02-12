"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Menu, X, ArrowRight } from "lucide-react";

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-500 ${isScrolled
                ? "bg-black/60 backdrop-blur-2xl border-b border-white/5 py-4"
                : "bg-transparent py-8"
                }`}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-4 group">
                    <div className="relative">
                        <img
                            src="/branding-logo.png"
                            alt="Masterkey Logo"
                            className="w-14 h-14 object-contain relative z-10"
                        />
                        <div className="absolute inset-0 bg-[var(--cyan-accent)]/10 blur-xl rounded-full scale-125 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <img
                        src="/branding-name.png"
                        alt="Masterkey Labs"
                        className="h-8 md:h-12 object-contain"
                    />
                </Link>

                {/* Desktop Nav */}
                <div className="hidden lg:flex items-center gap-12">
                    <nav className="flex items-center gap-10">
                        <Link href="/about" className="text-[10px] font-black uppercase tracking-[0.3em] text-silver hover:cyan-accent-text transition-colors">Kahani</Link>
                        <Link href="/career" className="text-[10px] font-black uppercase tracking-[0.3em] text-silver hover:cyan-accent-text transition-colors">Future Join Karein</Link>
                    </nav>

                    <div className="w-px h-4 bg-white/10" />

                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="text-[10px] font-black uppercase tracking-[0.3em] text-silver hover:text-white transition-colors px-4">
                            Console
                        </Link>
                        <Link href="/#audit" className="btn-cyan flex items-center gap-2 group text-[10px] py-3 px-6 shadow-cyan">
                            Abhi Shuru Karein
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="lg:hidden text-white p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X /> : <Menu className="text-[var(--cyan-accent)]" />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: "100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: "100%" }}
                        className="fixed inset-0 h-screen bg-black/95 backdrop-blur-3xl z-50 flex flex-col p-8 pt-32 lg:hidden"
                    >
                        <div className="flex flex-col gap-10">
                            <Link href="/about" className="text-5xl font-black tracking-tighter uppercase silver-gradient-text" onClick={() => setMobileMenuOpen(false)}>Kahani</Link>
                            <Link href="/career" className="text-5xl font-black tracking-tighter uppercase dual-accent-text" onClick={() => setMobileMenuOpen(false)}>Future Join Karein</Link>
                            <hr className="border-white/5" />
                            <div className="flex flex-col gap-4">
                                <Link href="/admin" className="glass-card text-center py-5 uppercase text-xs font-black tracking-widest text-white">Console Login</Link>
                                <Link href="/#audit" className="btn-cyan text-center py-5 shadow-cyan" onClick={() => setMobileMenuOpen(false)}>Abhi Shuru Karein</Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
