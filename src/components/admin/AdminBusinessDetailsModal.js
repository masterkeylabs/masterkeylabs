"use client";
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminBusinessDetailsModal({ business, isOpen, onClose }) {
    if (!business) return null;

    const auditResults = {
        lossAudit: business.loss_audit_results?.[0] || null,
        aiThreat: business.ai_threat_results?.[0] || null,
        nightLoss: business.night_loss_results?.[0] || null,
        missedCustomers: business.visibility_results?.[0] || null
    };

    const formatCurrency = (val) => {
        if (!val) return '₹0';
        if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
        if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
        return `₹${val}`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
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
                        className="relative w-full max-w-4xl max-h-[90vh] glass border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight uppercase">{business.entity_name}</h2>
                                <p className="text-white/40 text-xs font-bold tracking-[0.2em] uppercase mt-1">Terminal ID: {business.id.slice(0, 8)}</p>
                            </div>
                            <button 
                                onClick={onClose}
                                className="size-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors group"
                            >
                                <span className="material-symbols-outlined text-white/40 group-hover:text-white transition-colors">close</span>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Entity Information */}
                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">info</span>
                                        Base Intelligence
                                    </h3>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                            <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Location</p>
                                            <p className="text-sm font-bold text-white">{business.location || 'Unknown Node'}</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                            <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Sector</p>
                                            <p className="text-sm font-bold text-white capitalize">{business.classification?.replace('_', ' ') || 'Unclassified'}</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                            <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Revenue Tier</p>
                                            <p className="text-sm font-bold text-white">{business.revenue_tier || 'N/A'}</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                            <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Employee Count</p>
                                            <p className="text-sm font-bold text-white">{business.employees || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">Email</span>
                                            <span className="text-sm font-medium text-white">{business.email || '—'}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">Phone</span>
                                            <span className="text-sm font-medium text-white">{business.phone || '—'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Threat Assessment */}
                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-alert-red flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">security</span>
                                        Threat Assessment
                                    </h3>

                                    <div className={`p-6 rounded-3xl border ${
                                        auditResults.aiThreat?.threat_level === 'KHATRA' ? 'bg-alert-red/5 border-alert-red/20' :
                                        auditResults.aiThreat?.threat_level === 'SAVDHAN' ? 'bg-alert-orange/5 border-alert-orange/20' :
                                        'bg-primary/5 border-primary/20'
                                    }`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">AI Risk Status</p>
                                                <p className={`text-2xl font-black ${
                                                    auditResults.aiThreat?.threat_level === 'KHATRA' ? 'text-alert-red' :
                                                    auditResults.aiThreat?.threat_level === 'SAVDHAN' ? 'text-alert-orange' :
                                                    'text-primary'
                                                }`}>
                                                    {auditResults.aiThreat?.threat_level || 'PENDING'}
                                                </p>
                                            </div>
                                            <div className="size-16 rounded-full border-4 border-white/5 flex items-center justify-center">
                                                <span className="text-xl font-black text-white">{auditResults.aiThreat?.score || 0}%</span>
                                            </div>
                                        </div>
                                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-1000 ${
                                                    auditResults.aiThreat?.threat_level === 'KHATRA' ? 'bg-alert-red' :
                                                    auditResults.aiThreat?.threat_level === 'SAVDHAN' ? 'bg-alert-orange' :
                                                    'bg-primary'
                                                }`}
                                                style={{ width: `${auditResults.aiThreat?.score || 0}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                            <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Operational Bleed</p>
                                            <p className="text-xl font-black text-white">{formatCurrency(auditResults.lossAudit?.total_burn)}/mo</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                            <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Night Bleed</p>
                                            <p className="text-xl font-black text-white">{formatCurrency(auditResults.nightLoss?.total_loss)}/mo</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Visibility Audit */}
                                <div className="md:col-span-2 space-y-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">visibility</span>
                                        Visibility & Customer Leakage
                                    </h3>
                                    
                                    <div className="glass-light rounded-2xl p-6 border border-white/5">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                                            <div>
                                                <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Missed Customers</p>
                                                <p className="text-3xl font-black text-white">{auditResults.missedCustomers?.missed_customers || 0}</p>
                                                <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-1">Per Month</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Revenue Impact</p>
                                                <p className="text-3xl font-black text-cyan-400">{formatCurrency(auditResults.missedCustomers?.annual_loss / 12)}</p>
                                                <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-1">Lost Opportunity/Mo</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Confidence Score</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase ${
                                                        auditResults.missedCustomers?.confidence === 'HIGH' ? 'bg-primary/20 text-primary' : 'bg-alert-orange/20 text-alert-orange'
                                                    }`}>
                                                        {auditResults.missedCustomers?.confidence || 'UNKNOWN'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-8 border-t border-white/5 bg-white/[0.01] flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-white/20 uppercase font-bold tracking-widest">Terminal Registered</span>
                                    <span className="text-xs font-mono text-white/40">{new Date(business.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                                </div>
                            </div>
                            <button 
                                onClick={onClose}
                                className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                            >
                                Terminate Session
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
