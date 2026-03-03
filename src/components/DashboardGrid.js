'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import DashboardHeader from '@/components/DashboardHeader';
import DiagnosticGrid from '@/components/DiagnosticGrid';
import TransformationRoadmap from '@/components/TransformationRoadmap';
import FloatingFAB from '@/components/FloatingFAB';
import RescueArchitecture from '@/components/RescueArchitecture';
import BusinessProfile from '@/components/BusinessProfile';
import ComprehensiveReportModal from '@/components/ComprehensiveReportModal';
import { translations } from '@/lib/translations';

import { useLanguage } from '@/lib/LanguageContext';
import { useDiagnosticStore } from '@/store/diagnosticStore';

export default function DashboardGrid({ business, computedData }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { lang, setLang, t } = useLanguage();

    const setAuditData = useDiagnosticStore((state) => state.setAuditData);

    useEffect(() => {
        if (computedData) {
            setAuditData(computedData);
        }
    }, [computedData, setAuditData]);

    const { lossAudit, nightLoss, missedCustomers, aiThreat } = computedData || {};

    return (
        <div className="bg-background-dark font-sans text-slate-100 min-h-screen selection:bg-ios-blue/30 selection:text-ios-blue overflow-x-hidden flex">
            <Sidebar t={t} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <main className="flex-1 ml-0 md:ml-64 p-4 md:p-10 relative overflow-y-auto min-h-screen w-full">
                {/* Background Sophistication */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-ios-blue/5 blur-[120px] rounded-full opacity-60"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-ios-orange/5 blur-[120px] rounded-full opacity-40"></div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <DashboardHeader
                        companyName={business?.entity_name || t.header.command}
                        lang={lang}
                        setLang={setLang}
                        t={t}
                        setSidebarOpen={setSidebarOpen}
                    />


                    {/* Grid Layout */}
                    <div className="space-y-8">

                        {/* New Business Profile Block */}
                        <BusinessProfile business={business} t={t} lang={lang} />

                        {/* Highlighting the 4 deterministic calculations using the DiagnosticGrid */}
                        <section className="animate-fade-in opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
                            <DiagnosticGrid data={computedData} business={business} t={t} />
                        </section>

                        {/* Automatically Generated Comprehensive Audit Report */}
                        <ComprehensiveReportModal businessName={business?.entity_name} computedData={computedData} t={t} />




                        {/* Rescue Architecture placed at the very bottom as explicitly instructed */}
                        <section className="mt-16 border-t border-white/10 pt-16">
                            <RescueArchitecture businessId={business?.id} t={t} />
                        </section>

                    </div>
                </div>
            </main>

            <FloatingFAB
                businessName={business?.entity_name}
                threatResult={{ threatLevel: (aiThreat?.score || 0) >= 80 ? 'KHATRA' : 'SAFE' }}
                lossResult={lossAudit?.saving_target || 0}
                t={t}
            />


        </div>
    );
}
