'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function SignupPage() {
    const { user, business, loading: authLoading } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    // Auto-redirect if already signed in
    useEffect(() => {
        if (!authLoading && user) {
            console.log('--- Signup (Auto-Redirect): User detected, routing to dashboard ---');
            const path = business?.id ? `/dashboard?id=${business.id}` : '/dashboard';
            router.push(path);
        }
    }, [user, business, authLoading, router]);

    // PRE-FILL from user metadata if signed in (e.g. via Google but no business profile yet)
    useEffect(() => {
        if (user) {
            console.log('--- Signup Page: Pre-filling from user metadata ---', { email: user.email, meta: user.user_metadata });
            setEmail(prev => prev || user.email || '');
            setFullName(prev => prev || user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.display_name || '');
        }
    }, [user]);

    const handleSignup = async (e) => {
        if (e) e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setLoading(true);
        setError(null);
        console.log('--- Signup: Attempting submission ---', { email: email.trim() });

        try {
            const { data: authData, error: signupError } = await supabase.auth.signUp({
                email: email.trim(),
                password: password,
                options: {
                    data: { full_name: fullName }
                }
            });

            if (signupError) {
                if (signupError.status === 422 || signupError.message.toLowerCase().includes('already registered')) {
                    console.warn('--- Signup: Collision detected, launching auto-recovery ---');
                    return handleForceLogin();
                }
                throw signupError;
            }

            if (!authData.session) {
                setError(<>
                    <span className="font-bold block mb-1">Registration successful!</span>
                    Please verify your email or check if public registration is enabled in Supabase.
                </>);
            } else {
                router.push('/dashboard');
            }
        } catch (err) {
            console.error('--- Signup: Fatal Error ---', err);
            setError(err.message || 'Registration failed.');
        } finally {
            setLoading(false);
            setIsSubmitting(false);
        }
    };

    const handleForceLogin = async () => {
        try {
            const { error: loginError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password,
            });
            if (loginError) {
                setError(
                    <div className="space-y-4 text-left">
                        <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl">
                            <p className="font-black text-ios-orange uppercase tracking-tighter text-sm mb-1">Authorization Conflict</p>
                            <p className="text-[10px] leading-relaxed opacity-80">
                                Email <span className="text-white font-bold">{email.trim()}</span> is already in our authentication system, but we couldn't log you in automatically.
                            </p>
                        </div>
                        
                        <div className="space-y-3">
                            <p className="text-[9px] uppercase font-bold text-white/40 tracking-widest">Recommended Actions:</p>
                            <div className="flex flex-col gap-3">
                                <Link href="/login" className="ios-button-primary bg-ios-blue/20 text-ios-blue text-[10px] py-3 flex items-center justify-center border border-ios-blue/30">
                                    1. Try Manual Login
                                </Link>
                                <button 
                                    onClick={() => handleForgotPassword()}
                                    className="ios-button-primary bg-ios-orange/20 text-ios-orange text-[10px] py-3 flex items-center justify-center border border-ios-orange/30"
                                >
                                    2. Reset Forgotten Password
                                </button>
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="text-[9px] text-white/30 uppercase font-black underline underline-offset-4 hover:text-white transition-all py-2"
                                >
                                    3. Refresh System Terminal
                                </button>
                            </div>
                        </div>
                    </div>
                );
            } else {
                console.log('--- Signup (Recovery): Login success, routing to dashboard ---');
                router.push('/dashboard');
            }
        } catch (e) {
            setError("Recovery failed. Please use the manual login terminal.");
        } finally {
            setLoading(false);
            setIsSubmitting(false);
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

    const handleForgotPassword = async () => {
        if (!email) {
            setError(<span className="text-ios-orange">Please ensure the email field is filled to reset authorization.</span>);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
            });
            if (resetErr) throw resetErr;
            setError(
                <div className="bg-ios-blue/10 border border-ios-blue/20 p-4 rounded-xl text-ios-blue">
                    <p className="font-bold uppercase text-[10px]">Recovery Protocol Initiated</p>
                    <p className="text-[9px]">Check your inbox for the access reset link.</p>
                </div>
            );
        } catch (err) {
            setError(`Recovery Fault: ${err.message}`);
        } finally {
            setLoading(false);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-ios-orange/10 blur-[120px] rounded-full opacity-60 animate-pulse"></div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[400px] z-10">
                <div className="flex flex-col items-center mb-8">
                    <Link href="/">
                        <Image src="/logo-stacked.png" alt="MasterKey Logo" width={100} height={100} className="h-16 w-auto" />
                    </Link>
                    <h1 className="text-2xl font-bold mt-6 tracking-tight text-center">Terminal Registration</h1>
                    <p className="text-white/40 text-sm mt-2">Activate your MasterKey terminal instantly</p>
                </div>

                <div className="glass p-8 rounded-[2rem] border-white/5 shadow-2xl relative overflow-hidden">
                    {/* Google Login First */}
                    <button 
                        onClick={handleGoogleLogin} 
                        disabled={loading} 
                        className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center gap-3 transition-colors mb-8"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        <span className="text-sm font-bold tracking-tight text-white/90 uppercase">Continue with Google</span>
                    </button>

                    <div className="mb-8 flex items-center gap-4">
                        <div className="h-[1px] flex-1 bg-white/5"></div>
                        <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">OR</span>
                        <div className="h-[1px] flex-1 bg-white/5"></div>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] text-white/30 font-black uppercase tracking-widest ml-1">Operator Name</label>
                            <input type="text" required className="ios-input w-full" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-white/30 font-black uppercase tracking-widest ml-1">System Email</label>
                            <input type="email" required className="ios-input w-full" placeholder="operator@protocol.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-white/30 font-black uppercase tracking-widest ml-1">Access Password</label>
                            <input type="password" required className="ios-input w-full" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} />
                        </div>

                        {error && (
                            <div className={`text-xs p-3 rounded-xl border ${
                                (typeof error === 'string' && (error.includes('successful') || error.includes('success'))) 
                                ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                : 'bg-red-500/10 text-red-500 border-red-500/20'
                            }`}>
                                {error}
                            </div>
                        )}

                        <button disabled={loading} type="submit" className="w-full py-4 mt-4 ios-button-primary flex items-center justify-center gap-2">
                            {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'ACTIVATE TERMINAL'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-[11px] text-white/20 uppercase tracking-widest font-bold">
                            Registered operator? <Link href="/login" className="text-ios-blue underline underline-offset-4 ml-1">LOG IN</Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
