'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import VideoLogo from '@/components/VideoLogo';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import AIExtinctionTimer from '@/components/AIExtinctionTimer';
import ThemeToggle from '@/components/ThemeToggle';
import { useRouter } from 'next/navigation';
import ServiceList from '@/components/ServiceList';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function HomeClient() {
    const { lang, setLang, t } = useLanguage();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, business, loading: authLoading } = useAuth();
    const { theme } = useTheme();
    const isLight = theme === 'light';
    const router = useRouter();
    const diagnosticsScrollRef = useRef(null);
    const loading = authLoading;
    const hasSession = !!user && !!business; // Require both user and business profile for dashboard access

    const auditHref = user 
        ? (business?.id ? `/dashboard?id=${business.id}` : '/dashboard')
        : '/signup';

    const [mounted, setMounted] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const [activeSection, setActiveSection] = useState('home');

    useEffect(() => {
        setMounted(true);
        
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);

        const observerOptions = {
            root: null,
            rootMargin: '-10% 0px -80% 0px',
            threshold: 0
        };

        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        ['home', 'services', 'ai-timer', 'diagnostics'].forEach(id => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            observer.disconnect();
        };
    }, []);


    const handleStartFullAudit = () => {
        if (user) {
            router.push(auditHref);
        } else {
            router.push('/signup');
        }
    };

    const handleScroll = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const scrollDiagnostics = () => {
        if (diagnosticsScrollRef.current) {
            const container = diagnosticsScrollRef.current;
            const scrollAmount = container.clientWidth > 768 ? container.clientWidth / 2 : container.clientWidth * 0.8;
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            
            if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
                container.scrollTo({ left: 0, behavior: 'smooth' });
            }
        }
    };

    const [hoverSection, setHoverSection] = useState(null);

    return (
        <div className="bg-background-dark font-sans text-slate-100 min-h-screen selection:bg-ios-blue/30 selection:text-ios-blue overflow-x-hidden">
            {/* Minimal Grid Background */}
            <div className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>
            <div className="fixed top-0 left-0 w-full h-screen spotlight pointer-events-none z-0"></div>

            <Header 
                scrollY={scrollY} 
                activeSection={activeSection} 
                handleScroll={handleScroll} 
            />

            {/* Hero Logo — Now correctly placed below the nav bar and centered */}
            <div className="flex flex-col items-center text-center px-6 mt-4">
                <div className="mb-0 mt-[10px] scale-100 flex justify-center w-full">
                    <motion.div 
                        className="relative"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        {/* Main Logo Image — background adapts to theme */}
                        <div className={`logo-card relative transition-all duration-700 overflow-hidden rounded-3xl ${isLight ? '' : 'bg-transparent'}`}>
                            <VideoLogo 
                                src="/video-logo.mp4"
                                poster="/logo-stacked.png"
                                className="h-40 sm:h-52 md:h-64 lg:h-72 w-auto transition-all duration-300 opacity-100"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>

            <main className="relative z-10">
                {/* ═══════════ INTERNAL SYSTEMS & GROWTH PROTOCOLS ═══════════ */}
                <div id="services">
                    <ServiceList />
                </div>

                {/* ─── DIVIDER ─── */}
                <div className="w-full max-w-5xl mx-auto px-6"><div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" /></div>

                {/* ═══════════ HERO COPY & CTA ═══════════ */}
                <section className="container mx-auto px-6 py-8 lg:py-12 flex flex-col items-center">
                    {/* Hook & Copy */}
                    <div className="flex flex-col items-center gap-4 max-w-4xl text-center mb-10">
                        <p className="text-white/40 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-medium mb-2">
                            &quot;{t.tagline}&quot;
                        </p>
                        <div className="ios-badge-cyan">
                            {t.badge}
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-[1.1] text-white tracking-tight text-balance">
                            {t.hero.title1} <br className="hidden md:block" />
                            <span className="text-ios-blue">{t.hero.title2}</span>.
                        </h1>
                        <p className="text-white/50 text-base md:text-xl font-normal max-w-xl mt-4 leading-relaxed">
                            {t.hero.sub}
                        </p>

                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                            {mounted && (
                                <>
                                    <button onClick={handleStartFullAudit} className="px-10 py-5 w-full sm:w-auto bg-gradient-to-br from-ios-blue to-[#0099FF] text-black font-black rounded-2xl transition-all hover:scale-105 hover:brightness-110 active:scale-95 shadow-[0_20px_50px_rgba(0,229,255,0.3)] flex justify-center items-center gap-3 group border border-transparent">
                                        <span className="text-sm uppercase tracking-widest">Start Full Audit</span>
                                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                    </button>
                                    
                                    {/* Academy External CTA */}
                                    <Link href="https://canvas.instructure.com/enroll/YCDBWM" target="_blank" rel="noopener noreferrer" className="px-10 py-5 w-full sm:w-auto bg-[#0a0a0a] border border-white/10 text-white font-black rounded-2xl transition-all hover:scale-105 hover:bg-white/5 hover:border-ios-blue/30 active:scale-95 shadow-inner flex justify-center items-center gap-3 group relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                                        <span className="text-sm uppercase tracking-widest relative z-10">MasterKey Academy</span>
                                        <span className="material-symbols-outlined text-white/40 group-hover:text-ios-blue transition-colors relative z-10">school</span>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* ─── DIVIDER ─── */}
                <div className="w-full max-w-5xl mx-auto px-6"><div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" /></div>

                {/* ═══════════ CORE SCANNING & DIAGNOSTIC SUITE ═══════════ */}
                <section id="diagnostics" className="container mx-auto px-6 py-8 lg:py-12">
                    {/* Section Header */}
                    <div className="text-center max-w-3xl mx-auto mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ios-blue/10 border border-ios-blue/20 mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-ios-blue animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ios-blue">{t.scanningSuite.badge}</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
                            {t.scanningSuite.title1}<br className="hidden md:block" />
                            <span className="text-ios-blue">{t.scanningSuite.title2}</span>
                        </h2>
                        <p className="text-white/40 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                            {t.scanningSuite.sub}
                        </p>
                    </div>

                    <div className="relative group/scroll">
                        <div 
                            ref={diagnosticsScrollRef}
                            className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-6 pt-4 pb-12 px-6 -mx-6 md:mx-0 md:px-0 scroll-smooth"
                        >
                            {/* 1. Operational Waste */}
                            <div className="flex-none w-[85%] md:w-[calc(50%-12px)] snap-center group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 relative overflow-hidden">
                                <div className="w-12 h-12 rounded-2xl bg-ios-blue/10 flex items-center justify-center mb-6 border border-ios-blue/20 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-ios-blue">account_balance_wallet</span>
                                </div>
                                <p className="text-[10px] font-black text-ios-blue uppercase tracking-widest mb-2">{t.scanningSuite.waste.module}</p>
                                <h3 className="text-xl font-bold text-white mb-3">{t.scanningSuite.waste.title}</h3>
                                <p className="text-sm text-white/40 leading-relaxed mb-6">{t.scanningSuite.waste.sub}</p>
                            </div>

                            {/* 2. Night Loss */}
                            <div className="flex-none w-[85%] md:w-[calc(50%-12px)] snap-center group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 relative overflow-hidden">
                                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-purple-400">nights_stay</span>
                                </div>
                                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2">{t.scanningSuite.night.module}</p>
                                <h3 className="text-xl font-bold text-white mb-3">{t.scanningSuite.night.title}</h3>
                                <p className="text-sm text-white/40 leading-relaxed mb-6">{t.scanningSuite.night.sub}</p>
                            </div>

                            {/* 3. Visibility */}
                            <div className="flex-none w-[85%] md:w-[calc(50%-12px)] snap-center group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 relative overflow-hidden">
                                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-cyan-400">visibility</span>
                                </div>
                                <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2">{t.scanningSuite.visibility.module}</p>
                                <h3 className="text-xl font-bold text-white mb-3">{t.scanningSuite.visibility.title}</h3>
                                <p className="text-sm text-white/40 leading-relaxed mb-6">{t.scanningSuite.visibility.sub}</p>
                            </div>

                            {/* 4. Extinction Horizon */}
                            <div className="flex-none w-[85%] md:w-[calc(50%-12px)] snap-center group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 relative overflow-hidden">
                                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-red-400">history_toggle_off</span>
                                </div>
                                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">{t.scanningSuite.threat.module}</p>
                                <h3 className="text-xl font-bold text-white mb-3">{t.scanningSuite.threat.title}</h3>
                                <p className="text-sm text-white/40 leading-relaxed mb-6">{t.scanningSuite.threat.sub}</p>
                            </div>
                        </div>

                        {/* Global Navigation Sign (Right Edge) — Now Clickable */}
                        <button 
                            onClick={scrollDiagnostics}
                            className="md:hidden absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-ios-blue/10 border border-ios-blue/20 backdrop-blur-md text-ios-blue animate-bounce-x z-20 active:scale-95 transition-transform"
                        >
                            <span className="material-symbols-outlined font-bold">arrow_forward</span>
                        </button>
                        <div className="hidden md:absolute md:flex right-0 top-0 h-[calc(100%-3rem)] w-24 items-center justify-end pr-4 bg-gradient-to-l from-background-dark via-background-dark/80 to-transparent pointer-events-none group-hover/scroll:opacity-100 opacity-60 transition-opacity">
                             <button 
                                onClick={scrollDiagnostics}
                                className="p-2 rounded-full bg-ios-blue/5 border border-ios-blue/20 backdrop-blur-sm text-ios-blue/40 hover:text-ios-blue hover:bg-ios-blue/10 pointer-events-auto transition-all active:scale-95"
                            >
                                <span className="material-symbols-outlined font-bold">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* ─── DIVIDER ─── */}
                <div className="w-full max-w-5xl mx-auto px-6"><div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" /></div>

                {/* ═══════════ AI EXTINCTION TIMER ═══════════ */}
                <section id="ai-timer" className="container mx-auto px-6 py-8 lg:py-12 flex flex-col items-center">
                    <div className="w-full max-w-4xl mx-auto px-4 animate-fade-in opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                        {mounted && (
                            <AIExtinctionTimer
                                guestMode={!user}
                                onGetStarted={handleStartFullAudit}
                            />
                        )}
                    </div>
                </section>

                <Footer />
            </main>
        </div>
    );
}
