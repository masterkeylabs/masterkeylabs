'use client';

import React, { useRef, useState } from 'react';
import { useDiagnosticStore } from '@/store/diagnosticStore';
import { formatIndian } from '@/utils/formatIndian';

export default function ComprehensiveReportInline({ businessName, locked, t }) {
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
            showNotify(t.dashboard.auditSummary.lockedTitle || 'Audit Terminal is Locked. Please complete all 4 modules to unlock the Comprehensive Report.', 'error');
            return;
        }

        // Enforce all modules completion check using the actual stored objects
        const { lossAudit, nightLoss, missedCustomers, aiThreat } = useDiagnosticStore.getState();

        if (!lossAudit?.created_at || !nightLoss?.created_at || !missedCustomers?.created_at || !aiThreat?.created_at) {
            showNotify(t.dashboard.health.partial || 'Please complete all 4 audit modules (Operational Waste, Night Loss, Visibility, AI Threat) before generating the final report.', 'error');
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
    
    // Safely map translation sub-tree for the report
    const ts = t?.dashboard?.auditSummary?.report || {};

    const waMessage = `Hi Masterkey Labs, I just generated my Comprehensive Audit Report. My Total Annual Bleed is ${formatIndian(totalAnnualBleed)}. I need to deploy the Survival Protocol and fix my operations.`;
    const waLink = `https://wa.me/919920808365?text=${encodeURIComponent(waMessage)}`;

    const replacePlaceholders = (str, data = {}) => {
        if (!str) return '';
        let result = str;
        Object.keys(data).forEach(key => {
            result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), data[key]);
        });
        return result;
    };

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
                        </div>                        <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase">{t.dashboard.auditSummary.report.generatorTitle}</h3>
                        <p className="text-sm text-white/40 max-w-lg leading-relaxed">
                            {locked
                                ? t.dashboard.auditSummary.report.lockedSubtitle
                                : t.dashboard.auditSummary.report.unlockedSubtitle
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
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t.dashboard.auditSummary.report.btnLocked}</span>
                                </>
                            ) : isGenerating ? (
                                <>
                                    <span className="material-symbols-outlined text-base animate-spin">sync</span>
                                    <span className="text-[10px] uppercase tracking-[0.2em]">{t.dashboard.auditSummary.report.btnProcessing}</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-lg">rocket_launch</span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t.dashboard.auditSummary.report.btnGenerate}</span>
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
                    className="w-[800px] bg-[#0a0a0d] p-12 space-y-16 flex flex-col items-center"
                    style={{ background: '#0a0a0d', color: 'white', fontFamily: 'Inter, sans-serif' }}
                >
                    {/* Header: Confidential Watermark & Branding */}
                    <div className="w-full flex justify-between items-start border-b border-white/10 pb-12 mb-12 relative">
                        <div className="absolute top-[-40px] left-0 text-[10px] font-black tracking-[0.5em] text-white/10 uppercase">
                            CONFIDENTIAL BUSINESS REPORT // ST-0422 // {new Date().getFullYear()}
                        </div>
                        <div className="flex flex-col gap-4">
                            <img src="/logo.png" alt="MasterKey Labs" className="h-40 w-auto filter brightness-0 invert object-contain" style={{ WebkitFilter: 'brightness(0) invert(1)' }} />
                            <div className="px-4 py-1 bg-ios-cyan text-[10px] font-black uppercase tracking-widest text-black inline-block w-fit rounded-full">
                                Verified Report
                            </div>
                        </div>
                        <div className="text-right flex-1">
                             <h4 className="text-ios-cyan font-black tracking-[0.3em] uppercase text-[10px] mb-2">Audit Details</h4>
                            <p className="text-4xl font-black text-white tracking-tighter uppercase">{businessName || 'Your Business'}</p>
                            <p className="text-white/40 text-sm mt-1">{new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                        </div>
                    </div>

                    {/* Section 1: The Executive Letter (Authority & Trust) */}
                    <div className="w-full max-w-5xl bg-white/[0.02] border border-white/10 rounded-[60px] p-16 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-ios-blue/5 blur-[120px] rounded-full -z-10 translate-x-1/4 -translate-y-1/4"></div>
                        
                        <div className="flex items-center gap-4 mb-10">
                            <span className="w-10 h-[2px] bg-ios-cyan"></span>
                            <h3 className="text-ios-cyan font-black tracking-[0.4em] text-sm uppercase">{ts.architectNote?.title || 'Note from MasterKey Labs'}</h3>
                        </div>

                        <div className="space-y-10 text-2xl leading-relaxed text-white/70 font-medium">
                            <p className="first-letter:text-5xl first-letter:font-black first-letter:text-white first-letter:mr-3 first-letter:float-left">
                                {ts.architectNote?.p1 || 'Your current systems are working, but they are expensive.'}
                            </p>
                            <p>
                                {ts.architectNote?.p2 || 'Every month, your operations "bleed" capital because of human friction and missed timing. This report mapping your vulnerabilities is the first step toward reclaiming that capital.'}
                            </p>
                            <p>
                                {ts.architectNote?.p3 || 'Use this intelligence to protect your profit margins and prepare for the next leap in autonomous business efficiency.'}
                            </p>
                            
                            <div className="pt-8 border-t border-white/5 flex justify-between items-center">
                                <div>
                                    <p className="text-white text-2xl font-black italic tracking-tighter">{ts.architectNote?.sign || 'MasterKey Labs OS'}</p>
                                    <p className="text-[10px] text-white/30 tracking-[0.3em] uppercase mt-1">{ts.architectNote?.role || 'Founders, MasterKey Labs'}</p>
                                </div>
                                <div className="opacity-20 grayscale">
                                    <img src="/logo.png" alt="Signature" className="h-16 w-auto filter invert" />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Section 2: Annual Money Loss (The "Ouch" Factor) */}
                    <div className="text-center space-y-8 w-full py-16 px-12 bg-gradient-to-b from-white/[0.03] to-transparent rounded-[60px] border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
                        
                        <div className="inline-flex items-center gap-2 px-8 py-3 bg-red-500/10 border border-red-500/30 rounded-full mb-4">
                            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]"></span>
                            <span className="text-sm font-black tracking-[0.4em] text-red-500 uppercase">{ts.criticalBadge || 'HIGH COST WARNING'}</span>
                        </div>
                        
                        <h2 className="text-4xl font-black text-white/40 tracking-[0.3em] uppercase">{ts.annualBleed || 'TOTAL ANNUAL BLEED'}</h2>
                        
                        <div className="relative py-6 w-full flex justify-center">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-red-500/5 blur-[100px] rounded-full"></div>
                            <p className="text-[130px] font-black text-white drop-shadow-[0_0_60px_rgba(255,255,255,0.1)] tracking-tighter leading-none relative z-10 whitespace-nowrap">
                                {formatIndian(totalAnnualBleed)}
                            </p>
                        </div>

                        <div className="max-w-4xl mx-auto grid grid-cols-1 gap-8">
                            <div className="p-10 bg-gradient-to-br from-green-500/[0.08] to-transparent border border-green-500/20 rounded-[40px] shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-10">
                                    <span className="material-symbols-outlined text-green-500 text-6xl font-light">verified</span>
                                </div>
                                <div className="text-left relative z-10">
                                    <p className="text-[10px] font-black text-green-500 tracking-[0.4em] mb-3 uppercase">ESTIMATED SAVINGS</p>
                                    <div className="flex items-baseline gap-3">
                                        <p className="text-6xl font-black text-green-400 tracking-tight">{formatIndian(recoverablePotential)}</p>
                                        <p className="text-xl text-green-500/40 font-bold uppercase tracking-widest">Yearly Gain</p>
                                    </div>
                                    <p className="mt-4 text-xl text-green-400/70 font-medium leading-relaxed">
                                        {ts.recoverableLegend || 'A 50% efficiency recovery is immediately possible through simple automation.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: The 4 Leakages (Simplified & Professional) */}
                    <div className="w-full pt-16">
                        <div className="flex items-center justify-between mb-16 border-l-4 border-ios-cyan pl-8">
                            <div>
                                <h3 className="text-5xl font-black text-white uppercase tracking-tighter">{ts.telemetryTitle || 'Business Evaluation'}</h3>
                                <p className="text-white/40 text-xl mt-2 font-medium tracking-wide italic">Full Business Analysis // V2.1</p>
                            </div>
                            <div className="text-right">
                                <span className="text-ios-cyan font-black text-sm tracking-[0.5em] uppercase">Status: Critical</span>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-8">
                            {/* Leakage 1 */}
                            <div className="p-12 bg-white/[0.02] border border-white/10 rounded-[50px] relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-2 h-full bg-ios-blue opacity-50"></div>
                                <h4 className="text-xs font-black text-ios-blue tracking-[0.4em] mb-8 uppercase flex items-center gap-3">
                                    <span className="w-8 h-[1px] bg-ios-blue/30"></span>
                                    01 // {ts.opsFriction || 'Unnecessary Costs'}
                                </h4>
                                <p className="text-6xl font-black text-white mb-6 tracking-tighter">{formatIndian(annualOpsWaste)}</p>
                                <p className="text-xl text-white/50 leading-relaxed font-medium">
                                    {replacePlaceholders(ts.staffWaste, { amount: formatIndian(staffWaste * 12) })}
                                </p>
                            </div>

                            {/* Leakage 2 */}
                            <div className="p-12 bg-white/[0.02] border border-white/10 rounded-[50px] relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-2 h-full bg-purple-500 opacity-50"></div>
                                <h4 className="text-xs font-black text-purple-400 tracking-[0.4em] mb-8 uppercase flex items-center gap-3">
                                    <span className="w-8 h-[1px] bg-purple-500/30"></span>
                                    02 // {ts.afterHoursBleed || 'Nightly Losses'}
                                </h4>
                                <p className="text-6xl font-black text-white mb-6 tracking-tighter">{formatIndian(annualNightLoss)}</p>
                                <p className="text-xl text-white/50 leading-relaxed font-medium">
                                    {replacePlaceholders(ts.nightLossDesc, { amount: formatIndian(annualNightLoss) })}
                                </p>
                            </div>

                            {/* Leakage 3 */}
                            <div className="p-12 bg-white/[0.02] border border-white/10 rounded-[50px] relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-2 h-full bg-ios-cyan opacity-50"></div>
                                <h4 className="text-xs font-black text-ios-cyan tracking-[0.4em] mb-8 uppercase flex items-center gap-3">
                                    <span className="w-8 h-[1px] bg-ios-cyan/30"></span>
                                    03 // {ts.digitalInvisibility || 'Low Online Presence'}
                                </h4>
                                <p className="text-6xl font-black text-white mb-6 tracking-tighter">{formatIndian(annualVisibilityLoss)}</p>
                                <p className="text-xl text-white/50 leading-relaxed font-medium">
                                    {replacePlaceholders(ts.visibilityDesc, { 
                                        amount: formatIndian(annualVisibilityLoss),
                                        count: missedCustomers
                                    })}
                                </p>
                            </div>

                            {/* Leakage 4 */}
                            <div className="p-12 bg-white/[0.02] border border-white/10 rounded-[50px] relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-2 h-full bg-red-500 opacity-50"></div>
                                <h4 className="text-xs font-black text-red-500 tracking-[0.4em] mb-8 uppercase flex items-center gap-3">
                                    <span className="w-8 h-[1px] bg-red-500/30"></span>
                                    04 // {ts.aiThreatHorizon || 'AI Risk Time'}
                                </h4>
                                <p className="text-6xl font-black text-white mb-6 tracking-tighter">{extinctionHorizon} <span className="text-2xl text-white/30 font-medium">Months</span></p>
                                <p className="text-xl text-white/50 leading-relaxed font-medium">
                                    {replacePlaceholders(ts.aiLossDesc, { amount: extinctionHorizon })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: The Survival Protocol Roadmap (New) */}
                    <div className="w-full pt-16">
                        <div className="flex items-center gap-6 mb-16">
                            <div className="w-16 h-16 rounded-2xl bg-ios-cyan flex items-center justify-center">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 3L4 9V21H20V9L12 3ZM12 7.7L18.1 12.3V19.1H5.9V12.3L12 7.7Z" fill="black"/>
                                    <path d="M9 14.5H15V16H9V14.5Z" fill="black"/>
                                </svg>
                            </div>
                            <h3 className="text-5xl font-black text-white uppercase tracking-tighter">{ts.protocolTitle || 'Growth Roadmap'}</h3>
                        </div>

                        <div className="space-y-8">
                            <div className="flex gap-10">
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-ios-cyan text-black flex items-center justify-center font-black text-lg">1</div>
                                    <div className="w-[2px] h-full bg-white/10 mt-4"></div>
                                </div>
                                <div className="pb-12">
                                    <h4 className="text-2xl font-black text-white mb-3 uppercase tracking-wide">{ts.protocol01Title || 'Better Setup'}</h4>
                                    <p className="text-xl text-white/40 leading-relaxed max-w-4xl font-medium">
                                        {ts.protocol01Desc || 'Map current unorganized data and deploy a singular technical hub to eliminate coordination drag.'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-10">
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full border-2 border-ios-cyan text-ios-cyan flex items-center justify-center font-black text-lg">2</div>
                                    <div className="w-[2px] h-full bg-white/10 mt-4"></div>
                                </div>
                                <div className="pb-12">
                                    <h4 className="text-2xl font-black text-white mb-3 uppercase tracking-wide">{ts.protocol02Title || 'Starting Automation'}</h4>
                                    <p className="text-xl text-white/40 leading-relaxed max-w-4xl font-medium">
                                        {ts.protocol02Desc || 'Automate high-friction tasks (Customer Support, Leads, Ops) using dedicated AI agents to reclaim capital.'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-10">
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full border-2 border-white/20 text-white/40 flex items-center justify-center font-black text-lg">3</div>
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-white/40 mb-3 uppercase tracking-wide">{ts.protocol03Title || 'Scale & Market Dominance'}</h4>
                                    <p className="text-xl text-white/20 leading-relaxed max-w-4xl font-medium">
                                        {ts.protocol03Desc || 'Ramp-up visibility signals and dominate local search volume through programmatic SEO and 24/7 responsiveness.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 5: Call to Action (The Hook) */}
                    <div className="w-full bg-gradient-to-br from-[#007AFF] to-[#5856D6] p-16 rounded-[60px] text-center space-y-8 mt-16 shadow-[0_40px_100px_-20px_rgba(0,122,255,0.4)] relative overflow-hidden border border-white/20">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                        <h2 className="text-5xl font-black text-white tracking-widest uppercase leading-[1.1] relative z-10">
                            {ts.cta?.title || 'STOP THE BLEED'}
                        </h2>
                        <p className="text-2xl text-white/80 font-medium max-w-2xl mx-auto leading-relaxed relative z-10">
                            {ts.cta?.sub || 'Don\'t deal with these losses alone. Map your custom transformation path today.'}
                        </p>
                        <div className="pt-8 flex flex-col items-center gap-6 relative z-10">
                            <a 
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-16 py-6 bg-white text-black rounded-[24px] text-2xl font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-transform inline-block"
                            >
                                {ts.cta?.btn || 'Book Review'}
                            </a>
                            <p className="text-white/60 text-[10px] tracking-[0.4em] font-black uppercase">{ts.cta?.footer || 'CONFIRM YOUR SLOT AT MASTERKEYLABS.AI'}</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="w-full flex justify-between items-center text-white/20 text-[10px] font-black tracking-widest uppercase pt-10">
                        <span>MasterKey intelligence protocol v2.0</span>
                        <span>CONFIDENTIAL - FOR AUTHORIZED USE ONLY</span>
                    </div>
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
