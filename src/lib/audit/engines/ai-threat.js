/**
 * EXTINCTION HORIZON — FORMULA SPECIFICATION
 */
export function calculateAIThreat(industry, options = {}) {
    const {
        isOmnichannel = false,
        hasCRM = false,
        hasERP = false,
        employeeCount = 25
    } = typeof options === 'boolean'
            ? { isOmnichannel: options }
            : options;

    const industryRiskTable = {
        'it_services': 85, 'ecommerce': 85, 'finance': 85, 'travel': 85, 'data_entry': 85,
        'retail': 72, 'manufacturing': 72, 'logistics': 72, 'education': 72,
        'real_estate': 58, 'construction': 58, 'hospitality': 58, 'fb': 58, 'service': 58,
        'healthcare': 38, 'legal': 38, 'services': 38, 'b2b': 38,
        'default': 72
    };

    const normalizedIndustry = (typeof industry === 'string' ? industry : (industry?.value || '')).toLowerCase().trim();
    const riskPct = industryRiskTable[normalizedIndustry] || industryRiskTable['default'];

    let riskBand = 'MED-HIGH';
    if (riskPct >= 85) riskBand = 'HIGH';
    else if (riskPct >= 72) riskBand = 'MED-HIGH';
    else if (riskPct >= 58) riskBand = 'MEDIUM';
    else riskBand = 'LOW-MED';

    const baseMonthsMap = { 'HIGH': 18, 'MED-HIGH': 30, 'MEDIUM': 48, 'LOW-MED': 72 };
    const baseMonths = baseMonthsMap[riskBand];

    let modifier = 0;
    if (isOmnichannel) modifier += 12;
    if (hasCRM) modifier += 6;
    if (hasERP) modifier += 6;
    if (employeeCount < 10) modifier += 6;
    if (employeeCount >= 50 && employeeCount <= 200) modifier -= 6;
    if (employeeCount > 200) modifier -= 12;

    let rawHorizon = baseMonths + modifier;
    let finalHorizon = Math.max(6, Math.min(84, rawHorizon));

    if (riskPct >= 85 && finalHorizon > 24) finalHorizon = 24;
    if (riskPct >= 72 && finalHorizon > 36) finalHorizon = 36;

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
        score: riskPct,
        yearsLeft: Math.round(finalHorizon / 12 * 10) / 10,
        threatLevel: riskBand
    };
}
