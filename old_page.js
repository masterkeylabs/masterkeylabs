'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { calculateAIThreat } from '@/lib/calculations';
import GlassKey from '@/components/GlassKey';
import { motion, AnimatePresence } from 'framer-motion';
import { translations } from '@/lib/translations';

export default function Home() {
    const router = useRouter();
    const [lang, setLang] = useState('en');
    const t = translations[lang];

    // ... rest of logic
    const [submitting, setSubmitting] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [threatResult, setThreatResult] = useState(null);
    const [showLogin, setShowLogin] = useState(false);
    const [animPhase, setAnimPhase] = useState(0); // 0=idle, 1=scanning, 2=done

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
        }
    };

    const sectionVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 1, ease: [0.16, 1, 0.3, 1] }
        }
    };
    const [loginData, setLoginData] = useState({
        businessName: '', ownerName: '', email: '', phone: '', businessType: '',
    });
    const [loggedInBusinessId, setLoggedInBusinessId] = useState(null);
    const [loginError, setLoginError] = useState(null);
    const [existingBusinessId, setExistingBusinessId] = useState(null);
    const [formData, setFormData] = useState({
        entityName: '',
        location: '',
        age: '',
        classification: 'local_business',
        scalability: '1-10 (Micro)',
        digitalFootprint: 'none',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleLoginChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    // ΓöÇΓöÇΓöÇ Check Threat Level ΓöÇΓöÇΓöÇ
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setAnimPhase(1);
        setThreatResult(null);

        // Simulate dramatic scan (2.5s)
        await new Promise(r => setTimeout(r, 2500));

        const hasDigital = (formData.digitalFootprint || '').toLowerCase();
        const salesChannels = [];
        if (hasDigital.includes('website')) salesChannels.push('website');
        if (hasDigital.includes('marketplace')) salesChannels.push('marketplace');
        if (hasDigital.includes('social')) salesChannels.push('social');
        if (salesChannels.length === 0) salesChannels.push('walkin');

        const usesSoftware = hasDigital.includes('crm') || hasDigital.includes('erp') || hasDigital.includes('full');

        const threat = calculateAIThreat({
            industry: formData.classification,
            businessAge: parseInt(formData.age) || 1,
            employees: formData.scalability,
            salesChannels,
            usesSoftware,
            city: formData.location,
            hasPhysicalLocation: true,
        });

        setThreatResult(threat);
        setAnimPhase(2);
        setSubmitting(false);

        // After 3s of viewing results, show login
        setTimeout(() => setShowLogin(true), 3000);
    };

    // ΓöÇΓöÇΓöÇ Login & Save ΓöÇΓöÇΓöÇ
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError(null);
        setExistingBusinessId(null);

        try {
            // 1. Check if email or phone already exists
            const { data: existing, error: checkError } = await supabase
                .from('businesses')
                .select('id, entity_name')
                .or(`email.eq.${loginData.email},phone.eq.${loginData.phone}`)
                .maybeSingle();

            if (checkError) throw checkError;

            if (existing) {
                setLoginError("This email or mobile number is already registered.");
                setExistingBusinessId(existing.id);
                return;
            }

            // 2. If not, proceed with registration
            const { data: business, error: insertError } = await supabase.from('businesses').insert({
                entity_name: formData.entityName || loginData.businessName || 'Unknown Business',
                location: formData.location,
                business_age: parseInt(formData.age) || 1,
                classification: formData.classification,
                scalability: formData.scalability,
                digital_footprint: formData.digitalFootprint,
                owner_name: loginData.ownerName,
                email: loginData.email,
                phone: loginData.phone,
            }).select().single();

            if (insertError) throw insertError;

            if (business) {
                // Persist business ID
                localStorage.setItem('masterkey_business_id', business.id);
                setLoggedInBusinessId(business.id);

                // Save threat result
                if (threatResult) {
                    await supabase.from('ai_threat_results').insert({
                        business_id: business.id,
                        score: threatResult.score,
                        years_left: threatResult.yearsLeft,
                        threat_level: threatResult.threatLevel,
                        timeline_desc: threatResult.timelineDesc,
                        industry: formData.classification,
                        modifiers: {
                            salesChannels: [],
                            usesSoftware: false,
                            businessAge: parseInt(formData.age) || 1,
                        },
                    });
                }
                router.push(`/dashboard?id=${business.id}`);
            }
        } catch (err) {
            console.error('Login Error:', err);
            setLoginError(err.message || "An unexpected error occurred. Please try again.");
        }
    };

    // Initial check for logged-in status
    useEffect(() => {
        const savedId = localStorage.getItem('masterkey_business_id');
        if (savedId) setLoggedInBusinessId(savedId);
    }, []);

    // Sidebar dashboard click
    const handleDashboardClick = () => {
        setSidebarOpen(false);
        if (!threatResult) {
            setShowLogin(true);
        } else {
            setShowLogin(true);
        }
    };

    // Animated score counter
    const [displayScore, setDisplayScore] = useState(0);
    useEffect(() => {
        if (threatResult && animPhase === 2) {
            let start = 0;
            const target = threatResult.score;
            const step = Math.max(1, Math.floor(target / 40));
            const timer = setInterval(() => {
                start += step;
                if (start >= target) { start = target; clearInterval(timer); }
                setDisplayScore(start);
            }, 30);
            return () => clearInterval(timer);
        }
    }, [threatResult, animPhase]);

    // Scanning text effect
    const scanTexts = t.diagnostic.scanSteps;
    const [scanIdx, setScanIdx] = useState(0);
    useEffect(() => {
        if (animPhase === 1) {
            const iv = setInterval(() => setScanIdx(p => (p + 1) % scanTexts.length), 500);
            return () => clearInterval(iv);
        }
    }, [animPhase, scanTexts]);

    const isKhatra = threatResult && threatResult.score > 60;
    const isSavdhan = threatResult && threatResult.score > 30 && threatResult.score <= 60;
    const threatColor = isKhatra ? 'text-ios-orange' : isSavdhan ? 'text-ios-orange/60' : 'text-ios-blue';
    const threatBg = isKhatra ? 'from-ios-orange/20 via-ios-orange/10' : isSavdhan ? 'from-ios-orange/10 via-ios-orange/5' : 'from-ios-blue/20 via-ios-blue/10';

    return (
        <div className="bg-background-dark font-sans text-slate-100 min-h-screen selection:bg-ios-blue/30 selection:text-ios-blue overflow-x-hidden">
            {/* Minimal Grid Background */}
            <div className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>
            <div className="fixed top-0 left-0 w-full h-screen spotlight pointer-events-none z-0"></div>

            {/* ΓòÉΓòÉΓòÉ SIDEBAR OVERLAY ΓòÉΓòÉΓòÉ */}
            {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-[90] backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}
            <div className={`fixed top-0 right-0 h-full w-80 bg-background-dark/95 border-l border-white/10 z-[100] transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <img src="/logo.png" alt="MasterKey Labs" className="h-14 w-auto" />
                    <button onClick={() => setSidebarOpen(false)} className="text-white/60 hover:text-white">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <nav className="p-4 space-y-1">
                    {loggedInBusinessId ? (
                        <Link href={`/dashboard?id=${loggedInBusinessId}`} onClick={() => setSidebarOpen(false)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-primary hover:bg-primary/5 transition-all text-left">
                            <span className="material-symbols-outlined">dashboard</span>
                            <span className="text-sm font-semibold">Dashboard</span>
                        </Link>
                    ) : (
                        <button onClick={() => { setSidebarOpen(false); setShowLogin(true); }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-primary hover:bg-primary/5 transition-all text-left">
                            <span className="material-symbols-outlined">login</span>
                            <span className="text-sm font-semibold">Signup / Login</span>
                        </button>
                    )}
                    <a href="#services" onClick={() => setSidebarOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-primary hover:bg-primary/5 transition-all">
                        <span className="material-symbols-outlined">design_services</span>
                        <span className="text-sm font-semibold">Services</span>
                    </a>
                    <div className="pl-12 space-y-1">
                        <a href="#services" onClick={() => setSidebarOpen(false)} className="block py-2 text-xs text-white/40 hover:text-primary transition-colors">Brand & Identity Design</a>
                        <a href="#services" onClick={() => setSidebarOpen(false)} className="block py-2 text-xs text-white/40 hover:text-primary transition-colors">Systems & Automation</a>
                        <a href="#services" onClick={() => setSidebarOpen(false)} className="block py-2 text-xs text-white/40 hover:text-primary transition-colors">Leads & Growth</a>
                        <a href="#services" onClick={() => setSidebarOpen(false)} className="block py-2 text-xs text-white/40 hover:text-primary transition-colors">Strategy & Consulting</a>
                    </div>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-primary hover:bg-primary/5 transition-all">
                        <span className="material-symbols-outlined">contact_support</span>
                        <span className="text-sm font-semibold">Contact</span>
                    </a>
                </nav>
            </div>

            {/* ΓòÉΓòÉΓòÉ HEADER ΓòÉΓòÉΓòÉ */}
            <header className="relative z-50 pt-8 pb-4">
                {/* Navigation ΓÇö top right */}
                <div className="absolute top-8 right-6 md:right-12 flex items-center gap-4 z-50">
                    <div className="flex bg-white/5 rounded-full p-1 border border-white/10 backdrop-blur-md">
                        <button onClick={() => setLang('en')} className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${lang === 'en' ? 'bg-ios-blue text-white' : 'text-white/40 hover:text-white/60'}`}>EN</button>
                        <button onClick={() => setLang('hinglish')} className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${lang === 'hinglish' ? 'bg-ios-blue text-white' : 'text-white/40 hover:text-white/60'}`}>HINGLISH</button>
                        <button onClick={() => setLang('hi')} className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${lang === 'hi' ? 'bg-ios-blue text-white' : 'text-white/40 hover:text-white/60'}`}>αñ╣αñ┐αñ¿αÑìαñªαÑÇ</button>
                    </div>
                    <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-white/5 rounded-full transition-colors group">
                        <span className="material-symbols-outlined text-white/80 text-2xl">menu</span>
                    </button>
                </div>

                {/* Centered Glass Key ΓÇö Hyper-realistic focal point */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center text-center px-6"
                >
                    <motion.div variants={itemVariants} className="relative mb-0 mt-[-20px] scale-75 md:scale-100">
                        <GlassKey />
                    </motion.div>

                    <motion.p variants={itemVariants} className="text-white/40 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-medium mb-8">
                        &quot;{t.tagline}&quot;
                    </motion.p>

                    {/* Status badge + Taglines */}
                    <div className="flex flex-col items-center gap-4 max-w-3xl">
                        <motion.div variants={itemVariants} className="ios-badge-cyan">
                            {t.badge}
                        </motion.div>
                        <motion.h1 variants={itemVariants} className="text-4xl md:text-7xl font-bold leading-[1.1] text-white tracking-tight">
                            {t.hero.title1} <br className="hidden md:block" />
                            <span className="text-ios-blue">{t.hero.title2}</span>.
                        </motion.h1>
                        <motion.p variants={itemVariants} className="text-white/50 text-base md:text-xl font-normal max-w-xl mt-4 leading-relaxed">
                            {t.hero.sub}
                        </motion.p>
                    </div>
                </motion.div>
            </header>

            {/* ΓòÉΓòÉΓòÉ LOGIN DIALOG ΓòÉΓòÉΓòÉ */}
            {
                showLogin && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
                        <div className="system-card p-10 max-w-sm w-full relative animate-fade-in border border-white/5 shadow-2xl">
                            <button onClick={() => setShowLogin(false)} className="absolute top-6 right-6 text-white/20 hover:text-white/60 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                            <div className="text-center mb-10">
                                <div className="w-16 h-16 bg-ios-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <span className="material-symbols-outlined text-ios-blue text-3xl">key</span>
                                </div>
                                <h3 className="text-xl font-semibold text-white">System Access</h3>
                                <p className="text-xs text-white/30 mt-2 font-medium">Verify credentials for full analytics report</p>
                            </div>
                            <form onSubmit={handleLogin} className="space-y-4">
                                {loginError && (
                                    <div className="p-4 bg-ios-orange/10 border border-ios-orange/20 rounded-xl mb-6">
                                        <p className="text-[11px] text-ios-orange font-bold uppercase tracking-wider mb-2">Notice</p>
                                        <p className="text-xs text-white/60 mb-4 leading-relaxed">{loginError}</p>
                                        {existingBusinessId && (
                                            <button
                                                type="button"
                                                onClick={() => router.push(`/dashboard?id=${existingBusinessId}`)}
                                                className="w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/80 text-[10px] font-bold uppercase tracking-widest transition-all"
                                            >
                                                Go to Dashboard
                                            </button>
                                        )}
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <label className="text-[10px] text-white/20 uppercase tracking-widest font-bold ml-1">Entity</label>
                                    <input className="ios-input w-full" placeholder="Business Name" name="businessName" value={loginData.businessName} onChange={handleLoginChange} required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-white/20 uppercase tracking-widest font-bold ml-1">Principal</label>
                                    <input className="ios-input w-full" placeholder="Full Name" name="ownerName" value={loginData.ownerName} onChange={handleLoginChange} required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-white/20 uppercase tracking-widest font-bold ml-1">Email</label>
                                    <input className="ios-input w-full" placeholder="email@company.com" type="email" name="email" value={loginData.email} onChange={handleLoginChange} required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-white/20 uppercase tracking-widest font-bold ml-1">Contact</label>
                                    <input className="ios-input w-full" placeholder="Phone Number" type="tel" name="phone" value={loginData.phone} onChange={handleLoginChange} required />
                                </div>
                                <button type="submit" className="ios-button-primary w-full py-4 text-sm mt-6 flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-lg">verified_user</span>
                                    Authenticate
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* ΓòÉΓòÉΓòÉ MAIN CONTENT ΓòÉΓòÉΓòÉ */}
            <main className="relative z-10">
                <section className="container mx-auto px-6 py-8 lg:py-14 flex flex-col items-center">
                    <div className="relative w-full max-w-6xl flex flex-col lg:flex-row items-stretch justify-center gap-6 lg:gap-10">

                        {/* ΓòÉΓòÉΓòÉ DIAGNOSTIC CORE DIALOG ΓòÉΓòÉΓòÉ */}
                        <motion.div
                            variants={sectionVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="relative w-full lg:w-3/5 order-1"
                        >
                            <div className="absolute -inset-10 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
                            <div className="glass relative rounded-[2.5rem] p-10 md:p-12 border-primary/20 flex flex-col items-center justify-center min-h-[520px] text-center overflow-hidden shadow-[0_0_60px_rgba(0,229,255,0.08)]">
                                <div className="scanline"></div>

                                <AnimatePresence mode="wait">
                                    {/* ΓöÇΓöÇ PHASE 0: IDLE ΓÇö Awaiting ΓöÇΓöÇ */}
                                    {animPhase === 0 && (
                                        <motion.div
                                            key="phase0"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 1.05 }}
                                            transition={{ duration: 0.5 }}
                                            className="relative z-10 flex flex-col items-center py-12"
                                        >
                                            <div className="relative mb-12">
                                                <div className="w-32 h-32 bg-white/[0.03] rounded-3xl flex items-center justify-center border border-white/10 shadow-inner">
                                                    <span className="material-symbols-outlined text-ios-blue text-5xl opacity-80">analytics</span>
                                                </div>
                                            </div>
                                            <h3 className="text-white font-semibold text-2xl tracking-tight mb-4">
                                                {t.diagnostic.readyTitle}
                                            </h3>
                                            <p className="text-white/40 max-w-sm mx-auto text-sm leading-relaxed">
                                                {t.diagnostic.readySub}
                                            </p>

                                            {/* Status dots */}
                                            <div className="mt-8 flex space-x-2">
                                                <span className="w-1.5 h-1.5 bg-ios-blue/40 rounded-full"></span>
                                                <span className="w-1.5 h-1.5 bg-ios-blue/40 rounded-full"></span>
                                                <span className="w-1.5 h-1.5 bg-ios-blue/40 rounded-full"></span>
                                            </div>

                                            <div className="mt-10">
                                                {loggedInBusinessId ? (
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => router.push(`/dashboard?id=${loggedInBusinessId}`)}
                                                        className="ios-button-secondary px-6 py-2.5 text-xs uppercase tracking-widest flex items-center gap-2"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">dashboard</span>
                                                        Dashboard
                                                    </motion.button>
                                                ) : (
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => setShowLogin(true)}
                                                        className="ios-button-secondary px-6 py-2.5 text-xs uppercase tracking-widest flex items-center gap-2"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">login</span>
                                                        Sign In
                                                    </motion.button>
                                                )}
                                            </div>

                                            <div className="mt-12 grid grid-cols-3 gap-8">
                                                <div className="text-center">
                                                    <div className="text-white/80 font-bold text-lg">1.2k+</div>
                                                    <div className="text-[9px] text-white/30 uppercase tracking-widest font-bold">{t.diagnostic.reports}</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-ios-orange/80 font-bold text-lg">73%</div>
                                                    <div className="text-[9px] text-white/30 uppercase tracking-widest font-bold">{t.diagnostic.atRisk}</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-ios-cyan/80 font-bold text-lg">30s</div>
                                                    <div className="text-[9px] text-white/30 uppercase tracking-widest font-bold">{t.diagnostic.process}</div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* ΓöÇΓöÇ PHASE 1: SCANNING ANIMATION ΓöÇΓöÇ */}
                                    {animPhase === 1 && (
                                        <motion.div
                                            key="phase1"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 1.05 }}
                                            transition={{ duration: 0.5 }}
                                            className="relative z-10 flex flex-col items-center py-12"
                                        >
                                            <div className="relative w-40 h-40 mb-12">
                                                {/* Minimal circular progress */}
                                                <div className="absolute inset-0 border-[3px] border-white/5 rounded-full"></div>
                                                <div className="absolute inset-0 border-[3px] border-ios-blue rounded-full border-t-transparent animate-spin"></div>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-ios-blue text-4xl opacity-50">searching</span>
                                                </div>
                                            </div>
                                            <h3 className="text-white font-semibold text-xl tracking-tight mb-3">
                                                {t.diagnostic.scanning}
                                            </h3>
                                            <p className="text-ios-blue/60 text-xs font-mono uppercase tracking-widest animate-pulse h-5 lg:h-auto">
                                                {scanTexts[scanIdx]}
                                            </p>
                                            <div className="w-72 h-1 bg-white/5 rounded-full mt-10 overflow-hidden">
                                                <div className="h-full bg-ios-blue rounded-full transition-all duration-300" style={{ width: '100%' }}></div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* ΓöÇΓöÇ PHASE 2: RESULTS ΓöÇΓöÇ */}
                                    {animPhase === 2 && threatResult && (
                                        <motion.div
                                            key="phase2"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 1.05 }}
                                            transition={{ duration: 0.5 }}
                                            className="relative z-10 w-full py-8"
                                        >
                                            <div className="relative">
                                                {/* Results Badge */}
                                                <div className="flex justify-center mb-8">
                                                    <span className={isKhatra ? 'ios-badge-orange' : 'ios-badge-cyan'}>
                                                        {isKhatra ? t.diagnostic.results.vulnerable : t.diagnostic.results.minimal}
                                                    </span>
                                                </div>

                                                {/* Score */}
                                                <div className="text-center mb-10">
                                                    <div className={`text-8xl md:text-9xl font-bold tracking-tighter ${threatColor} leading-none`}>
                                                        {displayScore}
                                                        <span className="text-2xl text-white/10 font-medium tracking-normal ml-2">%</span>
                                                    </div>
                                                    <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-bold mt-4">{t.diagnostic.results.index}</p>
                                                </div>

                                                {/* Simple Stats Grid */}
                                                <div className="grid grid-cols-2 gap-4 mb-8">
                                                    <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/5 text-center">
                                                        <div className={`text-3xl font-bold ${threatColor}`}>{threatResult.yearsLeft}</div>
                                                        <div className="text-[9px] text-white/30 uppercase tracking-widest font-bold mt-2">{t.diagnostic.results.yearsLeft}</div>
                                                    </div>
                                                    <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/5 text-center">
                                                        <div className="text-3xl font-bold text-white/80 shrink-0">{formData.classification.replace('_', ' ')}</div>
                                                        <div className="text-[9px] text-white/30 uppercase tracking-widest font-bold mt-2">{t.diagnostic.results.vertical}</div>
                                                    </div>
                                                </div>

                                                {/* Summary text */}
                                                <div className="bg-white/[0.03] p-6 rounded-2xl border-l-[3px] border-l-ios-blue/40 border-y border-r border-white/5">
                                                    <p className="text-sm text-white/60 leading-relaxed font-medium">"{threatResult.timelineDesc}"</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>

                        {/* ΓòÉΓòÉΓòÉ RIGHT COLUMN ΓÇö FORM ΓòÉΓòÉΓòÉ */}
                        <motion.form
                            variants={sectionVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="w-full lg:w-2/5 order-2 flex flex-col gap-6"
                            onSubmit={handleSubmit}
                        >
                            <div className="space-y-1">
                                <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold ml-1">{t.form.entity}</label>
                                <input className="ios-input w-full" placeholder={t.form.entityPlaceholder} type="text" name="entityName" value={formData.entityName} onChange={handleChange} required />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold ml-1">{t.form.location}</label>
                                <input className="ios-input w-full" placeholder={t.form.locationPlaceholder} type="text" name="location" value={formData.location} onChange={handleChange} />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold ml-1">{t.form.presence}</label>
                                <input className="ios-input w-full" placeholder={t.form.presencePlaceholder} type="number" name="age" value={formData.age} onChange={handleChange} />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold ml-1">{t.form.classification}</label>
                                <select className="ios-input w-full appearance-none cursor-pointer" name="classification" value={formData.classification} onChange={handleChange}>
                                    <option value="ecommerce" className="bg-ios-gray-dark">E-commerce</option>
                                    <option value="saas" className="bg-ios-gray-dark">SaaS / Tech</option>
                                    <option value="local_business" className="bg-ios-gray-dark">Local Business</option>
                                    <option value="manufacturing" className="bg-ios-gray-dark">Manufacturing</option>
                                    <option value="retail" className="bg-ios-gray-dark">Retail</option>
                                    <option value="restaurant" className="bg-ios-gray-dark">Restaurant / F&amp;B</option>
                                    <option value="services" className="bg-ios-gray-dark">Services</option>
                                    <option value="real_estate" className="bg-ios-gray-dark">Real Estate</option>
                                    <option value="healthcare" className="bg-ios-gray-dark">Healthcare</option>
                                    <option value="coaching" className="bg-ios-gray-dark">Coaching / Tuition</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold ml-1">{t.form.scale}</label>
                                <select className="ios-input w-full appearance-none cursor-pointer" name="scalability" value={formData.scalability} onChange={handleChange}>
                                    <option className="bg-ios-gray-dark">1-10 (Micro)</option>
                                    <option className="bg-ios-gray-dark">11-50 (Small)</option>
                                    <option className="bg-ios-gray-dark">51-200 (Mid)</option>
                                    <option className="bg-ios-gray-dark">200+ (Large)</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold ml-1">{t.form.infrastructure}</label>
                                <select className="ios-input w-full appearance-none cursor-pointer" name="digitalFootprint" value={formData.digitalFootprint} onChange={handleChange}>
                                    <option value="none" className="bg-ios-gray-dark">Offline Only</option>
                                    <option value="social" className="bg-ios-gray-dark">Social Media Channels</option>
                                    <option value="website" className="bg-ios-gray-dark">Web Properties</option>
                                    <option value="marketplace" className="bg-ios-gray-dark">Marketplace Integration</option>
                                    <option value="website_social" className="bg-ios-gray-dark">Web + Social Systems</option>
                                    <option value="crm" className="bg-ios-gray-dark">Partial Automation (CRM/ERP)</option>
                                    <option value="full" className="bg-ios-gray-dark">Full System Automation</option>
                                </select>
                            </div>

                            <div className="mt-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="ios-button-primary w-full py-5 text-sm flex items-center justify-center gap-3 disabled:opacity-50 transition-all shadow-lg active:shadow-sm"
                                    type="submit"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                                            {t.form.submitting}
                                        </>
                                    ) : (
                                        <>
                                            {t.form.submit}
                                            <span className="material-symbols-outlined text-xl">arrow_right_alt</span>
                                        </>
                                    )}
                                </motion.button>
                                <p className="mt-4 text-[10px] text-white/20 text-center uppercase tracking-widest font-bold leading-relaxed">
                                    {t.form.footer1} <br />
                                    <span className="text-white/40">{t.form.footer2}</span>
                                </p>
                            </div>
                        </motion.form>
                    </div>

                    <div className="mt-12 text-center max-w-xl">
                        <p className="text-slate-300 text-sm md:text-base font-medium">
                            {t.cta.main} <br />
                            <span className="text-primary/70">{t.cta.sub}</span>
                        </p>
                    </div>
                </section>

                {/* ΓòÉΓòÉΓòÉ SERVICES SECTION ΓòÉΓòÉΓòÉ */}
                <motion.section
                    id="services"
                    variants={sectionVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="py-32 border-t border-white/5 bg-white/[0.01]"
                >
                    <div className="container mx-auto px-6">
                        <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
                            <div>
                                <h2 className="text-4xl font-bold text-white tracking-tight mb-4">{t.services.title}</h2>
                                <div className="h-1 w-12 bg-ios-blue rounded-full"></div>
                            </div>
                            <p className="text-white/30 max-w-sm text-right hidden md:block text-sm font-medium">
                                {t.services.sub}
                            </p>
                        </motion.div>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                            <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="md:col-span-7 system-card p-12 group transition-shadow hover:shadow-2xl hover:shadow-ios-blue/5">
                                <div className="flex items-start justify-between mb-10">
                                    <div className="w-14 h-14 rounded-2xl bg-ios-blue/10 flex items-center justify-center border border-ios-blue/20">
                                        <span className="material-symbols-outlined text-ios-blue text-3xl">swatches</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Protocol 01</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-6">{t.services.p1.title}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-10">
                                    <div><h4 className="text-white/80 font-semibold mb-2 text-sm">Visual Infrastructure</h4><p className="text-xs text-white/40 leading-relaxed font-medium">{t.services.p1.sub.split(', ')[0]}</p></div>
                                    <div><h4 className="text-white/80 font-semibold mb-2 text-sm">Market Strategy</h4><p className="text-xs text-white/40 leading-relaxed font-medium">{t.services.p1.sub.split(', ')[1]}</p></div>
                                    <div><h4 className="text-white/80 font-semibold mb-2 text-sm">Product Interface</h4><p className="text-xs text-white/40 leading-relaxed font-medium">{t.services.p1.sub.split(', ')[2]}</p></div>
                                    <div><h4 className="text-white/80 font-semibold mb-2 text-sm">Authority Assets</h4><p className="text-xs text-white/40 leading-relaxed font-medium">{t.services.p1.sub.split(', ')[3]}</p></div>
                                </div>
                            </motion.div>
                            <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="md:col-span-5 system-card p-12 group transition-shadow hover:shadow-2xl hover:shadow-ios-cyan/5">
                                <div className="flex items-start justify-between mb-10">
                                    <div className="w-14 h-14 rounded-2xl bg-ios-cyan/10 flex items-center justify-center border border-ios-cyan/20"><span className="material-symbols-outlined text-ios-cyan text-3xl">terminal</span></div>
                                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Protocol 02</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-6">{t.services.p2.title}</h3>
                                <ul className="space-y-6 mt-8">
                                    <li className="flex items-start gap-4"><span className="w-1.5 h-1.5 bg-ios-cyan rounded-full mt-2 shrink-0"></span><span className="text-xs text-white/40 font-medium leading-relaxed">{t.services.p2.sub.split(', ')[0]}</span></li>
                                    <li className="flex items-start gap-4"><span className="w-1.5 h-1.5 bg-ios-cyan rounded-full mt-2 shrink-0"></span><span className="text-xs text-white/40 font-medium leading-relaxed">{t.services.p2.sub.split(', ')[1]}</span></li>
                                    <li className="flex items-start gap-4"><span className="w-1.5 h-1.5 bg-ios-cyan rounded-full mt-2 shrink-0"></span><span className="text-xs text-white/40 font-medium leading-relaxed">{t.services.p2.sub.split(', ')[2]}</span></li>
                                </ul>
                            </motion.div>
                            <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="md:col-span-6 lg:col-span-4 system-card p-12 group transition-shadow hover:shadow-2xl hover:shadow-ios-orange/5">
                                <div className="flex items-start justify-between mb-10">
                                    <div className="w-14 h-14 rounded-2xl bg-ios-orange/10 flex items-center justify-center border border-ios-orange/20"><span className="material-symbols-outlined text-ios-orange text-3xl">rocket</span></div>
                                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Protocol 03</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-6">{t.services.p3.title}</h3>
                                <div className="space-y-4 mt-8">
                                    <div className="p-5 bg-white/[0.02] rounded-2xl border border-white/5"><h4 className="text-white/80 font-semibold mb-1 text-sm">Precision Targeting</h4><p className="text-xs text-white/40 font-medium">{t.services.p3.sub.split(', ')[0]}</p></div>
                                    <div className="p-5 bg-white/[0.02] rounded-2xl border border-white/5"><h4 className="text-white/80 font-semibold mb-1 text-sm">Automated Funnels</h4><p className="text-xs text-white/40 font-medium">{t.services.p3.sub.split(', ')[1]}</p></div>
                                </div>
                            </motion.div>
                            <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="md:col-span-6 lg:col-span-8 system-card p-12 group transition-shadow hover:shadow-2xl hover:shadow-ios-blue/5">
                                <div className="flex items-start justify-between mb-10">
                                    <div className="w-14 h-14 rounded-2xl bg-ios-blue/10 flex items-center justify-center border border-ios-blue/20"><span className="material-symbols-outlined text-ios-blue text-3xl">insights</span></div>
                                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Protocol 04</span>
                                </div>
                                <div className="grid md:grid-cols-2 gap-10">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-6">{t.services.p4.title}</h3>
                                        <p className="text-sm text-white/40 leading-relaxed font-medium">{t.services.p4.sub.split(', ')[0]}</p>
                                    </div>
                                    <div className="flex flex-col gap-5">
                                        <div className="flex gap-4 items-center"><span className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-ios-blue font-bold text-xs shrink-0">01</span><span className="text-xs text-white/50 font-medium">{t.services.p4.sub.split(', ')[1]}</span></div>
                                        <div className="flex gap-4 items-center"><span className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-ios-blue font-bold text-xs shrink-0">02</span><span className="text-xs text-white/50 font-medium">Scalable Technology Roadmap</span></div>
                                        <div className="flex gap-4 items-center"><span className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-ios-blue font-bold text-xs shrink-0">03</span><span className="text-xs text-white/50 font-medium">International Market Expansion</span></div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.section>

                {/* Footer */}
                <footer className="border-t border-white/5 pt-20 pb-24 bg-black/40">
                    <div className="container mx-auto px-6 flex flex-col items-center text-center">
                        <div className="mb-10 opacity-80 flex items-center justify-center">
                            <img src="/logo.png" alt="MasterKey Labs" className="h-8 md:h-10 w-auto object-contain brightness-110" />
                        </div>
                        <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 mb-16">
                            <a className="text-white/30 hover:text-ios-blue transition-colors uppercase text-[10px] font-bold tracking-[0.2em]" href="#">Systems</a>
                            <a className="text-white/30 hover:text-ios-blue transition-colors uppercase text-[10px] font-bold tracking-[0.2em]" href="#">Infrastructure</a>
                            <a className="text-white/30 hover:text-ios-blue transition-colors uppercase text-[10px] font-bold tracking-[0.2em]" href="#">Intelligence</a>
                            <a className="text-white/30 hover:text-ios-blue transition-colors uppercase text-[10px] font-bold tracking-[0.2em]" href="#">Directives</a>
                        </div>
                        <div className="text-white/10 text-[9px] tracking-[0.3em] font-bold uppercase">┬⌐ 2025 MASTERKEY LABS ΓÇö ADAPTIVE SYSTEMS PROTOCOL</div>
                    </div>
                </footer>
            </main>
        </div >
    );
}
