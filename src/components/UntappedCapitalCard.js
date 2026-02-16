export default function UntappedCapitalCard() {
    return (
        <div className="col-span-4 carbon-texture border border-premium-gold/30 rounded-xl p-8 flex flex-col justify-between glow-gold relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 size-48 bg-premium-gold/10 blur-[80px] rounded-full transition-all group-hover:bg-premium-gold/20"></div>
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-premium-gold">monetization_on</span>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-premium-gold">Premium Insight</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">Untapped Capital Detected</h3>
                <div className="my-6">
                    <p className="text-4xl font-black text-premium-gold tracking-tight">₹12,50,000</p>
                    <p className="text-white/40 text-sm mt-1 uppercase tracking-widest font-semibold">Manufacturing Tech Upgrade Scheme</p>
                </div>
            </div>
            <button className="w-full bg-premium-gold hover:bg-yellow-400 text-background-dark font-black py-4 rounded-lg tracking-widest uppercase transition-all flex items-center justify-center gap-2">
                Claim Strategy <span className="material-symbols-outlined font-bold">arrow_forward</span>
            </button>
        </div>
    );
}
