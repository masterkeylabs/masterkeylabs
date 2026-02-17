'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { calculateAIThreat } from '@/lib/calculations';
import bcrypt from 'bcryptjs';

export default function Home() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [threatResult, setThreatResult] = useState(null);
    const [showLogin, setShowLogin] = useState(false);
    const [animPhase, setAnimPhase] = useState(0); // 0=idle, 1=scanning, 2=done
    const [loginData, setLoginData] = useState({
        businessName: '', ownerName: '', email: '', phone: '', businessType: '',
        password: '', confirmPassword: ''
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

    // ─── Check Threat Level ───
    const handleSubmit = async (e) => {
        e.preventDefault();

        const age = parseInt(formData.age) || 0;
        if (age < 0 || age > 100) {
            alert("Please enter a valid business age (0-100 years).");
            return;
        }

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
            businessAge: age,
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

    // ─── Login & Save ───
    const [authMode, setAuthMode] = useState('signup'); // 'signup' or 'login'
    const [otpStep, setOtpStep] = useState(1); // 1 = enter identifier, 2 = verify otp
    const [identifier, setIdentifier] = useState(''); // email/phone for login
    const [password, setPassword] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [sendingOtp, setSendingOtp] = useState(false);

    // ─── Signup Flow ───
    const handleSignup = async (e) => {
        e.preventDefault();
        setLoginError(null);
        setExistingBusinessId(null);
        setSendingOtp(true);

        if (loginData.password !== loginData.confirmPassword) {
            setLoginError("Passwords do not match.");
            setSendingOtp(false);
            return;
        }

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
                setSendingOtp(false);
                return;
            }

            // 2. Hash password
            const hashedPassword = await bcrypt.hash(loginData.password, 10);

            // 3. If not, proceed with registration
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
                password_hash: hashedPassword,
            }).select().single();

            if (insertError) {
                console.error('Supabase Insert Error:', insertError);
                throw new Error(insertError.message || insertError.details || "Database insert failed.");
            }

            if (business) {
                localStorage.setItem('masterkey_business_id', business.id);
                setLoggedInBusinessId(business.id);

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
            console.error('Signup Error:', err);
            setLoginError(err.message || "An unexpected error occurred. Please try again.");
        } finally {
            setSendingOtp(false);
        }
    };

    const [sentTo, setSentTo] = useState(''); // Masked destination


    // ─── Login Flow (Password Based) ───
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError(null);
        setSendingOtp(true);

        try {
            const res = await fetch('/api/auth/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            localStorage.setItem('masterkey_business_id', data.businessId);
            router.push(`/dashboard?id=${data.businessId}`);
        } catch (err) {
            setLoginError(err.message);
        } finally {
            setSendingOtp(false);
        }
    };

    const handleLoginVerify = async (e) => {
        e.preventDefault();
        setLoginError(null);
        setSendingOtp(true);

        try {
            const res = await fetch('/api/auth/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, code: otpCode }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            localStorage.setItem('masterkey_business_id', data.businessId);
            router.push(`/dashboard?id=${data.businessId}`);
        } catch (err) {
            setLoginError(err.message);
        } finally {
            setSendingOtp(false);
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
        if (loggedInBusinessId) {
            router.push(`/dashboard?id=${loggedInBusinessId}`);
        } else {
            setAuthMode('login');
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
    const scanTexts = ['Scanning Industry Data...', 'Analyzing Competition...', 'Calculating AI Impact...', 'Evaluating Digital Presence...', 'Generating Threat Report...'];
    const [scanIdx, setScanIdx] = useState(0);
    useEffect(() => {
        if (animPhase === 1) {
            const iv = setInterval(() => setScanIdx(p => (p + 1) % scanTexts.length), 500);
            return () => clearInterval(iv);
        }
    }, [animPhase]);

    const isKhatra = threatResult?.threatLevel === 'KHATRA';
    const isSavdhan = threatResult?.threatLevel === 'SAVDHAN';
    const threatColor = isKhatra ? 'text-red-500' : isSavdhan ? 'text-orange-400' : 'text-emerald-400';
    const threatBg = isKhatra ? 'from-red-500/20 via-red-900/10' : isSavdhan ? 'from-orange-500/20 via-orange-900/10' : 'from-emerald-500/20 via-emerald-900/10';

    return (
        <div className="bg-background-dark font-display text-slate-100 min-h-screen selection:bg-primary/30 selection:text-primary overflow-x-hidden">
            {/* Grid Background */}
            <div className="fixed inset-0 pointer-events-none z-[-1] opacity-10" style={{ backgroundImage: 'linear-gradient(#00e5ff 1px, transparent 1px), linear-gradient(90deg, #00e5ff 1px, transparent 1px)', backgroundSize: '80px 80px' }}></div>
            <div className="fixed top-0 left-0 w-full h-screen spotlight pointer-events-none z-0"></div>

            {/* ═══ SIDEBAR OVERLAY ═══ */}
            {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-[90] backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}
            <div className={`fixed top-0 right-0 h-full w-80 bg-background-dark/95 border-l border-white/10 z-[100] transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <Link href="/" className="hover:opacity-80 transition-opacity">
                        <img src="/logo.png" alt="MasterKey Labs" className="h-20 w-auto" />
                    </Link>
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
                        <div className="p-2 space-y-1">
                            <button onClick={() => { setSidebarOpen(false); setAuthMode('signup'); setShowLogin(true); }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all text-left">
                                <span className="material-symbols-outlined text-sm">person_add</span>
                                <span className="text-xs font-black uppercase tracking-widest">Create Account</span>
                            </button>
                            <button onClick={() => { setSidebarOpen(false); setAuthMode('login'); setShowLogin(true); }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all text-left">
                                <span className="material-symbols-outlined text-sm">login</span>
                                <span className="text-xs font-black uppercase tracking-widest">Login</span>
                            </button>
                        </div>
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
                    <a href="mailto:support@masterkeylabs.in" className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-primary hover:bg-primary/5 transition-all">
                        <span className="material-symbols-outlined">contact_support</span>
                        <span className="text-sm font-semibold">Contact</span>
                    </a>
                </nav>
            </div>

            {/* ═══ HEADER ═══ */}
            <header className="relative z-50 pt-4 pb-2">
                {/* Hamburger menu — top right */}
                <button onClick={() => setSidebarOpen(true)} className="absolute top-4 right-4 md:top-6 md:right-12 p-2 md:p-2.5 hover:bg-white/5 rounded-xl transition-colors group z-50">
                    <span className="material-symbols-outlined text-primary text-xl md:text-2xl group-hover:rotate-180 transition-transform duration-500">menu</span>
                </button>

                {/* Centered Logo — Balanced Visibility */}
                <div className="flex flex-col items-center text-center px-6">
                    <Link href="/" className="relative h-12 md:h-20 flex items-center justify-center overflow-hidden w-full max-w-2xl bg-white/[0.01] rounded-2xl hover:bg-white/[0.03] transition-colors">
                        <img
                            src="/logo.png"
                            alt="MasterKey Labs"
                            className="relative h-[15rem] sm:h-[20rem] md:h-[30rem] w-auto object-contain drop-shadow-[0_0_20px_rgba(0,229,255,0.25)] scale-[1.05]"
                        />
                    </Link>


                    <p className="text-slate-300 italic text-[11px] md:text-base mt-2 relative z-10 font-medium">
                        &quot;AI tumhara business nahi lega. AI use karne wala insaan lega.&quot;
                    </p>

                    {/* Status badge + Taglines below logo — no borders */}
                    <div className="mt-4 flex flex-col items-center gap-2 max-w-2xl">
                        <div className="inline-block px-3 py-1 bg-primary/10 rounded-full text-primary text-[8px] md:text-[10px] font-bold tracking-[0.25em] uppercase animate-pulse">
                            ⚡ Status: Active Threat
                        </div>
                        <h1 className="text-2xl sm:text-4xl md:text-6xl font-extrabold leading-tight text-white tracking-tight">
                            Aapka Competitor Abhi <br className="hidden md:block" />
                            <span className="text-primary drop-shadow-[0_0_15px_rgba(0,229,255,0.3)]">AI Use Kar Raha Hai</span>.
                        </h1>
                        <p className="text-slate-400 text-sm md:text-lg font-light max-w-xl mt-4">
                            Har din jo aap wait karte ho — Wo din aapke business ki <br className="hidden md:block" />
                            <span className="text-white font-medium italic underline decoration-primary/30 underline-offset-4">Expiry Date</span> ke kareeb jata hai.
                        </p>
                    </div>
                </div>
            </header>

            {/* ═══ LOGIN DIALOG ═══ */}
            {
                showLogin && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
                        <div className="glass rounded-2xl p-6 md:p-8 max-w-md w-full border border-primary/20 relative animate-[fadeIn_0.3s_ease-out]">
                            <button onClick={() => { setShowLogin(false); setOtpStep(1); setLoginError(null); }} className="absolute top-4 right-4 text-white/40 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>

                            <div className="flex bg-white/5 rounded-xl p-1 mb-8 border border-white/5">
                                <button
                                    onClick={() => { setAuthMode('signup'); setLoginError(null); }}
                                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${authMode === 'signup' ? 'bg-primary text-background-dark shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white'}`}
                                >
                                    New Account
                                </button>
                                <button
                                    onClick={() => { setAuthMode('login'); setLoginError(null); }}
                                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${authMode === 'login' ? 'bg-primary text-background-dark shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white'}`}
                                >
                                    Login
                                </button>
                            </div>

                            <div className="text-center mb-6">
                                <span className="material-symbols-outlined text-primary text-3xl mb-2 block">
                                    {authMode === 'signup' ? 'person_add' : otpStep === 1 ? 'login' : 'vibration'}
                                </span>
                                <h3 className="text-xl font-bold text-white">
                                    {authMode === 'signup' ? 'Join MasterKey Labs' : otpStep === 1 ? 'Welcome Back' : 'Security Check'}
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    {authMode === 'signup' ? 'Create your business profile to start diagnostics' : otpStep === 1 ? 'Enter your credentials to access dashboard' : `Enter the 6-digit code sent to ${sentTo || identifier}`}
                                </p>
                            </div>

                            {loginError && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-6">
                                    <div className="flex items-center gap-3 text-red-400 text-[10px] font-black uppercase tracking-widest mb-1">
                                        <span className="material-symbols-outlined text-base">error</span>
                                        {authMode === 'signup' && loginError.includes('registered') ? "User Exists" : "Auth Failed"}
                                    </div>
                                    <p className="text-xs text-white/60">
                                        {loginError === "JSON object requested, multiple (or no) rows returned"
                                            ? "There was a problem accessing your data. Please try again."
                                            : loginError}
                                    </p>
                                    {authMode === 'signup' && existingBusinessId && (
                                        <button
                                            type="button"
                                            onClick={() => { setAuthMode('login'); setIdentifier(loginData.email || loginData.phone); setLoginError(null); }}
                                            className="w-full mt-3 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg text-primary text-[10px] font-black uppercase tracking-widest transition-all"
                                        >
                                            Switch to Login →
                                        </button>
                                    )}
                                </div>
                            )}

                            {authMode === 'signup' ? (
                                <form onSubmit={handleSignup} className="space-y-3">
                                    <div className="glass p-3 rounded-lg border-white/10">
                                        <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-1">Business Name</label>
                                        <input className="w-full bg-transparent border-0 p-0 text-white focus:ring-0 focus:outline-none text-sm placeholder:text-slate-700" placeholder="Your Business" name="businessName" value={loginData.businessName} onChange={handleLoginChange} required />
                                    </div>
                                    <div className="glass p-3 rounded-lg border-white/10">
                                        <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-1">Owner / Contact Name</label>
                                        <input className="w-full bg-transparent border-0 p-0 text-white focus:ring-0 focus:outline-none text-sm placeholder:text-slate-700" placeholder="Full Name" name="ownerName" value={loginData.ownerName} onChange={handleLoginChange} required />
                                    </div>
                                    <div className="glass p-3 rounded-lg border-white/10">
                                        <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-1">Email</label>
                                        <input className="w-full bg-transparent border-0 p-0 text-white focus:ring-0 focus:outline-none text-sm placeholder:text-slate-700" placeholder="email@company.com" type="email" name="email" value={loginData.email} onChange={handleLoginChange} required />
                                    </div>
                                    <div className="glass p-3 rounded-lg border-white/10">
                                        <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-1">Phone</label>
                                        <input className="w-full bg-transparent border-0 p-0 text-white focus:ring-0 focus:outline-none text-sm placeholder:text-slate-700" placeholder="+91 XXXXX XXXXX" type="tel" name="phone" value={loginData.phone} onChange={handleLoginChange} required />
                                    </div>
                                    <div className="glass p-3 rounded-lg border-white/10">
                                        <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-1">Password</label>
                                        <input className="w-full bg-transparent border-0 p-0 text-white focus:ring-0 focus:outline-none text-sm placeholder:text-slate-700" placeholder="••••••••" type="password" name="password" value={loginData.password} onChange={handleLoginChange} required />
                                    </div>
                                    <div className="glass p-3 rounded-lg border-white/10">
                                        <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-1">Confirm Password</label>
                                        <input className="w-full bg-transparent border-0 p-0 text-white focus:ring-0 focus:outline-none text-sm placeholder:text-slate-700" placeholder="••••••••" type="password" name="confirmPassword" value={loginData.confirmPassword} onChange={handleLoginChange} required />
                                    </div>
                                    <button type="submit" disabled={sendingOtp} className="w-full bg-primary hover:bg-primary/90 text-background-dark font-bold py-3 px-6 rounded-xl uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all active:scale-95 mt-4 disabled:opacity-50">
                                        <span className="material-symbols-outlined text-lg">rocket_launch</span>
                                        Create Account
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="glass p-4 rounded-xl border-white/10">
                                        <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-2">Email / Mobile No.</label>
                                        <input
                                            className="w-full bg-transparent border-0 p-0 text-white focus:ring-0 focus:outline-none text-base placeholder:text-slate-700"
                                            placeholder="email@example.com / 10 digit mobile no."
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="glass p-4 rounded-xl border-white/10">
                                        <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-2">Password</label>
                                        <input
                                            className="w-full bg-transparent border-0 p-0 text-white focus:ring-0 focus:outline-none text-base placeholder:text-slate-700"
                                            placeholder="Your secure password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <Link href="/user/forgot-password" size="sm" className="px-1 py-1 rounded-lg text-primary/60 hover:text-primary transition-all text-[10px] font-black uppercase tracking-widest">
                                            Forgot Password?
                                        </Link>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={sendingOtp}
                                        className="w-full bg-primary hover:bg-primary/90 text-background-dark font-bold py-4 px-6 rounded-xl uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {sendingOtp ? (
                                            <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-lg">login</span>
                                                Login to Dashboard
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                )
            }

            {/* ═══ MAIN CONTENT ═══ */}
            <main className="relative z-10">
                <section className="container mx-auto px-6 py-8 lg:py-14 flex flex-col items-center">
                    <div className="relative w-full max-w-6xl flex flex-col lg:flex-row items-stretch justify-center gap-6 lg:gap-10">

                        {/* ═══ DIAGNOSTIC CORE DIALOG ═══ */}
                        <div className="relative w-full lg:w-3/5 order-1">
                            <div className="absolute -inset-10 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
                            <div className="glass relative rounded-[1.5rem] md:rounded-[2.5rem] p-6 sm:p-10 md:p-12 border-primary/20 flex flex-col items-center justify-center min-h-[400px] md:min-h-[520px] text-center overflow-hidden shadow-[0_0_60px_rgba(0,229,255,0.08)]">
                                <div className="scanline"></div>

                                {/* ── PHASE 0: IDLE — Awaiting ── */}
                                {animPhase === 0 && (
                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className="relative mb-8">
                                            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150"></div>
                                            <div className="relative w-48 h-48 flex items-center justify-center">
                                                {/* Rotating rings */}
                                                <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
                                                <div className="absolute inset-3 border border-primary/10 rounded-full animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }}></div>
                                                <div className="absolute inset-6 border border-dashed border-primary/15 rounded-full animate-spin" style={{ animationDuration: '6s' }}></div>
                                                {/* Core icon */}
                                                <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-cyan-900/30 rounded-full flex items-center justify-center border border-primary/30 shadow-[0_0_40px_rgba(0,229,255,0.2)]">
                                                    <span className="material-symbols-outlined text-primary text-5xl animate-pulse">radar</span>
                                                </div>
                                            </div>
                                        </div>
                                        <h3 className="text-primary font-bold text-xl md:text-2xl tracking-[0.2em] uppercase mb-3 animate-pulse">
                                            AWAITING DIAGNOSTICS...
                                        </h3>
                                        <p className="text-slate-400 max-w-sm mx-auto text-sm">
                                            Details daalo aur dekho — aapka business <span className="text-white font-semibold">survive</span> karega ya <span className="text-red-400 font-semibold">replace</span> ho jayega.
                                        </p>
                                        <div className="mt-6 flex space-x-3">
                                            <span className="w-2 h-2 bg-primary rounded-full animate-ping"></span>
                                            <span className="w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDelay: '150ms' }}></span>
                                            <span className="w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDelay: '300ms' }}></span>
                                        </div>

                                        {/* Manual Entry / Login Toggle */}
                                        <div className="mt-6 flex flex-col items-center gap-4">
                                            {loggedInBusinessId ? (
                                                <button onClick={() => router.push(`/dashboard?id=${loggedInBusinessId}`)}
                                                    className="px-8 py-3 rounded-full border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/10 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.1)]">
                                                    <span className="material-symbols-outlined text-sm">dashboard</span>
                                                    Enter Dashboard
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => { setAuthMode('signup'); setShowLogin(true); }}
                                                        className="px-8 py-3 rounded-full bg-primary text-background-dark text-[10px] font-black uppercase tracking-[0.2em] hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-[0_0_25px_rgba(0,229,255,0.3)]">
                                                        <span className="material-symbols-outlined text-sm">person_add</span>
                                                        Signup
                                                    </button>
                                                    <button onClick={() => { setAuthMode('login'); setShowLogin(true); }}
                                                        className="px-8 py-3 rounded-full border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white hover:border-white/30 transition-all flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-sm">login</span>
                                                        Login
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
                                            <div className="glass px-3 py-2 rounded-lg">
                                                <div className="text-primary font-bold text-lg">1,247</div>
                                                <div className="text-[9px] text-slate-500 uppercase tracking-wider">Scans Done</div>
                                            </div>
                                            <div className="glass px-3 py-2 rounded-lg">
                                                <div className="text-red-400 font-bold text-lg">73%</div>
                                                <div className="text-[9px] text-slate-500 uppercase tracking-wider">At Risk</div>
                                            </div>
                                            <div className="glass px-3 py-2 rounded-lg">
                                                <div className="text-emerald-400 font-bold text-lg">30s</div>
                                                <div className="text-[9px] text-slate-500 uppercase tracking-wider">Free Scan</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── PHASE 1: SCANNING ANIMATION ── */}
                                {animPhase === 1 && (
                                    <div className="relative z-10 flex flex-col items-center">
                                        {/* Pulsing radar */}
                                        <div className="relative w-56 h-56 mb-8">
                                            <div className="absolute inset-0 border-2 border-red-500/30 rounded-full animate-ping" style={{ animationDuration: '1.5s' }}></div>
                                            <div className="absolute inset-4 border border-orange-400/20 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.3s' }}></div>
                                            <div className="absolute inset-8 border border-primary/20 rounded-full animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.6s' }}></div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-20 h-20 bg-gradient-to-br from-red-500/30 to-primary/20 rounded-full flex items-center justify-center border border-red-500/40 animate-pulse">
                                                    <span className="material-symbols-outlined text-red-400 text-4xl">security</span>
                                                </div>
                                            </div>
                                            {/* Sweeping line */}
                                            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
                                                <div className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-gradient-to-r from-primary to-transparent origin-left"></div>
                                            </div>
                                        </div>
                                        <h3 className="text-red-400 font-bold text-xl tracking-[0.15em] uppercase mb-2">
                                            THREAT SCAN IN PROGRESS
                                        </h3>
                                        <p className="text-primary/80 text-sm font-mono animate-pulse h-5">
                                            {scanTexts[scanIdx]}
                                        </p>
                                        <div className="w-64 h-1.5 bg-white/5 rounded-full mt-6 overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-primary to-red-500 rounded-full animate-[loading_2.5s_ease-in-out]" style={{ width: '100%' }}></div>
                                        </div>
                                    </div>
                                )}

                                {/* ── PHASE 2: RESULTS ── */}
                                {animPhase === 2 && threatResult && (
                                    <div className="relative z-10 w-full animate-[fadeIn_0.5s_ease-out]">
                                        <div className={`absolute inset-0 bg-gradient-to-b ${threatBg} to-transparent rounded-3xl opacity-50`}></div>
                                        <div className="relative">
                                            {/* Threat Badge */}
                                            <div className="flex justify-center mb-4">
                                                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.3em] border ${isKhatra ? 'bg-red-500/20 border-red-500/40 text-red-400' : isSavdhan ? 'bg-orange-500/20 border-orange-500/40 text-orange-400' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'}`}>
                                                    {isKhatra ? '⚠ KHATRA — HIGH RISK' : isSavdhan ? '⚡ SAVDHAN — MODERATE RISK' : '✓ SAFE — LOW RISK'}
                                                </span>
                                            </div>

                                            {/* Score */}
                                            <div className="text-center mb-6">
                                                <div className={`text-5xl sm:text-7xl md:text-8xl font-black ${threatColor} leading-none`}>
                                                    {displayScore}
                                                    <span className="text-xl md:text-2xl text-white/20">/100</span>
                                                </div>
                                                <p className="text-white/40 text-[10px] md:text-xs uppercase tracking-widest mt-2">AI Threat Score</p>
                                            </div>

                                            {/* Stats Grid */}
                                            <div className="grid grid-cols-2 gap-3 mb-6">
                                                <div className="glass p-4 rounded-xl text-center">
                                                    <div className={`text-2xl font-bold ${threatColor}`}>{threatResult.yearsLeft} yrs</div>
                                                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Market Relevance Left</div>
                                                </div>
                                                <div className="glass p-4 rounded-xl text-center">
                                                    <div className="text-2xl font-bold text-white">{formData.classification.replace('_', ' ')}</div>
                                                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Industry</div>
                                                </div>
                                            </div>

                                            {/* Timeline */}
                                            <div className="glass p-4 rounded-xl border-l-4 border-l-red-500/50 mb-4">
                                                <p className="text-sm text-slate-300 italic">"{threatResult.timelineDesc}"</p>
                                            </div>

                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ═══ RIGHT COLUMN — FORM ═══ */}
                        <form className="w-full lg:w-2/5 order-2 flex flex-col gap-4" onSubmit={handleSubmit}>
                            <div className="glass p-4 rounded-xl border-white/10 group focus-within:border-primary/50 transition-all">
                                <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-1">Entity Name</label>
                                <input className="w-full bg-transparent border-0 p-0 text-white focus:ring-0 focus:outline-none text-sm placeholder:text-slate-700" placeholder="Business Name" type="text" name="entityName" value={formData.entityName} onChange={handleChange} required />
                            </div>

                            {/* Location — own line */}
                            <div className="glass p-4 rounded-xl border-white/10">
                                <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-1">Location</label>
                                <select className="w-full bg-transparent border-0 p-0 text-white focus:ring-0 focus:outline-none text-sm appearance-none cursor-pointer" name="location" value={formData.location} onChange={handleChange}>
                                    <option value="" className="bg-background-dark">Select City</option>
                                    <option value="Mumbai" className="bg-background-dark">Mumbai</option>
                                    <option value="Delhi" className="bg-background-dark">Delhi</option>
                                    <option value="Bangalore" className="bg-background-dark">Bangalore</option>
                                    <option value="Hyderabad" className="bg-background-dark">Hyderabad</option>
                                    <option value="Ahmedabad" className="bg-background-dark">Ahmedabad</option>
                                    <option value="Chennai" className="bg-background-dark">Chennai</option>
                                    <option value="Kolkata" className="bg-background-dark">Kolkata</option>
                                    <option value="Pune" className="bg-background-dark">Pune</option>
                                    <option value="Jaipur" className="bg-background-dark">Jaipur</option>
                                    <option value="Surat" className="bg-background-dark">Surat</option>
                                    <option value="Lucknow" className="bg-background-dark">Lucknow</option>
                                    <option value="Kanpur" className="bg-background-dark">Kanpur</option>
                                    <option value="Nagpur" className="bg-background-dark">Nagpur</option>
                                    <option value="Indore" className="bg-background-dark">Indore</option>
                                    <option value="Thane" className="bg-background-dark">Thane</option>
                                    <option value="Bhopal" className="bg-background-dark">Bhopal</option>
                                    <option value="Visakhapatnam" className="bg-background-dark">Visakhapatnam</option>
                                    <option value="Pimpri-Chinchwad" className="bg-background-dark">Pimpri-Chinchwad</option>
                                    <option value="Patna" className="bg-background-dark">Patna</option>
                                    <option value="Vadodara" className="bg-background-dark">Vadodara</option>
                                    <option value="Ghaziabad" className="bg-background-dark">Ghaziabad</option>
                                    <option value="Ludhiana" className="bg-background-dark">Ludhiana</option>
                                    <option value="Agra" className="bg-background-dark">Agra</option>
                                    <option value="Nashik" className="bg-background-dark">Nashik</option>
                                    <option value="Faridabad" className="bg-background-dark">Faridabad</option>
                                    <option value="Meerut" className="bg-background-dark">Meerut</option>
                                    <option value="Rajkot" className="bg-background-dark">Rajkot</option>
                                    <option value="Kalyan-Dombivali" className="bg-background-dark">Kalyan-Dombivali</option>
                                    <option value="Vasai-Virar" className="bg-background-dark">Vasai-Virar</option>
                                    <option value="Varanasi" className="bg-background-dark">Varanasi</option>
                                    <option value="Srinagar" className="bg-background-dark">Srinagar</option>
                                    <option value="Aurangabad" className="bg-background-dark">Aurangabad</option>
                                    <option value="Dhanbad" className="bg-background-dark">Dhanbad</option>
                                    <option value="Amritsar" className="bg-background-dark">Amritsar</option>
                                    <option value="Navi Mumbai" className="bg-background-dark">Navi Mumbai</option>
                                    <option value="Allahabad" className="bg-background-dark">Allahabad</option>
                                    <option value="Ranchi" className="bg-background-dark">Ranchi</option>
                                    <option value="Howrah" className="bg-background-dark">Howrah</option>
                                    <option value="Coimbatore" className="bg-background-dark">Coimbatore</option>
                                    <option value="Jabalpur" className="bg-background-dark">Jabalpur</option>
                                    <option value="Gwalior" className="bg-background-dark">Gwalior</option>
                                    <option value="Vijayawada" className="bg-background-dark">Vijayawada</option>
                                    <option value="Jodhpur" className="bg-background-dark">Jodhpur</option>
                                    <option value="Madurai" className="bg-background-dark">Madurai</option>
                                    <option value="Raipur" className="bg-background-dark">Raipur</option>
                                    <option value="Kota" className="bg-background-dark">Kota</option>
                                    <option value="Chandigarh" className="bg-background-dark">Chandigarh</option>
                                    <option value="Guwahati" className="bg-background-dark">Guwahati</option>
                                    <option value="Other" className="bg-background-dark">Other</option>
                                </select>
                            </div>

                            {/* Business Age — own line */}
                            <div className="glass p-4 rounded-xl border-white/10 group focus-within:border-primary/50 transition-all">
                                <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-1">Business Age (Years)</label>
                                <input className="w-full bg-transparent border-0 p-0 text-white focus:ring-0 focus:outline-none text-sm placeholder:text-slate-700" placeholder="e.g. 5" type="number" name="age" value={formData.age} onChange={handleChange} />
                            </div>

                            <div className="glass p-4 rounded-xl border-white/10">
                                <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-1">Classification</label>
                                <select className="w-full bg-transparent border-0 p-0 text-white focus:ring-0 focus:outline-none text-sm appearance-none cursor-pointer" name="classification" value={formData.classification} onChange={handleChange}>
                                    <option value="ecommerce" className="bg-background-dark">E-commerce</option>
                                    <option value="saas" className="bg-background-dark">SaaS / Tech</option>
                                    <option value="local_business" className="bg-background-dark">Local Business</option>
                                    <option value="manufacturing" className="bg-background-dark">Manufacturing</option>
                                    <option value="retail" className="bg-background-dark">Retail</option>
                                    <option value="restaurant" className="bg-background-dark">Restaurant / F&amp;B</option>
                                    <option value="services" className="bg-background-dark">Services</option>
                                    <option value="real_estate" className="bg-background-dark">Real Estate</option>
                                    <option value="healthcare" className="bg-background-dark">Healthcare</option>
                                    <option value="coaching" className="bg-background-dark">Coaching / Tuition</option>
                                </select>
                            </div>

                            <div className="glass p-4 rounded-xl border-white/10">
                                <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-1">Scalability (Employees)</label>
                                <select className="w-full bg-transparent border-0 p-0 text-white focus:ring-0 focus:outline-none text-sm appearance-none cursor-pointer" name="scalability" value={formData.scalability} onChange={handleChange}>
                                    <option className="bg-background-dark">1-10 (Micro)</option>
                                    <option className="bg-background-dark">11-50 (Small)</option>
                                    <option className="bg-background-dark">51-200 (Mid)</option>
                                    <option className="bg-background-dark">200+ (Large)</option>
                                </select>
                            </div>

                            {/* Digital Footprint — Dropdown */}
                            <div className="glass p-4 rounded-xl border-white/10">
                                <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-1">Digital Footprint</label>
                                <select className="w-full bg-transparent border-0 p-0 text-white focus:ring-0 focus:outline-none text-sm appearance-none cursor-pointer" name="digitalFootprint" value={formData.digitalFootprint} onChange={handleChange}>
                                    <option value="none" className="bg-background-dark">No Digital Presence</option>
                                    <option value="social" className="bg-background-dark">Social Media Only (WhatsApp / Instagram)</option>
                                    <option value="website" className="bg-background-dark">Website / Landing Page</option>
                                    <option value="marketplace" className="bg-background-dark">Online Marketplace (Amazon / Flipkart)</option>
                                    <option value="website_social" className="bg-background-dark">Website + Social Media</option>
                                    <option value="crm" className="bg-background-dark">CRM / ERP / Software Used</option>
                                    <option value="full" className="bg-background-dark">Full Digital Setup (Website + CRM + Ads)</option>
                                </select>
                            </div>

                            <div className="mt-2">
                                <button className="orange-pulse w-full bg-warning hover:bg-warning/90 text-white font-bold py-4 px-6 rounded-xl uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 group disabled:opacity-50" type="submit" disabled={submitting}>
                                    {submitting ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                                            SCANNING...
                                        </>
                                    ) : (
                                        <>
                                            [ CHECK THREAT LEVEL
                                            <span className="material-icons text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                            ]
                                        </>
                                    )}
                                </button>
                                <p className="mt-3 text-[10px] text-slate-500 text-center uppercase tracking-tight leading-relaxed">
                                    1,000+ Business Owners already checked. <br />
                                    <span className="text-warning/80">Kya tum darte ho sach janne se?</span>
                                </p>
                            </div>
                        </form>
                    </div>

                    <div className="mt-12 text-center max-w-xl">
                        <p className="text-slate-300 text-sm md:text-base font-medium">
                            Abhi pata karo — Aapke Business ke paas kitna Time bacha hai? <br />
                            <span className="text-primary/70">(30 seconds. Free. No Bullshit.)</span>
                        </p>
                    </div>
                </section>

                {/* ═══ SERVICES SECTION ═══ */}
                <section id="services" className="py-24 border-t border-white/5 bg-black/40">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
                            <div>
                                <h2 className="text-4xl font-bold text-white mb-4">Services We Offer</h2>
                                <div className="h-1 w-24 bg-primary rounded-full"></div>
                            </div>
                            <p className="text-slate-500 max-w-sm text-right hidden md:block">
                                Explore our surgical solutions designed for business evolution and market dominance.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            <div className="md:col-span-7 glass p-10 rounded-3xl border-white/5 group hover:border-primary/30 transition-all">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-all">
                                        <span className="material-symbols-outlined text-primary text-3xl">brush</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Division 01</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">Meri Brand Weak Hai — <span className="text-primary/80">Logo &amp; Identity Sahi Karo</span></h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                                    <div><h4 className="text-white font-semibold mb-2 text-sm">Logo, Colors &amp; Fonts Design</h4><p className="text-xs text-slate-500 leading-relaxed">Aisi visual identity banao jo dekh ke log seriously lein — aur premium pay karein.</p></div>
                                    <div><h4 className="text-white font-semibold mb-2 text-sm">Brand Positioning</h4><p className="text-xs text-slate-500 leading-relaxed">Competitors se alag dikhna — apna &quot;Unfair Advantage&quot; dhundho.</p></div>
                                    <div><h4 className="text-white font-semibold mb-2 text-sm">Product &amp; Packaging Design</h4><p className="text-xs text-slate-500 leading-relaxed">Aisa packaging jo shelf pe sabse pehle dikhe — aur sell kare.</p></div>
                                    <div><h4 className="text-white font-semibold mb-2 text-sm">App &amp; Website Design (UX/UI)</h4><p className="text-xs text-slate-500 leading-relaxed">Aisi website ya app jo sirf sundar nahi — visitor ko customer banaye.</p></div>
                                </div>
                            </div>
                            <div className="md:col-span-5 glass p-10 rounded-3xl border-white/5 group hover:border-primary/30 transition-all">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-all"><span className="material-symbols-outlined text-primary text-3xl">hub</span></div>
                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Division 02</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">Mera Business Disorganized Hai — <span className="text-primary/80">Systems Banao</span></h3>
                                <ul className="space-y-4 mt-6">
                                    <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0"></span><span className="text-xs text-slate-400"><strong className="text-slate-200">Custom ERP &amp; CRM:</strong> Sab kuch ek jagah manage karo.</span></li>
                                    <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0"></span><span className="text-xs text-slate-400"><strong className="text-slate-200">Workflow Automation:</strong> Repetitive kaam AI se karwao.</span></li>
                                    <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0"></span><span className="text-xs text-slate-400"><strong className="text-slate-200">Purani Business ko Digital Karo:</strong> Cloud system pe aao.</span></li>
                                </ul>
                            </div>
                            <div className="md:col-span-6 lg:col-span-4 glass p-10 rounded-3xl border-white/5 group hover:border-primary/30 transition-all">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-all"><span className="material-symbols-outlined text-primary text-3xl">rocket_launch</span></div>
                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Division 03</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">Mujhe Leads &amp; Sales Chahiye — <span className="text-primary/80">Growth Karo</span></h3>
                                <div className="space-y-6 mt-6">
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/5"><h4 className="text-white font-semibold mb-1 text-sm">Lead Generation Ads</h4><p className="text-xs text-slate-500">Target karo jo actually kharidna chahte hain.</p></div>
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/5"><h4 className="text-white font-semibold mb-1 text-sm">Sales Funnel &amp; Automation</h4><p className="text-xs text-slate-500">Auto follow up jab tak woh buy na kare.</p></div>
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/5"><h4 className="text-white font-semibold mb-1 text-sm">Export &amp; Import Setup</h4><p className="text-xs text-slate-500">International market mein becho.</p></div>
                                </div>
                            </div>
                            <div className="md:col-span-6 lg:col-span-8 glass p-10 rounded-3xl border-white/5 group hover:border-primary/30 transition-all">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-all"><span className="material-symbols-outlined text-primary text-3xl">insights</span></div>
                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Division 04</span>
                                </div>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-4">Mujhe Strategy Chahiye — <span className="text-primary/80">Sahi Direction Lo</span></h3>
                                        <p className="text-sm text-slate-500">Stop guessing. We provide a detailed technical and business roadmap to ensure survival in the AI-first economy.</p>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex gap-4 items-center"><span className="w-10 h-10 flex items-center justify-center rounded bg-primary/10 text-primary font-bold text-sm shrink-0">01</span><span className="text-sm text-slate-300">Business Audit: Dhundho kahan se waste ho raha hai.</span></div>
                                        <div className="flex gap-4 items-center"><span className="w-10 h-10 flex items-center justify-center rounded bg-primary/10 text-primary font-bold text-sm shrink-0">02</span><span className="text-sm text-slate-300">12-Month Tech Roadmap: Tech-first business kaise bano.</span></div>
                                        <div className="flex gap-4 items-center"><span className="w-10 h-10 flex items-center justify-center rounded bg-primary/10 text-primary font-bold text-sm shrink-0">03</span><span className="text-sm text-slate-300">New Market Entry: Research, plan, aur brand ready karo.</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-white/5 pt-12 pb-24">
                    <div className="container mx-auto px-6 flex flex-col items-center text-center">
                        <Link href="/" className="mb-8 opacity-60 overflow-hidden h-12 md:h-14 flex items-center justify-center rounded-xl bg-white/[0.02] px-6 hover:opacity-100 hover:bg-white/[0.04] transition-all">
                            <img src="/logo.png" alt="MasterKey Labs" className="h-[20rem] md:h-[25rem] w-auto object-contain scale-[1.05] drop-shadow-[0_0_15px_rgba(0,229,255,0.1)]" />
                        </Link>
                        <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 mb-12">
                            <Link href="/privacy" className="text-slate-500 hover:text-primary transition-colors uppercase text-[10px] font-bold tracking-widest">Privacy Policy</Link>
                            <Link href="/terms" className="text-slate-500 hover:text-primary transition-colors uppercase text-[10px] font-bold tracking-widest">Terms & Conditions</Link>
                            <a href="mailto:support@masterkeylabs.in" className="text-slate-500 hover:text-primary transition-colors uppercase text-[10px] font-bold tracking-widest">Contact Support</a>
                        </div>
                        <div className="text-slate-700 text-[10px] tracking-widest uppercase">© 2024 Masterkey Labs. All Rights Reserved.</div>
                    </div>
                </footer>
            </main>
        </div >
    );
}
