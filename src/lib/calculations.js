/**
 * Utility for core business logic calculations used throughout the Masterkey OS Dashboard.
 * These functions are deterministic, do not rely on external APIs, and return exact numeric outputs.
 */

/**
 * Calculates financial bleed based on staff inefficiencies, operational drag, and marketing waste.
 * @param {number} staff - Monthly staff costs in INR.
 * @param {number} ops - Monthly operational costs in INR.
 * @param {number} marketing - Monthly marketing spend in INR.
 * @returns {number} Exact INR value representing monthly loss.
 */
export function calculateLossAudit(staff, ops, marketing) {
    const staffWasteFactor = 0.15;     // 15% lost to manual repetitive tasks
    const opsDragFactor = 0.20;        // 20% lost to operational friction
    const marketingBleedFactor = 0.35; // 35% of ad spend wasted without CRM/Automation

    const staffLoss = (Number(staff) || 0) * staffWasteFactor;
    const opsLoss = (Number(ops) || 0) * opsDragFactor;
    const marketingLoss = (Number(marketing) || 0) * marketingBleedFactor;

    // Compounding penalty: inefficient businesses with high spend bleed more
    const totalBaseLoss = staffLoss + opsLoss + marketingLoss;
    const compoundingPenalty = totalBaseLoss > 1000000 ? totalBaseLoss * 0.08 : totalBaseLoss * 0.03;

    return Math.round(totalBaseLoss + compoundingPenalty);
}

/**
 * Calculates lost revenue due to inquiries missed outside of business hours.
 * @param {number|string} closingTime - 24-hour format closing time (e.g., 18 for 6 PM).
 * @param {number} dailyInquiries - Average number of daily customer inquiries.
 * @returns {number} Exact INR value representing monthly lost revenue.
 */
export function calculateNightLoss(closingTime, dailyInquiries) {
    const time = Number(closingTime) || 18;
    const inquiries = Number(dailyInquiries) || 0;

    // Estimate closed hours based on a standard 9 AM opening
    let closedHours = 24 - (time - 9);
    closedHours = Math.max(0, Math.min(24, closedHours));

    // Assume night-time accounts for roughly 40% of potential overall traffic if scaled globally/digitally
    const missedInquiriesPerDay = inquiries * (closedHours / 24) * 0.45;

    // Hardcoded averages for typical Masterkey SME client
    const averageTicketValue = 25000; // INR per customer
    const conversionRate = 0.04;      // 4% baseline conversion for missed inbound leads

    const monthlyLostRevenue = missedInquiriesPerDay * 30 * averageTicketValue * conversionRate;

    return Math.round(monthlyLostRevenue);
}

/**
 * Calculates the risk of AI disruption for a specific business.
 * @param {string} industry - The industry niche.
 * @param {boolean} isOmnichannel - Whether the business operates across multiple digital channels.
 * @returns {number} Risk score between 0 and 100.
 */
export function calculateAIThreat(industry, isOmnichannel) {
    // Realistic industry modifiers indicating vulnerability to AI automation
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

    // Businesses that are omnichannel show adaptability and structural digital readiness
    const omnichannelDiscount = isOmnichannel ? 18 : -5; // Penalty if not omnichannel

    let finalRisk = baseRisk - omnichannelDiscount;

    // Ensure bounds
    return Math.max(0, Math.min(100, Math.round(finalRisk)));
}

/**
 * Calculates digital visibility score based on specific presence signals.
 * @param {object|array} signals - Object mapping signal names to booleans or an array of active signal strings.
 * @returns {number} Visibility score between 0 and 100.
 */
export function calculateVisibility(signals) {
    const signalWeights = {
        hasWebsite: 25,
        hasGoogleMyBusiness: 20,
        activeSocialMedia: 15,
        runsAds: 10,
        seoOptimized: 20,
        hasCRM: 10
    };

    let totalScore = 0;

    if (!signals) return 5; // Bare minimum baseline

    // Handle array of strings
    if (Array.isArray(signals)) {
        signals.forEach(signal => {
            if (signalWeights[signal]) {
                totalScore += signalWeights[signal];
            }
        });
    }
    // Handle object mapping
    else if (typeof signals === 'object') {
        for (const key in signalWeights) {
            if (signals[key]) {
                totalScore += signalWeights[key];
            }
        }
    }

    return Math.max(0, Math.min(100, Math.round(totalScore)));
}
