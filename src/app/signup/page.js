'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function SignupPage() {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        let cleaned = phone.replace(/\D/g, '');
        let formattedPhone;
        if (cleaned.length === 10) {
            formattedPhone = `+91${cleaned}`;
        } else if (cleaned.startsWith('91') && cleaned.length === 12) {
            formattedPhone = `+${cleaned}`;
        } else {
            formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
        }

        try {
            // ── Duplicate phone check ──────────────────────────────────────
            // Extract last 10 digits to match any storage format (+91XXXXXX, 91XXXXXX, XXXXXX)
            const allDigits = formattedPhone.replace(/\D/g, '');
            const tenDigit = allDigits.slice(-10);

            const { data: existingRows } = await supabase
                .from('businesses')
                .select('id')
                .ilike('phone', `%${tenDigit}%`)
                .limit(1);

            if (existingRows && existingRows.length > 0) {
                setError('📵 This mobile number is already registered. Please log in or use a different number.');
                setLoading(false);
                return;
            }
            // ──────────────────────────────────────────────────────────────

            const response = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: formattedPhone }),
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            setIsOtpSent(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        let cleaned = phone.replace(/\D/g, '');
        let formattedPhone = cleaned.length === 10 ? `+91${cleaned}` : (phone.startsWith('+') ? phone : `+${phone}`);

        try {
            const response = await fetch('/api/auth/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: formattedPhone,
                    code: otp,
                    fullName
                }),
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            // Twilio verified. Store user info in localStorage for session continuity.
            if (fullName) localStorage.setItem('masterkey_user_name', fullName);
            localStorage.setItem('masterkey_user_phone', formattedPhone);

            // Mark as success — show the success screen
            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass p-10 rounded-[2.5rem] border-white/5 shadow-2xl text-center max-w-[450px] z-10"
                >
                    <div className="w-20 h-20 bg-ios-blue/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-ios-blue/20">
                        <span className="material-symbols-outlined text-ios-blue text-4xl">verified_user</span>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight mb-4">Identity Verified</h2>
                    <p className="text-white/50 mb-2 leading-relaxed">
                        Welcome to the MasterKey network, <span className="text-white font-bold">{fullName || 'Operator'}</span>.
                    </p>
                    <p className="text-white/30 text-sm mb-8">Complete your business profile to activate the diagnostic system.</p>
                    <Link href="/" className="ios-button-primary w-full py-4 block text-center">
                        START BUSINESS INTAKE
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-ios-orange/10 blur-[120px] rounded-full opacity-60 animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-ios-blue/10 blur-[120px] rounded-full opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[400px] z-10"
            >
                <div className="flex flex-col items-center mb-10">
                    <Link href="/">
                        <Image src="/logo-stacked.png" alt="MasterKey Logo" width={100} height={100} className="h-20 w-auto object-contain cursor-pointer transition-transform hover:scale-105" />
                    </Link>
                    <h1 className="text-2xl font-bold mt-6 tracking-tight text-center">Protocol Registration</h1>
                    <p className="text-white/40 text-sm mt-2">Activate your secure mobile terminal</p>
                </div>

                <div className="glass p-8 rounded-[2rem] border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="scanline"></div>

                    <AnimatePresence mode="wait">
                        {!isOtpSent ? (
                            <motion.form
                                key="request-otp"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleSendOtp}
                                className="space-y-5"
                            >
                                {error && (
                                    <div className="p-3 bg-ios-orange/10 border border-ios-orange/20 rounded-xl text-[11px] text-ios-orange text-center animate-shake">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="ios-input w-full"
                                        placeholder="Alpha Operator"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black ml-1">Mobile Terminal</label>
                                    <input
                                        type="tel"
                                        required
                                        className="ios-input w-full"
                                        placeholder="82693 20980"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                    <p className="text-[9px] text-white/20 ml-1 italic">Indian numbers auto-formatted with +91</p>
                                </div>

                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="ios-button-primary w-full py-4 flex items-center justify-center gap-2 group relative overflow-hidden mt-2"
                                >
                                    {loading ? (
                                        <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                                    ) : (
                                        <>
                                            <span>GENERATE SECURE OTP</span>
                                            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">sms</span>
                                        </>
                                    )}
                                </button>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="verify-otp"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleVerifyOtp}
                                className="space-y-5"
                            >
                                {error && (
                                    <div className="p-3 bg-ios-orange/10 border border-ios-orange/20 rounded-xl text-[11px] text-ios-orange text-center animate-shake">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-1.5 text-center mb-4">
                                    <p className="text-[11px] text-white/40 uppercase tracking-widest">Sent to {phone}</p>
                                    <button
                                        type="button"
                                        onClick={() => setIsOtpSent(false)}
                                        className="text-[10px] text-ios-blue hover:underline uppercase font-bold"
                                    >
                                        Change Number
                                    </button>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black ml-1">Verification Code</label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        className="ios-input w-full text-center tracking-[0.5em] text-lg font-bold"
                                        placeholder="••••••"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    />
                                </div>

                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="ios-button-primary w-full py-4 flex items-center justify-center gap-2 group relative overflow-hidden mt-2"
                                >
                                    {loading ? (
                                        <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                                    ) : (
                                        <>
                                            <span>AUTHORIZE SESSION</span>
                                            <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">key</span>
                                        </>
                                    )}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-4">
                        <p className="text-[11px] text-white/20 uppercase tracking-widest font-bold">
                            Already part of the network? <Link href="/login" className="text-ios-blue hover:text-ios-blue/80 transition-colors underline underline-offset-4 ml-1">LOG IN</Link>
                        </p>
                        <Link href="/" className="text-[10px] text-white/10 hover:text-white transition-colors uppercase tracking-widest mt-2">
                            ← Return to Surface
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
