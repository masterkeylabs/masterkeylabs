'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [identifier, setIdentifier] = useState(searchParams.get('identifier') || '');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const handleReset = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/auth/user/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, otp, newPassword }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setMessage("Password reset successful! Redirecting to login...");
            setTimeout(() => {
                router.push('/');
            }, 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass max-w-md w-full p-8 rounded-3xl border border-primary/20 relative z-10 animate-[fadeIn_0.5s_ease-out]">
            <div className="text-center mb-8">
                <Link href="/">
                    <img src="/logo.png" alt="Logo" className="h-16 mx-auto mb-6 grayscale hover:grayscale-0 transition-all" />
                </Link>
                <h1 className="text-3xl font-black text-white tracking-tight mb-2 uppercase">Reset Password</h1>
                <p className="text-slate-400 text-sm">Enter the code sent to you and choose a new password.</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-xs font-medium">
                    <span className="material-symbols-outlined">error</span>
                    {error}
                </div>
            )}

            {message && (
                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 text-xs font-medium">
                    <span className="material-symbols-outlined">check_circle</span>
                    {message}
                </div>
            )}

            <form onSubmit={handleReset} className="space-y-4">
                <div className="glass p-3 rounded-lg border-white/10 group focus-within:border-primary/50 transition-all">
                    <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-1 font-black">Email / Mobile Number</label>
                    <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full bg-transparent border-0 p-0 text-white focus:ring-0 focus:outline-none text-sm font-medium"
                        required
                    />
                </div>

                <div className="glass p-3 rounded-lg border-white/10 group focus-within:border-primary/50 transition-all">
                    <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-1 font-black">6-Digit OTP</label>
                    <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full bg-transparent border-0 p-0 text-white focus:ring-0 focus:outline-none text-xl font-black tracking-[0.5em] text-center placeholder:text-slate-800"
                        placeholder="000000"
                        required
                    />
                </div>

                <div className="glass p-3 rounded-lg border-white/10 group focus-within:border-primary/50 transition-all">
                    <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-1 font-black">New Password</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-transparent border-0 p-0 text-white focus:ring-0 focus:outline-none text-sm font-medium"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <div className="glass p-3 rounded-lg border-white/10 group focus-within:border-primary/50 transition-all">
                    <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-1 font-black">Confirm New Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-transparent border-0 p-0 text-white focus:ring-0 focus:outline-none text-sm font-medium"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || message}
                    className="w-full bg-primary hover:bg-primary/90 text-background-dark font-black py-4 px-6 rounded-xl uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-[0_0_20px_rgba(0,229,255,0.2)] mt-4"
                >
                    {loading ? (
                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-lg">lock_reset</span>
                            Update Password
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}

export default function UserResetPassword() {
    return (
        <div className="min-h-screen bg-background-dark flex items-center justify-center p-4 font-display">
            <div className="fixed inset-0 pointer-events-none z-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#00e5ff 1px, transparent 1px), linear-gradient(90deg, #00e5ff 1px, transparent 1px)', backgroundSize: '80px 80px' }}></div>

            <Suspense fallback={<div className="text-primary animate-pulse">Initializing Security Grid...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
