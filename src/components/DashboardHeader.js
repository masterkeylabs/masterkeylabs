export default function DashboardHeader({ companyName = "Nexus Corp.", onMenuClick }) {
    return (
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-white/5 gap-4">
            <div>
                <h2 className="text-xl md:text-3xl font-bold tracking-tight">Welcome back, <span className="text-primary">{companyName}</span></h2>
                <p className="text-white/50 mt-1 uppercase text-[9px] md:text-[10px] font-black tracking-widest">Operational analysis: <span className="text-primary/60">Live Feed</span></p>
            </div>
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-3 hover:bg-white/5 rounded-xl transition-all border border-white/5 group"
                >
                    <span className="material-symbols-outlined text-primary text-2xl group-hover:rotate-180 transition-transform duration-500">menu</span>
                </button>
            </div>
        </header>
    );
}
