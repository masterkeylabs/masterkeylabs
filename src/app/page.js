'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import IntakeWizard from '@/components/IntakeWizard';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';

export default function Home() {
    const { lang, setLang, t } = useLanguage();
    const { user, loading: authLoading } = useAuth();
    const [localId, setLocalId] = useState(null);
    const [isCheckingLocal, setIsCheckingLocal] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setLocalId(localStorage.getItem('masterkey_business_id'));
        }
        setIsCheckingLocal(false);
    }, []);

    const loading = authLoading || isCheckingLocal;
    const hasSession = user || localId;
    const dashboardHref = user ? '/dashboard' : `/dashboard?id=${localId}`;

    return (
        <div className="bg-background-dark font-sans text-slate-100 min-h-screen selection:bg-ios-blue/30 selection:text-ios-blue overflow-x-hidden">
            {/* Minimal Grid Background */}
            <div className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>
            <div className="fixed top-0 left-0 w-full h-screen spotlight pointer-events-none z-0"></div>

            <header className="relative z-50 pt-8 pb-4">
                {/* Navigation — top right language toggle */}
                <div className="absolute top-4 right-6 md:right-12 flex items-center gap-4 z-50">
                    <div className="flex bg-white/5 rounded-full p-1 border border-white/10 backdrop-blur-md items-center shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                        {/* Language Toggles */}
                        <div className="flex bg-white/5 rounded-full p-0.5 mr-2">
                            <button onClick={() => setLang('en')} className={`px-2.5 py-1 rounded-full text-[9px] font-bold transition-all ${lang === 'en' ? 'bg-ios-blue text-white' : 'text-white/30 hover:text-white/50'}`}>EN</button>
                            <button onClick={() => setLang('hi')} className={`px-2.5 py-1 rounded-full text-[9px] font-bold transition-all ${lang === 'hi' ? 'bg-ios-blue text-white' : 'text-white/30 hover:text-white/50'}`}>HI</button>
                            <button onClick={() => setLang('hinglish')} className={`px-2.5 py-1 rounded-full text-[9px] font-bold transition-all ${lang === 'hinglish' ? 'bg-ios-blue text-white' : 'text-white/30 hover:text-white/50'}`}>HG</button>
                        </div>

                        <div className="w-[1px] h-4 bg-white/10 mx-1"></div>

                        {loading ? (
                            <div className="w-16 h-6 bg-white/5 animate-pulse rounded-full mx-2"></div>
                        ) : hasSession ? (
                            <Link href={dashboardHref} className="px-4 py-1.5 text-[10px] font-black bg-ios-blue hover:bg-ios-blue/80 text-white rounded-full transition-all uppercase tracking-widest border border-white/5 shadow-lg flex items-center gap-1.5">
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
                    <div className="mb-0 mt-[-20px] scale-75 md:scale-100 flex justify-center w-full">
                        <Image src="/logo-stacked.png" alt="MasterKey Labs Logo" width={256} height={256} className="h-48 md:h-64 object-contain opacity-90 drop-shadow-[0_0_15px_rgba(0,229,255,0.2)]" />
                    </div>
                </div>
            </header>

            <main className="relative z-10">
                <section className="container mx-auto px-6 py-4 lg:py-8 flex flex-col items-center">

                    {/* Hook & Copy - restored previous content */}
                    <div className="flex flex-col items-center gap-4 max-w-4xl text-center mb-10">
                        <p className="text-white/40 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-medium mb-2">
                            &quot;{t.tagline}&quot;
                        </p>
                        <div className="ios-badge-cyan">
                            {t.badge}
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-[1.1] text-white tracking-tight text-balance">
                            {t.hero.title1} <br className="hidden md:block" />
                            <span className="text-ios-blue">{t.hero.title2}</span>.
                        </h1>
                        <p className="text-white/50 text-base md:text-xl font-normal max-w-xl mt-4 leading-relaxed">
                            {t.hero.sub}
                        </p>

                    </div>

                    {/* Sunk-Cost Wizard */}
                    <IntakeWizard t={t} />

                    <div className="mt-16 text-center max-w-xl">
                        <p className="text-slate-300 text-sm md:text-base font-medium">
                            {t.cta.main} <br />
                            <span className="text-primary/70">{t.cta.sub}</span>
                        </p>
                        <div className="flex -space-x-2 justify-center mt-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-background-dark bg-ios-gray-dark flex items-center justify-center text-[8px] font-bold text-white/40">MK</div>
                            ))}
                            <div className="w-8 h-8 rounded-full border-2 border-background-dark bg-ios-blue/10 flex items-center justify-center text-[10px] font-bold text-ios-blue font-mono">+1k</div>
                        </div>
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
                        <div className="mb-10 opacity-80 flex items-center justify-center">
                            <Image src="/logo-text.png" alt="MasterKey Labs" width={320} height={64} className="h-16 md:h-24 w-auto object-contain brightness-110" />
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
