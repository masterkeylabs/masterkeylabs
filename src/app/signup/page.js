'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function SignupPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Duplicate Check
            const cleanPhone = phone.replace(/\D/g, '');
            const last10 = cleanPhone.slice(-10);

            const [{ data: phoneDupe }, { data: emailDupe }] = await Promise.all([
                supabase.from('businesses').select('id').ilike('phone', `%${last10}%`).limit(1),
                supabase.from('businesses').select('id').ilike('email', email.trim()).limit(1),
            ]);

            if ((phoneDupe && phoneDupe.length > 0) || (emailDupe && emailDupe.length > 0)) {
                throw new Error('Terminal ID or Email already registered.');
            }

            // Direct Insert (Bug-Free flow)
            const { data, error: insertError } = await supabase
                .from('businesses')
                .insert({
                    entity_name: 'Initialize System',
                    owner_name: fullName,
                    email: email.trim(),
                    phone: phone.trim(),
                    classification: 'direct_instant_signup'
                })
                .select()
                .single();

            if (insertError) throw insertError;

            if (data) {
                localStorage.setItem('masterkey_business_id', data.id);
                router.push(`/dashboard?id=${data.id}`);
            }
        } catch (err) {
            setError(err.message || 'Registration failed.');
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
                        <input type="text" required className="ios-input w-full" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                        <input type="email" required className="ios-input w-full" placeholder="operator@protocol.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <input type="tel" required className="ios-input w-full" placeholder="+91 XXXXX XXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />

                        {error && <div className="bg-red-500/10 text-red-500 text-xs p-3 rounded-xl">{error}</div>}

                        <button disabled={loading} type="submit" className="w-full py-4 mt-2 ios-button-primary flex items-center justify-center gap-2">
                            {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'SYNCHRONIZE & ENTER'}
                        </button>
                    </form>

                    <div className="my-6 flex items-center gap-4">
                        <div className="h-[1px] flex-1 bg-white/5"></div>
                        <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">OR</span>
                        <div className="h-[1px] flex-1 bg-white/5"></div>
                    </div>

                    <button onClick={handleGoogleLogin} disabled={loading} className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl">
                        REGISTER WITH GOOGLE
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
