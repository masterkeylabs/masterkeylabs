'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';

export default function Sidebar({ t, sidebarOpen, setSidebarOpen }) {
    const { signOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [dashboardHref, setDashboardHref] = useState('/dashboard');
    const [activeNav, setActiveNav] = useState('status');

    useEffect(() => {
        const id = localStorage.getItem('masterkey_business_id');
        if (id) setDashboardHref(`/dashboard?id=${id}`);
    }, []);

    const handleStatus = () => {
        setActiveNav('status');
        if (pathname === '/dashboard') {
            // Already on dashboard — just scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // On a sub-page — navigate back (loads at top automatically)
            router.push(dashboardHref);
        }
    };

    const handleAnalytics = () => {
        setActiveNav('analytics');
        const el = document.getElementById('schedule-review');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const activeClass = 'bg-ios-blue/10 text-ios-blue border border-ios-blue/20';
    const inactiveClass = 'text-white/40 hover:text-white/80 border border-transparent';

    return (
        <>
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/60 z-[90] backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen && setSidebarOpen(false)} />
            )}
            <aside className={`w-64 border-r border-white/5 bg-background-dark flex flex-col fixed h-full z-[100] transition-transform duration-300 left-0 top-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="p-8 flex items-center justify-between">
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/">
                            <img src="/logo.png" alt="MasterKey Labs" style={{ height: '56px', width: 'auto', filter: 'brightness(0) invert(1)', cursor: 'pointer' }} />
                        </Link>
                    </div>
                    {setSidebarOpen && (
                        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white/60 hover:text-white">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    )}
                </div>

                <nav className="flex-1 px-4 space-y-1.5 mt-2">
                    {/* System Status */}
                    <a
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${activeNav === 'status' ? activeClass : inactiveClass}`}
                        onClick={handleStatus}
                    >
                        <span className="material-symbols-outlined text-lg">dashboard_customize</span>
                        <span className="text-[13px] font-semibold tracking-tight">{t?.sidebar?.status || 'System Status'}</span>
                    </a>

                    {/* Deep Analytics */}
                    <a
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${activeNav === 'analytics' ? activeClass : inactiveClass}`}
                        onClick={handleAnalytics}
                    >
                        <span className="material-symbols-outlined text-lg">analytics</span>
                        <span className="text-[13px] font-medium tracking-tight">{t?.sidebar?.analytics || 'Deep Analytics'}</span>
                    </a>

                    <div className="pt-4 pb-2 px-4">
                        <span className="text-[10px] font-bold text-white/10 uppercase tracking-[0.2em]">{t?.sidebar?.protocols || 'Protocols'}</span>
                    </div>

                    <a className="flex items-center justify-between px-4 py-2.5 rounded-xl text-white/10 cursor-not-allowed group" href="#">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-lg">rocket_launch</span>
                            <span className="text-[13px] font-medium tracking-tight opacity-50">{t?.sidebar?.growth || 'Growth'}</span>
                        </div>
                        <span className="material-symbols-outlined text-[14px]">lock</span>
                    </a>

                    <a className="flex items-center justify-between px-4 py-2.5 rounded-xl text-white/10 cursor-not-allowed group" href="#">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-lg">hub</span>
                            <span className="text-[13px] font-medium tracking-tight opacity-50">{t?.sidebar?.map || 'Map'}</span>
                        </div>
                        <span className="material-symbols-outlined text-[14px]">lock</span>
                    </a>
                </nav>

                <div className="p-6 mt-auto space-y-4">
                    <button
                        onClick={signOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/40 hover:text-ios-orange hover:bg-ios-orange/5 transition-all text-left"
                    >
                        <span className="material-symbols-outlined text-lg">logout</span>
                        <span className="text-[13px] font-medium tracking-tight">{t?.sidebar?.logout || 'Logout'}</span>
                    </button>
                    <div className="system-card p-4 flex items-center gap-3 bg-white/[0.02]">
                        <div className="w-2 h-2 bg-ios-cyan rounded-full animate-pulse shadow-[0_0_8px_rgba(0,229,255,0.4)]"></div>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">{t?.sidebar?.active || 'NODE ACTIVE'}</p>
                    </div>
                </div>
            </aside>
        </>
    );
}
