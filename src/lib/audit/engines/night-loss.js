import { NIGHT_LOSS_CONFIG } from '../config';

/**
 * NIGHT LOSS — FORMULA SPECIFICATION
 */
export function calculateNightLoss(dailyInquiries, closingTime, avgTransactionValue, businessType = 'both') {
    const dailyLeads = Math.max(0, Number(dailyInquiries) || 0);
    const avgValue = Math.max(0, Number(avgTransactionValue) || 0);

    // 1. Traffic Rate Resolution
    const nightTrafficRate = NIGHT_LOSS_CONFIG.TRAFFIC_RATES[closingTime] || 0.22;
    const monthlyAfterHoursLeads = Math.round(dailyLeads * nightTrafficRate * 30);

    // 2. Conversion Gap Resolution
    const rates = NIGHT_LOSS_CONFIG.CONVERSION_RATES[businessType] || NIGHT_LOSS_CONFIG.CONVERSION_RATES['both'];
    const conversionGap = rates.gap;

    // 3. Loss Calculation
    const monthlyLostConversions = monthlyAfterHoursLeads * conversionGap;
    const monthlyNightLoss = Math.round(monthlyLostConversions * avgValue);

    return {
        nightInquiries: monthlyAfterHoursLeads,
        monthlyLostConversions: Math.round(monthlyLostConversions),
        currentRevenue: Math.round(monthlyAfterHoursLeads * rates.delayed * avgValue),
        potentialRevenue: Math.round(monthlyAfterHoursLeads * rates.aiInstant * avgValue),
        monthlyLoss: monthlyNightLoss,
        annualLoss: monthlyNightLoss * 12,
        conversionGap: Math.round(conversionGap * 100),
        hourlyLoss: Math.round(monthlyNightLoss / (30 * 14))
    };
}
