'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import { useLanguage } from '@/lib/LanguageContext';

export default function FeatureLayout({ children, title, subtitle, backHref }) {
    const { lang, setLang, t } = useLanguage();
    const [dashboardHref, setDashboardHref] = useState('/dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (backHref) {
            setDashboardHref(backHref);
        } else {
            setDashboardHref(`/dashboard`);
        }
    }, [backHref]);

    return (
        <div className="flex h-full min-h-screen bg-black overflow-x-hidden">
            <Sidebar t={t} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <main className="flex-1 md:ml-64 p-4 md:p-8 transition-all duration-300 w-full overflow-x-hidden">
                {/* Mobile Header Bar */}
                <div className="flex items-center justify-between md:hidden mb-6 bg-white/[0.02] border border-white/5 p-3 rounded-xl backdrop-blur-md">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 text-white/70 hover:text-white"
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    <Image src="/logo-new.png" alt="Logo" width={360} height={96} style={{ width: 'auto' }} className="h-24 w-auto object-contain" />

                    {/* Small Lang Toggle for Mobile */}
                    <div className="flex bg-white/5 rounded-full p-0.5 border border-white/10">
                        <button onClick={() => setLang('en')} className={`px-2 py-0.5 rounded-full text-[8px] font-bold transition-all ${lang === 'en' ? 'bg-ios-blue text-white' : 'text-white/40'}`}>EN</button>
                        <button onClick={() => setLang('hi')} className={`px-2 py-0.5 rounded-full text-[8px] font-bold transition-all ${lang === 'hi' ? 'bg-ios-blue text-white' : 'text-white/40'}`}>HI</button>
                        <button onClick={() => setLang('hinglish')} className={`px-2 py-0.5 rounded-full text-[8px] font-bold transition-all ${lang === 'hinglish' ? 'bg-ios-blue text-white' : 'text-white/40'}`}>HG</button>
                    </div>
                </div>

                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <Link href={dashboardHref} className="inline-flex items-center gap-2 text-white/40 hover:text-primary transition-colors text-xs">
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            {t?.dashboard?.backToDashboard || 'Back to Dashboard'}
                        </Link>

                        {/* Language Switcher for Desktop */}
                        <div className="hidden md:flex bg-white/5 rounded-full p-1 border border-white/10 backdrop-blur-md">
                            <button onClick={() => setLang('en')} className={`px-3 py-1 rounded-full text-[9px] font-bold transition-all ${lang === 'en' ? 'bg-ios-blue text-white' : 'text-white/40 hover:text-white/60'}`}>EN</button>
                            <button onClick={() => setLang('hinglish')} className={`px-3 py-1 rounded-full text-[9px] font-bold transition-all ${lang === 'hinglish' ? 'bg-ios-blue text-white' : 'text-white/40 hover:text-white/60'}`}>HINGLISH</button>
                            <button onClick={() => setLang('hi')} className={`px-3 py-1 rounded-full text-[9px] font-bold transition-all ${lang === 'hi' ? 'bg-ios-blue text-white' : 'text-white/40 hover:text-white/60'}`}>हिन्दी</button>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">{title}</h2>
                            {subtitle && <p className="text-white/50 mt-1 text-sm md:text-base">{subtitle}</p>}
                        </div>
                    </div>
                    <div className="h-[1px] w-full bg-gradient-to-r from-primary/30 via-white/5 to-transparent mt-4"></div>
                </div>
                {children}
            </main>
        </div>
    );
}
