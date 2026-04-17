'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SSOReceiver() {
    const router = useRouter();
    const [status, setStatus] = useState('Authenticating via FutureProof...');
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleSSO = async () => {
            try {
                // 1. Get the hash fragment from the URL
                const hash = window.location.hash.substring(1);
                
                if (!hash) {
                    throw new Error('No authentication tokens found in the URL.');
                }

                // 2. Parse the URL encoded hash string
                const hashParams = new URLSearchParams(hash);
                const accessToken = hashParams.get('access_token');
                const refreshToken = hashParams.get('refresh_token');

                if (!accessToken || !refreshToken) {
                    throw new Error('Invalid authentication tokens.');
                }

                setStatus('Establishing Secure Session...');

                // 3. Set the session in Supabase locally
                const { data, error: sessionError } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                });

                if (sessionError) {
                    throw sessionError;
                }

                setStatus('Access Granted. Redirecting to Homepage...');

                // 4. Clear the hash from the URL
                window.history.replaceState(null, '', window.location.pathname);

                // 5. Redirect
                setTimeout(() => {
                    router.push('/');
                }, 1000);

            } catch (err) {
                console.error('SSO Error:', err);
                setError(err.message || 'Failed to authenticate.');
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            }
        };

        handleSSO();
    }, [router]);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 text-center flex flex-col items-center">
                {error ? (
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-6">
                            <AlertCircle className="w-10 h-10" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Authentication Failed</h1>
                        <p className="text-gray-400 mb-6">{error}</p>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">Redirecting to Login...</p>
                    </motion.div>
                ) : (
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                        <div className="relative mb-8">
                            <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 relative z-10">
                                {status.includes('Granted') ? <ShieldCheck className="w-10 h-10" /> : <Zap className="w-10 h-10 animate-pulse" />}
                            </div>
                            <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Secure Handoff</h1>
                        <p className="text-blue-500 font-bold tracking-widest uppercase text-sm">{status}</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
