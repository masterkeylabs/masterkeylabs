import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="bg-background-dark font-sans text-slate-100 min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Minimal Grid Background */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>
        <div className="absolute top-0 left-0 w-full h-full spotlight pointer-events-none z-0"></div>

        <div className="relative z-10 text-center max-w-lg p-8 glass-premium rounded-[2rem] border border-white/10 shadow-2xl backdrop-blur-3xl mx-4">
            <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 bg-ios-blue/10 rounded-full flex items-center justify-center border border-ios-blue/30 blur-[1px]">
                    <span className="material-symbols-outlined text-[40px] text-ios-blue">warning</span>
                </div>
            </div>
            
            <h1 className="text-6xl font-black mb-2 text-white/90 tracking-tighter mix-blend-screen">404</h1>
            <h2 className="text-xl font-bold uppercase tracking-[0.2em] mb-6 text-ios-blue">Directive Not Found</h2>
            
            <p className="text-white/50 mb-10 text-sm leading-relaxed px-4">
                The terminal sequence you requested is invalid or off-limits. Please verify your directive parameters and return to the main hub.
            </p>
            
            <Link href="/" className="inline-block px-8 py-4 bg-ios-blue text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white transition-colors duration-300 shadow-[0_0_20px_rgba(0,229,255,0.3)]">
                Initialize Return
            </Link>
        </div>
    </div>
  );
}
