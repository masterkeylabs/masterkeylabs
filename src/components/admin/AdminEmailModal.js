"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminEmailModal({ user, isOpen, onClose }) {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState(null); // 'success', 'error'

    if (!user) return null;

    const handleSend = async (e) => {
        e.preventDefault();
        setSending(true);
        setStatus(null);

        try {
            const response = await fetch('/api/admin/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    businessName: user.entity_name,
                    subject,
                    message
                })
            });

            const data = await response.json();
            if (data.success) {
                setStatus('success');
                setTimeout(() => {
                    onClose();
                    setSubject('');
                    setMessage('');
                    setStatus(null);
                }, 2000);
            } else {
                throw new Error(data.error || 'Failed to send email');
            }
        } catch (error) {
            console.error('Email Send Error:', error);
            setStatus('error');
        } finally {
            setSending(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background-dark/80 backdrop-blur-md"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg glass border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden"
                    >
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">Direct Transmission</h2>
                                <p className="text-white/40 text-[10px] font-bold tracking-widest uppercase mt-1">Target: {user.email}</p>
                            </div>
                            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSend} className="p-8 space-y-6">
                            {status === 'success' && (
                                <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-primary text-xs font-bold text-center animate-pulse">
                                    TRANSMISSION SUCCESSFUL
                                </div>
                            )}
                            {status === 'error' && (
                                <div className="p-4 bg-alert-red/10 border border-alert-red/20 rounded-xl text-alert-red text-xs font-bold text-center">
                                    TRANSMISSION FAILED
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Subject Header</label>
                                <input
                                    required
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Enter encrypted subject..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-primary/50 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Message Body</label>
                                <textarea
                                    required
                                    rows={6}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Enter your message here..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-primary/50 text-sm resize-none"
                                />
                            </div>

                            <button
                                disabled={sending || status === 'success'}
                                className="w-full py-4 bg-primary hover:bg-cyan-400 text-background-dark rounded-xl font-black text-xs tracking-widest uppercase transition-all glow-cyan flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {sending ? (
                                    <div className="w-5 h-5 border-2 border-background-dark/30 border-t-background-dark rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span>INITIATE DISPATCH</span>
                                        <span className="material-symbols-outlined text-lg">send</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
