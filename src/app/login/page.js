'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    const [identifier, setIdentifier] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const cleanId = identifier.trim();
            const cleanPhone = cleanId.replace(/\D/g, '');
            const last10 = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : null;

            // Search by email OR phone
            let query = supabase.from('businesses').select('id, owner_name, phone');

            if (last10 && cleanId.match(/^\d+$/)) {
                query = query.ilike('phone', `%${last10}%`);
            } else {
                query = query.ilike('email', cleanId);
            }

            const { data, error: searchError } = await query.maybeSingle();

            if (searchError) throw searchError;

            if (!data) {
                throw new Error('📵 Access Denied. No matching operator profile found.');
            }

            // Store session identifiers
            localStorage.setItem('masterkey_business_id', data.id);
            localStorage.setItem('masterkey_user_name', data.owner_name);
            localStorage.setItem('masterkey_user_phone', data.phone);

            // Immediate redirect to dashboard
            router.push(`/dashboard?id=${data.id}`);
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
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-ios-blue/10 blur-[120px] rounded-full opacity-60 animate-pulse"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[400px] z-10"
            >
                <div className="flex flex-col items-center mb-10">
                    <Link href="/">
                        <Image src="/logo-stacked.png" alt="MasterKey Logo" width={100} height={100} className="h-20 w-auto object-contain cursor-pointer transition-transform hover:scale-105" />
                    </Link>
                    <h1 className="text-2xl font-bold mt-6 tracking-tight text-center">System Access</h1>
                    <p className="text-white/40 text-sm mt-2">Enter credentials for secure decryption</p>
                </div>

                <div className="glass p-8 rounded-[2rem] border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="scanline"></div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="text-center mb-4">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                                <span className="material-symbols-outlined text-white/40 text-3xl">vpn_key</span>
                            </div>
                            <p className="text-white/60 text-sm">Terminal Access Sequence</p>
                        </div>

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
                            <label className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black ml-1">Email or Mobile Number</label>
                            <input
                                type="text"
                                required
                                className="ios-input w-full"
                                placeholder="operator@protocol.com"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                            />
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full py-4 ios-button-primary flex items-center justify-center gap-2 group relative overflow-hidden"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>DECRYPT & ENTER</span>
                                    <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">login</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="my-8 flex items-center gap-4">
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
                        <span className="text-sm font-bold tracking-tight text-white/90">CONTINUE WITH GOOGLE</span>
                    </button>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <Link href="/signup" className="text-[11px] text-white/20 uppercase tracking-widest font-bold hover:text-white transition-colors">
                            Need authorization? <span className="text-ios-blue underline underline-offset-4 ml-1">REGISTER TERMINAL</span>
                        </Link>
                    </div>
                </div>
                <div className="mt-12 text-center">
                    <Link href="/" className="text-white/20 text-xs hover:text-white transition-colors flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        RETURN TO SURFACE
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
