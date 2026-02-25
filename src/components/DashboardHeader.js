export default function DashboardHeader({ companyName = "Nexus Corp.", lang, setLang, t, setSidebarOpen }) {
    return (
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 md:mb-12 pb-6 md:pb-8 border-b border-white/5 gap-4 md:gap-0">
            <div className="flex items-center justify-between w-full md:w-auto">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mb-1">
                        {t.header.command}: <span className="text-ios-blue">{companyName}</span>
                    </h2>
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-ios-cyan/40 rounded-full animate-pulse"></span>
                        <p className="text-[11px] text-white/30 uppercase tracking-[0.15em] font-bold">{t.header.sync}</p>
                    </div>
                </div>
                {setSidebarOpen && (
                    <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-white/60 hover:text-white ml-4 rounded-lg bg-white/5">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                )}
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                {/* Language Switcher */}
                <div className="flex bg-white/5 rounded-full p-1 border border-white/10 backdrop-blur-md">
                    <button onClick={() => setLang('en')} className={`px-3 py-1 rounded-full text-[9px] font-bold transition-all ${lang === 'en' ? 'bg-ios-blue text-white' : 'text-white/40 hover:text-white/60'}`}>EN</button>
                    <button onClick={() => setLang('hinglish')} className={`px-3 py-1 rounded-full text-[9px] font-bold transition-all ${lang === 'hinglish' ? 'bg-ios-blue text-white' : 'text-white/40 hover:text-white/60'}`}>HINGLISH</button>
                    <button onClick={() => setLang('hi')} className={`px-3 py-1 rounded-full text-[9px] font-bold transition-all ${lang === 'hi' ? 'bg-ios-blue text-white' : 'text-white/40 hover:text-white/60'}`}>हिन्दी</button>
                </div>

                <div className="system-card px-4 py-2 border border-white/5 flex items-center gap-2 bg-white/[0.01]">
                    <span className="material-symbols-outlined text-[14px] text-white/20">schedule</span>
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">v2.1.0-secure</span>
                </div>
            </div>
        </header>
    );
}
