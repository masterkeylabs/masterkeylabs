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
    // HIGH band (85%)
    { value: 'it_services', label: 'IT / BPO', risk: 85, band: 'HIGH' },
    { value: 'ecommerce', label: 'E-commerce', risk: 85, band: 'HIGH' },
    { value: 'finance', label: 'Finance (routine)', risk: 85, band: 'HIGH' },
    { value: 'travel', label: 'Travel Booking', risk: 85, band: 'HIGH' },
    { value: 'data_entry', label: 'Data Entry Firms', risk: 85, band: 'HIGH' },
    // MED-HIGH band (72%)
    { value: 'retail', label: 'Retail (physical)', risk: 72, band: 'MED-HIGH' },
    { value: 'manufacturing', label: 'Manufacturing (semi-auto)', risk: 72, band: 'MED-HIGH' },
    { value: 'logistics', label: 'Logistics', risk: 72, band: 'MED-HIGH' },
    { value: 'education', label: 'Education / Coaching', risk: 72, band: 'MED-HIGH' },
    // MEDIUM band (58%)
    { value: 'real_estate', label: 'Real Estate', risk: 58, band: 'MEDIUM' },
    { value: 'construction', label: 'Construction', risk: 58, band: 'MEDIUM' },
    { value: 'hospitality', label: 'Hospitality', risk: 58, band: 'MEDIUM' },
    { value: 'fb', label: 'Media / Content', risk: 58, band: 'MEDIUM' },
    // LOW-MED band (38%)
    { value: 'healthcare', label: 'Healthcare (clinical)', risk: 38, band: 'LOW-MED' },
    { value: 'legal', label: 'Legal', risk: 38, band: 'LOW-MED' },
    { value: 'services', label: 'Skilled Trades', risk: 38, band: 'LOW-MED' },
    { value: 'b2b', label: 'Agriculture', risk: 38, band: 'LOW-MED' },
];

/**
 * OPERATIONAL WASTE — FORMULA SPECIFICATION
 * Three sub-calculations. Each is independent. They sum to total ops waste.
 * Coordination Drag is applied last.
 *
 * 1A. Payroll Waste   — base 0.15, tiered by manual hours, ERP reduces by ×0.55
 * 1B. Overhead Waste  — base 0.15, ERP reduces by ×0.60
 * 1C. Marketing Waste — base 0.26, CRM reduces by ×0.55
 * 1D. Coordination Drag — triggers when waste > 8% of estimated annual revenue
 *
 * @param {number} staff     - Monthly staff/payroll costs (annual_payroll) in INR.
 * @param {number} ops       - Monthly operational overheads (annual_overheads) in INR.
 * @param {number} marketing - Monthly marketing budget (annual_marketing_budget) in INR.
 * @param {object} options
 * @param {number} options.manualHoursPerWeek - Weekly manual work hours per employee (default 20)
 * @param {boolean} options.hasCRM  - Whether business uses a CRM
 * @param {boolean} options.hasERP  - Whether business uses ERP/inventory system
 * @param {number} options.annualRevenue - Estimated annual revenue (for Coordination Drag)
 * @returns {object} Waste breakdown in INR.
 */
export function calculateLossAudit(staff, ops, marketing, options = {}) {
    const s = Math.max(0, Number(staff) || 0);
    const o = Math.max(0, Number(ops) || 0);
    const m = Math.max(0, Number(marketing) || 0);
    const { manualHoursPerWeek = 20, hasCRM = false, hasERP = false, annualRevenue = 0 } = options;
    const rev = Math.max(0, Number(annualRevenue) || 0);

    // ── 1A. Payroll Waste ──────────────────────────────────────────────
    // Baseline: 15% of time on automatable tasks (NASSCOM SMB Ops Index 2023)
    let payrollWasteRate = 0.15;

    // MODIFIER: Manual work hours (user input or default)
    if (manualHoursPerWeek > 50) payrollWasteRate = 0.28;
    else if (manualHoursPerWeek > 30) payrollWasteRate = 0.22;
    else if (manualHoursPerWeek >= 15) payrollWasteRate = 0.15; // default
    else payrollWasteRate = 0.09;

    // MODIFIER: ERP present (Gartner ERP ROI Report, 2023)
    // ERP reduces manual labour requirement by 45% on average for SMBs
    if (hasERP) payrollWasteRate = payrollWasteRate * 0.55;

    const payrollWaste = s * payrollWasteRate;

    // ── 1B. Overhead Waste ─────────────────────────────────────────────
    // 15% of operational overheads lost to inefficient systems (Deloitte SMB Ops Benchmark)
    let overheadWasteRate = 0.15;

    // MODIFIER: ERP present
    // Deloitte: ERP cuts overhead inefficiency by 40% for SMBs
    if (hasERP) overheadWasteRate = overheadWasteRate * 0.60;

    const overheadWaste = o * overheadWasteRate;

    // ── 1C. Marketing Waste ────────────────────────────────────────────
    // 26% of marketing spend wasted without proper attribution (HubSpot State of Marketing 2023)
    let marketingWasteRate = 0.26;

    // MODIFIER: CRM present
    // Salesforce: CRM reduces marketing waste by 45%
    if (hasCRM) marketingWasteRate = marketingWasteRate * 0.55;

    const marketingWaste = m * marketingWasteRate;

    // ── 1D. Coordination Drag ──────────────────────────────────────────
    // Fires when operational waste is disproportionate to the size of the business (% of revenue)
    const totalOpsWaste = payrollWaste + overheadWaste + marketingWaste;
    let coordinationDrag = 0;

    const annualRevenueMidpoint = rev;
    if (annualRevenueMidpoint > 0) {
        const wasteAsPctRevenue = totalOpsWaste / annualRevenueMidpoint;
        if (wasteAsPctRevenue > 0.08) {
            coordinationDrag = totalOpsWaste * 0.08;
        }
    }

    // ── FINAL MODULE 1 OUTPUT ──────────────────────────────────────────
    const finalOpsWaste = totalOpsWaste + coordinationDrag;
    const totalBurn = Math.round(finalOpsWaste);

    return {
        staffWaste: Math.round(payrollWaste),
        opsWaste: Math.round(overheadWaste),
        marketingWaste: Math.round(marketingWaste),
        coordinationDrag: Math.round(coordinationDrag),
        totalBurn: totalBurn,
        annualBurn: totalBurn * 12,
        savingTarget: Math.round(totalBurn * 0.7),
        fiveYearCost: totalBurn * 12 * 5
    };
}

/**
 * NIGHT LOSS — FORMULA SPECIFICATION
 * Calculates lost revenue due to inquiries missed outside of business hours.
 *
 * 2A. Night Traffic Rate by Closing Time:
 *     6 PM → 42%, 8 PM → 22%, 10 PM → 12%
 *     Source: Google Consumer Insights India 2023 + Facebook IQ India Consumer Report 2022
 *
 * 2B. Conversion Rate Gap by Business Type (using "Both" average):
 *     AI Instant Reply: 25%, Next-Day Reply: 2.5%, Gap: 22.5%
 *     Source: HBR "Short Life of Online Sales Leads" (Oldroyd, 2011) | Salesforce India (2023)
 *
 * 2C. Complete Night Loss Formula:
 *     Step 1: monthly_after_hours_leads = daily_leads × night_traffic_rate × 30
 *     Step 2: conversion_gap = ai_conversion_rate - delayed_conversion_rate
 *     Step 3: monthly_lost_conversions = monthly_after_hours_leads × conversion_gap
 *     Step 4: monthly_night_loss = monthly_lost_conversions × avg_transaction_value
 *     Step 5: annual_night_loss = monthly_night_loss × 12
 *
 * @param {number} dailyInquiries - Average daily leads/inquiries
 * @param {string} closingTime  - Business closing time ('6pm', '8pm', '10pm')
 * @param {number} avgTransactionValue - Average profit/transaction value per sale (₹)
 * @param {string} businessType - 'b2b', 'b2c', or 'both' (default: 'both')
 * @returns {object} Night loss breakdown
 */
export function calculateNightLoss(dailyInquiries, closingTime, avgTransactionValue, businessType = 'both') {
    const dailyLeads = Math.max(0, Number(dailyInquiries) || 0);
    const avgValue = Math.max(0, Number(avgTransactionValue) || 0);

    // ── 2A. Night Traffic Rate ─────────────────────────────────────────
    // Source: Google Consumer Insights India (2023) | Facebook IQ India Report (2022)
    const nightTrafficMap = {
        '6pm': 0.42,   // 42% of daily leads arrive after 6 PM (prime evening window: 6–10 PM)
        '8pm': 0.22,   // 22% arrive after 8 PM (late evening: 8 PM–midnight)
        '10pm': 0.12,  // 12% arrive after 10 PM (night window: 10 PM–8 AM)
    };
    const nightTrafficRate = nightTrafficMap[closingTime] || 0.22;

    // ── STEP 1: After-hours leads per month ────────────────────────────
    const monthlyAfterHoursLeads = Math.round(dailyLeads * nightTrafficRate * 30);

    // ── 2B. Conversion Rate Gap ────────────────────────────────────────
    // Source: HBR "Short Life of Online Sales Leads" (Oldroyd, 2011) | Salesforce India (2023)
    const conversionRates = {
        'b2b': { aiInstant: 0.22, delayed: 0.02, gap: 0.20 },
        'b2c': { aiInstant: 0.28, delayed: 0.03, gap: 0.25 },
        'both': { aiInstant: 0.25, delayed: 0.025, gap: 0.225 },
    };
    const rates = conversionRates[businessType] || conversionRates['both'];

    // ── STEP 2: Conversion gap ─────────────────────────────────────────
    const conversionGap = rates.gap;

    // ── STEP 3: Monthly lost conversions ───────────────────────────────
    const monthlyLostConversions = monthlyAfterHoursLeads * conversionGap;

    // ── STEP 4: Monthly revenue loss ───────────────────────────────────
    const monthlyNightLoss = Math.round(monthlyLostConversions * avgValue);

    // ── STEP 5: Annualise ──────────────────────────────────────────────
    const annualNightLoss = monthlyNightLoss * 12;

    // Additional useful outputs for UI
    const potentialRevenue = Math.round(monthlyAfterHoursLeads * rates.aiInstant * avgValue);
    const currentRevenue = Math.round(monthlyAfterHoursLeads * rates.delayed * avgValue);

    return {
        nightInquiries: monthlyAfterHoursLeads,
        monthlyLostConversions: Math.round(monthlyLostConversions),
        currentRevenue,
        potentialRevenue,
        monthlyLoss: monthlyNightLoss,
        annualLoss: annualNightLoss,
        conversionGap: Math.round(conversionGap * 100),
        hourlyLoss: Math.round(monthlyNightLoss / (30 * 14)) // ~14 after-hours per day avg
    };
}

/**
 * VISIBILITY — FORMULA SPECIFICATION
 * Two parts: (a) a 100-point scoring system, and (b) converting the invisibility
 * score into a ₹ loss using city search volume benchmarks.
 *
 * 3A. Revised 100-Point Scoring System (anchored to Google's own data):
 *     Google Business Profile: 25, Mobile Website: 20, WhatsApp Business: 15,
 *     Active Social Media: 15, Local SEO: 15, CRM: 5, Paid Ads: 5 = 100
 *
 * 3B. City Search Volume Benchmarks:
 *     Metro: 40,000 | Tier-1: 18,000 | Tier-2: 7,000 | Tier-3/Other: 2,500
 *
 * 3C. Complete Formula:
 *     Step 1: visibility_score = sum of checked signals (100 pts max)
 *     Step 2: invisibility_rate = (100 - visibility_score) / 100
 *     Step 3: missed_searches = city_monthly_searches × invisibility_rate
 *     Step 4: monthly_missed_customers = missed_searches × 0.06 (search_to_customer_rate)
 *     Step 5: monthly_visibility_loss = monthly_missed_customers × avg_transaction_value
 *
 * @param {object|array} signals - Checked signals (object of booleans or array of ids)
 * @param {string} city    - City name for tier lookup
 * @param {number} avgTransactionValue - Avg transaction/sale value (₹)
 * @returns {object} Visibility breakdown
 */
export function calculateVisibility(signals, city = '', avgTransactionValue = 0) {
    const avgValue = Math.max(0, Number(avgTransactionValue) || 0);
    const signalWeights = {
        hasGoogleMyBusiness: 25,
        hasWebsite: 20,
        hasWhatsApp: 15,
        activeSocialMedia: 15,
        seoOptimized: 15,
        hasCRM: 5,
        runsAds: 5
    };

    // ── STEP 1: Score the business (100 pts max) ───────────────────────
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

    // ── STEP 2: Invisibility rate ──────────────────────────────────────
    const invisibilityRate = (100 - percent) / 100;

    // ── STEP 3: Missed searches per month ──────────────────────────────
    // City tier search volume benchmarks
    // Source: Google Keyword Planner (2024) | TRAI Internet Subscriber Report Q3 2023
    const METRO_CITIES = ['mumbai', 'delhi', 'bengaluru', 'bangalore', 'hyderabad', 'chennai', 'kolkata'];
    const TIER1_CITIES = ['pune', 'ahmedabad', 'jaipur', 'surat', 'lucknow', 'kanpur'];
    const TIER2_CITIES = ['nagpur', 'indore', 'bhopal', 'coimbatore', 'vadodara', 'kochi'];

    const cityLower = (city || '').toLowerCase().trim();
    let cityMonthlySearches = 2500; // Tier-3/Other floor
    if (METRO_CITIES.includes(cityLower)) cityMonthlySearches = 40000;
    else if (TIER1_CITIES.includes(cityLower)) cityMonthlySearches = 18000;
    else if (TIER2_CITIES.includes(cityLower)) cityMonthlySearches = 7000;

    const missedSearches = Math.round(cityMonthlySearches * invisibilityRate);

    // ── STEP 4: Convert searches to customers ──────────────────────────
    // Google "Think with Google" (2023): 6% of local searches convert
    const searchToCustomerRate = 0.06;
    const monthlyMissedCustomers = Math.round(missedSearches * searchToCustomerRate);

    // ── STEP 5: Revenue loss ───────────────────────────────────────────
    const monthlyVisibilityLoss = Math.round(monthlyMissedCustomers * avgValue);
    const annualVisibilityLoss = monthlyVisibilityLoss * 12;

    return {
        percent,
        status,
        invisibilityRate: Math.round(invisibilityRate * 100),
        cityMonthlySearches,
        missedSearches,
        missedCustomers: monthlyMissedCustomers,
        monthlyLoss: monthlyVisibilityLoss,
        annualLoss: annualVisibilityLoss,
        gaps
    };
}

/**
 * EXTINCTION HORIZON — FORMULA SPECIFICATION
 * Two outputs: (1) Disruption Risk % and (2) Time Horizon in months.
 *
 * 4A. Disruption Risk % by Industry (4 bands):
 *     HIGH: 85%, MED-HIGH: 72%, MEDIUM: 58%, LOW-MED: 38%
 *
 * 4B. Time Horizon Formula:
 *     Step 1: Base months by risk band (HIGH=18, MED-HIGH=30, MEDIUM=48, LOW-MED=72)
 *     Step 2: Apply modifiers (omnichannel +12, CRM +6, ERP +6, <10 emp +6, 50-200 emp -6, >200 emp -12)
 *     Step 3: raw_horizon = base_months + modifier
 *     Step 4: clamp(raw_horizon, min=6, max=84)
 *     Step 5: Consistency check (high risk cannot have long runway)
 *
 * SOURCE: McKinsey "Jobs Lost, Jobs Gained" India Update (2023) | Oxford Martin School Automation
 *         Susceptibility Index | WEF Future of Jobs (2023)
 *
 * @param {string} industry - Industry sector value
 * @param {object} options  - { isOmnichannel, hasCRM, hasERP, employeeCount }
 * @returns {object} Extinction horizon breakdown
 */
export function calculateAIThreat(industry, options = {}) {
    const {
        isOmnichannel = false,
        hasCRM = false,
        hasERP = false,
        employeeCount = 25
    } = typeof options === 'boolean'
            ? { isOmnichannel: options }  // backward compat: old signature was (industry, isOmnichannel)
            : options;

    // ── 4A. Industry Risk Band ─────────────────────────────────────────
    const industryRiskTable = {
        'it_services': 85, 'ecommerce': 85, 'finance': 85, 'travel': 85, 'data_entry': 85,
        'retail': 72, 'manufacturing': 72, 'logistics': 72, 'education': 72,
        'real_estate': 58, 'construction': 58, 'hospitality': 58, 'fb': 58,
        'healthcare': 38, 'legal': 38, 'services': 38, 'b2b': 38,
        'default': 72
    };

    const normalizedIndustry = (industry || '').toLowerCase().trim();
    const riskPct = industryRiskTable[normalizedIndustry] || industryRiskTable['default'];

    // Derive risk band from percentage
    let riskBand = 'MED-HIGH';
    if (riskPct >= 85) riskBand = 'HIGH';
    else if (riskPct >= 72) riskBand = 'MED-HIGH';
    else if (riskPct >= 58) riskBand = 'MEDIUM';
    else riskBand = 'LOW-MED';

    // ── 4B. Time Horizon ───────────────────────────────────────────────
    // Step 1: Base months by risk band
    const baseMonthsMap = { 'HIGH': 18, 'MED-HIGH': 30, 'MEDIUM': 48, 'LOW-MED': 72 };
    const baseMonths = baseMonthsMap[riskBand];

    // Step 2: Apply modifiers
    let modifier = 0;
    if (isOmnichannel) modifier += 12;  // physical moat
    if (hasCRM) modifier += 6;          // data infrastructure
    if (hasERP) modifier += 6;          // operational resilience
    if (employeeCount < 10) modifier += 6;       // nimble, can pivot fast
    if (employeeCount >= 50 && employeeCount <= 200) modifier -= 6;  // slower adaptation
    if (employeeCount > 200) modifier -= 12;     // large = bigger target

    // Step 3: Raw horizon
    let rawHorizon = baseMonths + modifier;

    // Step 4: Floor and ceiling
    let finalHorizon = Math.max(6, Math.min(84, rawHorizon));

    // Step 5: Consistency check — high risk cannot have a long runway
    if (riskPct >= 85 && finalHorizon > 24) finalHorizon = 24;
    if (riskPct >= 72 && finalHorizon > 36) finalHorizon = 36;

    // ── 4C. Display Labels ─────────────────────────────────────────────
    let displayLabel, displayColor;
    if (finalHorizon < 18) {
        displayLabel = 'CRITICAL WINDOW — Act immediately';
        displayColor = 'red';
    } else if (finalHorizon <= 36) {
        displayLabel = 'WATCH CLOSELY — 12-month action plan needed';
        displayColor = 'orange';
    } else if (finalHorizon <= 60) {
        displayLabel = 'MANAGEABLE RUNWAY — Begin transition planning';
        displayColor = 'gold';
    } else {
        displayLabel = 'LONG RUNWAY — Monitor and prepare, not urgent';
        displayColor = 'blue';
    }

    return {
        riskPct,
        riskBand,
        baseMonths,
        modifier,
        finalHorizon,
        displayLabel,
        displayColor,
        // Backward compat fields
        score: riskPct,
        yearsLeft: Math.round(finalHorizon / 12 * 10) / 10,
        threatLevel: riskBand
    };
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

export const VISIBILITY_SIGNALS = [
    { id: 'hasGoogleMyBusiness', label: 'Google Business Profile (verified + complete)', weight: 25, points: 25 },
    { id: 'hasWebsite', label: 'Mobile-optimised Website', weight: 20, points: 20 },
    { id: 'hasWhatsApp', label: 'WhatsApp Business (active)', weight: 15, points: 15 },
    { id: 'activeSocialMedia', label: 'Active Social Media (2+ platforms)', weight: 15, points: 15 },
    { id: 'seoOptimized', label: 'Local SEO (keyword optimised)', weight: 15, points: 15 },
    { id: 'hasCRM', label: 'CRM / Lead Management Tool', weight: 5, points: 5 },
    { id: 'runsAds', label: 'Paid Ads (Google / Meta active)', weight: 5, points: 5 },
];
