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
import BleedSummaryCard from '@/components/BleedSummaryCard';
import { translations } from '@/lib/translations';

import { useLanguage } from '@/lib/LanguageContext';
import { useDiagnosticStore } from '@/store/diagnosticStore';

export default function DashboardGrid({ business, computedData }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { lang, setLang, t } = useLanguage();
    const [showAuditWizard, setShowAuditWizard] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [mounted, setMounted] = useState(false);
    const setAuditData = useDiagnosticStore((state) => state.setAuditData);

    console.log('--- DashboardGrid: Render ---', {
        businessId: business?.id,
        businessName: business?.entity_name,
        hasComputedData: !!computedData
    });

    useEffect(() => {
        setMounted(true);
        if (computedData) {
            setAuditData(computedData);
        }
    }, [computedData, setAuditData]);

    const { lossAudit, nightLoss, missedCustomers, aiThreat } = computedData || {};

    const auditsIncomplete = !lossAudit?.created_at || !nightLoss?.created_at || !missedCustomers?.created_at || !aiThreat?.created_at;
    const profileIncomplete = !business?.id || !business?.entity_name || !business?.owner_name || !business?.phone || !business?.email || business.entity_name === 'Initialize System';

    const handleWizardComplete = () => {
        if (!auditsIncomplete) {
            // Already complete, just close and force reload to fetch fresh data
            setShowAuditWizard(false);
            window.location.reload();
            return;
        }

        // Trigger the high-tech unlocking animation
        setIsUnlocking(true);
        setShowAuditWizard(false);

        // After animation completes, we reload or just settle
        setTimeout(() => {
            setIsUnlocking(false);
            window.location.reload(); // Force refresh to get all locked states updated server-side
        }, 4000); // 4 seconds of glory
    };

    // --- RENDER UNLOCKING OVERLAY ---
    const UnlockingOverlay = () => (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center overflow-hidden">
            {/* Background Grid & Scanlines */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ios-cyan/5 to-transparent animate-scanline"></div>

            {/* Central Hexagon/Core */}
            <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center animate-pulse-slow">
                <div className="absolute inset-0 border-4 border-ios-cyan/20 rounded-[3rem] rotate-45 animate-spin-slow"></div>
                <div className="absolute inset-4 border-2 border-ios-cyan/40 rounded-[2.5rem] -rotate-12 animate-reverse-spin"></div>

                <div className="relative text-center space-y-4">
                    <span className="material-symbols-outlined text-7xl md:text-9xl text-ios-cyan drop-shadow-[0_0_20px_rgba(0,210,255,0.8)] animate-bounce">
                        lock_open
                    </span>
                    <div className="space-y-1">
                        <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-[0.3em] font-sans">
                            System <span className="text-ios-cyan">Unlocked</span>
                        </h2>
                        <div className="w-32 h-1 bg-white/10 mx-auto rounded-full overflow-hidden">
                            <div className="h-full bg-ios-cyan animate-shimmer scale-x-150"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Stream Typography */}
            <div className="absolute bottom-20 left-0 right-0 text-center">
                <p className="text-[10px] md:text-xs font-mono text-ios-cyan/60 uppercase tracking-[0.5em] animate-fade-in-out">
                    Decrypting Diagnostic Parameters...
                </p>
                <div className="flex justify-center gap-12 mt-6 opacity-40">
                    {['VAULT', 'METRICS', 'SYNERGY', 'PROTOCOL'].map(word => (
                        <span key={word} className="text-[8px] font-black tracking-widest text-white">{word}::READY</span>
                    ))}
                </div>
            </div>

            {/* Global Flash Effect */}
            <div className="absolute inset-0 bg-white animate-flash opacity-0 pointer-events-none"></div>
        </div>
    );

    if (!mounted) return (
        <div className="bg-background-dark min-h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-ios-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="bg-background-dark font-sans text-slate-100 min-h-screen selection:bg-ios-blue/30 selection:text-ios-blue overflow-x-hidden flex">
            <Sidebar t={t} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {isUnlocking && <UnlockingOverlay />}

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

                        {/* BLEED SUMMARY CARD (P4 Implementation) */}
                        <BleedSummaryCard
                            t={t}
                            locked={auditsIncomplete}
                        />

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
                        <section id="comprehensive-report" className={`${auditsIncomplete ? 'blur-md pointer-events-none opacity-50 transition-all duration-700' : ''}`}>
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
                    onComplete={handleWizardComplete}
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
