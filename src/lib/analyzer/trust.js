/**
 * Trust Analyzer
 * Analyzes trust signals on a page using Cheerio.
 */

const TESTIMONIAL_KEYWORDS = [
    "testimonial", "review", "customer said", "our clients",
    "success story", "case study", "trusted by", "as seen in",
    "rating", "stars", "recommend", "satisfied"
];

const PRIVACY_KEYWORDS = ["privacy", "policy", "gdpr", "terms"];
const ABOUT_KEYWORDS = ["about us", "about", "our story", "who we are"];
const SOCIAL_PROOF_INDICATORS = [
    "clients", "customers", "users", "trusted by", "partner",
    "award", "certified", "accredited"
];

export function analyzeTrust($, has_ssl) {
    const issues = [];
    const strengths = [];
    const pageText = $('body').text().toLowerCase();
    const pageHtml = $.html().toLowerCase();

    // SSL
    if (has_ssl) {
        strengths.push("SSL/HTTPS enabled - secure connection");
    } else {
        issues.push("Site not using HTTPS - critical for trust");
    }

    // Testimonials
    const has_testimonials = TESTIMONIAL_KEYWORDS.some(kw => pageText.includes(kw) || pageHtml.includes(kw));
    if (has_testimonials) {
        strengths.push("Social proof/testimonials present");
    } else {
        issues.push("Add testimonials or customer reviews to build trust");
    }

    // Social Proof
    const has_social_proof = SOCIAL_PROOF_INDICATORS.some(ind => pageText.includes(ind));
    if (has_social_proof) {
        strengths.push("Social proof elements detected");
    } else {
        issues.push("Add logos, client count, or certifications");
    }

    // Privacy Policy
    let has_privacy_policy = false;
    $('a').each((_, el) => {
        const href = $(el).attr('href') || '';
        if (PRIVACY_KEYWORDS.some(kw => href.toLowerCase().includes(kw))) {
            has_privacy_policy = true;
        }
    });
    if (!has_privacy_policy && (pageText.includes("privacy policy") || pageText.includes("privacy notice"))) {
        has_privacy_policy = true;
    }

    if (has_privacy_policy) {
        strengths.push("Privacy policy link found");
    } else {
        issues.push("Add privacy policy - required for GDPR and trust");
    }

    // About Page
    let has_about_page = false;
    $('a').each((_, el) => {
        const href = $(el).attr('href') || '';
        if (ABOUT_KEYWORDS.some(kw => href.toLowerCase().includes(kw))) {
            has_about_page = true;
        }
    });
    if (!has_about_page && (pageText.includes("about us") || pageText.includes("who we are"))) {
        has_about_page = true;
    }

    if (has_about_page) {
        strengths.push("About page/company info present");
    } else {
        issues.push("Add About page - customers want to know who they're buying from");
    }

    const factors = [has_ssl, has_testimonials, has_social_proof, has_privacy_policy, has_about_page];
    let score = factors.filter(Boolean).length * 20;
    score = Math.min(100, score);

    return {
        score,
        has_ssl,
        has_testimonials,
        has_social_proof,
        has_privacy_policy,
        has_about_page,
        issues,
        strengths
    };
}
