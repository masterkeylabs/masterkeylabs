// ===================================================================
// MasterKey Labs — Calculation Engine
// All 5 diagnostic features with real industry data
// ===================================================================

// ===================== 1. LOSS AUDIT =====================

const WASTE_RATES = {
    staff: { base: 0.20, retail: 0.03, manufacturing: -0.02, fb: 0.02, services: 0.01, realestate: 0.0 },
    marketing: { base: 0.30, retail: 0.02, manufacturing: 0.00, fb: 0.05, services: -0.03, realestate: 0.02 },
    ops: { base: 0.12, retail: 0.00, manufacturing: 0.04, fb: 0.01, services: -0.03, realestate: 0.02 },
};

export function calculateLossAudit(staffInput, marketingInput, opsInput, industry = '') {
    const staff = Math.max(0, staffInput);
    const marketing = Math.max(0, marketingInput);
    const ops = Math.max(0, opsInput);
    const ind = industry.toLowerCase().replace(/[^a-z]/g, '').replace('food', 'fb').replace('beverage', 'fb');
    const s = WASTE_RATES.staff;
    const m = WASTE_RATES.marketing;
    const o = WASTE_RATES.ops;

    const staffRate = s.base + (s[ind] ?? 0);
    const marketingRate = m.base + (m[ind] ?? 0);
    const opsRate = o.base + (o[ind] ?? 0);

    const staffWaste = Math.round(staff * staffRate);
    const marketingWaste = Math.round(marketing * marketingRate);
    const opsWaste = Math.round(ops * opsRate);

    const totalBurn = staffWaste + marketingWaste + opsWaste;
    const annualBurn = totalBurn * 12;
    const savingTarget = Math.round(totalBurn * 0.60);
    const fiveYearCost = annualBurn * 5;

    return {
        staffWaste, marketingWaste, opsWaste,
        staffRate, marketingRate, opsRate,
        totalBurn, annualBurn, savingTarget, fiveYearCost,
    };
}


// ===================== 2. CARGO EXPORT =====================

const REGIONAL_EXPORTS = {
    UAE: { multiplier: 3.5, perUnit: 45, minFixed: 8000 },
    UK: { multiplier: 5.2, perUnit: 120, minFixed: 15000 },
    USA: { multiplier: 6.5, perUnit: 180, minFixed: 25000 },
    Australia: { multiplier: 5.8, perUnit: 140, minFixed: 18000 },
    Singapore: { multiplier: 4.2, perUnit: 85, minFixed: 12000 },
    Europe: { multiplier: 5.0, perUnit: 130, minFixed: 16000 },
    MiddleEast: { multiplier: 3.8, perUnit: 50, minFixed: 9000 },
    Africa: { multiplier: 3.0, perUnit: 70, minFixed: 10000 },
    default: { multiplier: 3.5, perUnit: 100, minFixed: 12000 }
};

const COUNTRY_TO_REGION = {
    'USA': 'USA', 'Canada': 'USA', 'Mexico': 'USA',
    'UK': 'UK', 'Germany': 'Europe', 'France': 'Europe', 'Italy': 'Europe', 'Spain': 'Europe', 'Netherlands': 'Europe',
    'Australia': 'Australia', 'New Zealand': 'Australia',
    'Singapore': 'Singapore', 'Japan': 'Singapore', 'South Korea': 'Singapore', 'China': 'Singapore',
    'UAE': 'UAE', 'Saudi Arabia': 'MiddleEast', 'Qatar': 'MiddleEast', 'Kuwait': 'MiddleEast', 'Oman': 'MiddleEast',
    'South Africa': 'Africa', 'Kenya': 'Africa', 'Nigeria': 'Africa', 'Egypt': 'Africa'
};

export const EXPORT_CATEGORIES = [
    { value: 'spices', label: 'Spices & Condiments' },
    { value: 'basmati_rice', label: 'Basmati Rice' },
    { value: 'textile', label: 'Textile & Fabrics' },
    { value: 'handicrafts', label: 'Handicrafts & Gifts' },
    { value: 'leather', label: 'Leather Goods' },
    { value: 'processed_food', label: 'Processed Foods' },
    { value: 'jewellery', label: 'Jewellery (non-gold)' },
    { value: 'ayurvedic', label: 'Ayurvedic Products' },
];

export function calculateExportOpportunity(priceInput, qtyInput, category, destination) {
    const localPricePerUnit = Math.max(0, priceInput);
    const monthlyQty = Math.max(0, qtyInput);
    const region = COUNTRY_TO_REGION[destination] || (destination === 'UAE' ? 'UAE' : destination === 'UK' ? 'UK' : destination === 'Singapore' ? 'Singapore' : 'default');
    const regionData = REGIONAL_EXPORTS[region] || REGIONAL_EXPORTS['default'];

    // Category Multipliers (fine-tuning)
    const categoryBonus =
        category === 'handicrafts' ? 1.5 :
            category === 'ayurvedic' ? 1.3 :
                category === 'spices' ? 1.2 :
                    category === 'textile' ? 1.1 : 1.0;

    const multiplier = regionData.multiplier * categoryBonus;

    const exportPrice = Math.round(localPricePerUnit * multiplier);
    const exportRevenue = exportPrice * monthlyQty;
    const localRevenue = localPricePerUnit * monthlyQty;
    const exportCost = (regionData.perUnit * monthlyQty) + regionData.minFixed;
    const netExportProfit = exportRevenue - exportCost;
    const additionalIncome = netExportProfit - localRevenue;
    const roiPercent = localRevenue > 0 ? Math.round(((netExportProfit - localRevenue) / localRevenue) * 100) : 0;
    const annualAdditional = additionalIncome * 12;

    return {
        multiplier: multiplier.toFixed(1), exportPrice, exportRevenue, localRevenue,
        exportCost, netExportProfit, additionalIncome, roiPercent, annualAdditional,
    };
}


// ===================== 3. AI THREAT ASSESSMENT =====================

const INDUSTRY_SCORES = {
    'data_entry': 88,
    'travel_agents': 85,
    'accounting': 82,
    'customer_service': 80,
    'print_media': 78,
    'textile_retail': 72,
    'kirana': 68,
    'general_store': 68,
    'restaurant': 55,
    'tiffin_service': 55,
    'real_estate': 62,
    'coaching': 58,
    'tuition': 58,
    'manufacturing': 42,
    'healthcare': 38,
    'skilled_trades': 25,
    'ecommerce': 65,
    'saas': 50,
    'local_business': 60,
    'retail': 68,
    'services': 62,
    'fb': 55,
};

const TIER1_CITIES = ['mumbai', 'delhi', 'bengaluru', 'bangalore', 'hyderabad', 'pune', 'chennai', 'kolkata', 'ahmedabad', 'gurugram', 'noida'];

export function calculateAIThreat({ industry, businessAge: ageInput, employees, salesChannels = [], usesSoftware, city, hasPhysicalLocation }) {
    const businessAge = Math.max(0, ageInput);
    const ind = (industry || '').toLowerCase().replace(/[^a-z_]/g, '').replace('food', 'fb').replace('beverage', 'fb');
    let score = INDUSTRY_SCORES[ind] ?? 50;

    // Score modifiers
    if (businessAge > 15) score += 8;
    if (!usesSoftware) score += 12;
    if (salesChannels.length === 1 && salesChannels[0] === 'walkin') score += 10;
    if (salesChannels.includes('website')) score -= 8;
    if (salesChannels.includes('marketplace')) score -= 6;
    if (usesSoftware) score -= 10;
    if (TIER1_CITIES.includes((city || '').toLowerCase())) score += 5;

    const empStr = String(employees || '');
    if (empStr.includes('100+') || parseInt(empStr) > 100) score -= 5;

    score = Math.max(5, Math.min(98, score));

    const yearsLeft = score >= 85 ? 2
        : score >= 70 ? 3 + Math.round((85 - score) * 0.15)
            : score >= 55 ? 5 + Math.round((70 - score) * 0.3)
                : score >= 40 ? 7 + Math.round((55 - score) * 0.4)
                    : 12;

    const threatLevel = score >= 70 ? 'KHATRA'
        : score >= 40 ? 'SAVDHAN'
            : 'SAFE';

    // Get timeline description
    const timelineDesc = score >= 70 ? '2-4 years before major disruption'
        : score >= 55 ? '4-7 years before significant change'
            : score >= 40 ? '7-10 years — slower disruption timeline'
                : '10+ years — relatively AI-resistant';

    return { score, yearsLeft, threatLevel, timelineDesc };
}


// ===================== 4. NIGHT LOSS CALCULATOR =====================

const NIGHT_RATE_MAP = {
    '6pm': 0.38,
    '8pm': 0.25,
    '10pm': 0.14,
};

const CURRENT_CVR_MAP = {
    'instant': 0.28,
    '<30min': 0.18,
    '1-4hrs': 0.08,
    'nextday': 0.03,
    'none': 0.00,
};

const AI_CVR = 0.28;

export function calculateNightLoss(dailyInquiriesInput, closingTime, profitPerSaleInput, responseTime, monthlyDaysInput = 26) {
    const dailyInquiries = Math.max(0, dailyInquiriesInput);
    const profitPerSale = Math.max(0, profitPerSaleInput);
    const monthlyDays = Math.max(0, monthlyDaysInput);
    const nightRate = NIGHT_RATE_MAP[closingTime] ?? 0.25;
    const currentCvr = CURRENT_CVR_MAP[responseTime] ?? 0.00;

    const nightInquiries = Math.round(dailyInquiries * nightRate * monthlyDays);
    const currentRevenue = Math.round(nightInquiries * currentCvr * profitPerSale);
    const potentialRevenue = Math.round(nightInquiries * AI_CVR * profitPerSale);
    const monthlyLoss = potentialRevenue - currentRevenue;
    const annualLoss = monthlyLoss * 12;
    const hoursInMonth = monthlyDays * (closingTime === '6pm' ? 14 : closingTime === '8pm' ? 12 : 10);
    const hourlyLoss = hoursInMonth > 0 ? Math.round(monthlyLoss / hoursInMonth) : 0;

    return {
        nightRate, currentCvr,
        nightInquiries, currentRevenue, potentialRevenue,
        monthlyLoss, annualLoss, hourlyLoss,
    };
}


// ===================== 5. VISIBILITY SCANNER =====================

export const VISIBILITY_SIGNALS = [
    { id: 'gmb', label: 'GMB Claimed & Verified', points: 15 },
    { id: 'reviews', label: '20+ Reviews, 4.0+ Rating', points: 15 },
    { id: 'mobile', label: 'Mobile-optimised website <3s', points: 12 },
    { id: 'social', label: 'Active Instagram/Facebook', points: 10 },
    { id: 'whatsapp', label: 'WhatsApp Business + Catalogue', points: 10 },
    { id: 'seo', label: 'Page 1 for primary keyword', points: 12 },
    { id: 'directory', label: 'JustDial / IndiaMART listed', points: 8 },
    { id: 'responses', label: 'Responds to Google Reviews', points: 8 },
    { id: 'paid_ads', label: 'Runs paid digital ads', points: 5 },
    { id: 'nap', label: 'Consistent NAP across platforms', points: 5 },
];

const CITY_SEARCH_VOLUME = {
    'mumbai': 4200, 'delhi': 3800, 'bengaluru': 3500, 'bangalore': 3500,
    'hyderabad': 2800, 'ahmedabad': 2200, 'pune': 2000, 'indore': 1400,
    'jaipur': 1600, 'lucknow': 1500, 'surat': 1800, 'chandigarh': 1200,
};

export function calculateVisibility(answers, city = '') {
    const totalScore = VISIBILITY_SIGNALS.reduce(
        (sum, s) => sum + (answers[s.id] ? s.points : 0), 0
    );
    const percent = totalScore;

    const status = percent >= 86 ? 'DOMINANT'
        : percent >= 71 ? 'VISIBLE'
            : percent >= 51 ? 'OKAY'
                : percent >= 26 ? 'GHOST'
                    : 'INVISIBLE';

    const statusHindi = percent >= 86 ? 'प्रभावी'
        : percent >= 71 ? 'दिखाई देता है'
            : percent >= 51 ? 'ठीक है'
                : percent >= 26 ? 'भूत'
                    : 'अदृश्य';

    const gaps = VISIBILITY_SIGNALS.filter(s => !answers[s.id]);

    // Missed customers estimation
    const cityKey = (city || '').toLowerCase();
    const baseSearches = CITY_SEARCH_VOLUME[cityKey] ?? 1200;
    const visibilityGap = (100 - percent) / 100;
    const missedCustomers = Math.round(baseSearches * visibilityGap * 0.02);

    return { percent, status, statusHindi, gaps, missedCustomers };
}


// ===================== HELPERS =====================

export function formatINR(amount) {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} Lakh`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatINRFull(amount) {
    return `₹${amount.toLocaleString('en-IN')}`;
}
