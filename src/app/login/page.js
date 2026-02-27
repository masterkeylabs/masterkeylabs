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
                            <p className="text-white/60 text-sm">Verify your Terminal ID</p>
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
