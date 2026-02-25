import React from 'react';
import { LayoutDashboard, FileText, Lock } from 'lucide-react';

export function DashboardSidebar() {
    return (
        <aside className="w-64 border-r border-white/5 bg-[#050505] hidden md:flex flex-col h-screen shrink-0 relative z-20 shadow-[8px_0_30px_rgba(0,0,0,0.8)]">
            {/* Brand */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-lg font-black tracking-widest text-white">PROTOCOL<span className="text-ios-blue">.OS</span></h2>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 p-4 space-y-2 mt-4">
                <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl bg-white/5 text-white border border-white/10 shadow-[inset_0_1px_rgba(255,255,255,0.05)]">
                    <LayoutDashboard size={18} className="text-ios-blue" />
                    Overview
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
                    <FileText size={18} />
                    Diagnostic Reports
                </a>
                <div className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-700 cursor-not-allowed">
                    <Lock size={18} />
                    Growth Systems (Locked)
                </div>
            </nav>

            {/* Status Footer */}
            <div className="p-6 border-t border-white/10 mt-auto bg-[#030303]">
                <div className="flex items-center justify-center gap-3 bg-green-900/20 px-4 py-3 rounded-xl border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                    </span>
                    <span className="text-green-500 text-[11px] font-bold uppercase tracking-widest">
                        System Online
                    </span>
                </div>
            </div>
        </aside>
    );
}
