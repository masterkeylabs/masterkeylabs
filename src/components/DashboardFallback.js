'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';

export default function DashboardFallback() {
    const router = useRouter();
    const { business, loading } = useAuth();

    useEffect(() => {
        if (loading) return;

        const id = business?.id || (typeof window !== 'undefined' ? localStorage.getItem('masterkey_business_id') : null);
        if (id) {
            // Business ID found — redirect with it
            router.replace(`/dashboard?id=${id}`);
        }
    }, [business, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-10 text-center">
                <div className="w-16 h-16 border-4 border-ios-blue/20 border-t-ios-blue rounded-full animate-spin mb-6"></div>
                <p className="text-white/40 uppercase tracking-[0.2em] text-[10px] font-bold">Synchronizing Terminal...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-10 text-center animate-fade-in">
            <span className="material-symbols-outlined text-6xl text-white/10 mb-6">
                manage_accounts
            </span>
            <h2 className="text-2xl font-bold tracking-tight mb-3">No Active Business Session</h2>
            <p className="text-white/40 mb-8 max-w-sm leading-relaxed">
                No business session was found associated with your account. Please complete the intake protocol to activate your diagnostic dashboard.
            </p>
            <Link
                href="/"
                className="inline-flex items-center gap-2 bg-ios-blue hover:bg-ios-blue/80 text-white font-bold px-8 py-4 rounded-2xl uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-ios-blue/20"
            >
                <span className="material-symbols-outlined text-sm">rocket_launch</span>
                Start Business Intake
            </Link>
        </div>
    );
}
