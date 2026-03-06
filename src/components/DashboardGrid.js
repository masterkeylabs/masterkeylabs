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
import DashboardIntakeWizard from '@/components/DashboardIntakeWizard';
import { translations } from '@/lib/translations';

import { useLanguage } from '@/lib/LanguageContext';
import { useDiagnosticStore } from '@/store/diagnosticStore';

export default function DashboardGrid({ business, computedData }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { lang, setLang, t } = useLanguage();
    const [showAuditWizard, setShowAuditWizard] = useState(false);
    const setAuditData = useDiagnosticStore((state) => state.setAuditData);

    useEffect(() => {
        if (computedData) {
            setAuditData(computedData);
        }
    }, [computedData, setAuditData]);

    const { lossAudit, nightLoss, missedCustomers, aiThreat } = computedData || {};

    const auditsIncomplete = !lossAudit?.created_at || !nightLoss?.created_at || !missedCustomers?.created_at || !aiThreat?.created_at;
    const profileIncomplete = !business?.id || !business?.entity_name || !business?.owner_name || !business?.phone || !business?.email || business.entity_name === 'Initialize System';

    // DIAGNOSTIC LOGS
    useEffect(() => {
        console.log('--- DashboardGrid State ---');
        console.log('Business ID:', business?.id);
        console.log('Entity Name:', business?.entity_name);
        console.log('Profile Incomplete:', profileIncomplete);
        if (profileIncomplete) {
            console.log('Reasons for Incomplete Profile:', {
                noId: !business?.id,
                noName: !business?.entity_name,
                noOwner: !business?.owner_name,
                noPhone: !business?.phone,
                noEmail: !business?.email,
                isDefaultName: business?.entity_name === 'Initialize System'
            });
        }
    }, [business, profileIncomplete]);

    return (
        <div className="bg-background-dark font-sans text-slate-100 min-h-screen selection:bg-ios-blue/30 selection:text-ios-blue overflow-x-hidden flex">
            <Sidebar t={t} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <main className="flex-1 ml-0 md:ml-64 p-4 md:p-10 relative min-h-screen w-full max-w-full">
                {/* Background Sophistication */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-ios-blue/5 blur-[120px] rounded-full opacity-60"></div>
                    <div className="absolute bottom-0 left-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-ios-orange/5 blur-[120px] rounded-full opacity-40"></div>
                </div>

                <div className={`max-w-7xl mx-auto relative z-10 transition-all duration-700 ${profileIncomplete ? 'blur-sm grayscale pointer-events-none opacity-50' : ''}`}>
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
                            <DiagnosticGrid
                                data={computedData}
                                business={business}
                                t={t}
                                locked={auditsIncomplete}
                                onStartAudit={() => setShowAuditWizard(true)}
                            />
                        </section>

                        {/* Automatically Generated Comprehensive Audit Report */}
                        <section className={`${auditsIncomplete ? 'blur-md pointer-events-none opacity-50 transition-all duration-700' : ''}`}>
                            <ComprehensiveReportModal businessName={business?.entity_name} computedData={computedData} t={t} />
                        </section>




                        {/* Rescue Architecture placed at the very bottom as explicitly instructed */}
                        <section className={`mt-16 border-t border-white/10 pt-16 ${auditsIncomplete ? 'blur-md pointer-events-none opacity-50' : ''}`}>
                            <RescueArchitecture businessId={business?.id} t={t} />
                        </section>

                    </div>
                </div>
            </main>

            {/* Profile Wizard shows if profile incomplete. Audit Wizard shows if explicitly triggered or audits are incomplete (but profile IS complete) */}
            {(profileIncomplete || showAuditWizard) && (
                <DashboardIntakeWizard
                    business={business}
                    existingData={computedData}
                    t={t}
                    mode={profileIncomplete ? 'profile' : 'audit'}
                    initialStep={profileIncomplete ? 0 : 1}
                    onComplete={() => {
                        setShowAuditWizard(false);
                    }}
                />
            )}

            <FloatingFAB
                businessName={business?.entity_name}
                threatResult={{ threatLevel: (aiThreat?.score || 0) >= 80 ? 'KHATRA' : 'SAFE' }}
                lossResult={lossAudit?.saving_target || 0}
                t={t}
            />


        </div>
    );
}
