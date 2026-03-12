'use client';

import React, { useRef, useState } from 'react';
import { useDiagnosticStore } from '@/store/diagnosticStore';
import { formatIndian } from '@/utils/formatIndian';

export default function ComprehensiveReportInline({ businessName, locked }) {
    const reportRef = useRef();
    const [isGenerating, setIsGenerating] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    const showNotify = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 5000);
    };

    const generatePdfBase64 = async () => {
        const { toJpeg } = await import('html-to-image');
        const { default: jsPDF } = await import('jspdf');

        const element = reportRef.current;
        if (!element) throw new Error('Report element not found');

        const width = element.offsetWidth;
        const height = element.scrollHeight || element.offsetHeight;

        // Using JPEG with quality compression and 1x pixel ratio shrinks a 40MB payload down to under 1MB
        const dataUrl = await toJpeg(element, {
            quality: 0.70,
            width: width,
            height: height,
            pixelRatio: 1,
            backgroundColor: '#0a0a0d',
            style: { background: '#0a0a0d' },
            skipFonts: true,
            filter: (node) => {
                if (node.tagName === 'LINK' && node.rel === 'stylesheet') return false;
                return true;
            }
        });

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [width, height]
        });

        pdf.addImage(dataUrl, 'JPEG', 0, 0, width, height);

        // To guarantee zero corruption, extract as ArrayBuffer then encode to raw Base64
        const arrayBuffer = pdf.output('arraybuffer');
        const buffer = new Uint8Array(arrayBuffer);

        let binary = '';
        const len = buffer.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(buffer[i]);
        }

        // Return pure, clean base64 string
        return btoa(binary);
    };

    const handleGenerateReport = async () => {
        if (locked) {
            showNotify('Audit Terminal is Locked. Please complete all 4 modules to unlock the Comprehensive Report.', 'error');
            return;
        }

        // Enforce all modules completion check using the actual stored objects
        const { lossAudit, nightLoss, missedCustomers, aiThreat } = useDiagnosticStore.getState();

        if (!lossAudit?.created_at || !nightLoss?.created_at || !missedCustomers?.created_at || !aiThreat?.created_at) {
            showNotify('Please complete all 4 audit modules (Operational Waste, Night Loss, Visibility, AI Threat) before generating the final report.', 'error');
            return;
        }

        setIsGenerating(true);
        try {
            // 1. Generate the PDF
            const pdfBase64 = await generatePdfBase64();

            // 2. Trigger Download
            if (typeof window !== 'undefined') {
                const link = document.createElement('a');
                link.href = `data:application/pdf;base64,${pdfBase64}`;
                link.download = `${businessName || 'Masterkey'}_Audit_Report.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            showNotify(`Report successfully generated and downloaded.`);
        } catch (error) {
            console.error('Report generation failed:', error);
            showNotify(error.message || 'Failed to generate report', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    const {
        lossAudit,
        nightLoss,
        missedCustomers: missedCustomersData,
        aiThreat,
        totalAnnualBleed,
        opsWaste: opsWasteStore,
        staffWaste: staffWasteStore,
        marketingWaste: marketingWasteStore,
        nightLossRevenue: nightLossRevenueStore,
        extinctionHorizon: extinctionHorizonStore,
    } = useDiagnosticStore();

    // Mapping for internal compatibility
    const opsWaste = opsWasteStore || lossAudit?.saving_target || 0;
    const staffWaste = staffWasteStore || lossAudit?.staff_waste || 0;
    const marketingWaste = marketingWasteStore || lossAudit?.marketing_waste || 0;
    const nightLossRevenue = nightLossRevenueStore || nightLoss?.monthly_loss || 0;
    const missedCustomers = missedCustomersData?.missed_customers || 0;
    const extinctionHorizon = aiThreat?.score || 0;

    const annualOpsWaste = opsWaste * 12;
    const annualNightLoss = nightLossRevenue * 12;
    const annualVisibilityLoss = missedCustomers * (missedCustomersData?.avg_transaction_value || 1500) * 12;
    const recoverablePotential = totalAnnualBleed * 0.5;

    const lossAuditData = lossAudit || {};
    const nightLossData = nightLoss || {};
    const visibilityData = missedCustomersData || {};
    const aiThreatData = aiThreat || {};

    const computedData = { lossAudit, nightLoss, missedCustomers, aiThreat };

    const waMessage = `Hi Masterkey Labs, I just generated my Comprehensive Audit Report. My Total Annual Bleed is ₹${formatIndian(totalAnnualBleed)}. I need to deploy the Survival Protocol and fix my operations.`;
    const waLink = `https://wa.me/919920808365?text=${encodeURIComponent(waMessage)}`;

    return (
        <section className="animate-fade-in opacity-0 w-full mt-4" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
            {/* The Dashboard Generator Card */}
            <div className={`relative w-full border rounded-3xl shadow-2xl overflow-hidden transition-all duration-700 ${locked ? 'bg-black/40 border-white/5 grayscale pointer-events-none' : 'bg-[#0a0a0d] border-white/10'}`}>
                <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-ios-cyan via-ios-blue to-ios-purple opacity-50 z-20 ${locked ? 'grayscale' : ''}`}></div>

                <div className="p-8 md:p-10 flex flex-col lg:flex-row justify-between items-center gap-8 relative z-10">
                    <div className="flex flex-col gap-2 text-center lg:text-left">
                        <div className="flex items-center gap-2 justify-center lg:justify-start">
                            <span className="material-symbols-outlined text-ios-cyan text-sm">{locked ? 'lock' : 'verified_user'}</span>
                            <span className="text-[10px] text-ios-cyan font-black uppercase tracking-[0.2em]">{locked ? 'Terminal Locked' : 'Diagnostic Terminal'}</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase">Audit Report Generator</h3>
                        <p className="text-sm text-white/40 max-w-lg leading-relaxed">
                            {locked
                                ? 'Complete the Operational Audit Sequence to generate your board-ready transformation roadmap.'
                                : 'Compile all critical leakages and transformation roadmaps into a singular, board-ready audit document.'
                            }
                        </p>
                    </div>

                    <div className="flex items-center justify-center w-full md:w-auto">
                        <button
                            onClick={handleGenerateReport}
                            disabled={isGenerating || locked}
                            className={`flex items-center gap-3 px-12 h-[60px] rounded-2xl transition-all active:scale-95 shadow-2xl ${locked
                                ? 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                                : isGenerating
                                    ? 'bg-ios-cyan/20 text-ios-cyan cursor-wait'
                                    : 'bg-ios-cyan text-black hover:bg-ios-cyan/90 font-black'
                                }`}
                        >
                            {locked ? (
                                <>
                                    <span className="material-symbols-outlined text-lg">lock_clock</span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Locked by Protocol</span>
                                </>
                            ) : isGenerating ? (
                                <>
                                    <span className="material-symbols-outlined text-base animate-spin">sync</span>
                                    <span className="text-[10px] uppercase tracking-[0.2em]">Processing Payload...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-lg">rocket_launch</span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Generate & Download Report</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Hidden Off-Screen Layer for PDF Generation (Target width: 1200px) */}
            <div style={{ position: 'absolute', left: '-10000px', top: '0', pointerEvents: 'none' }}>
                <div
                    ref={reportRef}
                    className="w-[1200px] bg-[#0a0a0d] p-16 space-y-20 flex flex-col items-center"
                    style={{ background: '#0a0a0d', color: 'white' }}
                >
                    {/* High-Fidelity PDF Header */}
                    <div className="w-full flex justify-between items-end border-b border-white/10 pb-12 mb-12">
                        <img src="/logo.png" alt="MasterKey Labs" className="h-20 w-auto filter brightness-0 invert object-contain" style={{ WebkitFilter: 'brightness(0) invert(1)' }} />
                        <div className="text-right">
                            <h4 className="text-ios-cyan font-black tracking-widest uppercase text-xs mb-1">Diagnostic Audit Payload</h4>
                            <p className="text-3xl font-black text-white tracking-tighter uppercase">{businessName || 'Masterkey OS'}</p>
                            <p className="text-white/40 text-sm mt-1">{new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                        </div>
                    </div>

                    {/* Section 1: Executive Summary */}
                    <div className="text-center space-y-8 w-full">
                        <div className="inline-block px-6 py-2 bg-red-500/10 border border-red-500/20 rounded-full mb-4">
                            <span className="text-xs font-black tracking-[0.3em] text-red-500 uppercase">CRITICAL SYSTEM DISRUPTION DETECTED</span>
                        </div>
                        <h1 className="text-7xl font-black text-white tracking-tighter uppercase leading-none">
                            Total Annual<br />Capital Bleed
                        </h1>
                        <p className="text-[160px] font-black text-amber-500 drop-shadow-[0_0_40px_rgba(245,158,11,0.4)] tracking-tighter leading-none py-10">
                            {formatIndian(totalAnnualBleed)}
                        </p>

                        <div className="mt-12 p-8 bg-green-500/5 border border-green-500/20 rounded-3xl max-w-3xl mx-auto shadow-2xl">
                            <p className="text-xs font-black text-green-500/50 uppercase tracking-[0.3em] mb-3">RECOVERABLE POTENTIAL</p>
                            <p className="text-5xl font-black text-green-400 tracking-tight">{formatIndian(recoverablePotential)} / year</p>
                            <p className="mt-4 text-lg text-green-400/80 italic font-medium">We can reclaim 50% of this burn by deploying autonomous operational protocols.</p>
                        </div>
                    </div>

                    {/* Section 2: The 4 Leakages */}
                    <div className="w-full">
                        <div className="flex items-center gap-4 mb-10">
                            <span className="w-2.5 h-10 bg-ios-cyan rounded-full shadow-[0_0_15px_rgba(0,210,255,0.5)]"></span>
                            <h3 className="text-4xl font-black text-white uppercase tracking-widest">Diagnostic Telemetry</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-10">
                            <div className="p-10 bg-white/[0.03] border border-white/10 rounded-3xl shadow-xl">
                                <h4 className="text-sm font-black text-white/40 uppercase tracking-[0.2em] mb-6">Operational Friction</h4>
                                <p className="text-5xl font-black text-white mb-4 tracking-tighter">{formatIndian(annualOpsWaste)}</p>
                                <p className="text-lg text-white/50 leading-relaxed font-medium">
                                    Manual fragmentation is vaporizing <span className="text-amber-500 font-black">{formatIndian(annualOpsWaste)}</span>. Includes {formatIndian(staffWaste * 12)} in payroll inefficiency.
                                </p>
                            </div>

                            <div className="p-10 bg-white/[0.03] border border-purple-500/20 rounded-3xl shadow-xl">
                                <h4 className="text-sm font-black text-purple-400/60 uppercase tracking-[0.2em] mb-6">After-Hours Bleed</h4>
                                <p className="text-5xl font-black text-white mb-4 tracking-tighter">{formatIndian(annualNightLoss)}</p>
                                <p className="text-lg text-white/50 leading-relaxed font-medium">
                                    While systems sleep, you hemorrhage <span className="text-purple-400 font-black">{formatIndian(annualNightLoss)}</span> annually due to lack of 24/7 AI lead response.
                                </p>
                            </div>

                            <div className="p-10 bg-white/[0.03] border border-ios-cyan/20 rounded-3xl shadow-xl">
                                <h4 className="text-sm font-black text-ios-cyan/60 uppercase tracking-[0.2em] mb-6">Digital Invisibility</h4>
                                <p className="text-5xl font-black text-white mb-4 tracking-tighter">{formatIndian(annualVisibilityLoss)}</p>
                                <p className="text-lg text-white/50 leading-relaxed font-medium">
                                    An estimated <span className="text-ios-cyan font-black">{formatIndian(annualVisibilityLoss)}</span> (<span className="text-white font-black">{missedCustomers}</span> missed customers) is captured by local competitors.
                                </p>
                            </div>

                            <div className="p-10 bg-white/[0.03] border border-red-500/20 rounded-3xl shadow-xl">
                                <h4 className="text-sm font-black text-red-500/60 uppercase tracking-[0.2em] mb-6">AI Irrelevance Horizon</h4>
                                <p className="text-5xl font-black text-white mb-4 tracking-tighter">{extinctionHorizon} MO</p>
                                <p className="text-lg text-white/50 leading-relaxed font-medium">
                                    Window of survival: <span className="text-red-400 font-black">{extinctionHorizon} months</span> remaining before AI-native firms render your model obsolete.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Coordination Drag (Conditional) */}
                    {totalAnnualBleed > 1000000 && (
                        <div className="w-full p-12 bg-amber-500/5 border border-amber-500/20 rounded-3xl relative overflow-hidden flex items-start gap-8 shadow-inner">
                            <div className="absolute top-0 right-0 w-[400px] h-full bg-amber-500/5 blur-[100px] rounded-full"></div>
                            <span className="material-symbols-outlined text-amber-500 text-6xl mt-1">warning</span>
                            <div className="relative z-10">
                                <h4 className="text-2xl font-black text-amber-500 uppercase tracking-widest mb-4">Coordination Drag Applied</h4>
                                <p className="text-xl text-white/70 leading-relaxed font-medium">
                                    Fixing inefficiencies at this scale is technically complex. Every day of delay compounds the capital dump. Immediate architectural intervention is mandatory.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Section 4: The Survival Protocol */}
                    <div className="w-full pb-20">
                        <div className="flex items-center gap-4 mb-12">
                            <span className="w-2.5 h-10 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.5)]"></span>
                            <h3 className="text-4xl font-black text-white uppercase tracking-widest">The Survival Protocol</h3>
                        </div>
                        <div className="relative pl-12">
                            <div className="absolute left-[24px] top-[40px] bottom-[40px] w-1 bg-white/10"></div>
                            <div className="space-y-16">
                                <div className="flex gap-10">
                                    <div className="w-12 h-12 rounded-full bg-white border-2 border-green-500 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                                        <span className="text-black font-black text-lg">01</span>
                                    </div>
                                    <div className="pt-1">
                                        <h4 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Ecosystem Unification</h4>
                                        <p className="text-lg text-white/40 leading-relaxed font-medium">Consolidate fragmented tools into a singular, high-availability architecture.</p>
                                    </div>
                                </div>
                                <div className="flex gap-10">
                                    <div className="w-12 h-12 rounded-full bg-white border-2 border-ios-cyan flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(0,210,255,0.3)]">
                                        <span className="text-black font-black text-lg">02</span>
                                    </div>
                                    <div className="pt-1">
                                        <h4 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Autonomous Orchestration</h4>
                                        <p className="text-lg text-white/40 leading-relaxed font-medium">Deploy programmatic workflows and intelligent routing to eliminate manual cognitive load.</p>
                                    </div>
                                </div>
                                <div className="flex gap-10">
                                    <div className="w-12 h-12 rounded-full bg-white border-2 border-purple-500 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                                        <span className="text-black font-black text-lg">03</span>
                                    </div>
                                    <div className="pt-1">
                                        <h4 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Scale & Dominance</h4>
                                        <p className="text-lg text-white/40 leading-relaxed font-medium">Dominate local metrics and capture 24/7 inbound traffic across all digital touchpoints.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 5: Detailed Audit Telemetry */}
                    {computedData && (
                        <div className="w-full pb-10">
                            <div className="flex items-center gap-4 mb-10 w-full border-b border-white/10 pb-6">
                                <span className="w-2.5 h-10 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"></span>
                                <h3 className="text-3xl font-black text-white uppercase tracking-widest">Raw System Diagnostics</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                {/* Module 1 Breakdown */}
                                <div className="p-8 bg-[#111115] border border-white/10 rounded-2xl">
                                    <h4 className="text-xs font-black text-white/50 uppercase tracking-widest mb-6">Mod 01: Operational Waste</h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                            <span className="text-sm font-medium text-white/60">Staff/Payroll Waste</span>
                                            <span className="text-lg font-bold text-white tracking-tight">{formatIndian(staffWaste)} <span className="text-[10px] text-white/30 tracking-widest">/mo</span></span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                            <span className="text-sm font-medium text-white/60">Marketing Bleed</span>
                                            <span className="text-lg font-bold text-white tracking-tight">{formatIndian(marketingWaste)} <span className="text-[10px] text-white/30 tracking-widest">/mo</span></span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                            <span className="text-sm font-medium text-white/60">Raw Ops Overheads</span>
                                            <span className="text-lg font-bold text-white tracking-tight">{formatIndian(lossAuditData.ops_overheads || 0)} <span className="text-[10px] text-white/30 tracking-widest">/mo</span></span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2">
                                            <span className="text-sm font-medium text-amber-500/80">Coordination Drag Applied</span>
                                            <span className="text-lg font-bold text-amber-400 tracking-tight">{lossAuditData.coordination_drag || 0}x</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Module 2 Breakdown */}
                                <div className="p-8 bg-[#111115] border border-purple-500/20 rounded-2xl">
                                    <h4 className="text-xs font-black text-purple-400/50 uppercase tracking-widest mb-6">Mod 02: Night Loss</h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                            <span className="text-sm font-medium text-white/60">Missed Weekly Inquiries</span>
                                            <span className="text-lg font-bold text-white tracking-tight">{nightLossData.inquiries || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                            <span className="text-sm font-medium text-white/60">Avg Txn / LTV Velocity</span>
                                            <span className="text-lg font-bold text-white tracking-tight">{formatIndian(nightLossData.avg_transaction_value || 0)}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                            <span className="text-sm font-medium text-white/60">Est. Conversion Rate</span>
                                            <span className="text-lg font-bold text-white tracking-tight">{nightLossData.response_time === 'b2b' ? 20 : nightLossData.response_time === 'b2c' ? 25 : 23}%</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2">
                                            <span className="text-sm font-medium text-purple-400/80">Monthly Revenue Hemorrhage</span>
                                            <span className="text-lg font-bold text-purple-400 tracking-tight">{formatIndian(nightLossRevenue)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Module 3 Breakdown */}
                                <div className="p-8 bg-[#111115] border border-ios-cyan/20 rounded-2xl">
                                    <h4 className="text-xs font-black text-ios-cyan/50 uppercase tracking-widest mb-6">Mod 03: Digital Invisibility</h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                            <span className="text-sm font-medium text-white/60">Lost Local Searches</span>
                                            <span className="text-lg font-bold text-white tracking-tight">{visibilityData.missed_searches ? visibilityData.missed_searches.toLocaleString('en-IN') : 0} <span className="text-[10px] text-white/30 tracking-widest">/mo</span></span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                            <span className="text-sm font-medium text-white/60">High-Intent Missed Customers</span>
                                            <span className="text-lg font-bold text-white tracking-tight">{missedCustomers} <span className="text-[10px] text-white/30 tracking-widest">/mo</span></span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2">
                                            <span className="text-sm font-medium text-ios-cyan/80">Calculated Invisibility Score</span>
                                            <span className="text-lg font-bold text-ios-cyan tracking-tight">{100 - (visibilityData.percent || 0)}%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Module 4 Breakdown */}
                                <div className="p-8 bg-[#111115] border border-red-500/20 rounded-2xl">
                                    <h4 className="text-xs font-black text-red-500/50 uppercase tracking-widest mb-6">Mod 04: AI Threat Horizon</h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                            <span className="text-sm font-medium text-white/60">Threat Assessment Threshold</span>
                                            <span className="text-lg font-bold text-white tracking-tight uppercase">{aiThreatData.threat_level || 'UNKNOWN'}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                            <span className="text-sm font-medium text-white/60">Survival Complexity Score</span>
                                            <span className="text-lg font-bold text-white tracking-tight">{aiThreatData.score || 0}%</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                            <span className="text-sm font-medium text-white/60">Calculated Time to Live</span>
                                            <span className="text-lg font-bold text-white tracking-tight">{aiThreatData.final_horizon || (aiThreatData.years_left ? Math.round(aiThreatData.years_left * 12) : 0)} <span className="text-[10px] text-white/30 tracking-widest">MONTHS</span></span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2">
                                            <span className="text-sm font-medium text-red-400/80">Extinction Deadline Status</span>
                                            <span className="text-[11px] font-black tracking-[0.2em] text-red-500 uppercase">{aiThreatData.score > 70 ? 'CRITICAL EVASION REQ.' : 'MONITORING'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Notification Toast */}
            {notification.show && (
                <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[9999]">
                    <div className={`flex items-center gap-4 px-8 py-5 rounded-2xl border backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-fade-in ${notification.type === 'error'
                        ? 'bg-red-500/10 border-red-500/30 text-red-400'
                        : 'bg-ios-cyan/10 border-ios-cyan/30 text-ios-cyan'
                        }`}>
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${notification.type === 'error' ? 'bg-red-500/20' : 'bg-ios-cyan/20'
                            }`}>
                            <span className="material-symbols-outlined text-sm">
                                {notification.type === 'error' ? 'error' : 'check_circle'}
                            </span>
                        </div>
                        <span className="text-sm font-bold uppercase tracking-[0.1em]">{notification.message}</span>
                    </div>
                </div>
            )}
        </section>
    );
}
