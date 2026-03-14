'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err) {
            setError(err.message || "Failed to update password.");
        } finally {
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
                    <h1 className="text-2xl font-bold mt-6 tracking-tight text-center">Reset Password</h1>
                    <p className="text-white/40 text-sm mt-2">Securely update your terminal access credentials</p>
                </div>

                <div className="glass p-8 rounded-[2rem] border-white/5 shadow-2xl relative overflow-hidden">
                    {success ? (
                        <div className="text-center space-y-4 py-8">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
                                <span className="material-symbols-outlined text-green-500 text-3xl">check_circle</span>
                            </div>
                            <h2 className="text-xl font-bold">Success</h2>
                            <p className="text-white/40 text-sm">Your password has been updated. Redirecting to login...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div className="text-center mb-4">
                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                                    <span className="material-symbols-outlined text-white/40 text-3xl">security</span>
                                </div>
                                <p className="text-white/60 text-sm">Create New Access Code</p>
                            </div>

                            {error && <div className="bg-red-500/10 text-red-500 text-xs p-3 rounded-xl border border-red-500/20">{error}</div>}

                            <div className="space-y-1">
                                <label className="text-[10px] text-white/30 font-black uppercase tracking-widest ml-1">New Password</label>
                                <input 
                                    type="password" 
                                    required 
                                    className="ios-input w-full" 
                                    placeholder="••••••••" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    autoFocus 
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] text-white/30 font-black uppercase tracking-widest ml-1">Confirm Password</label>
                                <input 
                                    type="password" 
                                    required 
                                    className="ios-input w-full" 
                                    placeholder="••••••••" 
                                    value={confirmPassword} 
                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                />
                            </div>

                            <button disabled={loading} type="submit" className="w-full py-4 ios-button-primary flex items-center justify-center gap-2">
                                {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'UPDATE ACCESS CODE'}
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
