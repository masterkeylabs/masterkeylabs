export function formatIndian(amount: number): string {
    // Uses the Indian numbering system (Lakhs/Crores)
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount || 0);
}
