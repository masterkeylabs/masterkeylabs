import Link from 'next/link';
import { useDiagnosticStore } from '@/store/diagnosticStore';

export default function BusinessProfile({ business, t, lang }) {
    // Access the raw data state injected from the Loss Audit component
    const { opsWasteRaw } = useDiagnosticStore();

    if (!business) return null;

    // Use translations for labels, fallback to English if t is missing
    const profileT = t?.dashboard?.profile || {
        title: "Business Profile",
        managedBy: "Managed by",
        vertical: "Vertical",
        revenue: "Revenue",
        employees: "Employees",
        contact: "Contact"
    };

    let verticalCode = business.classification || 'Unknown';
    let revenueBracket = 'Not specified';

    // Override classification with real live data from Operational Waste if available
    if (opsWasteRaw?.industry) {
        verticalCode = opsWasteRaw.industry;
    }

    // Revenue mapping logic
    if (opsWasteRaw?.revenue_bracket) {
        revenueBracket = opsWasteRaw.revenue_bracket;
    } else if (business.classification && business.classification.includes('::')) {
        const parts = business.classification.split('::');
        verticalCode = opsWasteRaw?.industry || parts[0];
        revenueBracket = parts[1];
    } else if (business.classification && business.classification.includes(' (')) {
        const match = business.classification.match(/(.*) \((.*)\)/);
        if (match) {
            verticalCode = opsWasteRaw?.industry || match[1];
            revenueBracket = match[2];
        }
    }

    const formatVertical = (v) => {
        // Use translated verticals from t.verticals
        const verticalLabel = t?.verticals?.[v.toLowerCase()];
        if (verticalLabel) return verticalLabel;

        const mapping = {
            'retail': 'Retail',
            'fb': 'Food & Beverage',
            'services': 'Service',
            'b2b': 'B2B Goods',
            'ecommerce': 'E-commerce'
        };
        return mapping[v.toLowerCase()] || v;
    };

    const content = (
        <div className="system-card bg-white/[0.02] border border-white/5 p-5 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all duration-300 hover:bg-white/[0.04] hover:border-white/20 relative overflow-hidden cursor-pointer">
            {/* Edit Icon on Hover Container */}
            <div className="absolute top-4 right-4 text-white/0 group-hover:text-ios-blue transition-colors duration-300 pointer-events-none">
                <span className="material-symbols-outlined text-xl">edit</span>
            </div>

            <div className="w-full md:w-auto">
                <h3 className="text-[10px] text-ios-blue uppercase tracking-[0.2em] font-bold mb-2">{profileT.title}</h3>
                <h2 className="text-xl md:text-3xl font-bold text-white tracking-tight group-hover:text-ios-blue transition-colors duration-300 truncate">{business.entity_name}</h2>
                <p className="text-white/50 text-xs md:text-sm mt-1">{profileT.managedBy} {business.owner_name || 'System'}</p>
            </div>

            <div className="flex flex-wrap md:flex-nowrap gap-4 md:gap-8 w-full md:w-auto">
                <div className="flex flex-col gap-1 min-w-[140px] max-w-full">
                    <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Email</span>
                    <span className="text-xs md:text-sm font-semibold text-white/90 break-all">{business.email || '—'}</span>
                </div>
                <div className="flex flex-col gap-1 min-w-[120px]">
                    <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold whitespace-nowrap">{profileT.contact}</span>
                    <span className="text-xs md:text-sm font-semibold text-white/90 whitespace-nowrap">{business.phone || '—'}</span>
                </div>
            </div>
        </div>
    );

    return (
        <section className="mb-8 animate-fade-in opacity-0" style={{ animationDelay: '0s', animationFillMode: 'forwards' }}>
            <Link href={business.id ? `/dashboard/profile?id=${business.id}` : '/dashboard/profile'} className="block group">
                {content}
            </Link>
        </section>
    );
}
