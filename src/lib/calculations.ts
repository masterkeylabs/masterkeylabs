// Core Architecture Constants
export const WASTE_RATES = {
    staff: 0.15,      // 15% lost to manual repetitive tasks
    ops: 0.20,        // 20% lost to operational friction
    marketing: 0.35   // 35% of ad spend wasted without CRM/Automation
};

export const EXPORT_COSTS = {
    freightMultiplier: 1.15,
    customsDuty: 0.05
};

export const NIGHT_RATE = {
    trafficShare: 0.45,   // 45% of potential global/digital traffic happens outside 9-5
    averageTicket: 25000  // Average INR ticket size for Masterkey clients
};

export const CURRENT_CVR = 0.04; // 4% baseline conversion for missed inbound leads

export const AI_RISK_MATRIX: Record<string, number> = {
    'retail': 82,
    'healthcare': 65,
    'finance': 94,
    'manufacturing': 78,
    'logistics': 85,
    'education': 72,
    'real_estate': 68,
    'it_services': 95,
    'e-commerce': 88,
    'hospitality': 60,
    'default': 75
};

// Deterministic Math Export Functions

export function calculateLossAudit(staff: number, ops: number, marketing: number): number {
    const staffLoss = (Number(staff) || 0) * WASTE_RATES.staff;
    const opsLoss = (Number(ops) || 0) * WASTE_RATES.ops;
    const marketingLoss = (Number(marketing) || 0) * WASTE_RATES.marketing;

    const totalBaseLoss = staffLoss + opsLoss + marketingLoss;
    const compoundingPenalty = totalBaseLoss > 1000000 ? totalBaseLoss * 0.08 : totalBaseLoss * 0.03;

    return Math.round(totalBaseLoss + compoundingPenalty);
}

export function calculateNightLoss(closingTime: number | string, dailyInquiries: number): number {
    const time = Number(closingTime) || 18;
    const inquiries = Number(dailyInquiries) || 0;

    let closedHours = 24 - (time - 9);
    closedHours = Math.max(0, Math.min(24, closedHours));

    const missedInquiriesPerDay = inquiries * (closedHours / 24) * NIGHT_RATE.trafficShare;
    const monthlyLostRevenue = missedInquiriesPerDay * 30 * NIGHT_RATE.averageTicket * CURRENT_CVR;

    return Math.round(monthlyLostRevenue);
}

export function calculateAIThreat(industry: string, isOmnichannel: boolean): number {
    const normalizedIndustry = (industry || '').toLowerCase().trim().replace(/ /g, '_');
    const baseRisk = AI_RISK_MATRIX[normalizedIndustry] || AI_RISK_MATRIX['default'];

    const omnichannelDiscount = isOmnichannel ? 18 : -5;
    const finalRisk = baseRisk - omnichannelDiscount;

    return Math.max(0, Math.min(100, Math.round(finalRisk)));
}

export const EXPORT_CATEGORIES = [
    { value: 'spices', label: 'Spices & Herbs' },
    { value: 'textiles', label: 'Cotton / Textiles' },
    { value: 'jewelry', label: 'Jewelry / Gems' },
    { value: 'handicrafts', label: 'Handicrafts' },
    { value: 'software', label: 'Software/IT Services' },
    { value: 'manufacturing', label: 'Manufacturing & Parts' },
    { value: 'agriculture', label: 'Agricultural Produce' },
    { value: 'other', label: 'Other/Miscellaneous' },
];

export const VISIBILITY_SIGNALS = [
    { id: 'website', label: 'Professional Website', points: 30 },
    { id: 'gmb', label: 'Google My Business Optimized', points: 20 },
    { id: 'social', label: 'Active Social Media (Daily/Weekly)', points: 15 },
    { id: 'seo', label: 'Basic SEO (Appears on Page 1)', points: 15 },
    { id: 'ads', label: 'Paid Advertising active', points: 10 },
    { id: 'crm', label: 'CRM / Auto-responder', points: 10 },
];

export function formatINR(val: any): string {
    const num = Number(val) || 0;
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
}

export function formatINRFull(val: any): string {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
}

export function calculateExportOpportunity(price: number, qty: number, category: string, destination: string) {
    const localRevenue = price * qty;

    let multiplier = 2.5;
    if (destination === 'USA' || destination === 'UK' || destination === 'Australia') multiplier = 4.5;
    else if (destination === 'UAE' || destination === 'Singapore') multiplier = 3.0;
    else if (destination === 'Germany' || destination === 'Japan') multiplier = 5.0;

    const exportRevenue = localRevenue * multiplier;
    // Base cost 15% + Customs estimate
    const exportCost = exportRevenue * (0.15 + EXPORT_COSTS.customsDuty);
    const netExportProfit = exportRevenue - exportCost;
    const additionalIncome = netExportProfit - localRevenue;
    const roiPercent = Math.round(((netExportProfit - localRevenue) / localRevenue) * 100);
    const annualAdditional = additionalIncome * 12;

    return {
        multiplier,
        exportRevenue,
        localRevenue,
        exportCost,
        netExportProfit,
        additionalIncome,
        roiPercent,
        annualAdditional
    };
}

export function calculateVisibility(signals: Record<string, boolean>, city?: string) {
    let percent = 0;
    let gaps: { label: string, points: number }[] = [];

    if (signals) {
        VISIBILITY_SIGNALS.forEach(s => {
            if (signals[s.id]) {
                percent += s.points;
            } else {
                gaps.push({ label: s.label, points: s.points });
            }
        });
    }

    percent = Math.max(0, Math.min(100, percent));

    let status = 'INVISIBLE';
    if (percent >= 80) status = 'DOMINANT';
    else if (percent >= 60) status = 'VISIBLE';
    else if (percent >= 40) status = 'OKAY';
    else if (percent >= 20) status = 'GHOST';

    const missedCustomers = Math.round(((100 - percent) / 100) * 500);

    return { percent, status, missedCustomers, gaps };
}

