import React from 'react';

interface AssetCardProps {
    subsidy: string | number;
}

export function AssetCard({ subsidy }: AssetCardProps) {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#030303] p-8 h-full min-h-[250px] shadow-2xl flex flex-col justify-between group">
            {/* Carbon Fiber Texture Overlay */}
            <div
                className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
                style={{
                    backgroundImage: `linear-gradient(45deg, #111 25%, transparent 25%, transparent 75%, #111 75%, #111), linear-gradient(45deg, #111 25%, transparent 25%, transparent 75%, #111 75%, #111)`,
                    backgroundSize: '10px 10px',
                    backgroundPosition: '0 0, 5px 5px'
                }}
            ></div>

            {/* Glowing Backdrop for text - pulses on hover */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-yellow-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-yellow-500/20 transition-all duration-[800ms] easy-in-out"></div>

            <div className="relative z-10 w-full h-full flex flex-col pt-2">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-auto">Untapped Capital</h3>

                <div className="flex flex-col mt-4 mb-8">
                    <span className="text-[9px] text-yellow-500/60 font-bold tracking-[0.2em] uppercase mb-3">Available Subsidy / Growth Capital</span>
                    <span
                        className="text-4xl md:text-5xl lg:text-5xl font-black tracking-tighter"
                        style={{
                            color: 'transparent',
                            backgroundClip: 'text',
                            backgroundImage: 'linear-gradient(to right, #fbbf24, #fef08a)',
                            filter: 'drop-shadow(0px 0px 15px rgba(250, 204, 21, 0.5))'
                        }}
                    >
                        ₹{subsidy}
                    </span>
                </div>

                {/* Claim Strategy Button */}
                <button className="relative z-20 w-full py-4 mt-2 bg-yellow-500/5 hover:bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-bold uppercase tracking-[0.2em] text-[10px] transition-all duration-300 rounded-xl group-hover:border-yellow-500/40 shadow-[0_0_10px_rgba(234,179,8,0.05)] group-hover:shadow-[0_0_20px_rgba(234,179,8,0.15)] group-active:scale-[0.98]">
                    [ Claim Strategy ]
                </button>
            </div>
        </div>
    );
}
