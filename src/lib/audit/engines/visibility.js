import { VISIBILITY_CONFIG } from '../config';

/**
 * VISIBILITY — FORMULA SPECIFICATION
 * Decoupled, functional implementation of the visibility audit.
 */
export function calculateVisibility(signals, city = '', avgTransactionValue = 0) {
    const avgValue = Math.round(Number(avgTransactionValue) || 0);
    const activeSignals = Array.isArray(signals) ? signals : Object.keys(signals).filter(k => signals[k]);

    // 1. Validation Logic
    const validationError = !city ? 'CITY_REQUIRED' : (avgValue < 0 ? 'INVALID_VALUE' : null);
    if (validationError) {
        return { percent: 0, status: 'INVALID', error: validationError, missedCustomers: 0, monthlyLoss: 0 };
    }

    // 2. Data-Driven Scoring (Functional)
    const totalScore = Object.entries(VISIBILITY_CONFIG.WEIGHTS).reduce((acc, [signalId, weight]) => {
        return activeSignals.includes(signalId) ? acc + weight : acc;
    }, 0);

    const percent = Math.min(100, totalScore);
    const invisibilityRate = (100 - percent) / 100;

    // 3. City Tier Resolution
    const cityLower = city.toLowerCase().trim();
    let cityMonthlySearches = VISIBILITY_CONFIG.CITY_BENCHMARKS.DEFAULT;

    if (VISIBILITY_CONFIG.CITY_BENCHMARKS.METRO.names.includes(cityLower)) {
        cityMonthlySearches = VISIBILITY_CONFIG.CITY_BENCHMARKS.METRO.searches;
    } else if (VISIBILITY_CONFIG.CITY_BENCHMARKS.TIER1.names.includes(cityLower)) {
        cityMonthlySearches = VISIBILITY_CONFIG.CITY_BENCHMARKS.TIER1.searches;
    } else if (VISIBILITY_CONFIG.CITY_BENCHMARKS.TIER2.names.includes(cityLower)) {
        cityMonthlySearches = VISIBILITY_CONFIG.CITY_BENCHMARKS.TIER2.searches;
    }

    // 4. Conversion Math
    const missedSearches = Math.round(cityMonthlySearches * invisibilityRate);
    const monthlyMissedCustomers = Math.round(missedSearches * VISIBILITY_CONFIG.CONVERSION_RATES.LOCAL_SEARCH);
    const monthlyVisibilityLoss = Math.round(monthlyMissedCustomers * avgValue);

    // 5. Gap Analysis
    const gaps = Object.entries(VISIBILITY_CONFIG.WEIGHTS)
        .filter(([id]) => !activeSignals.includes(id))
        .map(([id, points]) => ({ id, label: id.replace(/([A-Z])/g, ' $1').trim(), points }));

    // Status Determination
    let status = 'INVISIBLE';
    if (percent >= 90) status = 'DOMINANT';
    else if (percent >= 70) status = 'VISIBLE';
    else if (percent >= 50) status = 'OKAY';
    else if (percent >= 30) status = 'GHOST';

    return {
        percent,
        status,
        invisibilityRate: Math.round(invisibilityRate * 100),
        cityMonthlySearches,
        missedSearches,
        missedCustomers: monthlyMissedCustomers,
        monthlyLoss: monthlyVisibilityLoss,
        annualLoss: monthlyVisibilityLoss * 12,
        gaps
    };
}
