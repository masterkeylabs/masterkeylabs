'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Sidebar({ isOpen, onClose, onReportClick }) {
    const router = useRouter();

    const handleLogout = () => {
        if (confirm('Are you sure you want to log out?')) {
            localStorage.removeItem('masterkey_business_id');
            router.push('/');
        }
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <aside
                className={`fixed top-0 right-0 h-full w-80 bg-background-dark/95 border-l border-white/10 z-[110] transform transition-transform duration-300 ease-in-out shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <Link href="/" className="hover:opacity-80 transition-all">
                        <img src="/logo.png" alt="MasterKey Labs" className="h-12 w-auto grayscale brightness-200" />
                    </Link>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-8">
                    <Link
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary border border-primary/20 glow-cyan transition-all"
                        href="/dashboard"
                        onClick={onClose}
                    >
                        <span className="material-symbols-outlined text-sm">dashboard</span>
                        <span className="text-xs font-black uppercase tracking-widest">Overview</span>
                    </Link>

                    <button
                        onClick={() => { onReportClick(); onClose(); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all text-left"
                    >
                        <span className="material-symbols-outlined text-sm">analytics</span>
                        <span className="text-xs font-black uppercase tracking-widest">Diagnostic Reports</span>
                    </button>

                    <div className="pt-2">
                        <div className="px-4 py-2 text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">Restricted Access</div>
                        <a className="flex items-center justify-between px-4 py-3 rounded-xl text-white/10 cursor-not-allowed group" href="#">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-sm">rocket_launch</span>
                                <span className="text-xs font-black uppercase tracking-widest">Growth Systems</span>
                            </div>
                            <span className="material-symbols-outlined text-xs">lock</span>
                        </a>
                    </div>

                    <div className="mt-auto pt-8">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500/40 hover:text-red-500 hover:bg-red-500/5 transition-all"
                        >
                            <span className="material-symbols-outlined text-sm">logout</span>
                            <span className="text-xs font-black uppercase tracking-widest">Logout System</span>
                        </button>
                    </div>
                </nav>

                <div className="p-6 mt-auto">
                    <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-xl border border-white/5">
                        <div className="size-1.5 bg-neon-green rounded-full pulse-green"></div>
                        <p className="text-[10px] font-black text-neon-green uppercase tracking-widest">Connection: Secure</p>
                    </div>
                </div>
            </aside>
        </>
    );
}
