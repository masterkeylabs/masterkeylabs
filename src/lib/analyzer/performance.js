/**
 * Performance Analyzer
 * Analyzes performance metrics.
 */

export function analyzePerformance(
    response_time_ms,
    content_length,
    headers
) {
    const issues = [];
    const strengths = [];
    let score = 100;

    const page_size_kb = parseFloat((content_length / 1024).toFixed(2));

    // Response time
    if (response_time_ms < 500) {
        strengths.push(`Excellent response time (${Math.round(response_time_ms)}ms)`);
    } else if (response_time_ms < 1500) {
        strengths.push(`Good response time (${Math.round(response_time_ms)}ms)`);
    } else {
        issues.push(`Slow response time (${Math.round(response_time_ms)}ms) - optimize server`);
        score -= 15;
    }

    // Page size
    if (page_size_kb < 500) {
        strengths.push(`Reasonable page size (${Math.round(page_size_kb)} KB)`);
    } else if (page_size_kb < 1500) {
        issues.push(`Page is large (${Math.round(page_size_kb)} KB) - compress images/assets`);
        score -= 10;
    } else {
        issues.push(`Page is very large (${Math.round(page_size_kb)} KB) - significant optimization needed`);
        score -= 20;
    }

    // Compression
    // Note: In Next.js App Router API routes, headers is a Headers object
    const contentEncoding = (headers.get ? headers.get('content-encoding') : (headers['content-encoding'] || '')).toLowerCase();
    const has_compression = contentEncoding.includes('gzip') || contentEncoding.includes('br');
    if (has_compression) {
        strengths.push("Content compression enabled (gzip/brotli)");
    } else {
        issues.push("Enable gzip/brotli compression to reduce transfer size");
        score -= 15;
    }

    // Caching
    const cacheControl = headers.get ? headers.get('cache-control') : (headers['cache-control'] || '');
    const has_caching = cacheControl.toLowerCase().includes('max-age');
    if (has_caching) {
        strengths.push("Caching headers present");
    } else {
        issues.push("Add Cache-Control headers for static assets");
        score -= 10;
    }

    score = Math.max(0, Math.min(100, score));

    return {
        score,
        response_time_ms,
        page_size_kb,
        has_compression,
        has_caching,
        issues,
        strengths
    };
}
