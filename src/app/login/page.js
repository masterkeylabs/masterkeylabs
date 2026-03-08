'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const { user, loading: authLoading } = useAuth();
    const [identifier, setIdentifier] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    // Auto-redirect if already logged in
    useEffect(() => {
        console.log('--- Login Page: Auth State Update ---', { userEmail: user?.email, authLoading });
        if (!authLoading && user) {
            console.log('--- Login Page: User detected, redirecting to dashboard ---');
            const localBizId = localStorage.getItem('masterkey_business_id');
            router.push(localBizId ? `/dashboard?id=${localBizId}` : '/dashboard');
        }
    }, [user, authLoading, router]);

    // Check for error in URL
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const errorParam = urlParams.get('error');
        if (errorParam) {
            console.warn('--- Login Page: Auth Error via URL ---', errorParam);
            setError(`Authentication security check failed (Code: ${errorParam}). Please try again.`);
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const cleanId = identifier.trim();

            // Direct database lookup (Fast Access)
            const { data, error: queryError } = await supabase
                .from('businesses')
                .select('id')
                .ilike('email', cleanId)
                .maybeSingle();

            if (queryError) throw queryError;

            let finalData = data;

            if (!finalData) {
                const cleanPhone = cleanId.replace(/\D/g, '').slice(-10);
                if (cleanPhone.length >= 10) {
                    const { data: phoneData } = await supabase
                        .from('businesses')
                        .select('id')
                        .ilike('phone', `%${cleanPhone}%`)
                        .maybeSingle();
                    finalData = phoneData;
                }
            }

            if (finalData) {
                // localStorage session management (Instant)
                localStorage.setItem('masterkey_business_id', finalData.id);
                router.push(`/dashboard?id=${finalData.id}`);
            } else {
                throw new Error('Credential mismatch. No active terminal found.');
            }
        } catch (err) {
            setError(err.message || 'Authentication sequence failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` }
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

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[400px] z-10">
                <div className="flex flex-col items-center mb-10">
                    <Link href="/">
                        <Image src="/logo-stacked.png" alt="MasterKey Logo" width={100} height={100} className="h-20 w-auto object-contain" />
                    </Link>
                    <h1 className="text-2xl font-bold mt-6 tracking-tight text-center">System Access</h1>
                    <p className="text-white/40 text-sm mt-2">Enter credentials for instant decryption</p>
                </div>

                <div className="glass p-8 rounded-[2rem] border-white/5 shadow-2xl relative overflow-hidden">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="text-center mb-4">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                                <span className="material-symbols-outlined text-white/40 text-3xl">vpn_key</span>
                            </div>
                            <p className="text-white/60 text-sm">Terminal Access Sequence</p>
                        </div>

                        {error && <div className="bg-red-500/10 text-red-500 text-xs p-3 rounded-xl border border-red-500/20">{error}</div>}

                        <input type="text" required className="ios-input w-full" placeholder="Email or Mobile Number" value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoFocus />

                        <button disabled={loading} type="submit" className="w-full py-4 ios-button-primary flex items-center justify-center gap-2">
                            {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'AUTHENTICATE SYSTEM'}
                        </button>
                    </form>

                    <div className="my-8 flex items-center gap-4">
                        <div className="h-[1px] flex-1 bg-white/5"></div>
                        <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">OR</span>
                        <div className="h-[1px] flex-1 bg-white/5"></div>
                    </div>

                    <button onClick={handleGoogleLogin} disabled={loading} className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center gap-3">
                        <span className="text-sm font-bold tracking-tight text-white/90 uppercase">Continue with Google</span>
                    </button>

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
