'use client';

import React, { useRef, useState } from 'react';
import { useDiagnosticStore } from '@/store/diagnosticStore';
import { formatIndian } from '@/utils/formatIndian';

export default function ComprehensiveReportInline({ businessName }) {
    const reportRef = useRef();
    const [emailTarget, setEmailTarget] = useState('');
    const [isEmailing, setIsEmailing] = useState(false);
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

    const handleEmailExport = async () => {
        if (!emailTarget.trim() || !emailTarget.includes('@')) {
            showNotify('Please enter a valid email address.', 'error');
            return;
        }

        setIsEmailing(true);
        try {
            // Generate the PDF completely in the background (returns pure base64)
            const pdfBase64 = await generatePdfBase64();

            // Send base64 payload to the rewritten tracking endpoint
            const res = await fetch('/api/export-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: emailTarget.trim(),
                    pdfBase64: pdfBase64,
                    businessName: businessName || 'Masterkey'
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to dispatch email');
            }

            showNotify(`Email sent successfully! Report dispatched to ${emailTarget}`);
            setEmailTarget(''); // Reset input
        } catch (error) {
            console.error('Email export failed:', error);
            showNotify(error.message || 'Failed to dispatch email', 'error');
        } finally {
            setIsEmailing(false);
        }
    };

    const handleDownload = async () => {
        if (typeof window === 'undefined') return;

        try {
            // Because generatePdfBase64 returns a pure base64 string without data: prefix
            const pdfBase64 = await generatePdfBase64();

            // Create a downloadable link explicitly
            const link = document.createElement('a');
            link.href = `data:application/pdf;base64,${pdfBase64}`;
            link.download = `${businessName || 'Masterkey'}_Audit_Report.pdf`;

            // Trigger browser download and cleanup
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            showNotify('Failed to generate PDF document.', 'error');
        }
    };

    const {
        opsWaste,
        staffWaste,
        marketingWaste,
        nightLossRevenue,
        missedCustomers,
        extinctionHorizon,
        totalAnnualBleed,
    } = useDiagnosticStore();

    const annualOpsWaste = opsWaste * 12;
    const annualNightLoss = nightLossRevenue * 12;
    const annualVisibilityLoss = missedCustomers * 1500 * 12; // Assuming 1500 INR/customer value
    const recoverablePotential = totalAnnualBleed * 0.5;

    const waMessage = `Hi Masterkey Labs, I just generated my Comprehensive Audit Report. My Total Annual Bleed is ₹${formatIndian(totalAnnualBleed)}. I need to deploy the Survival Protocol and fix my operations.`;
    const waLink = `https://wa.me/919920808365?text=${encodeURIComponent(waMessage)}`; // Using a placeholder number for the example, please update if needed

    return (
        <section className="animate-fade-in opacity-0 w-full mt-4" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
            <div className="relative w-full bg-[#0a0a0d] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">

                {/* Header with Actions */}
                <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/[0.02] z-10">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="MasterKey Labs" className="h-16 w-auto filter brightness-0 invert object-contain" style={{ WebkitFilter: 'brightness(0) invert(1)' }} />
                    </div>
                    <div className="flex items-center gap-4">
                        {/* New Email Input & Trigger */}
                        <div className="flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden h-[42px]">
                            <input
                                type="email"
                                placeholder="Enter email address"
                                value={emailTarget}
                                onChange={(e) => setEmailTarget(e.target.value)}
                                className="bg-transparent text-white px-4 py-2 text-sm outline-none placeholder:text-white/30 w-48"
                                disabled={isEmailing}
                            />
                            <button
                                onClick={handleEmailExport}
                                disabled={isEmailing}
                                className={`flex items-center gap-2 px-4 h-full border-l border-white/10 transition-colors ${isEmailing ? 'bg-ios-cyan/20 text-ios-cyan cursor-wait' : 'bg-ios-cyan text-black hover:bg-ios-cyan/80'
                                    }`}
                            >
                                {isEmailing ? (
                                    <>
                                        <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                                        <span className="text-xs font-bold uppercase tracking-wider">Sending...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-sm">send</span>
                                        <span className="text-xs font-bold uppercase tracking-wider">Email PDF</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Existing Download Action */}
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">download</span>
                            <span className="text-xs font-bold uppercase tracking-wider">Download PDF</span>
                        </button>
                    </div>
                </div>

                {/* Scrollable Report Content */}
                <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-16" ref={reportRef}>

                    {/* Section 1: Executive Summary */}
                    <div className="text-center space-y-6">
                        <div className="inline-block px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full mb-4">
                            <span className="text-[10px] font-black tracking-[0.2em] text-red-500 uppercase">CRITICAL SYSTEM DIAGNOSIS</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase">
                            Total Annual Bleed
                        </h1>
                        <p className="text-10xl md:text-8xl font-black text-amber-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.3)] tracking-tighter">
                            {formatIndian(totalAnnualBleed)}
                        </p>

                        <div className="mt-8 p-6 bg-green-500/5 border border-green-500/20 rounded-2xl max-w-2xl mx-auto">
                            <p className="text-sm font-bold text-green-500/50 uppercase tracking-widest mb-2">RECOVERABLE POTENTIAL</p>
                            <p className="text-3xl font-black text-green-400">{formatIndian(recoverablePotential)} / year</p>
                            <p className="mt-3 text-sm text-green-400/80 italic">We can save 50% of your current losses by automating critical workflows.</p>
                        </div>
                    </div>

                    {/* Section 2: The 4 Leakages */}
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <span className="w-1.5 h-6 bg-ios-cyan rounded-full"></span>
                            <h3 className="text-2xl font-bold text-white uppercase tracking-wider">Diagnostic Telemetry</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                                <h4 className="text-xs font-black text-white/40 uppercase tracking-widest mb-4">Operational Friction</h4>
                                <p className="text-3xl font-bold text-white mb-2">{formatIndian(annualOpsWaste)}</p>
                                <p className="text-sm text-white/50 leading-relaxed">
                                    Redundant manual data entry and software fragmentation are vaporizing <span className="text-amber-500 font-bold">{formatIndian(annualOpsWaste)}</span> annually. This includes {formatIndian(staffWaste * 12)} in sheer payroll inefficiency.
                                </p>
                            </div>

                            <div className="p-6 bg-white/[0.02] border border-purple-500/10 rounded-2xl">
                                <h4 className="text-xs font-black text-purple-400/60 uppercase tracking-widest mb-4">After-Hours Bleed</h4>
                                <p className="text-3xl font-bold text-white mb-2">{formatIndian(annualNightLoss)}</p>
                                <p className="text-sm text-white/50 leading-relaxed">
                                    While operations sleep, you hemorrhage <span className="text-purple-400 font-bold">{formatIndian(annualNightLoss)}</span> annually due to the absence of autonomous, 24/7 AI response protocols for inbound leads.
                                </p>
                            </div>

                            <div className="p-6 bg-white/[0.02] border border-ios-cyan/10 rounded-2xl">
                                <h4 className="text-xs font-black text-ios-cyan/60 uppercase tracking-widest mb-4">Digital Invisibility</h4>
                                <p className="text-3xl font-bold text-white mb-2">{formatIndian(annualVisibilityLoss)}</p>
                                <p className="text-sm text-white/50 leading-relaxed">
                                    An estimated <span className="text-ios-cyan font-bold">{formatIndian(annualVisibilityLoss)}</span> (<span className="text-white font-bold">{missedCustomers}</span> missed prospects) within your geo-fenced radius is currently being captured by optimized competitors.
                                </p>
                            </div>

                            <div className="p-6 bg-white/[0.02] border border-red-500/10 rounded-2xl">
                                <h4 className="text-xs font-black text-red-500/60 uppercase tracking-widest mb-4">AI Extinction Threat</h4>
                                <p className="text-3xl font-bold text-white mb-2">{extinctionHorizon} MO</p>
                                <p className="text-sm text-white/50 leading-relaxed">
                                    Market irrelevance horizon: <span className="text-red-400 font-bold">{extinctionHorizon} months</span> remaining before fully AI-native competitors render your legacy operational models obsolete.
                                </p>
                            </div>

                        </div>
                    </div>

                    {/* Section 3: Coordination Drag (Conditional) */}
                    {totalAnnualBleed > 1000000 && (
                        <div className="p-8 bg-amber-500/5 border border-amber-500/20 rounded-3xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none"></div>
                            <div className="flex items-start gap-4 relative z-10">
                                <span className="material-symbols-outlined text-amber-500 text-4xl mt-1">warning</span>
                                <div>
                                    <h4 className="text-lg font-black text-amber-500 uppercase tracking-widest mb-2">Coordination Drag Applied</h4>
                                    <p className="text-white/70 leading-relaxed">
                                        Fixing inefficiencies at this scale becomes increasingly expensive. Every day of delay compounds your losses. Immediate intervention is required to stabilize operations.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section 4: The Survival Protocol */}
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
                            <h3 className="text-2xl font-bold text-white uppercase tracking-wider">The Survival Protocol</h3>
                        </div>
                        <div className="relative">
                            <div className="absolute left-[15px] top-[24px] bottom-[24px] w-0.5 bg-white/10 z-0"></div>
                            <div className="space-y-8 relative z-10">

                                <div className="flex gap-6">
                                    <div className="w-8 h-8 rounded-full bg-[#0a0a0d] border-2 border-green-500 flex items-center justify-center flex-shrink-0">
                                        <span className="text-green-500 font-bold text-xs">01</span>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white mb-1">Ecosystem Unification</h4>
                                        <p className="text-sm text-white/40">Consolidate fragmented, legacy tools into a singular, high-availability architecture.</p>
                                    </div>
                                </div>

                                <div className="flex gap-6">
                                    <div className="w-8 h-8 rounded-full bg-[#0a0a0d] border-2 border-ios-cyan flex items-center justify-center flex-shrink-0">
                                        <span className="text-ios-cyan font-bold text-xs">02</span>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white mb-1">Autonomous Systems</h4>
                                        <p className="text-sm text-white/40">Deploy intelligent routing and programmatic workflows to instantly eliminate manual cognitive load.</p>
                                    </div>
                                </div>

                                <div className="flex gap-6">
                                    <div className="w-8 h-8 rounded-full bg-[#0a0a0d] border-2 border-purple-500 flex items-center justify-center flex-shrink-0">
                                        <span className="text-purple-500 font-bold text-xs">03</span>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white mb-1">Performance & Visibility Scaling</h4>
                                        <p className="text-sm text-white/40">Dominate local search metrics and capture 24/7 inbound lead traffic.</p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* TASK 3: The Ultimate CTA */}
                    <div className="mt-16 pt-16 border-t border-white/10 text-center space-y-8 pb-12">
                        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
                            Stop the Capital Bleed.<br />
                            <span className="text-ios-cyan">Claim Your Unfair Advantage.</span>
                        </h2>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-6 max-w-3xl mx-auto mt-10">
                            {/* Primary CTA */}
                            <a
                                href="https://calendly.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full md:w-auto px-8 py-5 bg-white text-black text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                            >
                                Build Survival Protocol <span className="opacity-50 ml-2">(Book Architect)</span>
                            </a>

                            {/* Secondary CTA (WhatsApp) */}
                            <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full md:w-auto px-8 py-5 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-[#25D366]/20 transition-all flex items-center justify-center gap-3"
                            >
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.711.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" /></svg>
                                Speak to an Expert Now
                            </a>
                        </div>
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
