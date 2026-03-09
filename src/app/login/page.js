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
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [emailSent, setEmailSent] = useState(false);
    const router = useRouter();

    // Auto-redirect if already logged in
    useEffect(() => {
        if (!authLoading && user) {
            console.log('--- Login Page: User detected, redirecting to dashboard ---');
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Check if user exists in businesses table first (Access Control)
            const { data, error: queryError } = await supabase
                .from('businesses')
                .select('id')
                .ilike('email', email.trim())
                .maybeSingle();

            if (queryError) throw queryError;

            if (!data) {
                throw new Error('No active terminal found for this email. Please register first.');
            }

            // Trigger Magic Link
            const { error: otpError } = await supabase.auth.signInWithOtp({
                email: email.trim(),
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
                }
            });

            if (otpError) throw otpError;
            setEmailSent(true);
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
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
                    queryParams: {
                        prompt: 'select_account'
                    }
                }
            });
            if (error) throw error;
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    if (emailSent) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass p-10 rounded-[2.5rem] max-w-[420px] border-white/5 shadow-2xl">
                    <div className="w-20 h-20 bg-ios-blue/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-ios-blue/20">
                        <span className="material-symbols-outlined text-ios-blue text-4xl animate-pulse">broadcast_on_personal</span>
                    </div>
                    <h2 className="text-3xl font-bold mb-4 tracking-tight">Transmission Sent</h2>
                    <p className="text-white/40 leading-relaxed mb-8">
                        A secure access link is on its way to <span className="text-white font-bold">{email}</span>.
                        Sync your device by clicking the link in the message.
                    </p>
                    <button onClick={() => setEmailSent(false)} className="text-ios-blue text-xs font-black uppercase tracking-widest hover:brightness-125 transition-all">
                        Retry with different ID
                    </button>
                </motion.div>
            </div>
        );
    }

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

                        <div className="space-y-1">
                            <label className="text-[10px] text-white/30 font-black uppercase tracking-widest ml-1">Registered Email</label>
                            <input type="email" required className="ios-input w-full" placeholder="operator@protocol.com" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
                        </div>

                        <button disabled={loading} type="submit" className="w-full py-4 ios-button-primary flex items-center justify-center gap-2">
                            {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'AUTHENTICATE SYSTEM'}
                        </button>
                    </form>

                    <div className="my-8 flex items-center gap-4">
                        <div className="h-[1px] flex-1 bg-white/5"></div>
                        <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">OR</span>
                        <div className="h-[1px] flex-1 bg-white/5"></div>
                    </div>

                    <button onClick={handleGoogleLogin} disabled={loading} className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center gap-3 transition-colors">
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
