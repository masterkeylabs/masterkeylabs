/**
 * EXPORT OPPORTUNITY — FORMULA SPECIFICATION
 */
export const EXPORT_CATEGORIES = [
    { value: 'spices', label: 'Spices & Spices Extracts' },
    { value: 'textiles', label: 'Textiles & Apparel' },
    { value: 'leather', label: 'Leather Goods' },
    { value: 'machinery', label: 'Machinery & Equipment' },
    { value: 'software', label: 'IT & Software Services' },
    { value: 'healthcare', label: 'Pharmaceuticals' },
];

export function calculateExportOpportunity(localPrice, monthlyQty, category, destination) {
    const price = Math.max(0, Number(localPrice) || 0);
    const qty = Math.max(0, Number(monthlyQty) || 0);
    const baseRev = price * qty;
    const multiplier = 2.5;
    const exportRevenue = baseRev * multiplier;
    const exportCost = exportRevenue * 0.2;
    const netExportProfit = exportRevenue - exportCost;
    const additionalIncome = netExportProfit - baseRev;

    return {
        multiplier,
        exportRevenue,
        localRevenue: baseRev,
        exportCost,
        netExportProfit,
        additionalIncome,
        roiPercent: baseRev > 0 ? Math.round((netExportProfit / baseRev) * 100) : 0,
        annualAdditional: additionalIncome * 12
    };
}
