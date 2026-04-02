'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import AIExtinctionTimer from '@/components/AIExtinctionTimer';
import ThemeToggle from '@/components/ThemeToggle';
import { useRouter } from 'next/navigation';

export default function Home() {
    const { lang, setLang, t } = useLanguage();
    const { user, business, loading: authLoading } = useAuth();
    const router = useRouter();
    const loading = authLoading;
    const hasSession = !!user && !!business; // Require both user and business profile for dashboard access

    const effectiveId = business?.id || null;
    const [auditHref, setAuditHref] = useState('/signup');

    const [mounted, setMounted] = useState(false);
    const [isLogoSparkling, setIsLogoSparkling] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (loading || !mounted) return;

        if (user) {
            setAuditHref(business?.id ? `/dashboard?id=${business.id}` : '/dashboard');
        } else {
            setAuditHref('/signup');
        }
    }, [user, business, loading, mounted]);

    const handleStartFullAudit = () => {
        if (user) {
            router.push(auditHref);
        } else {
            router.push('/signup');
        }
    };

    return (
        <div className="bg-background-dark font-sans text-slate-100 min-h-screen selection:bg-ios-blue/30 selection:text-ios-blue overflow-x-hidden">
            {/* Minimal Grid Background */}
            <div className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>
            <div className="fixed top-0 left-0 w-full h-screen spotlight pointer-events-none z-0"></div>

            <header className="relative z-50 pt-6 pb-4 px-6">
                {/* Navigation — responsive toggle */}
                <div className="flex flex-col md:flex-row items-center md:justify-end gap-4 mb-8">
                    <div className="flex bg-white/5 rounded-full p-1 border border-white/10 backdrop-blur-md items-center shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                        {/* Language Toggles */}
                        <div className="flex bg-white/5 rounded-full p-0.5 mr-2">
                            <button onClick={() => setLang('en')} className={`px-2.5 py-1 rounded-full text-[9px] font-bold transition-all ${lang === 'en' ? 'bg-ios-blue text-white' : 'text-white/30 hover:text-white/50'}`}>EN</button>
                            <button onClick={() => setLang('hi')} className={`px-2.5 py-1 rounded-full text-[9px] font-bold transition-all ${lang === 'hi' ? 'bg-ios-blue text-white' : 'text-white/30 hover:text-white/50'}`}>HI</button>
                            <button onClick={() => setLang('hinglish')} className={`px-2.5 py-1 rounded-full text-[9px] font-bold transition-all ${lang === 'hinglish' ? 'bg-ios-blue text-white' : 'text-white/30 hover:text-white/50'}`}>HG</button>
                        </div>

                        <div className="w-[1px] h-4 bg-white/10 mx-1"></div>

                        {/* Day / Night Toggle */}
                        <ThemeToggle className="mx-1" />

                        <div className="w-[1px] h-4 bg-white/10 mx-1"></div>

                        {!mounted || loading ? (
                            <div className="w-16 h-6 bg-white/5 animate-pulse rounded-full mx-2"></div>
                        ) : hasSession ? (
                            <Link href="/dashboard" className="px-4 py-1.5 text-[10px] font-black bg-ios-blue hover:bg-ios-blue/80 text-white rounded-full transition-all uppercase tracking-widest border border-white/5 shadow-lg flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[14px]">dashboard</span>
                                {t.nav.dashboard.toUpperCase()}
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="px-3 py-1.5 text-[10px] font-black text-white/60 hover:text-white transition-all uppercase tracking-widest">
                                    {t.nav.login.toUpperCase()}
                                </Link>

                                <Link href="/signup" className="ml-1 px-4 py-1.5 text-[10px] font-black bg-white/10 hover:bg-white/20 text-white rounded-full transition-all uppercase tracking-widest border border-white/5 shadow-inner">
                                    {t.nav.signup.toUpperCase()}
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-center text-center px-6 mt-8">
                    <div className="mb-0 mt-[10px] scale-100 flex justify-center w-full">
                        <motion.div 
                            className="relative group cursor-pointer"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => setIsLogoSparkling(!isLogoSparkling)}
                        >
                            {/* Main Logo Image (Absolute Clarity) */}
                            <div className={`relative transition-all duration-500 group-hover:drop-shadow-[0_0_20px_rgba(0,229,255,0.15)] ${isLogoSparkling ? 'drop-shadow-[0_0_20px_rgba(0,229,255,0.15)]' : ''}`}>
                                <Image 
                                    src="/logo-stacked.png" 
                                    alt="MasterKey Labs Logo" 
                                    width={1000} 
                                    height={1000} 
                                    className={`h-64 sm:h-80 md:h-[400px] lg:h-[500px] w-auto object-contain transition-all duration-300 opacity-100 group-hover:brightness-110 ${isLogoSparkling ? 'brightness-110' : ''}`} 
                                />

                                {/* High-Clarity Symmetrical Neon Sparkle Swarm */}
                                <div className={`absolute inset-0 pointer-events-none transition-opacity duration-700 group-hover:opacity-100 ${isLogoSparkling ? 'opacity-100' : 'opacity-0'}`}>
                                    {/* Symmetrical Pairs (Left: Blue, Right: Orange) */}
                                    {/* Top Corners */}
                                    <div className="sparkle sparkle-blue animate-sparkle" style={{ top: '15%', left: '15%', '--x': '-20px', '--y': '-30px' }} />
                                    <div className="sparkle sparkle-orange animate-sparkle" style={{ top: '15%', left: '85%', '--x': '20px', '--y': '-30px' }} />
                                    
                                    {/* Upper Diagonals */}
                                    <div className="sparkle sparkle-blue animate-sparkle [animation-delay:0.3s]" style={{ top: '30%', left: '30%', '--x': '15px', '--y': '-40px' }} />
                                    <div className="sparkle sparkle-orange animate-sparkle [animation-delay:0.3s]" style={{ top: '30%', left: '70%', '--x': '-15px', '--y': '-40px' }} />
                                    
                                    {/* Middle Hub */}
                                    <div className="sparkle sparkle-blue animate-sparkle [animation-delay:0.6s]" style={{ top: '50%', left: '20%', '--x': '40px', '--y': '0px' }} />
                                    <div className="sparkle sparkle-orange animate-sparkle [animation-delay:0.6s]" style={{ top: '50%', left: '80%', '--x': '-40px', '--y': '0px' }} />
                                    
                                    {/* Lower Diagonals */}
                                    <div className="sparkle sparkle-blue animate-sparkle [animation-delay:0.9s]" style={{ top: '65%', left: '35%', '--x': '-10px', '--y': '40px' }} />
                                    <div className="sparkle sparkle-orange animate-sparkle [animation-delay:0.9s]" style={{ top: '65%', left: '65%', '--x': '10px', '--y': '40px' }} />
                                    
                                    {/* Bottom Corners */}
                                    <div className="sparkle sparkle-blue animate-sparkle [animation-delay:1.2s]" style={{ top: '80%', left: '15%', '--x': '-30px', '--y': '20px' }} />
                                    <div className="sparkle sparkle-orange animate-sparkle [animation-delay:1.2s]" style={{ top: '80%', left: '85%', '--x': '30px', '--y': '20px' }} />

                                    {/* Central Vertical Axis Sparkles (Alternating) */}
                                    <div className="sparkle sparkle-blue animate-sparkle [animation-delay:1.5s]" style={{ top: '10%', left: '50%', '--x': '0px', '--y': '-50px' }} />
                                    <div className="sparkle sparkle-orange animate-sparkle [animation-delay:1.8s]" style={{ top: '45%', left: '50%', '--x': '0px', '--y': '20px' }} />
                                    <div className="sparkle sparkle-blue animate-sparkle [animation-delay:2.1s]" style={{ top: '90%', left: '50%', '--x': '0px', '--y': '40px' }} />
                                    
                                    {/* Secondary Symmetry Layer */}
                                    <div className="sparkle sparkle-orange animate-sparkle [animation-delay:0.5s]" style={{ top: '40%', left: '25%', '--x': '20px', '--y': '-20px' }} />
                                    <div className="sparkle sparkle-blue animate-sparkle [animation-delay:0.5s]" style={{ top: '40%', left: '75%', '--x': '-20px', '--y': '-20px' }} />
                                    <div className="sparkle sparkle-orange animate-sparkle [animation-delay:1.1s]" style={{ top: '60%', left: '20%', '--x': '30px', '--y': '30px' }} />
                                    <div className="sparkle sparkle-blue animate-sparkle [animation-delay:1.1s]" style={{ top: '60%', left: '80%', '--x': '-30px', '--y': '30px' }} />
                                </div>
                            </div>

                            {/* Crisp Background Glow */}
                            <div className={`absolute inset-0 bg-ios-blue/5 rounded-full blur-[60px] -z-10 transition-opacity duration-700 pointer-events-none group-hover:opacity-100 ${isLogoSparkling ? 'opacity-100' : 'opacity-0'}`} />
                        </motion.div>
                    </div>
                </div>
            </header>

            <main className="relative z-10">
                <section className="container mx-auto px-6 py-4 lg:py-8 flex flex-col items-center">

                    {/* AI Extinction Timer — shown first, above the hook */}
                    <div className="mb-10 w-full max-w-4xl mx-auto px-4 animate-fade-in opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                        {mounted && (
                            <AIExtinctionTimer
                                guestMode={!user}
                                onGetStarted={handleStartFullAudit}
                            />
                        )}
                    </div>

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
                                    <Link href="https://canvas.instructure.com/courses/14537625" target="_blank" rel="noopener noreferrer" className="px-10 py-5 w-full sm:w-auto bg-[#0a0a0a] border border-white/10 text-white font-black rounded-2xl transition-all hover:scale-105 hover:bg-white/5 hover:border-ios-blue/30 active:scale-95 shadow-inner flex justify-center items-center gap-3 group relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                                        <span className="text-sm uppercase tracking-widest relative z-10">MasterKey Academy</span>
                                        <span className="material-symbols-outlined text-white/40 group-hover:text-ios-blue transition-colors relative z-10">school</span>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* CTA below the hook removed to avoid conflict with AI Timer (Fix #2) */}
                    </div>
                </section>

                {/* ═══════════ CORE SCANNING & DIAGNOSTIC SUITE ═══════════ */}
                <section className="container mx-auto px-6 py-20 lg:py-28">
                    {/* Section Header */}
                    <div className="text-center max-w-3xl mx-auto mb-16">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                        {/* 1. Operational Waste */}
                        <div className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500">
                            <div className="w-12 h-12 rounded-2xl bg-ios-blue/10 flex items-center justify-center mb-6 border border-ios-blue/20 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-ios-blue">account_balance_wallet</span>
                            </div>
                            <p className="text-[10px] font-black text-ios-blue uppercase tracking-widest mb-2">{t.scanningSuite.waste.module}</p>
                            <h3 className="text-xl font-bold text-white mb-3">{t.scanningSuite.waste.title}</h3>
                            <p className="text-sm text-white/40 leading-relaxed mb-6">{t.scanningSuite.waste.sub}</p>
                        </div>

                        {/* 2. Night Loss */}
                        <div className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-purple-400">nights_stay</span>
                            </div>
                            <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2">{t.scanningSuite.night.module}</p>
                            <h3 className="text-xl font-bold text-white mb-3">{t.scanningSuite.night.title}</h3>
                            <p className="text-sm text-white/40 leading-relaxed mb-6">{t.scanningSuite.night.sub}</p>
                        </div>

                        {/* 3. Visibility */}
                        <div className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500">
                            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-cyan-400">visibility</span>
                            </div>
                            <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2">{t.scanningSuite.visibility.module}</p>
                            <h3 className="text-xl font-bold text-white mb-3">{t.scanningSuite.visibility.title}</h3>
                            <p className="text-sm text-white/40 leading-relaxed mb-6">{t.scanningSuite.visibility.sub}</p>
                        </div>

                        {/* 4. Extinction Horizon */}
                        <div className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500">
                            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-red-400">history_toggle_off</span>
                            </div>
                            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">{t.scanningSuite.threat.module}</p>
                            <h3 className="text-xl font-bold text-white mb-3">{t.scanningSuite.threat.title}</h3>
                            <p className="text-sm text-white/40 leading-relaxed mb-6">{t.scanningSuite.threat.sub}</p>
                        </div>
                    </div>
                </section>

                <footer className="border-t border-white/5 pt-20 pb-24 bg-black/40 mt-0">
                    <div className="container mx-auto px-6 flex flex-col items-center text-center">
                        <div className="mb-10 opacity-80">
                            <Link href="/">
                                <img src="/logo-new.png" alt="MasterKey Labs" style={{ height: '250px', width: 'auto', cursor: 'pointer' }} />
                            </Link>
                        </div>
                        <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 mb-12">
                            <span className="text-white/30 uppercase text-[10px] font-bold tracking-[0.2em]">{t.footer.systems}</span>
                            <span className="text-white/30 uppercase text-[10px] font-bold tracking-[0.2em]">{t.footer.infrastructure}</span>
                            <span className="text-white/30 uppercase text-[10px] font-bold tracking-[0.2em]">{t.footer.intelligence}</span>
                            <span className="text-white/30 uppercase text-[10px] font-bold tracking-[0.2em]">{t.footer.directives}</span>
                        </div>

                        {/* Legal and Contact */}
                        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-12 text-[10px] font-bold uppercase tracking-[0.1em]">
                            <Link href="/privacy" className="text-white/40 hover:text-ios-blue transition-colors">{t.footer.privacy}</Link>
                            <Link href="/terms" className="text-white/40 hover:text-ios-blue transition-colors">{t.footer.terms}</Link>
                        </div>

                        <div className="text-white/10 text-[9px] tracking-[0.3em] font-bold uppercase">{t.footer.rights}</div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
