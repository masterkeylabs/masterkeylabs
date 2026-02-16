'use client';

import { useSearchParams } from 'next/navigation';
import FeatureLayout from '@/components/FeatureLayout';
import WebsiteAnalyzer from '@/components/WebsiteAnalyzer';

export default function LiveVisibilityPage() {
    const searchParams = useSearchParams();
    const businessId = searchParams.get('id');

    return (
        <FeatureLayout
            title="Live Website Audit"
            subtitle="AI-Powered Technical, SEO & Conversion Efficiency Scan"
            backHref={businessId ? `/dashboard/visibility?id=${businessId}` : '/dashboard/visibility'}
        >
            <div className="bg-carbon border border-white/10 rounded-2xl p-8 lg:p-12">
                <WebsiteAnalyzer />
            </div>
        </FeatureLayout>
    );
}
