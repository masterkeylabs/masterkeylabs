'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserForgotPassword() {
    const [identifier, setIdentifier] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const res = await fetch('/api/auth/user/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setMessage(`Reset code sent to ${data.sentTo}. Redirecting...`);
            setTimeout(() => {
                router.push(`/user/reset-password?identifier=${encodeURIComponent(identifier)}`);
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-dark flex items-center justify-center p-4 font-display">
            {/* Grid Background */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#00e5ff 1px, transparent 1px), linear-gradient(90deg, #00e5ff 1px, transparent 1px)', backgroundSize: '80px 80px' }}></div>

            <div className="glass max-w-md w-full p-8 rounded-3xl border border-primary/20 relative z-10 animate-[fadeIn_0.5s_ease-out]">
                <div className="text-center mb-8">
                    <Link href="/">
                        <img src="/logo.png" alt="Logo" className="h-16 mx-auto mb-6 grayscale hover:grayscale-0 transition-all" />
                    </Link>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2 uppercase">Forgot Password</h1>
                    <p className="text-slate-400 text-sm">Enter your email or mobile number to receive a reset code.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-xs">
                        <span className="material-symbols-outlined">error</span>
                        {error}
                    </div>
                )}

                {message && (
                    <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 text-xs">
                        <span className="material-symbols-outlined">check_circle</span>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="glass p-4 rounded-xl border-white/10 group focus-within:border-primary/50 transition-all">
                        <label className="text-[10px] text-primary/60 uppercase tracking-widest block mb-2 font-black">Email / Mobile Number</label>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="w-full bg-transparent border-0 p-0 text-white focus:ring-0 focus:outline-none text-base placeholder:text-slate-700 font-medium"
                            placeholder="e.g. email@example.com"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-background-dark font-black py-4 px-6 rounded-xl uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-[0_0_20px_rgba(0,229,255,0.2)]"
                    >
                        {loading ? (
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-lg">send</span>
                                Send Reset Code
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <Link href="/" className="text-[10px] text-white/40 uppercase font-black tracking-[0.2em] hover:text-primary transition-colors flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
