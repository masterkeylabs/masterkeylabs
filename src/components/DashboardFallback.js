'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardFallback() {
    const router = useRouter();

    useEffect(() => {
        const id = localStorage.getItem('masterkey_business_id');
        if (id) {
            // Business ID found in localStorage — redirect with it
            router.replace(`/dashboard?id=${id}`);
        }
        // If no ID found, stay and show the message below
    }, [router]);

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-10 text-center">
            <span className="material-symbols-outlined text-6xl text-white/10 mb-6">
                manage_accounts
            </span>
            <h2 className="text-2xl font-bold tracking-tight mb-3">No Active Business Session</h2>
            <p className="text-white/40 mb-8 max-w-sm leading-relaxed">
                No business session was found. Please complete the intake protocol to activate your diagnostic dashboard.
            </p>
            <a
                href="/"
                className="inline-flex items-center gap-2 bg-ios-blue hover:bg-ios-blue/80 text-white font-bold px-8 py-4 rounded-2xl uppercase tracking-widest text-xs transition-all"
            >
                <span className="material-symbols-outlined text-sm">rocket_launch</span>
                Start Business Intake
            </a>
        </div>
    );
}
