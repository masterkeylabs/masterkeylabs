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
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [emailSent, setEmailSent] = useState(false);
    const router = useRouter();

    // Auto-redirect if already fully registered
    useEffect(() => {
        if (!authLoading && user && business) {
            console.log('--- Signup Page: Fully registered user detected, redirecting to dashboard ---');
            router.push(`/dashboard?id=${business.id}`);
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
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Check for profile existence first (Duplicate Check)
            const cleanPhone = phone.replace(/\D/g, '');
            const last10 = cleanPhone.slice(-10);

            const [{ data: phoneDupe }, { data: emailDupe }] = await Promise.all([
                supabase.from('businesses').select('id, classification').ilike('phone', `%${last10}%`).limit(1),
                supabase.from('businesses').select('id, classification').ilike('email', email.trim()).limit(1),
            ]);

            const existingRecord = (phoneDupe?.[0] || emailDupe?.[0]);

            if (existingRecord && existingRecord.classification !== 'magic_link_onboarding') {
                setError(<>
                    This Email or Terminal ID is already registered.
                    <Link href="/login" className="underline ml-1">Log in instead?</Link>
                </>);
                setLoading(false);
                return;
            }

            // 2. Pre-create or update business record
            if (existingRecord) {
                console.log('--- Signup: Using existing pending record ---', existingRecord.id);
                // We just proceed to step 3 which resends the OTP
            } else {
                const { error: insertError } = await supabase
                    .from('businesses')
                    .insert({
                        entity_name: 'Initialize System',
                        owner_name: fullName,
                        email: email.trim(),
                        phone: phone.trim(),
                        classification: 'magic_link_onboarding'
                    });
                if (insertError) throw insertError;
            }

            // 3. Trigger Magic Link
            const { error: otpError } = await supabase.auth.signInWithOtp({
                email: email.trim(),
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
                    data: {
                        full_name: fullName,
                        phone: phone.trim()
                    }
                }
            });

            if (otpError) throw otpError;

            setEmailSent(true);
        } catch (err) {
            setError(err.message || 'Registration sequence failed.');
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
                        <span className="material-symbols-outlined text-ios-blue text-4xl animate-pulse">mark_email_unread</span>
                    </div>
                    <h2 className="text-3xl font-bold mb-4 tracking-tight">Check Your Terminal</h2>
                    <p className="text-white/40 leading-relaxed mb-8">
                        A secure access link has been transmitted to <span className="text-white font-bold">{email}</span>.
                        Click the link to verify your identity and enter the dashboard.
                    </p>
                    <button onClick={() => setEmailSent(false)} className="text-ios-blue text-xs font-black uppercase tracking-widest hover:brightness-125 transition-all">
                        Change Email Address
                    </button>
                </motion.div>
            </div>
        );
    }

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
                            <label className="text-[10px] text-white/30 font-black uppercase tracking-widest ml-1">Terminal ID (Phone)</label>
                            <input type="tel" required className="ios-input w-full" placeholder="+91 XXXXX XXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>

                        {error && <div className="bg-red-500/10 text-red-500 text-xs p-3 rounded-xl border border-red-500/20">{error}</div>}

                        <button disabled={loading} type="submit" className="w-full py-4 mt-4 ios-button-primary flex items-center justify-center gap-2">
                            {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'TRANSMIT SECURE LINK'}
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
                        <p className="text-[11px] text-white/20 uppercase tracking-widest font-bold">
                            Registered operator? <Link href="/login" className="text-ios-blue underline underline-offset-4 ml-1">LOG IN</Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
