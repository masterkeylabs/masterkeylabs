'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Sidebar({ onReportClick }) {
    const router = useRouter();

    const handleLogout = () => {
        if (confirm('Are you sure you want to log out?')) {
            localStorage.removeItem('masterkey_business_id');
            router.push('/');
        }
    };

    return (
        <aside className="w-64 border-r border-white/10 bg-background-dark flex flex-col fixed h-full z-50">
            <div className="p-6">
                <Link href="/" className="flex items-center gap-3 h-16 overflow-hidden bg-white/[0.01] rounded-lg px-2 hover:bg-white/[0.03] transition-colors">
                    <img src="/logo.png" alt="MasterKey Labs" className="h-[20rem] w-auto object-contain scale-[1.05]" />
                </Link>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                <Link className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary border border-primary/20 glow-cyan transition-all" href="/dashboard">
                    <span className="material-symbols-outlined text-primary">dashboard</span>
                    <span className="text-sm font-semibold tracking-wide">Overview</span>
                </Link>
                <button
                    onClick={onReportClick}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                    <span className="material-symbols-outlined">analytics</span>
                    <span className="text-sm font-medium">Diagnostic Reports</span>
                </button>
                <a className="flex items-center justify-between px-4 py-3 rounded-lg text-white/30 cursor-not-allowed" href="#">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined">rocket_launch</span>
                        <span className="text-sm font-medium">Growth Systems</span>
                    </div>
                    <span className="material-symbols-outlined text-sm">lock</span>
                </a>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-all cursor-pointer"
                >
                    <span className="material-symbols-outlined">logout</span>
                    <span className="text-sm font-medium">Logout</span>
                </button>
            </nav>

            <div className="p-6 border-t border-white/10">
                <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-xl">
                    <div className="size-2 bg-neon-green rounded-full pulse-green"></div>
                    <p className="text-xs font-bold text-neon-green uppercase tracking-tighter">System Online</p>
                </div>
            </div>
        </aside>
    );
}
