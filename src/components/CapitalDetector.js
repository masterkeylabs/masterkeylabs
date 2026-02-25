'use client';
import { motion } from 'framer-motion';

export default function CapitalDetector({ data }) {
    // Graceful fallback if data hasn't loaded (supporting both DB snake_case and math engine camelCase)
    const staffBleed = data?.staffWaste || data?.staff_waste_monthly || data?.staff_waste || 0;
    const marketingWaste = data?.marketingWaste || data?.marketing_waste_monthly || data?.marketing_waste || 0;
    const opsInefficiency = data?.opsWaste || data?.ops_waste_monthly || data?.ops_waste || 0;
    const totalAnnualBleed = data?.annualBurn || data?.annual_burn || 0;

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(val || 0);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.4
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    if (!totalAnnualBleed || totalAnnualBleed === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="system-card w-full border border-[#FFAB00]/40 p-10 rounded-2xl bg-[#FFAB00]/10 flex flex-col items-center justify-center text-center animate-pulse shadow-[0_0_40px_rgba(255,171,0,0.15)] mb-8 backdrop-blur-xl relative overflow-hidden"
            >
                {/* Background glow flair */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#FFAB00]/20 blur-[80px] rounded-full pointer-events-none"></div>

                <span className="material-symbols-outlined text-[48px] text-[#FFAB00] mb-6 drop-shadow-[0_0_15px_rgba(255,171,0,0.8)] relative z-10">warning</span>
                <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight mb-3 drop-shadow-[0_0_10px_rgba(255,171,0,0.5)] relative z-10">
                    SYSTEM ERROR: Impossible metrics detected.
                </h3>
                <p className="text-[#FFAB00]/80 text-sm md:text-base font-bold tracking-wide uppercase relative z-10">
                    Re-run diagnostic to calculate hidden operational waste.
                </p>
            </motion.div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
            {/* Column 1: Staff Bleed */}
            <motion.div variants={itemVariants} className="system-card relative border border-white/5 p-6 flex flex-col justify-between rounded-2xl overflow-hidden backdrop-blur-[15px] bg-white/[0.03]">
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="size-10 rounded-xl bg-ios-orange/10 flex items-center justify-center text-ios-orange">
                            <span className="material-symbols-outlined text-lg">group_remove</span>
                        </div>
                        <span className="text-[10px] font-bold text-ios-orange uppercase tracking-[0.2em]">Staff Bleed</span>
                    </div>
                    <p className="text-[20px] font-bold text-white mb-1 tabular-nums">
                        {formatCurrency(staffBleed)} <span className="text-[11px] text-white/40 font-normal">/mo</span>
                    </p>
                    <p className="text-white/30 text-[11px] leading-relaxed font-medium">Excess payroll redundancy & unused hours.</p>
                </div>
            </motion.div>

            {/* Column 2: Ad Waste */}
            <motion.div variants={itemVariants} className="system-card relative border border-white/5 p-6 flex flex-col justify-between rounded-2xl overflow-hidden backdrop-blur-[15px] bg-white/[0.03]">
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="size-10 rounded-xl bg-ios-orange/10 flex items-center justify-center text-ios-orange">
                            <span className="material-symbols-outlined text-lg">trending_down</span>
                        </div>
                        <span className="text-[10px] font-bold text-ios-orange uppercase tracking-[0.2em]">Ad Waste</span>
                    </div>
                    <p className="text-[20px] font-bold text-white mb-1 tabular-nums">
                        {formatCurrency(marketingWaste)} <span className="text-[11px] text-white/40 font-normal">/mo</span>
                    </p>
                    <p className="text-white/30 text-[11px] leading-relaxed font-medium">Inefficient marketing spend & lost leads.</p>
                </div>
            </motion.div>

            {/* Column 3: Ops Inefficiency */}
            <motion.div variants={itemVariants} className="system-card relative border border-white/5 p-6 flex flex-col justify-between rounded-2xl overflow-hidden backdrop-blur-[15px] bg-white/[0.03]">
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="size-10 rounded-xl bg-ios-orange/10 flex items-center justify-center text-ios-orange">
                            <span className="material-symbols-outlined text-lg">settings_alert</span>
                        </div>
                        <span className="text-[10px] font-bold text-ios-orange uppercase tracking-[0.2em]">Ops Friction</span>
                    </div>
                    <p className="text-[20px] font-bold text-white mb-1 tabular-nums">
                        {formatCurrency(opsInefficiency)} <span className="text-[11px] text-white/40 font-normal">/mo</span>
                    </p>
                    <p className="text-white/30 text-[11px] leading-relaxed font-medium">Software bloat & manual manual processes.</p>
                </div>
            </motion.div>

            {/* Column 4: Total Annual Bleed (Contrasted) */}
            <motion.div variants={itemVariants} className="system-card relative border p-6 flex flex-col justify-between rounded-2xl shadow-[0_0_40px_rgba(255,171,0,0.1)] overflow-hidden backdrop-blur-[15px] bg-[#FFAB00]/5 border-[#FFAB00]/30">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#FFAB00]/15 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>

                <div className="relative z-10 flex-col h-full flex justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="size-10 rounded-xl bg-[#FFAB00]/10 flex items-center justify-center text-[#FFAB00] shadow-[0_0_15px_rgba(255,171,0,0.2)] border border-[#FFAB00]/20">
                                <span className="material-symbols-outlined text-lg">warning</span>
                            </div>
                            <span className="text-[10px] font-bold text-[#FFAB00] uppercase tracking-[0.2em] drop-shadow-[0_0_5px_rgba(255,171,0,0.8)]">Annual Bleed</span>
                        </div>
                        <p className="text-[28px] md:text-[32px] font-black text-white leading-none mb-1 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] tabular-nums tracking-tighter">
                            {formatCurrency(totalAnnualBleed)}
                        </p>
                        <p className="text-[#FFAB00]/70 text-[10px] leading-relaxed font-bold mb-6 uppercase tracking-[0.2em]">Total Sunk Cost</p>
                    </div>

                    <button className="w-full py-4 text-[11px] font-bold tracking-[0.1em] uppercase flex items-center justify-center gap-2 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] glow-orange"
                        style={{ backgroundColor: '#FFAB00', color: '#000', boxShadow: '0 4px 20px rgba(255, 171, 0, 0.4)' }}>
                        <span className="material-symbols-outlined text-[16px]">bolt</span>
                        Deploy System Upgrade
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
