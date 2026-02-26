export function buildWhatsAppLink(feature: string, result: string | number): string {
    const phoneNumber = "919876543210"; // Placeholder Masterkey Labs phone number

    const message = `Hello Masterkey Labs, I just used the ${feature} diagnostic tool and my result was: ${result}. I would like to schedule an Architecture Review.`;

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}
