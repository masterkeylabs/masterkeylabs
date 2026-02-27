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
                throw new Error('📵 This mobile number is already registered.');
            }
            if (emailDupe && emailDupe.length > 0) {
                throw new Error('📧 This email is already registered.');
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
