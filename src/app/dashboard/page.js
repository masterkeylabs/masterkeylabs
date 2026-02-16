"use client";
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import DashboardHeader from '@/components/DashboardHeader';
import HealthMeter from '@/components/HealthMeter';
import CapitalDetector from '@/components/CapitalDetector';
import ExtinctionTimer from '@/components/ExtinctionTimer';
import FloatingFAB from '@/components/FloatingFAB';

import DiagnosticLog from '@/components/DiagnosticLog';
import ReportModal from '@/components/ReportModal';
import { supabase } from '@/lib/supabaseClient';

function DashboardContent() {
    const searchParams = useSearchParams();
    const businessId = searchParams.get('id');

    const [business, setBusiness] = useState(null);
    const [threatResult, setThreatResult] = useState(null);
    const [lossResult, setLossResult] = useState(null);
    const [exportResult, setExportResult] = useState(null);
    const [nightResult, setNightResult] = useState(null);
    const [visibilityResult, setVisibilityResult] = useState(null);
    const [reportModalOpen, setReportModalOpen] = useState(false);

    // Fetch business profile
    const fetchBusiness = useCallback(async () => {
        if (!businessId) return;
        const { data } = await supabase.from('businesses').select('*').eq('id', businessId).single();
        if (data) setBusiness(data);
    }, [businessId]);

    // Fetch AI threat results
    const fetchThreat = useCallback(async () => {
        if (!businessId) return;
        const { data } = await supabase.from('ai_threat_results').select('*').eq('business_id', businessId).order('created_at', { ascending: false }).limit(1).single();
        if (data) setThreatResult(data);
    }, [businessId]);

    // Fetch all feature results
    const fetchResults = useCallback(async () => {
        if (!businessId) return;
        const [loss, exp, night, vis] = await Promise.all([
            supabase.from('loss_audit_results').select('*').eq('business_id', businessId).order('created_at', { ascending: false }).limit(1).single(),
            supabase.from('export_results').select('*').eq('business_id', businessId).order('created_at', { ascending: false }).limit(1).single(),
            supabase.from('night_loss_results').select('*').eq('business_id', businessId).order('created_at', { ascending: false }).limit(1).single(),
            supabase.from('visibility_results').select('*').eq('business_id', businessId).order('created_at', { ascending: false }).limit(1).single(),
        ]);
        if (loss.data) setLossResult(loss.data);
        if (exp.data) setExportResult(exp.data);
        if (night.data) setNightResult(night.data);
        if (vis.data) setVisibilityResult(vis.data);
    }, [businessId]);

    useEffect(() => {
        fetchBusiness();
        fetchThreat();
        fetchResults();

        if (!businessId) return;

        // Real-time subscriptions
        const channels = [
            supabase.channel('rt-threat')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'ai_threat_results', filter: `business_id=eq.${businessId}` }, () => fetchThreat())
                .subscribe(),
            supabase.channel('rt-loss')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'loss_audit_results', filter: `business_id=eq.${businessId}` }, () => fetchResults())
                .subscribe(),
            supabase.channel('rt-export')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'export_results', filter: `business_id=eq.${businessId}` }, () => fetchResults())
                .subscribe(),
            supabase.channel('rt-night')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'night_loss_results', filter: `business_id=eq.${businessId}` }, () => fetchResults())
                .subscribe(),
            supabase.channel('rt-visibility')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'visibility_results', filter: `business_id=eq.${businessId}` }, () => fetchResults())
                .subscribe(),
        ];

        return () => channels.forEach(ch => ch.unsubscribe());
    }, [businessId, fetchBusiness, fetchThreat, fetchResults]);

    // Format INR for summary cards
    const fmtINR = (n) => {
        if (!n) return '—';
        if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
        if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
        return `₹${n.toLocaleString('en-IN')}`;
    };

    // Build diagnostic card data from real results
    const cardData = [
        {
            title: 'Loss Audit',
            amount: lossResult ? fmtINR(lossResult.total_burn) + '/mo' : 'Run Audit',
            description: lossResult
                ? `Staff ₹${(lossResult.staff_waste / 1000).toFixed(0)}K + Mktg ₹${(lossResult.marketing_waste / 1000).toFixed(0)}K + Ops ₹${(lossResult.ops_waste / 1000).toFixed(0)}K wasted monthly`
                : 'Find hidden waste in staff, marketing & operations costs',
            icon: 'trending_down',
            color: 'red',
            href: `/dashboard/loss-audit${businessId ? `?id=${businessId}` : ''}`,
        },
        {
            title: 'Night Loss',
            amount: nightResult ? fmtINR(nightResult.monthly_loss) + '/mo' : 'Calculate',
            description: nightResult
                ? `${nightResult.night_inquiries} night enquiries going unanswered monthly`
                : 'Revenue lost from after-hours unanswered inquiries',
            icon: 'nightlight',
            color: 'orange',
            href: `/dashboard/night-loss${businessId ? `?id=${businessId}` : ''}`,
        },
        {
            title: 'Digital Visibility',
            amount: visibilityResult ? `${visibilityResult.percent}%` : 'Scan',
            description: visibilityResult
                ? `Status: ${visibilityResult.status} — ~${visibilityResult.missed_customers} customers missed/mo`
                : 'Are customers finding you or your competitors?',
            icon: 'radar',
            color: 'cyan',
            href: `/dashboard/visibility${businessId ? `?id=${businessId}` : ''}`,
        },
        {
            title: 'Global Markets',
            amount: exportResult ? fmtINR(exportResult.additional_income) + '/mo' : 'Explore',
            description: exportResult
                ? `${exportResult.multiplier}x premium in ${exportResult.destination} market — ROI ${exportResult.roi_percent}%`
                : 'Your products could sell for 3-7x more internationally',
            icon: 'public',
            color: 'green',
            href: `/dashboard/export${businessId ? `?id=${businessId}` : ''}`,
        },
        {
            title: 'Live Website Audit',
            amount: 'Live Scan',
            description: 'AI-powered technical, SEO and conversion efficiency analyzer',
            icon: 'analytics',
            color: 'cyan',
            href: `/dashboard/visibility/live${businessId ? `?id=${businessId}` : ''}`,
        },
    ];

    // Compute extinction date from threat yearsLeft
    const extinctionDate = threatResult
        ? new Date(Date.now() + threatResult.years_left * 365.25 * 24 * 60 * 60 * 1000).toISOString()
        : null;

    return (
        <>
            <div className="flex h-full min-h-screen">
                <Sidebar onReportClick={() => setReportModalOpen(true)} />
                <main className="flex-1 ml-64 p-8">
                    <DashboardHeader companyName={business?.entity_name || 'Your Business'} />

                    {/* Grid Row 1: Diagnostic Cards — Now at Top */}
                    <div className="mb-8">
                        <CapitalDetector cards={cardData} />
                    </div>

                    {/* Grid Row 2: Extinction Timer + Diagnostic Log */}
                    <div className="grid grid-cols-1 gap-6 mb-8">
                        <ExtinctionTimer targetDate={extinctionDate} />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        <div className="xl:col-span-2">
                            <DiagnosticLog />
                        </div>
                        <div className="xl:col-span-1">
                            {/* Conditional Health Results — Show only after all audits */}
                            {lossResult && exportResult && nightResult && visibilityResult ? (
                                <HealthMeter
                                    zone={threatResult?.threat_level === 'KHATRA' ? 'Critical Zone'
                                        : threatResult?.threat_level === 'SAVDHAN' ? 'Warning Zone'
                                            : threatResult ? 'Safe Zone' : 'Analyzing...'}
                                    months={threatResult?.years_left ? threatResult.years_left * 12 : null}
                                    description={threatResult?.timeline_desc || 'Diagnostic Scan Complete'}
                                    score={threatResult?.score}
                                />
                            ) : (
                                <div className="glass rounded-xl p-8 border border-white/5 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                                    <span className="material-symbols-outlined text-white/20 text-5xl mb-4">lock</span>
                                    <h4 className="text-white font-bold mb-2 uppercase tracking-widest">Full Health Audit Locked</h4>
                                    <p className="text-white/40 text-sm">Complete all 4 diagnostic features above to reveal your comprehensive business survival score.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            <FloatingFAB businessName={business?.entity_name} />


            <ReportModal
                isOpen={reportModalOpen}
                onClose={() => setReportModalOpen(false)}
                data={{
                    business,
                    threatResult,
                    lossResult,
                    exportResult,
                    nightResult,
                    visibilityResult
                }}
            />

            {/* Background Decoration */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20 z-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[150px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-alert-red/10 blur-[150px] rounded-full"></div>
            </div>
        </>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-background-dark text-white">Loading dashboard...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
