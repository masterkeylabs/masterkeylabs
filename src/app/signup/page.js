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

    const [email, setEmail] = useState('');

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // ── Duplicate Check ──────────────────────────────────────
            const cleanPhone = phone.replace(/\D/g, '');
            const last10 = cleanPhone.slice(-10);

            const [{ data: phoneDupe }, { data: emailDupe }] = await Promise.all([
                supabase.from('businesses').select('id').ilike('phone', `%${last10}%`).limit(1),
                supabase.from('businesses').select('id').ilike('email', email.trim()).limit(1),
            ]);

            if (phoneDupe && phoneDupe.length > 0) {
                setError('📵 This mobile number is already registered.');
                setLoading(false);
                return;
            }
            if (emailDupe && emailDupe.length > 0) {
                setError('📧 This email is already registered.');
                setLoading(false);
                return;
            }
            // ──────────────────────────────────────────────────────────────

            // Create business record directly
            const { data: newBiz, error: insertError } = await supabase
                .from('businesses')
                .insert({
                    entity_name: fullName + "'s Business",
                    owner_name: fullName,
                    email: email,
                    phone: phone,
                    classification: 'direct_signup'
                })
                .select()
                .single();

            if (insertError) throw insertError;

            // Store session identifiers
            localStorage.setItem('masterkey_business_id', newBiz.id);
            localStorage.setItem('masterkey_user_name', fullName);
            localStorage.setItem('masterkey_user_phone', phone);

            // Immediate redirect to dashboard
            router.push(`/dashboard?id=${newBiz.id}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`
                }
            });
            if (error) throw error;
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-ios-orange/10 blur-[120px] rounded-full opacity-60 animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-ios-blue/10 blur-[120px] rounded-full opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[400px] z-10"
            >
                <div className="flex flex-col items-center mb-8">
                    <Link href="/">
                        <Image src="/logo-stacked.png" alt="MasterKey Logo" width={100} height={100} className="h-16 w-auto object-contain cursor-pointer transition-transform hover:scale-105" />
                    </Link>
                    <h1 className="text-2xl font-bold mt-6 tracking-tight text-center">Registration Protocol</h1>
                    <p className="text-white/40 text-sm mt-2">Activate your MasterKey terminal</p>
                </div>

                <div className="glass p-8 rounded-[2rem] border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="scanline"></div>

                    <form onSubmit={handleSignup} className="space-y-4">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] p-3 rounded-xl flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">error</span>
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[10px] text-white/30 uppercase tracking-widest font-black ml-1">Operator Name</label>
                            <input
                                type="text"
                                required
                                className="ios-input w-full"
                                placeholder="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] text-white/30 uppercase tracking-widest font-black ml-1">Secure Email</label>
                            <input
                                type="email"
                                required
                                className="ios-input w-full"
                                placeholder="operator@protocol.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] text-white/30 uppercase tracking-widest font-black ml-1">Terminal ID (Phone)</label>
                            <input
                                type="tel"
                                required
                                className="ios-input w-full"
                                placeholder="+91 XXXXX XXXXX"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full py-4 mt-2 ios-button-primary flex items-center justify-center gap-2 group relative overflow-hidden"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>AUTHORIZE & ENTER</span>
                                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">bolt</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="my-6 flex items-center gap-4">
                        <div className="h-[1px] flex-1 bg-white/5"></div>
                        <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">OR</span>
                        <div className="h-[1px] flex-1 bg-white/5"></div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span className="text-sm font-bold tracking-tight text-white/90">REGISTER WITH GOOGLE</span>
                    </button>

                    <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-4">
                        <p className="text-[11px] text-white/20 uppercase tracking-widest font-bold">
                            Registered operator? <Link href="/login" className="text-ios-blue hover:text-ios-blue/80 transition-colors underline underline-offset-4 ml-1">LOG IN</Link>
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
