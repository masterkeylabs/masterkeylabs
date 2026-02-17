"use client";
import { useState, useEffect } from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [step, setStep] = useState(1); // 1: verify OTP, 2: set new password
    const [resetToken, setResetToken] = useState('');
    const [passwordStrength, setPasswordStrength] = useState('');

    useEffect(() => {
        const emailParam = searchParams.get('email');
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [searchParams]);

    // Password strength checker
    useEffect(() => {
        if (newPassword.length === 0) {
            setPasswordStrength('');
        } else if (newPassword.length < 8) {
            setPasswordStrength('weak');
        } else if (newPassword.length < 12) {
            setPasswordStrength('medium');
        } else {
            setPasswordStrength('strong');
        }
    }, [newPassword]);

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/admin/verify-reset-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: otp })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to verify OTP');
            }

            setResetToken(data.resetToken);
            setStep(2);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        // Validate password length
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/admin/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resetToken, newPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to reset password');
            }

            // Success - redirect to login
            router.push('/admin/login?reset=success');

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStrengthColor = () => {
        switch (passwordStrength) {
            case 'weak': return 'bg-red-500';
            case 'medium': return 'bg-yellow-500';
            case 'strong': return 'bg-green-500';
            default: return 'bg-white/10';
        }
    };

    const getStrengthWidth = () => {
        switch (passwordStrength) {
            case 'weak': return 'w-1/3';
            case 'medium': return 'w-2/3';
            case 'strong': return 'w-full';
            default: return 'w-0';
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 font-sans selection:bg-primary/30">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none opacity-20 overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[180px] rounded-full"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-900/20 blur-[180px] rounded-full"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo Area */}
                <div className="flex flex-col items-center mb-10 text-center">
                    <Link href="/admin/login" className="mb-6 overflow-hidden h-16 md:h-20 flex items-center justify-center rounded-xl bg-white/[0.02] px-10 w-full max-w-xs border border-white/5 shadow-inner hover:bg-white/[0.04] transition-all">
                        <img src="/logo.png" alt="MasterKey Labs" className="h-[25rem] md:h-[30rem] w-auto object-contain scale-[1.1] drop-shadow-[0_0_15px_rgba(0,229,255,0.2)]" />
                    </Link>
                    <div className="inline-block px-3 py-1 bg-primary/10 rounded-full text-primary text-[10px] font-black tracking-[0.25em] uppercase border border-primary/20">
                        {step === 1 ? 'Verify Identity' : 'Set New Password'}
                    </div>
                </div>

                {/* Form */}
                <div className="glass rounded-[2rem] p-8 md:p-10 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <h1 className="text-2xl font-bold mb-3 tracking-tight">
                        {step === 1 ? 'Enter Reset Code' : 'Create New Password'}
                    </h1>
                    <p className="text-sm text-white/50 mb-6">
                        {step === 1
                            ? 'Enter the 6-digit code sent to your email.'
                            : 'Choose a strong password for your admin account.'}
                    </p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {error}
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2 ml-1">Admin Email</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-sm"
                                    placeholder="name@masterkey.labs"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2 ml-1">Reset Code</label>
                                <input
                                    type="text"
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-2xl font-mono text-center tracking-[0.5em]"
                                    placeholder="000000"
                                    maxLength={6}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length !== 6}
                                className="w-full bg-primary hover:bg-cyan-400 text-background-dark py-5 rounded-xl font-black text-sm tracking-[0.2em] uppercase transition-all glow-cyan flex items-center justify-center gap-3 group disabled:opacity-50"
                            >
                                {loading ? (
                                    <span className="w-5 h-5 border-2 border-background-dark/30 border-t-background-dark rounded-full animate-spin"></span>
                                ) : (
                                    <>
                                        <span>Verify Code</span>
                                        <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2 ml-1">New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-sm font-mono"
                                    placeholder="••••••••••••"
                                />
                                {newPassword && (
                                    <div className="mt-2">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-white/40">Password Strength</span>
                                            <span className={`font-bold ${passwordStrength === 'weak' ? 'text-red-400' :
                                                passwordStrength === 'medium' ? 'text-yellow-400' :
                                                    'text-green-400'
                                                }`}>
                                                {passwordStrength.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                            <div className={`h-full ${getStrengthColor()} ${getStrengthWidth()} transition-all duration-300`}></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2 ml-1">Confirm Password</label>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-sm font-mono"
                                    placeholder="••••••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !newPassword || !confirmPassword}
                                className="w-full bg-primary hover:bg-cyan-400 text-background-dark py-5 rounded-xl font-black text-sm tracking-[0.2em] uppercase transition-all glow-cyan flex items-center justify-center gap-3 group disabled:opacity-50"
                            >
                                {loading ? (
                                    <span className="w-5 h-5 border-2 border-background-dark/30 border-t-background-dark rounded-full animate-spin"></span>
                                ) : (
                                    <>
                                        <span>Reset Password</span>
                                        <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">lock_reset</span>
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    <div className="mt-8 text-center">
                        <Link href="/admin/login" className="text-xs text-white/40 hover:text-primary transition-colors">
                            ← Back to Login
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <p className="mt-8 text-center text-white/20 text-xs">
                    Secure transmission encrypted with Quantum-Safe protocols.
                </p>
            </div>
        </div>
    );
}

export default function ResetPassword() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 font-sans">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-primary font-black uppercase tracking-[.2em] text-xs">Initializing Security Grid...</p>
                </div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
