"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AdminLogin() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: admin, error: authError } = await supabase
                .from('admin_users')
                .select('*')
                .eq('email', email)
                .eq('password_hash', password)
                .single();

            if (authError) {
                console.error('Supabase Auth Error:', authError);
                // Check for missing table vs invalid credentials
                if (authError.code === 'PGRST116') {
                    throw new Error('Invalid specialized credentials.');
                }
                throw new Error(`System Error: ${authError.message}`);
            }

            if (!admin) {
                throw new Error('Invalid specialized credentials.');
            }

            // Success
            localStorage.setItem('admin_session', JSON.stringify({
                id: admin.id,
                email: admin.email,
                role: admin.role,
                timestamp: Date.now()
            }));
            router.push('/admin/dashboard');

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
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
                    <img src="/logo-stacked.png" alt="MasterKey Labs" className="h-24 md:h-32 w-auto object-contain drop-shadow-[0_0_15px_rgba(0,229,255,0.2)] mb-6" />
                    <div className="inline-block px-3 py-1 bg-primary/10 rounded-full text-primary text-[10px] font-black tracking-[0.25em] uppercase border border-primary/20">
                        Command Center Access
                    </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="glass rounded-[2rem] p-8 md:p-10 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <h1 className="text-2xl font-bold mb-6 tracking-tight">System Authentication</h1>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
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
                            <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2 ml-1">Security Key</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-sm font-mono"
                                placeholder="••••••••••••"
                            />
                        </div>

                        <button
                            disabled={loading}
                            className="w-full bg-primary hover:bg-cyan-400 text-background-dark py-5 rounded-xl font-black text-sm tracking-[0.2em] uppercase transition-all glow-cyan flex items-center justify-center gap-3 group disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-background-dark/30 border-t-background-dark rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    <span>Decrypt Access</span>
                                    <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">fingerprint</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-[10px] text-white/20 uppercase font-bold tracking-[.3em]">
                            Authorized Personnel Only
                        </p>
                    </div>
                </form>

                {/* Footer */}
                <p className="mt-8 text-center text-white/20 text-xs">
                    Secure transmission encrypted with Quantum-Safe protocols.
                </p>
            </div>
        </div>
    );
}
