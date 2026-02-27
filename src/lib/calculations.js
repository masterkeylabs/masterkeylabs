/**
 * Utility for core business logic calculations used throughout the Masterkey OS Dashboard.
 * These functions are deterministic, do not rely on external APIs, and return exact numeric outputs.
 */

export function formatINR(amount) {
    if (amount >= 10000000) return '₹' + (amount / 10000000).toFixed(2) + ' Cr';
    if (amount >= 100000) return '₹' + (amount / 100000).toFixed(2) + ' L';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
}

export function formatINRFull(amount) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
}

export const BUSINESS_VERTICALS = [
    { value: 'retail', label: 'Retail / Shop', risk: 82 },
    { value: 'fb', label: 'Food & Beverage', risk: 75 },
    { value: 'services', label: 'Professional Services', risk: 72 },
    { value: 'b2b', label: 'B2B / Wholesale', risk: 65 },
    { value: 'ecommerce', label: 'E-commerce', risk: 92 },
    { value: 'manufacturing', label: 'Manufacturing', risk: 78 },
    { value: 'logistics', label: 'Logistics / Transport', risk: 85 },
    { value: 'healthcare', label: 'Healthcare / Medical', risk: 60 },
    { value: 'real_estate', label: 'Real Estate', risk: 68 },
    { value: 'it_services', label: 'IT & Software', risk: 95 },
];

/**
 * Calculates financial bleed based on staff inefficiencies, operational drag, and marketing waste.
 * @param {number} staff - Monthly staff costs in INR.
 * @param {number} ops - Monthly operational costs in INR.
 * @param {number} marketing - Monthly marketing spend in INR.
 * @returns {number} Exact INR value representing monthly loss.
 */
export function calculateLossAudit(staff, ops, marketing, options = {}) {
    const { manualHoursPerWeek = 20, hasCRM = false, hasERP = false, industry = '' } = options;

    let staffWasteFactor = 0.12;
    let opsDragFactor = 0.15;
    let marketingBleedFactor = 0.30;

    // Industry specific adjustments
    if (industry === 'ecommerce') marketingBleedFactor += 0.10;
    if (industry === 'manufacturing') opsDragFactor += 0.05;
    if (industry === 'retail') staffWasteFactor += 0.03;

    if (manualHoursPerWeek > 30) staffWasteFactor += 0.10;
    else if (manualHoursPerWeek > 15) staffWasteFactor += 0.05;

    if (hasCRM) marketingBleedFactor -= 0.15;
    if (hasERP) opsDragFactor -= 0.10;

    const staffLoss = (Number(staff) || 0) * staffWasteFactor;
    const opsLoss = (Number(ops) || 0) * opsDragFactor;
    const marketingLoss = (Number(marketing) || 0) * marketingBleedFactor;

    const totalBaseLoss = staffLoss + opsLoss + marketingLoss;
    const compoundingPenalty = totalBaseLoss > 1000000 ? totalBaseLoss * 0.08 : totalBaseLoss * 0.03;

    const totalBurn = Math.round(totalBaseLoss + compoundingPenalty);

    return {
        staffWaste: Math.round(staffLoss),
        opsWaste: Math.round(opsLoss),
        marketingWaste: Math.round(marketingLoss),
        totalBurn: totalBurn,
        annualBurn: totalBurn * 12,
        savingTarget: Math.round(totalBurn * 0.7),
        fiveYearCost: totalBurn * 12 * 5
    };
}

/**
 * Calculates lost revenue due to inquiries missed outside of business hours.
 */
export function calculateNightLoss(dailyInquiries, closingTime, profitPerSale, responseTime, monthlyDays = 26) {
    const inquiries = Number(dailyInquiries) || 0;
    const profit = Number(profitPerSale) || 0;

    const closingHour = parseInt(closingTime) || 18;
    const closedHours = 24 - (closingHour - 9);
    const nightTrafficFactor = closingHour <= 18 ? 0.38 : closingHour <= 20 ? 0.25 : 0.14;

    const nightInquiries = Math.round(inquiries * nightTrafficFactor * monthlyDays);

    const cvrMap = {
        'instant': 0.28,
        '<30min': 0.18,
        '1-4hrs': 0.08,
        'nextday': 0.03,
        'none': 0.00
    };

    const currentCVR = cvrMap[responseTime] || 0.05;
    const potentialCVR = 0.28; // AI Instant response

    const currentRevenue = Math.round(nightInquiries * currentCVR * profit);
    const potentialRevenue = Math.round(nightInquiries * potentialCVR * profit);
    const monthlyLoss = potentialRevenue - currentRevenue;

    return {
        nightInquiries,
        currentRevenue,
        potentialRevenue,
        monthlyLoss,
        annualLoss: monthlyLoss * 12,
        hourlyLoss: Math.round(monthlyLoss / (monthlyDays * closedHours))
    };
}

/**
 * Calculates digital visibility score and missed customer opportunities.
 */
export function calculateVisibility(signals, city = '') {
    const signalWeights = {
        hasWebsite: 20,
        hasGoogleMyBusiness: 20,
        activeSocialMedia: 15,
        runsAds: 10,
        seoOptimized: 15,
        hasCRM: 5,
        hasWhatsApp: 15
    };

    let totalScore = 0;
    const gaps = [];
    const activeSignals = Array.isArray(signals) ? signals : Object.keys(signals).filter(k => signals[k]);

    Object.keys(signalWeights).forEach(id => {
        if (activeSignals.includes(id)) {
            totalScore += signalWeights[id];
        } else {
            gaps.push({ id, label: id.replace(/([A-Z])/g, ' $1').trim(), points: signalWeights[id] });
        }
    });

    const percent = Math.min(100, totalScore);
    let status = 'INVISIBLE';
    if (percent >= 90) status = 'DOMINANT';
    else if (percent >= 70) status = 'VISIBLE';
    else if (percent >= 50) status = 'OKAY';
    else if (percent >= 30) status = 'GHOST';

    // Mock missed customers based on score and city size (generic multiplier)
    const baselineTraffic = city ? 1200 : 500;
    const missedCustomers = Math.round(baselineTraffic * (1 - percent / 100));

    return {
        percent,
        status,
        missedCustomers,
        gaps
    };
}

/**
 * Calculates the risk of AI disruption for a specific business.
 */
export function calculateAIThreat(industry, isOmnichannel) {
    const industryRiskTable = {
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

    const normalizedIndustry = (industry || '').toLowerCase().trim().replace(/ /g, '_');
    let baseRisk = industryRiskTable[normalizedIndustry] || industryRiskTable['default'];
    const omnichannelDiscount = isOmnichannel ? 18 : -5;
    let finalRisk = baseRisk - omnichannelDiscount;

    return Math.max(0, Math.min(100, Math.round(finalRisk)));
}

export const EXPORT_CATEGORIES = [
    { value: 'spices', label: 'Spices & Spices Extracts' },
    { value: 'textiles', label: 'Textiles & Apparel' },
    { value: 'leather', label: 'Leather Goods' },
    { value: 'machinery', label: 'Machinery & Equipment' },
    { value: 'software', label: 'IT & Software Services' },
    { value: 'healthcare', label: 'Pharmaceuticals' },
];

export function calculateExportOpportunity(localPrice, monthlyQty, category, destination) {
    const baseRev = localPrice * monthlyQty;
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

export const VISIBILITY_SIGNALS = [
    { id: 'hasWebsite', label: 'Website Active', weight: 20 },
    { id: 'hasGoogleMyBusiness', label: 'Google My Business', weight: 20 },
    { id: 'activeSocialMedia', label: 'Active Social Media', weight: 15 },
    { id: 'runsAds', label: 'Running Ads', weight: 10 },
    { id: 'seoOptimized', label: 'SEO Optimized', weight: 15 },
    { id: 'hasCRM', label: 'CRM Integration', weight: 5 },
    { id: 'hasWhatsApp', label: 'WhatsApp Automation', weight: 15 },
];
