import Link from 'next/link';

export default function CapitalDetector({ cards = [] }) {
    const COLOR_MAP = {
        red: { label: 'text-alert-red', iconBg: 'bg-alert-red/10', iconColor: 'text-alert-red', hoverBorder: 'hover:border-alert-red/30', icon: 'trending_down' },
        orange: { label: 'text-alert-orange', iconBg: 'bg-alert-orange/10', iconColor: 'text-alert-orange', hoverBorder: 'hover:border-alert-orange/30', icon: 'nightlight' },
        cyan: { label: 'text-primary', iconBg: 'bg-primary/10', iconColor: 'text-primary', hoverBorder: 'hover:border-primary/30', icon: 'radar' },
        green: { label: 'text-neon-green', iconBg: 'bg-neon-green/10', iconColor: 'text-neon-green', hoverBorder: 'hover:border-neon-green/30', icon: 'public' },
    };

    const DEFAULT_CARDS = [
        { title: 'Loss Audit', amount: 'Run Audit', description: 'Find hidden waste in staff, marketing & operations costs', color: 'red', href: '/dashboard/loss-audit' },
        { title: 'Night Loss', amount: 'Calculate', description: 'Revenue lost from after-hours unanswered inquiries', color: 'orange', href: '/dashboard/night-loss' },
        { title: 'Digital Visibility', amount: 'Scan', description: 'Are customers finding you or your competitors?', color: 'cyan', href: '/dashboard/visibility' },
        { title: 'Global Markets', amount: 'Explore', description: 'Your products could sell for 3-7x more internationally', color: 'green', href: '/dashboard/export' },
    ];

    const displayCards = cards.length > 0 ? cards : DEFAULT_CARDS;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
            {displayCards.map((card, index) => {
                const style = COLOR_MAP[card.color] || COLOR_MAP.red;
                return (
                    <Link key={index} href={card.href || '#'}
                        className={`bg-carbon border border-white/5 p-6 rounded-xl ${style.hoverBorder} transition-all cursor-pointer group hover:bg-white/[0.03]`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`size-10 rounded-lg ${style.iconBg} flex items-center justify-center ${style.iconColor}`}>
                                <span className="material-symbols-outlined">{card.icon || style.icon}</span>
                            </div>
                            <span className={`text-[10px] font-bold ${style.label} uppercase tracking-widest`}>{card.title}</span>
                        </div>
                        <p className={`text-lg font-black mb-2 ${style.label}`}>{card.amount}</p>
                        <p className="text-white/50 text-xs leading-relaxed">{card.description}</p>
                        <div className="mt-4 flex items-center gap-1 text-white/30 group-hover:text-white/60 transition-colors">
                            <span className="text-[10px] font-bold uppercase tracking-widest">Open</span>
                            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
