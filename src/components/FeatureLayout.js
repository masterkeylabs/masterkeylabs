'use client';
import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

export default function FeatureLayout({ children, title, subtitle, backHref = '/dashboard' }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-full min-h-screen bg-background-dark overflow-x-hidden">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onReportClick={() => { }} // Could be passed as prop if needed
            />

            <main className="flex-1 p-4 md:p-8 relative z-10">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Link href={backHref} className="inline-flex items-center gap-2 text-white/40 hover:text-primary transition-colors text-sm mb-4">
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            Back to Dashboard
                        </Link>
                        <h2 className="text-3xl font-bold tracking-tight text-white">{title}</h2>
                        {subtitle && <p className="text-white/50 mt-1">{subtitle}</p>}
                    </div>

                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="self-end md:self-auto p-3 hover:bg-white/5 rounded-xl transition-all border border-white/5 text-primary"
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </div>

                <div className="h-[1px] w-full bg-gradient-to-r from-primary/30 via-white/5 to-transparent mb-8"></div>

                {children}
            </main>
        </div>
    );
}
