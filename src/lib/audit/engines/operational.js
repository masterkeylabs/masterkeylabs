import { OPERATIONAL_CONFIG } from '../config';

export const BUSINESS_VERTICALS = [
    { value: 'it_services', label: 'IT / BPO', risk: 85, band: 'HIGH' },
    { value: 'ecommerce', label: 'E-commerce', risk: 85, band: 'HIGH' },
    { value: 'finance', label: 'Finance (routine)', risk: 85, band: 'HIGH' },
    { value: 'travel', label: 'Travel Booking', risk: 85, band: 'HIGH' },
    { value: 'data_entry', label: 'Data Entry Firms', risk: 85, band: 'HIGH' },
    { value: 'retail', label: 'Retail (physical)', risk: 72, band: 'MED-HIGH' },
    { value: 'manufacturing', label: 'Manufacturing (semi-auto)', risk: 72, band: 'MED-HIGH' },
    { value: 'logistics', label: 'Logistics', risk: 72, band: 'MED-HIGH' },
    { value: 'education', label: 'Education / Coaching', risk: 72, band: 'MED-HIGH' },
    { value: 'real_estate', risk: 58, band: 'MEDIUM' },
    { value: 'construction', label: 'Construction', risk: 58, band: 'MEDIUM' },
    { value: 'hospitality', label: 'Hospitality', risk: 58, band: 'MEDIUM' },
    { value: 'service', label: 'Service Sector', risk: 58, band: 'MEDIUM' },
    { value: 'fb', label: 'Media / Content', risk: 58, band: 'MEDIUM' },
    { value: 'healthcare', label: 'Healthcare (clinical)', risk: 38, band: 'LOW-MED' },
    { value: 'legal', label: 'Legal', risk: 38, band: 'LOW-MED' },
    { value: 'services', label: 'Skilled Trades', risk: 38, band: 'LOW-MED' },
    { value: 'b2b', label: 'Agriculture', risk: 38, band: 'LOW-MED' },
];

/**
 * OPERATIONAL WASTE — FORMULA SPECIFICATION
 * Now includes Logic Guards and Confidence Intelligence.
 */
export function calculateLossAudit(staff, ops, marketing, options = {}) {
    // 1. INPUT NORMALIZATION
    const s = Math.max(0, Number(staff) || 0);
    const o = Math.max(0, Number(ops) || 0);
    const m = Math.max(0, Number(marketing) || 0);
    const rev = Math.max(0, Number(options.annualRevenue) || 0);

    const totalInputCosts = s + o + m;

    // 2. LOGIC GUARD: Sanity Check
    // If reported monthly costs > reported annual revenue, the data is highly suspect.
    const isSuspiciousData = rev > 0 && totalInputCosts > (rev / 12) * 1.5; // allowing 50% margin for seasonal loss
    const insolvencyRisk = totalInputCosts > (rev / 12) && rev > 0;

    const intelligence = {
        reliability: isSuspiciousData ? 'LOW' : (insolvencyRisk ? 'MEDIUM' : 'HIGH'),
        isInsolvent: insolvencyRisk,
        isSuspicious: isSuspiciousData,
        flags: []
    };

    if (isSuspiciousData) intelligence.flags.push('EXCESSIVE_COSTS_DETECTED');
    if (insolvencyRisk) intelligence.flags.push('NEGATIVE_MARGIN_WARNING');

    // 3. INDUSTRY MODIFIER
    const normalizedIndustry = (typeof options.industry === 'string' ? options.industry : (options.industry?.value || '')).toLowerCase().trim();
    const industryObj = BUSINESS_VERTICALS.find(v => v.value === normalizedIndustry) || { risk: 72 };
    const industryRiskFactor = industryObj.risk / 85;

    // 4. THE CALCULATION (Refactored for clarity)
    const { manualHoursPerDay = 3, hasCRM = false, hasERP = false } = options;

    // 4A. Payroll Waste
    let payrollWasteRate = OPERATIONAL_CONFIG.BASELINE_WASTE_RATES.PAYROLL * industryRiskFactor;
    if (manualHoursPerDay > 6) payrollWasteRate *= 1.86;
    else if (manualHoursPerDay >= 4) payrollWasteRate *= 1.46;
    else if (manualHoursPerDay < 1) payrollWasteRate *= 0.6;
    if (hasERP) payrollWasteRate *= (1 - OPERATIONAL_CONFIG.EFFICIENCY_GAINS.ERP_PAYROLL_REDUCTION);

    // 4B. Overhead Waste
    let overheadWasteRate = OPERATIONAL_CONFIG.BASELINE_WASTE_RATES.OVERHEAD * industryRiskFactor;
    if (hasERP) overheadWasteRate *= (1 - OPERATIONAL_CONFIG.EFFICIENCY_GAINS.ERP_OVERHEAD_REDUCTION);

    // 4C. Marketing Waste
    let marketingWasteRate = OPERATIONAL_CONFIG.BASELINE_WASTE_RATES.MARKETING;
    if (hasCRM) marketingWasteRate *= (1 - OPERATIONAL_CONFIG.EFFICIENCY_GAINS.CRM_MARKETING_REDUCTION);

    let payrollWaste = s * payrollWasteRate;
    let overheadWaste = o * overheadWasteRate;
    let marketingWaste = m * marketingWasteRate;

    // 4D. Coordination Drag
    let coordinationDrag = 0;
    const totalOpsWaste = payrollWaste + overheadWaste + marketingWaste;
    if (rev > 0 && (totalOpsWaste / rev) > OPERATIONAL_CONFIG.DRAG_THRESHOLD) {
        coordinationDrag = totalOpsWaste * OPERATIONAL_CONFIG.DRAG_THRESHOLD;
    }

    // 5. THE CAP (Universal Safety Net)
    // We never claim to lose more than 100% of a specific spend category.
    const finalPayrollWaste = Math.min(payrollWaste, s);
    const finalOverheadWaste = Math.min(overheadWaste, o);
    const finalMarketingWaste = Math.min(marketingWaste, m);

    let totalBurn = finalPayrollWaste + finalOverheadWaste + finalMarketingWaste + coordinationDrag;
    
    // Final Cap: Total waste cannot exceed total input cost
    totalBurn = Math.min(totalBurn, totalInputCosts);

    return {
        staffWaste: Math.round(finalPayrollWaste),
        opsWaste: Math.round(finalOverheadWaste),
        marketingWaste: Math.round(finalMarketingWaste),
        coordinationDrag: Math.round(coordinationDrag),
        totalBurn: Math.round(totalBurn),
        annualBurn: Math.round(totalBurn * 12),
        savingTarget: Math.round(totalBurn * 0.7),
        fiveYearCost: Math.round(totalBurn * 12 * 5),
        intelligence // The special return for the UI
    };
}
