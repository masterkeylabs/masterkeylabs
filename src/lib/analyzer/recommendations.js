/**
 * Recommendations Engine
 * Generates summary and actionable recommendations based on analysis results.
 */

function getGrade(score) {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
}

function generateRecommendations(
    seo,
    performance,
    conversion,
    trust,
    ux
) {
    const recommendations = [];

    // Critical
    if (!trust.has_ssl) {
        recommendations.push("🔒 CRITICAL: Enable HTTPS/SSL immediately. 85% of users abandon sites without SSL.");
    }
    if (!conversion.has_cta_buttons) {
        recommendations.push("📣 Add clear call-to-action buttons above the fold. 'Get Started', 'Contact Us', or 'Free Trial' increase conversions by 28%.");
    }
    if (!conversion.has_contact_form) {
        recommendations.push("📝 Add a lead capture form. Websites with forms convert 2-3x more visitors.");
    }

    // High Impact
    if (!seo.has_meta_description) {
        recommendations.push("🔍 Add a compelling meta description (120-160 chars). It improves click-through from search by up to 35%.");
    }
    if (!ux.has_mobile_viewport) {
        recommendations.push("📱 Implement responsive design. 60%+ of traffic is mobile - non-responsive sites lose 57% of users.");
    }
    if (!trust.has_testimonials) {
        recommendations.push("⭐ Add customer testimonials. Social proof increases conversions by 34%.");
    }

    // Medium Impact
    if (!performance.has_compression) {
        recommendations.push("⚡ Enable gzip compression. Reduces page load by 70% for text-based content.");
    }
    if (performance.response_time_ms && performance.response_time_ms > 3000) {
        recommendations.push("⏱️ Optimize page speed. Each second of delay can reduce conversions by 7%.");
    }
    if (!conversion.has_phone_number) {
        recommendations.push("📞 Display a phone number. Visible contact info increases trust and conversions.");
    }
    if (!trust.has_privacy_policy) {
        recommendations.push("📄 Add a privacy policy. Required for GDPR and increases trust by 20%.");
    }

    // Nice to have
    if (!seo.has_og_tags) {
        recommendations.push("📤 Add Open Graph tags (og:title, og:image) for better social sharing.");
    }
    if (!ux.has_footer) {
        recommendations.push("🔗 Add a footer with links to About, Contact, Privacy, and Terms.");
    }
    if (conversion.cta_count < 2) {
        recommendations.push("🎯 Place multiple CTAs throughout the page - above fold, mid-page, and before footer.");
    }

    return recommendations.slice(0, 10);
}

function generateSummary(
    url,
    overallScore,
    grade,
    seo,
    conversion,
    trust
) {
    let base = "";
    if (overallScore >= 80) {
        base = `Your website shows strong customer acquisition potential (Grade ${grade}). `;
    } else if (overallScore >= 60) {
        base = `Your website has moderate efficiency (Grade ${grade}). Several improvements could significantly boost conversions. `;
    } else {
        base = `Your website needs attention (Grade ${grade}). Key conversion elements are missing. `;
    }

    const highlights = [];
    if (seo.score >= 70) highlights.push("SEO foundations are solid");
    if (conversion.score >= 70) highlights.push("good conversion elements");
    if (trust.score >= 70) highlights.push("strong trust signals");

    if (highlights.length > 0) {
        base += `Strengths: ${highlights.join(', ')}. `;
    }
    base += "Focus on the recommendations below for maximum impact.";
    return base;
}

export function finalizeAnalysis(
    url,
    seo,
    performance,
    conversion,
    trust,
    ux
) {
    const weights = { seo: 0.2, performance: 0.2, conversion: 0.3, trust: 0.2, ux: 0.1 };

    let overallScore = (
        seo.score * weights.seo +
        performance.score * weights.performance +
        conversion.score * weights.conversion +
        trust.score * weights.trust +
        ux.score * weights.ux
    );

    overallScore = Math.min(100, Math.max(0, Math.round(overallScore)));
    const grade = getGrade(overallScore);
    const recommendations = generateRecommendations(seo, performance, conversion, trust, ux);
    const summary = generateSummary(url, overallScore, grade, seo, conversion, trust);

    return {
        url,
        overall_score: overallScore,
        efficiency_grade: grade,
        seo,
        performance,
        conversion,
        trust,
        ux,
        ai_recommendations: recommendations,
        summary
    };
}
