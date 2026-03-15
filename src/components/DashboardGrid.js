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
import { useAuth } from '@/lib/AuthContext';

export default function DashboardGrid({ business: serverBusiness, computedData: initialComputedData }) {
    const { business: clientBusiness, loading: authLoading } = useAuth();
    const business = clientBusiness || serverBusiness;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { lang, setLang, t } = useLanguage();
    const [showAuditWizard, setShowAuditWizard] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Zustand store reactive selectors (MUST be at top level)
    const setAuditData = useDiagnosticStore((state) => state.setAuditData);
    const lossAudit = useDiagnosticStore((state) => state.lossAudit);
    const nightLoss = useDiagnosticStore((state) => state.nightLoss);
    const missedCustomers = useDiagnosticStore((state) => state.missedCustomers);
    const aiThreat = useDiagnosticStore((state) => state.aiThreat);

    // Derived states
    const computedData = { lossAudit, nightLoss, missedCustomers, aiThreat };
    const auditsIncomplete = 
        !lossAudit || !lossAudit.id || 
        !nightLoss || !nightLoss.id || 
        !missedCustomers || !missedCustomers.id || 
        !aiThreat || !aiThreat.id;
    const profileIncomplete = !business?.id || !business?.entity_name || !business?.owner_name || !business?.phone || !business?.email || business.entity_name === 'Initialize System';

    useEffect(() => {
        setMounted(true);
    }, []);

    // 2. Hydration Effect (Moved to top level)
    useEffect(() => {
        if (!mounted) return;
        
        const serverHasData = initialComputedData?.lossAudit || initialComputedData?.nightLoss || initialComputedData?.missedCustomers || initialComputedData?.aiThreat;
        if (serverHasData) {
            console.log('--- DashboardGrid: Hydrating store from robust server data ---');
            setAuditData(initialComputedData);
        }
    }, [mounted, initialComputedData, setAuditData]);

    // 3. Status Reporting (Moved to top level)
    useEffect(() => {
        if (!mounted) return;
        console.log('--- Live Dashboard Status ---', {
            id: business?.id,
            name: business?.entity_name,
            profileIncomplete,
            auditsIncomplete,
            showAuditWizard
        });
    }, [mounted, business?.id, profileIncomplete, auditsIncomplete, showAuditWizard]);

    // Consolidation Guard: Render spinner until mounted and auth is ready
    if (!mounted || authLoading) {
        return (
            <div className="bg-background-dark min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-ios-blue border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-white/40 text-xs font-mono tracking-widest uppercase">Preparing Dashboard...</p>
                </div>
            </div>
        );
    }


    const handleWizardComplete = () => {
        console.log('--- Wizard: Received onComplete signal ---');
        // Only close if we are truly done with everything
        const currentStore = useDiagnosticStore.getState();
        const auditsDone = currentStore.lossAudit && currentStore.nightLoss && currentStore.missedCustomers && currentStore.aiThreat;
        const profileDone = business?.id && business?.entity_name && business.entity_name !== 'Initialize System';

        if (auditsDone && profileDone) {
            setShowAuditWizard(false);
        }

        // Check if we are now complete (wait a tiny bit for store to settle if needed, but it should be instant)
        // We use the LATEST store values directly rather than the constant from render to avoid closure issues
        
        // Use fallback to localStorage because closure variables 'business' might be stale on fast completions
        const localBizId = typeof window !== 'undefined' ? localStorage.getItem('masterkey_business_id') : null;
        const finalBizId = business?.id || localBizId;
        
        if (auditsDone && profileDone) {
            console.log('--- Wizard: Full system completion detected! ---');
            setIsUnlocking(true);
            
            // Premium transition: show animation, then redirect to the explicit ID path to lock it in and ensure 
            // all server-side reports (PDFs, etc) are generated and synced flawlessly avoiding SSR auth drops.
            setTimeout(() => {
                window.location.href = `/dashboard?id=${finalBizId}`;
            }, 3000); 
        } else {
            console.log('--- Wizard: Partial completion or profile-only sync, staying in dashboard view ---');
        }
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
                            Checkup <span className="text-ios-cyan">Complete</span>
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
                    Preparing Your Report...
                </p>
                <div className="flex justify-center gap-12 mt-6 opacity-40">
                    {['SAVINGS', 'GROWTH', 'RESULTS', 'PLAN'].map(word => (
                        <span key={word} className="text-[8px] font-black tracking-widest text-white">{word}::READY</span>
                    ))}
                </div>
            </div>

            {/* Global Flash Effect */}
            <div className="absolute inset-0 bg-white animate-flash opacity-0 pointer-events-none"></div>
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
                        {mounted && (
                            <BleedSummaryCard
                                t={t}
                                locked={auditsIncomplete}
                            />
                        )}

                        {/* Highlighting the 4 deterministic calculations using the DiagnosticGrid */}
                        <section className="animate-fade-in opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
                            <DiagnosticGrid
                                business={business}
                                t={t}
                                locked={auditsIncomplete}
                                onStartAudit={() => setShowAuditWizard(true)}
                            />
                        </section>

                        {/* Automatically Generated Comprehensive Audit Report */}
                        <section id="comprehensive-report">
                            <ComprehensiveReportModal
                                businessName={business?.entity_name}
                                locked={auditsIncomplete}
                                t={t}
                            />
                        </section>




                        {/* Rescue Architecture placed at the very bottom as explicitly instructed */}
                        <section className={`mt-16 border-t border-white/10 pt-16 ${auditsIncomplete ? 'blur-md pointer-events-none opacity-50' : ''}`}>
                            <RescueArchitecture businessId={business?.id} t={t} />
                        </section>

                    </div>
                </div>
            </main>

            {/* Profile Wizard shows if profile incomplete. Audit Wizard shows if explicitly triggered. */}
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
