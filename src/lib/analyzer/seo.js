/**
 * SEO Analyzer
 * Analyzes SEO elements of a page using Cheerio.
 */

export function analyzeSEO($, url) {
    const issues = [];
    const strengths = [];
    let scoreComponents = 0;
    const maxComponents = 6;

    // Title tag
    const title = $('title').text().trim();
    const has_title = title.length > 0;
    if (has_title) {
        if (title.length >= 30 && title.length <= 60) {
            strengths.push("Title length is optimal for SEO (30-60 chars)");
        } else if (title.length < 30) {
            issues.push("Title is too short - aim for 30-60 characters");
        } else {
            issues.push("Title is too long - may be truncated in search results");
        }
        scoreComponents++;
    } else {
        issues.push("Missing title tag - critical for SEO");
    }

    // Meta description
    const metaDesc = $('meta[name="description"]').attr('content')?.trim();
    const has_meta_description = !!metaDesc && metaDesc.length > 0;
    if (has_meta_description) {
        if (metaDesc.length >= 120 && metaDesc.length <= 160) {
            strengths.push("Meta description length is optimal");
        }
        scoreComponents++;
    } else {
        issues.push("Missing meta description - affects click-through rates");
    }

    // Open Graph tags
    const ogTags = $('meta[property^="og:"]');
    const has_og_tags = ogTags.length >= 2;
    if (has_og_tags) {
        strengths.push("Open Graph tags present for social sharing");
        scoreComponents++;
    } else {
        issues.push("Missing Open Graph tags - add og:title and og:image for social");
    }

    // Heading structure
    const headings = $('h1, h2, h3, h4, h5, h6').slice(0, 10);
    const heading_structure = headings.map((_, el) => ({
        tag: el.tagName,
        text: $(el).text().trim().substring(0, 50)
    })).get();

    const h1Count = $('h1').length;
    if (h1Count === 1) {
        strengths.push("Proper H1 hierarchy (single H1)");
        scoreComponents++;
    } else if (h1Count === 0) {
        issues.push("No H1 heading found - add one for better SEO");
    } else {
        issues.push("Multiple H1 tags - use only one per page");
    }

    // Meta keywords
    const metaKw = $('meta[name="keywords"]').attr('content')?.trim();
    const meta_keywords = !!metaKw;

    // Canonical URL
    const canonical = $('link[rel="canonical"]').attr('href');
    const canonical_url = canonical || null;
    if (canonical_url) {
        strengths.push("Canonical URL defined - helps avoid duplicate content");
    }

    // Score calculation
    let score = Math.min(100, Math.floor((scoreComponents / maxComponents) * 100) + 20);
    score = Math.min(100, score);

    return {
        score,
        has_title,
        has_meta_description,
        has_og_tags,
        heading_structure,
        meta_keywords,
        canonical_url,
        issues,
        strengths
    };
}
