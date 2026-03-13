/**
 * VISIBILITY AUDIT CONFIGURATION
 */
export const VISIBILITY_CONFIG = {
    WEIGHTS: {
        hasGoogleMyBusiness: 25,
        hasWebsite: 20,
        hasWhatsApp: 15,
        activeSocialMedia: 15,
        seoOptimized: 15,
        hasCRM: 5,
        runsAds: 5
    },
    CITY_BENCHMARKS: {
        METRO: { names: ['mumbai', 'delhi', 'bengaluru', 'bangalore', 'hyderabad', 'chennai', 'kolkata'], searches: 40000 },
        TIER1: { names: ['pune', 'ahmedabad', 'jaipur', 'surat', 'lucknow', 'kanpur'], searches: 18000 },
        TIER2: { names: ['nagpur', 'indore', 'bhopal', 'coimbatore', 'vadodara', 'kochi'], searches: 7000 },
        DEFAULT: 2500
    },
    CONVERSION_RATES: {
        LOCAL_SEARCH: 0.06
    }
};

/**
 * NIGHT LOSS CONFIGURATION
 */
export const NIGHT_LOSS_CONFIG = {
    TRAFFIC_RATES: {
        '12am': 0.75,
        '6pm': 0.42,
        '8pm': 0.22,
        '10pm': 0.12,
        '24x7': 0.00
    },
    CONVERSION_RATES: {
        'b2b': { aiInstant: 0.22, delayed: 0.02, gap: 0.20 },
        'b2c': { aiInstant: 0.28, delayed: 0.03, gap: 0.25 },
        'both': { aiInstant: 0.25, delayed: 0.025, gap: 0.225 },
    }
};

/**
 * OPERATIONAL AUDIT CONFIGURATION
 */
export const OPERATIONAL_CONFIG = {
    BASELINE_WASTE_RATES: {
        PAYROLL: 0.15,
        OVERHEAD: 0.15,
        MARKETING: 0.26
    },
    EFFICIENCY_GAINS: {
        ERP_PAYROLL_REDUCTION: 0.45, // 1 - 0.45 = 0.55 multiplier
        ERP_OVERHEAD_REDUCTION: 0.40, // 1 - 0.40 = 0.60 multiplier
        CRM_MARKETING_REDUCTION: 0.45  // 1 - 0.45 = 0.55 multiplier
    },
    DRAG_THRESHOLD: 0.08 // 8% of revenue
};
