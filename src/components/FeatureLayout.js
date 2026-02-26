'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

export default function FeatureLayout({ children, title, subtitle, backHref, t }) {
    const [dashboardHref, setDashboardHref] = useState('/dashboard');

    useEffect(() => {
        const id = localStorage.getItem('masterkey_business_id');
        if (id) {
            setDashboardHref(`/dashboard?id=${id}`);
        } else if (backHref) {
            setDashboardHref(backHref);
        }
    }, [backHref]);

    return (
        <div className="flex h-full min-h-screen">
            <Sidebar t={t} />
            <main className="flex-1 ml-64 p-8">
                <div className="mb-8">
                    <Link href={dashboardHref} className="inline-flex items-center gap-2 text-white/40 hover:text-primary transition-colors text-sm mb-4">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        {t?.dashboard?.backToDashboard || 'Back to Dashboard'}
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight text-white">{title}</h2>
                    {subtitle && <p className="text-white/50 mt-1">{subtitle}</p>}
                    <div className="h-[1px] w-full bg-gradient-to-r from-primary/30 via-white/5 to-transparent mt-4"></div>
                </div>
                {children}
            </main>
        </div>
    );
}
