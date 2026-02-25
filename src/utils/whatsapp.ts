/**
 * Utility function to build a WhatsApp URL for scheduling the Architecture Review.
 * 
 * @param feature - The specific metric or feature the user was engaging with (e.g., 'Operational Waste', 'AI Extinction Risk').
 * @param result - The calculated score or monetary value (e.g., '₹1,26,563', '87/100').
 * @returns An encoded wa.me URL.
 */
export function buildWhatsAppLink(feature: string, result: string | number): string {
    // Use the official Masterkey Operations Number 
    const phoneNumber = "919999999999";

    const message = `Protocol Override Request \n` +
        `System Diagnostic: ${feature}\n` +
        `Audit Result: ${result}\n\n` +
        `I would like to schedule an Architecture Review. Provide next steps.`;

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}
