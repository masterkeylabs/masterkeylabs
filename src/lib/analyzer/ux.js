/**
 * UX Analyzer
 * Analyzes user experience elements on a page using Cheerio.
 */

export function analyzeUX($) {
    const issues = [];
    const strengths = [];
    let score = 70; // Base score

    // Mobile viewport
    const viewport = $('meta[name="viewport"]').attr('content');
    const has_mobile_viewport = !!viewport && viewport.toLowerCase().includes('width');
    if (has_mobile_viewport) {
        strengths.push("Mobile viewport meta tag present - responsive design");
        score += 10;
    } else {
        issues.push("Missing viewport meta - site may not display well on mobile");
    }

    // Navigation
    let has_clear_navigation = $('nav').length > 0 || $('header').length > 0;
    if (has_clear_navigation) {
        strengths.push("Clear navigation structure (nav/header)");
        score += 10;
    } else {
        const navLinks = $('a[href]').filter((_, el) => $(el).text().trim().length > 0);
        has_clear_navigation = navLinks.length >= 3;
        if (has_clear_navigation) {
            strengths.push("Navigation links present");
        } else {
            issues.push("Improve navigation - add clear menu structure");
        }
    }

    // Footer
    const has_footer = $('footer').length > 0;
    if (has_footer) {
        strengths.push("Footer present - good for structure");
        score += 5;
    } else {
        issues.push("Add footer with links and contact info");
    }

    // Readability
    const text = $('body').text();
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);

    let readability_score = 50;
    if (sentences.length > 0) {
        const avgWords = words.length / sentences.length;
        if (avgWords < 20) {
            readability_score = 90;
            strengths.push("Content appears concise and readable");
        } else if (avgWords < 30) {
            readability_score = 75;
        } else {
            readability_score = 60;
            issues.push("Consider shorter sentences for better readability");
        }
    }

    score = Math.min(100, score);
    if (!has_mobile_viewport) {
        score = Math.max(0, score - 15);
    }

    return {
        score,
        has_mobile_viewport,
        has_clear_navigation,
        has_footer,
        readability_score,
        issues,
        strengths
    };
}
