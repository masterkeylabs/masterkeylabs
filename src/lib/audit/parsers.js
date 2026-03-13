/**
 * Range and hour parsing utilities.
 */

export function parseNumericalRange(rangeStr) {
    if (typeof rangeStr === 'number') return rangeStr;
    if (!rangeStr || typeof rangeStr !== 'string') return 0;

    const str = rangeStr.replace(/,/g, '').toLowerCase().trim();

    // Specific mapping for common Masterkey ranges
    if (str.includes('< 1l') || str.includes('<1l')) return 50000;
    if (str.includes('1l-5l')) return 300000;
    if (str.includes('5l-15l')) return 1000000;
    if (str.includes('15l+')) return 2000000;

    // Mapping for Daily Inquiries / Leads
    if (str.includes('< 20')) return 10;
    if (str.includes('20-50')) return 35;
    if (str.includes('50-100')) return 75;
    if (str.includes('100+')) return 150;

    // Mapping for Average Transaction Value
    if (str.includes('< 1k')) return 500;
    if (str.includes('1k-10k')) return 5500;
    if (str.includes('10k-50k')) return 30000;
    if (str.includes('50k+')) return 100000;

    // Generic L (Lakh) parsing
    if (str.includes('l')) {
        const numbers = str.match(/\d+(\.\d+)?/g);
        if (numbers && numbers.length === 2) {
            return (parseFloat(numbers[0]) + parseFloat(numbers[1])) / 2 * 100000;
        } else if (numbers && numbers.length === 1) {
            if (str.includes('<') || str.includes('under')) return parseFloat(numbers[0]) * 0.5 * 100000;
            if (str.includes('+') || str.includes('over')) return parseFloat(numbers[0]) * 1.5 * 100000;
            return parseFloat(numbers[0]) * 100000;
        }
    }

    // Generic numeric parsing
    const numbers = str.match(/\d+(\.\d+)?/g);
    if (numbers && numbers.length === 2) {
        return (parseFloat(numbers[0]) + parseFloat(numbers[1])) / 2;
    } else if (numbers && numbers.length === 1) {
        return parseFloat(numbers[0]);
    }

    return 0;
}

export function parseHoursRange(rangeStr) {
    if (typeof rangeStr === 'number') return rangeStr;
    if (!rangeStr || typeof rangeStr !== 'string') return 3;

    const str = rangeStr.toLowerCase().trim();
    if (str.includes('1-3')) return 2;
    if (str.includes('4-6')) return 5;
    if (str.includes('7+')) return 8;

    const numbers = str.match(/\d+/g);
    if (numbers && numbers.length === 1) return parseInt(numbers[0]);
    return 3;
}
