'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
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
                    code: otp
                }),
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            // Twilio verified. Store phone in localStorage for session continuity.
            localStorage.setItem('masterkey_user_phone', formattedPhone);

            // ── Look up business by phone and store ID ───────────────────
            const last10 = cleaned.slice(-10);
            const { data: businessData } = await supabase
                .from('businesses')
                .select('id')
                .ilike('phone', `%${last10}%`)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (businessData) {
                localStorage.setItem('masterkey_business_id', businessData.id);
            }
            // ─────────────────────────────────────────────────────────────

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
                        <span className="material-symbols-outlined text-ios-blue text-4xl">vpn_key</span>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight mb-4">Access Granted</h2>
                    <p className="text-white/50 mb-8 leading-relaxed">
                        Security clearance established. Re-initializing your MasterKey workspace...
                    </p>
                    <Link href="/dashboard" className="ios-button-primary w-full py-4 block">
                        ENTER COMMAND CENTER
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-ios-blue/10 blur-[120px] rounded-full opacity-60 animate-pulse"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[400px] z-10"
            >
                <div className="flex flex-col items-center mb-10">
                    <Link href="/">
                        <Image src="/logo-stacked.png" alt="MasterKey Logo" width={100} height={100} className="h-20 w-auto object-contain" />
                    </Link>
                    <h1 className="text-2xl font-bold mt-6 tracking-tight text-center">System Access</h1>
                    <p className="text-white/40 text-sm mt-2">Enter credentials for secure decryption</p>
                </div>

                <div className="glass p-8 rounded-[2rem] border-white/5 shadow-2xl relative">
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
                                {error && <div className="p-3 bg-ios-orange/10 border border-ios-orange/20 rounded-xl text-[11px] text-ios-orange text-center">{error}</div>}

                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black ml-1">Terminal ID (Phone)</label>
                                    <input
                                        type="tel"
                                        required
                                        autoComplete="off"
                                        className="ios-input w-full"
                                        placeholder="Enter your mobile number"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>

                                <button disabled={loading} type="submit" className="ios-button-primary w-full py-4 flex items-center justify-center gap-2">
                                    {loading ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : 'SEND ACCESS CODE'}
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
                                {error && <div className="p-3 bg-ios-orange/10 border border-ios-orange/20 rounded-xl text-[11px] text-ios-orange text-center">{error}</div>}

                                <div className="space-y-1.5 text-center mb-4">
                                    <p className="text-[11px] text-white/40 uppercase tracking-widest">Sent to {phone}</p>
                                    <button type="button" onClick={() => setIsOtpSent(false)} className="text-[10px] text-ios-blue hover:underline uppercase font-bold">Change ID</button>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black ml-1">Access Token</label>
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

                                <button disabled={loading} type="submit" className="ios-button-primary w-full py-4 flex items-center justify-center gap-2">
                                    {loading ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : 'DECRYPT & ENTER'}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <Link href="/signup" className="text-[11px] text-white/20 uppercase tracking-widest font-bold hover:text-white transition-colors">
                            Need authorization? <span className="text-ios-blue underline underline-offset-4 ml-1">REGISTER TERMINAL</span>
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
