'use client';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import DashboardHeader from '@/components/DashboardHeader';
import DiagnosticGrid from '@/components/DiagnosticGrid';
import TransformationRoadmap from '@/components/TransformationRoadmap';
import HealthMeter from '@/components/HealthMeter';
import FloatingFAB from '@/components/FloatingFAB';
import RescueArchitecture from '@/components/RescueArchitecture';
import BusinessProfile from '@/components/BusinessProfile';
import { translations } from '@/lib/translations';

export default function DashboardGrid({ business, computedData }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [lang, setLang] = useState('en');
    const t = translations[lang];

    const { lossAudit, nightLoss, missedCustomers, aiThreat } = computedData || {};

    // Helper functions to prevent crashes on undefined data
    const getZone = () => {
        if (!computedData) return t.dashboard.health.analyzing;
        if (aiThreat >= 80) return t.dashboard.health.critical || 'CRITICAL';
        if (aiThreat >= 50) return t.dashboard.health.caution || 'CAUTION';
        return t.dashboard.health.optimized || 'OPTIMIZED';
    };

    const getDescription = () => {
        if (!computedData) return t.dashboard.health.analyzing;
        if (aiThreat >= 80) return "Critical vulnerability detected. System is failing.";
        return t.dashboard.health.partial || 'System processing partial data.';
    };

    return (
        <div className="bg-background-dark font-sans text-slate-100 min-h-screen selection:bg-ios-blue/30 selection:text-ios-blue overflow-x-hidden flex">
            <Sidebar t={t} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <main className="flex-1 ml-0 md:ml-64 p-4 md:p-10 relative overflow-y-auto h-screen w-full">
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
                        <BusinessProfile business={business} />

                        {/* Highlighting the 4 deterministic calculations using the DiagnosticGrid */}
                        <section className="animate-fade-in opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
                            <div className="flex items-center gap-2 mb-6 ml-4">
                                <span className="w-1 h-4 bg-ios-blue rounded-full"></span>
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30">
                                    {t.dashboard.risksTitle || 'SYSTEM DIAGNOSTICS'}
                                </h3>
                            </div>

                            {/* Inserted the Client UI component here, replacing CapitalDetector and ExtinctionTimer */}
                            <DiagnosticGrid data={computedData} />
                        </section>

                        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 animate-fade-in opacity-0" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
                            <div className="xl:col-span-3 space-y-8">
                                <div className="system-card border border-white/5 p-8 bg-white/[0.01] h-full">
                                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-ios-blue">account_tree</span>
                                            <h3 className="text-[12px] font-bold text-white uppercase tracking-widest">Protocol Transformation</h3>
                                        </div>
                                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-none">Step-By-Step</span>
                                    </div>
                                    <TransformationRoadmap />
                                </div>
                            </div>

                            <div className="xl:col-span-2">
                                <HealthMeter
                                    zone={getZone()}
                                    months={Math.round((100 - (aiThreat || 0)) * 0.12)}
                                    description={getDescription()}
                                    score={Math.max(0, 100 - Math.round((lossAudit || 0) / 100000) * 5)}
                                    t={t}
                                />
                            </div>
                        </div>

                        {/* Rescue Architecture placed at the very bottom as explicitly instructed */}
                        <section className="mt-16 border-t border-white/10 pt-16">
                            <RescueArchitecture businessId={business?.id} />
                        </section>

                    </div>
                </div>
            </main>

            <FloatingFAB
                businessName={business?.entity_name}
                threatResult={{ threatLevel: aiThreat >= 80 ? 'KHATRA' : 'SAFE' }}
                lossResult={lossAudit}
            />
        </div>
    );
}
