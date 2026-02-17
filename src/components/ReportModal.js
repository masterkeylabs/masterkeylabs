'use client';
import { useState, useEffect } from 'react';
import { generateDiagnosticPDF } from '@/lib/pdfGenerator';
import { supabase } from '@/lib/supabaseClient';

export default function ReportModal({ isOpen, onClose, data }) {
    const [sending, setSending] = useState(false);
    const { business } = data;

    const [email, setEmail] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (business) {
            setEmail(business.email || '');
        }
    }, [business]);

    if (!isOpen) return null;

    const syncContactInfo = async () => {
        if (email !== business.email) {
            try {
                await supabase.from('businesses').update({ email }).eq('id', business.id);
            } catch (err) {
                console.error('Failed to sync contact info:', err);
            }
        }
    };

    const handleDownload = async () => {
        await syncContactInfo();
        const doc = generateDiagnosticPDF({ ...data, business: { ...business, email } });
        doc.save(`Diagnostic_Report_${business?.entity_name || 'Business'}.pdf`);
    };

    const handleEmail = async () => {
        setSending(true);
        await syncContactInfo();

        try {
            const doc = generateDiagnosticPDF({ ...data, business: { ...business, email } });
            // Get base64 content
            const dataUri = doc.output('datauristring');
            const pdfBase64 = dataUri.split(',')[1];

            const response = await fetch('/api/send-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    businessName: business?.entity_name || 'Business',
                    pdfBase64,
                    contactPhone: business?.phone // Keep static phone from business for email body
                }),
            });

            // Check if response is JSON
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const result = await response.json();
                if (response.ok) {
                    alert(`Report successfully sent to ${email}`);
                    onClose();
                } else {
                    throw new Error(result.error || 'Failed to send email');
                }
            } else {
                const text = await response.text();
                console.error('Non-JSON response:', text);
                throw new Error('Server returned an invalid response (not JSON). Please check if RESEND_API_KEY is configured.');
            }
        } catch (err) {
            console.error('Email export failed:', err);
            alert(`Error: ${err.message}`);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="glass rounded-2xl md:rounded-[2rem] p-6 md:p-8 max-w-lg w-full border border-primary/20 relative shadow-[0_0_50px_rgba(0,229,255,0.1)]">
                <button onClick={onClose} className="absolute top-4 right-4 md:top-6 md:right-6 text-white/40 hover:text-white transition-colors">
                    <span className="material-symbols-outlined">close</span>
                </button>

                <div className="text-center mb-6">
                    <div className="size-12 md:size-16 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center text-primary mx-auto mb-4 border border-primary/20">
                        <span className="material-symbols-outlined text-3xl md:text-4xl">picture_as_pdf</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight">Export Diagnostic Report</h3>
                    <p className="text-slate-400 text-[12px] md:text-sm">Verify your email address before exporting.</p>
                </div>

                {/* Contact Verification Section */}
                <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Verify Recipient Details</span>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="text-[10px] font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest"
                        >
                            {isEditing ? 'Done' : 'Edit Info'}
                        </button>
                    </div>
                    <div className="space-y-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-white/30 uppercase ml-1">Email Address</label>
                            {isEditing ? (
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 outline-none w-full"
                                />
                            ) : (
                                <p className="text-sm text-white px-3 py-2 bg-white/5 rounded-lg border border-transparent">{email}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Download Option */}
                    <button onClick={handleDownload} className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all group">
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">download</span>
                            <div className="text-left">
                                <p className="text-xs font-bold text-white uppercase tracking-widest">Download PDF</p>
                                <p className="text-[10px] text-white/40">Offline access for records</p>
                            </div>
                        </div>
                        <span className="material-symbols-outlined text-white/20 group-hover:text-primary transition-colors">chevron_right</span>
                    </button>

                    {/* Email Option */}
                    <button onClick={handleEmail} disabled={sending} className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-premium-gold/50 hover:bg-premium-gold/5 transition-all group disabled:opacity-50">
                        <div className="flex items-center gap-4">
                            <span className={`material-symbols-outlined text-premium-gold group-hover:scale-110 transition-transform ${sending ? 'animate-spin' : ''}`}>
                                {sending ? 'sync' : 'mail'}
                            </span>
                            <div className="text-left">
                                <p className="text-xs font-bold text-white uppercase tracking-widest">{sending ? 'Sending...' : 'Send to Email'}</p>
                                <p className="text-[10px] text-white/40">Dispatch summary to inbox</p>
                            </div>
                        </div>
                        <span className="material-symbols-outlined text-white/20 group-hover:text-premium-gold transition-colors">chevron_right</span>
                    </button>
                </div>

                <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-3 text-white/30">
                    <span className="material-symbols-outlined text-xs">info</span>
                    <p className="text-[10px] leading-tight">Reports reflect your latest diagnostic scores and market delta insights.</p>
                </div>
            </div>
        </div>
    );
}
