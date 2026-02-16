/**
 * Conversion Analyzer
 * Analyzes conversion elements using Cheerio.
 */

const CTA_KEYWORDS = [
    "sign up", "signup", "register", "get started", "start free", "try free",
    "buy now", "add to cart", "subscribe", "contact us", "learn more",
    "request demo", "book now", "schedule", "free trial", "download",
    "join", "enroll", "order now", "shop now", "claim", "get quote"
];

const PHONE_PATTERN = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/;
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

function hasCTA(el, $) {
    const text = $(el).text().trim().toLowerCase();
    return CTA_KEYWORDS.some(kw => text.includes(kw));
}

function isButtonOrLink(el) {
    const name = el.tagName.toLowerCase();
    if (name === 'button' || name === 'a') return true;
    const role = (el.attribs['role'] || '').toLowerCase();
    return role === 'button' || role === 'link';
}

export function analyzeConversion($) {
    const issues = [];
    const strengths = [];
    let cta_count = 0;

    $('button, a, input').each((_, el) => {
        if (el.tagName === 'input') {
            const type = el.attribs['type'];
            if (type === 'submit' || type === 'button') {
                cta_count++;
            }
        } else if (isButtonOrLink(el) && hasCTA(el, $)) {
            cta_count++;
        }
    });

    const has_cta_buttons = cta_count > 0;
    if (has_cta_buttons) {
        strengths.push(`Found ${cta_count} call-to-action element(s)`);
    } else {
        issues.push("No clear call-to-action buttons - add 'Sign Up', 'Contact', etc.");
    }

    const forms = $('form');
    const form_count = forms.length;
    const has_contact_form = form_count > 0;
    if (has_contact_form) {
        strengths.push(`Found ${form_count} form(s) for lead capture`);
    } else {
        issues.push("No forms found - add contact/lead capture form");
    }

    const pageText = $('body').text();
    const has_phone_number = PHONE_PATTERN.test(pageText);
    if (has_phone_number) {
        strengths.push("Phone number visible - easy for customers to reach");
    } else {
        issues.push("No phone number displayed - add for trust and conversions");
    }

    let has_email = EMAIL_PATTERN.test(pageText);
    const mailtoLinks = $('a[href^="mailto:"]');
    has_email = has_email || mailtoLinks.length > 0;
    if (has_email) {
        strengths.push("Email/contact info present");
    } else {
        issues.push("No email address - add contact email or mailto link");
    }

    const chatIndicators = ["intercom", "drift", "zendesk", "crisp", "tawk", "tidio", "livechat"];
    let has_chat_widget = false;
    $('script[src]').each((_, el) => {
        const src = el.attribs['src'] || '';
        if (chatIndicators.some(ind => src.toLowerCase().includes(ind))) {
            has_chat_widget = true;
        }
    });

    if (has_chat_widget) {
        strengths.push("Live chat widget detected - good for instant support");
    }

    const factors = [has_cta_buttons, has_contact_form, has_phone_number, has_email];
    let baseScore = factors.filter(Boolean).length * 20;
    if (has_chat_widget) baseScore += 10;
    const score = Math.min(100, baseScore);

    if (score < 50) {
        issues.push("Low conversion potential - prioritize adding CTAs and contact options");
    }

    return {
        score,
        has_cta_buttons,
        has_contact_form,
        has_phone_number,
        has_email,
        has_chat_widget,
        cta_count,
        form_count,
        issues,
        strengths
    };
}
