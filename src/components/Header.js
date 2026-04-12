'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import VideoLogo from '@/components/VideoLogo';

export default function Header({ scrollY, activeSection, handleScroll }) {
    const { lang, setLang, t } = useLanguage();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, business, loading } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [hoverSection, setHoverSection] = useState(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const hasSession = !!user && !!business;

    return (
        <header id="home" className="relative z-[100] pt-4 md:pt-6 pb-4 px-6 sticky top-0 flex flex-col items-center">
            {/* Unified Glassmorphic Navigation Bar — Premium & Scroll-Reactive */}
            <motion.div 
                animate={{
                    paddingTop: scrollY > 50 ? '4px' : '6px',
                    paddingBottom: scrollY > 50 ? '4px' : '6px',
                    scale: scrollY > 50 ? 0.98 : 1
                }}
                className={`flex items-center gap-1.5 glass-premium p-1.5 rounded-full shadow-2xl transition-all max-w-full ${scrollY > 50 ? 'bg-black/80 backdrop-blur-3xl border-white/20' : ''}`}
            >
                
                {/* Navigation Links (Desktop) */}
                <div 
                    className="hidden md:flex items-center gap-0.5 mr-1 border-r border-white/10 pr-1.5 relative h-full"
                    onMouseLeave={() => setHoverSection(null)}
                >
                    {[
                        { id: 'home', label: t.nav.home },
                        { id: 'services', label: t.nav.services },
                        { id: 'diagnostics', label: t.nav.diagnostics },
                        { id: 'ai-timer', label: t.nav.aiTimer }
                    ].map((item) => (
                        <button 
                            key={item.id}
                            onClick={() => handleScroll ? handleScroll(item.id) : (window.location.href = `/#${item.id}`)} 
                            onMouseEnter={() => setHoverSection(item.id)}
                            className={`relative px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-full z-10 ${activeSection === item.id ? 'text-white' : 'text-white/40 hover:text-white/80'}`}
                        >
                            {(hoverSection === item.id || activeSection === item.id) && (
                                <motion.div
                                    layoutId="nav-pill"
                                    className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-full -z-10"
                                    initial={false}
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 30
                                    }}
                                />
                            )}
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Desktop-only Controls */}
                <div className="hidden sm:flex items-center gap-1">
                    {/* Language Toggles */}
                    <div className="flex bg-white/5 rounded-full p-0.5 mr-1">
                        <button onClick={() => setLang('en')} className={`px-2.5 py-1 rounded-full text-[9px] font-bold transition-all ${lang === 'en' ? 'bg-ios-blue text-white' : 'text-white/30 hover:text-white/50'}`}>EN</button>
                        <button onClick={() => setLang('hi')} className={`px-2.5 py-1 rounded-full text-[9px] font-bold transition-all ${lang === 'hi' ? 'bg-ios-blue text-white' : 'text-white/30 hover:text-white/50'}`}>HI</button>
                        <button onClick={() => setLang('hinglish')} className={`px-2.5 py-1 rounded-full text-[9px] font-bold transition-all ${lang === 'hinglish' ? 'bg-ios-blue text-white' : 'text-white/30 hover:text-white/50'}`}>HG</button>
                    </div>

                    <div className="w-[1px] h-4 bg-white/10 mx-1"></div>

                    {/* Day / Night Toggle */}
                    <ThemeToggle className="mx-1 scale-90" />

                    <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
                </div>

                {/* Auth & Dashboard (Adaptive) */}
                {!mounted || loading ? (
                    <div className="w-16 h-6 bg-white/5 animate-pulse rounded-full mx-2"></div>
                ) : hasSession ? (
                    <Link href="/dashboard" className="px-4 py-2 text-[10px] font-black bg-ios-blue hover:bg-ios-blue/80 text-white rounded-full transition-all uppercase tracking-widest border border-white/5 shadow-lg flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">dashboard</span>
                        <span>{t.nav.dashboard.toUpperCase()}</span>
                    </Link>
                ) : (
                    <div className="flex items-center gap-1">
                        <Link href="/login" className="px-3 py-2 text-[10px] font-black text-white/60 hover:text-white transition-all uppercase tracking-widest hidden xs:block">
                            {t.nav.login.toUpperCase()}
                        </Link>

                        <Link href="/signup" className="px-3.5 py-2 text-[10px] font-black bg-white/10 hover:bg-white/20 text-white rounded-full transition-all uppercase tracking-widest border border-white/5 shadow-inner">
                            {t.nav.signup.toUpperCase()}
                        </Link>
                    </div>
                )}

                {/* Mobile Menu Toggle */}
                <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="flex md:hidden flex-col gap-1.5 p-2 px-3 hover:bg-white/5 rounded-full transition-all"
                >
                    <div className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></div>
                    <div className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></div>
                    <div className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></div>
                </button>
            </motion.div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 top-0 left-0 w-full h-full mobile-menu-overlay flex flex-col p-8 pt-24 pb-20 z-[99] overflow-y-auto custom-scrollbar"
                    >
                        <nav className="flex flex-col gap-2 mb-12">
                            {[
                                { id: 'home', label: t.nav.home },
                                { id: 'services', label: t.nav.services },
                                { id: 'diagnostics', label: t.nav.diagnostics },
                                { id: 'ai-timer', label: t.nav.aiTimer }
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        if (handleScroll) {
                                            handleScroll(item.id);
                                        } else {
                                            window.location.href = `/#${item.id}`;
                                        }
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={`mobile-menu-item ${activeSection === item.id ? 'active' : ''}`}
                                >
                                    {item.label}
                                    <span className="material-symbols-outlined text-white/20">chevron_right</span>
                                </button>
                            ))}
                        </nav>

                        <div className="mt-8 space-y-8">
                            {/* Mobile Language Selection */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Select Language</p>
                                <div className="flex gap-2">
                                    {['en', 'hi', 'hinglish'].map((l) => (
                                        <button
                                            key={l}
                                            onClick={() => setLang(l)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${lang === l ? 'bg-ios-blue border-ios-blue text-white' : 'bg-white/5 border-white/10 text-white/40'}`}
                                        >
                                            {l.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Mobile Theme Toggle */}
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                                <span className="text-xs font-bold uppercase tracking-widest text-white/60">Interface Mode</span>
                                <ThemeToggle />
                            </div>

                            {/* Mobile Auth & Dashboard */}
                            {!mounted || loading ? (
                                <div className="w-full h-12 bg-white/5 animate-pulse rounded-2xl"></div>
                            ) : hasSession ? (
                                <Link 
                                    href="/dashboard" 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-full px-6 py-4 rounded-2xl bg-ios-blue text-black text-center text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">dashboard</span>
                                    {t.nav.dashboard}
                                </Link>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <Link 
                                        href="/login" 
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-center text-xs font-black uppercase tracking-widest"
                                    >
                                        {t.nav.login}
                                    </Link>
                                    <Link 
                                        href="/signup" 
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="px-6 py-4 rounded-2xl bg-ios-blue text-black text-center text-xs font-black uppercase tracking-widest"
                                    >
                                        {t.nav.signup}
                                    </Link>
                                </div>
                            )}

                            <button 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="w-full py-4 text-white/20 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.5em]"
                            >
                                Close Terminal
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
