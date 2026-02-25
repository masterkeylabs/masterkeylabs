'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import IntakeWizard from '@/components/IntakeWizard';
import { translations } from '@/lib/translations';

// Removed metadata export because this is now a client component again.
// RootLayout already has default metadata.

export default function Home() {
    const [lang, setLang] = useState('en');
    const t = translations[lang];

    return (
        <div className="bg-background-dark font-sans text-slate-100 min-h-screen selection:bg-ios-blue/30 selection:text-ios-blue overflow-x-hidden">
            {/* Minimal Grid Background */}
            <div className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>
            <div className="fixed top-0 left-0 w-full h-screen spotlight pointer-events-none z-0"></div>

            <header className="relative z-50 pt-8 pb-4">
                {/* Navigation — top right language toggle */}
                <div className="absolute top-4 right-6 md:right-12 flex items-center gap-4 z-50">
                    <div className="flex bg-white/5 rounded-full p-1 border border-white/10 backdrop-blur-md">
                        <button onClick={() => setLang('en')} className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${lang === 'en' ? 'bg-ios-blue text-white' : 'text-white/40 hover:text-white/60'}`}>EN</button>
                        <button onClick={() => setLang('hinglish')} className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${lang === 'hinglish' ? 'bg-ios-blue text-white' : 'text-white/40 hover:text-white/60'}`}>HINGLISH</button>
                        <button onClick={() => setLang('hi')} className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${lang === 'hi' ? 'bg-ios-blue text-white' : 'text-white/40 hover:text-white/60'}`}>हिंदी</button>
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

                <footer className="border-t border-white/5 pt-20 pb-24 bg-black/40 mt-20">
                    <div className="container mx-auto px-6 flex flex-col items-center text-center">
                        <div className="mb-10 opacity-80 flex items-center justify-center">
                            <Image src="/logo-text.png" alt="MasterKey Labs" width={160} height={32} className="h-6 md:h-8 w-auto object-contain brightness-110" />
                        </div>
                        <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 mb-16">
                            <span className="text-white/30 uppercase text-[10px] font-bold tracking-[0.2em]">Systems</span>
                            <span className="text-white/30 uppercase text-[10px] font-bold tracking-[0.2em]">Infrastructure</span>
                            <span className="text-white/30 uppercase text-[10px] font-bold tracking-[0.2em]">Intelligence</span>
                            <span className="text-white/30 uppercase text-[10px] font-bold tracking-[0.2em]">Directives</span>
                        </div>
                        <div className="text-white/10 text-[9px] tracking-[0.3em] font-bold uppercase">© 2025 MASTERKEY LABS — ADAPTIVE SYSTEMS PROTOCOL</div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
