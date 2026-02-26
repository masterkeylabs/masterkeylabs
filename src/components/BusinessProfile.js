import Link from 'next/link';

export default function BusinessProfile({ business }) {
    if (!business) return null;

    // Parse classification string which is formatted as "vertical::revenueBracket"
    let vertical = business.classification || 'Unknown';
    let revenueBracket = 'Not specified';

    if (business.classification && business.classification.includes('::')) {
        const parts = business.classification.split('::');
        vertical = parts[0];
        revenueBracket = parts[1];
    } else if (business.classification && business.classification.includes(' (')) {
        // legacy format if any
        const match = business.classification.match(/(.*) \((.*)\)/);
        if (match) {
            vertical = match[1];
            revenueBracket = match[2];
        }
    }

    const formatVertical = (v) => {
        const mapping = {
            'retail': 'Retail',
            'fb': 'Food & Beverage',
            'services': 'Service',
            'b2b': 'B2B Goods',
            'ecommerce': 'E-commerce'
        };
        return mapping[v] || v;
    };

    return (
        <section className="mb-8 animate-fade-in opacity-0" style={{ animationDelay: '0s', animationFillMode: 'forwards' }}>
            <Link href={`/dashboard/profile?id=${business.id}`} className="block group">
                <div className="system-card bg-white/[0.02] border border-white/5 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all duration-300 hover:bg-white/[0.04] hover:border-white/20 relative overflow-hidden cursor-pointer">

                    {/* Edit Icon on Hover Container */}
                    <div className="absolute top-4 right-4 text-white/0 group-hover:text-ios-blue transition-colors duration-300 pointer-events-none">
                        <span className="material-symbols-outlined text-xl">edit</span>
                    </div>

                    <div>
                        <h3 className="text-[10px] text-ios-blue uppercase tracking-[0.2em] font-bold mb-2">Business Profile</h3>
                        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight group-hover:text-ios-blue transition-colors duration-300">{business.entity_name}</h2>
                        <p className="text-white/50 text-sm mt-1">Managed by {business.owner_name}</p>
                    </div>

                    <div className="flex flex-wrap gap-4 md:gap-8 pr-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Vertical</span>
                            <span className="text-sm font-semibold text-white/90">{formatVertical(vertical)}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Revenue</span>
                            <span className="text-sm font-semibold text-white/90">{revenueBracket}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Employees</span>
                            <span className="text-sm font-semibold text-white/90">{business.scalability || 'Unknown'}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Contact</span>
                            <span className="text-sm font-semibold text-white/90">{business.phone || business.email || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </Link>
        </section>
    );
}
