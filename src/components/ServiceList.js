'use client';
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';
import Link from 'next/link';

const icons = {
    p1: 'psychology', // AI Automation
    p2: 'precision_manufacturing', // Business Digitalization
    p3: 'brand_awareness', // Brand & Identity
    p4: 'account_tree', // Systems & Architecture
    p5: 'rocket_launch', // Leads & Growth
    p6: 'query_stats', // Strategy & Intelligence
    p7: 'language', // Website Development
    p8: 'smartphone', // App Development
    p9: 'cloud_done' // SaaS Products
};

const accents = {
    p1: 'border-ios-blue/30 text-ios-blue shadow-[0_0_20px_rgba(0,229,255,0.1)]',
    p2: 'border-purple-500/30 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.1)]',
    p3: 'border-cyan-400/30 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.1)]',
    p4: 'border-emerald-400/30 text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.1)]',
    p5: 'border-orange-400/30 text-orange-400 shadow-[0_0_20px_rgba(251,146,60,0.1)]',
    p6: 'border-pink-400/30 text-pink-400 shadow-[0_0_20px_rgba(244,114,182,0.1)]',
    p7: 'border-blue-400/30 text-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.1)]',
    p8: 'border-indigo-400/30 text-indigo-400 shadow-[0_0_20px_rgba(129,140,248,0.1)]',
    p9: 'border-violet-400/30 text-violet-400 shadow-[0_0_20px_rgba(167,139,250,0.1)]'
};

const bgAccents = {
    p1: 'bg-ios-blue/10 border-ios-blue/20',
    p2: 'bg-purple-500/10 border-purple-500/20',
    p3: 'bg-cyan-500/10 border-cyan-500/20',
    p4: 'bg-emerald-500/10 border-emerald-500/20',
    p5: 'bg-orange-500/10 border-orange-500/20',
    p6: 'bg-pink-500/10 border-pink-500/20',
    p7: 'bg-blue-500/10 border-blue-500/20',
    p8: 'bg-indigo-500/10 border-indigo-500/20',
    p9: 'bg-violet-500/10 border-violet-500/20'
};

const ServiceList = () => {
    const { t } = useLanguage();
    const scrollRef = useRef(null);
    const services = t.services;

    const scroll = () => {
        if (scrollRef.current) {
            const container = scrollRef.current;
            const scrollAmount = container.clientWidth > 768 ? container.clientWidth / 3 : container.clientWidth * 0.8;
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            
            // If we are at the end, scroll back to start
            if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
                container.scrollTo({ left: 0, behavior: 'smooth' });
            }
        }
    };

    if (!services) return null;

    const serviceKeys = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9'];

    return (
        <section className="container mx-auto px-6 py-8 lg:py-12 relative">
            {/* Background Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-ios-blue/5 blur-[120px] rounded-full -z-10 pointer-events-none opacity-50" />

            <div className="text-center max-w-3xl mx-auto mb-8">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-ios-blue animate-pulse"></span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Expansion Protocols</span>
                </motion.div>
                
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight mb-6"
                >
                    {services.title}
                </motion.h2>
                
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-white/40 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed"
                >
                    {services.sub}
                </motion.p>
            </div>

            <div className="relative group/scroll">
                <div 
                    ref={scrollRef}
                    className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-6 pt-4 pb-12 px-6 -mx-6 md:mx-0 md:px-0 scroll-smooth"
                >
                    {serviceKeys.map((key, index) => (
                        <Link href={`/services/${key}`} key={key} className="flex-none w-[85%] md:w-[calc(33.333%-16px)] snap-center">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ 
                                    delay: index * 0.1, 
                                    duration: 0.8,
                                    ease: [0.21, 0.47, 0.32, 0.98]
                                }}
                                whileHover={{ y: -8 }}
                                className={`group relative p-8 rounded-3xl bg-[#0a0a09] border border-white/5 hover:bg-white/[0.04] transition-all duration-500 overflow-hidden h-full ${accents[key].split(' ').filter(c => c.startsWith('hover:') || c.includes('border')).join(' ')}`}
                            >
                                {/* Interactive Radial Gradient Hover Effect */}
                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-white/[0.02] to-transparent -z-10`} />
                                
                                {/* Top Accent Line */}
                                <div className={`absolute top-0 left-0 w-full h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-current to-transparent ${accents[key].split(' ').find(c => c.includes('text'))}`} />

                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border transition-all duration-500 group-hover:scale-110 ${bgAccents[key]} ${accents[key].split(' ').find(c => c.includes('text'))}`}>
                                    <span className="material-symbols-outlined text-3xl font-light">
                                        {icons[key]}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-4 tracking-tight group-hover:translate-x-1 transition-transform">
                                    {services[key]?.title}
                                </h3>
                                
                                <p className="text-sm text-white/40 leading-relaxed group-hover:text-white/60 transition-all duration-500 mb-8">
                                    {services[key]?.sub}
                                </p>

                                <div className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-ios-blue opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                                    <span>Initiate Protocol</span>
                                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>

                {/* Global Navigation Sign (Right Edge) - Now Clickable */}
                <button 
                    onClick={scroll}
                    className="absolute right-4 top-[calc(50%-1.5rem)] -translate-y-1/2 p-3 rounded-full bg-ios-blue/10 border border-ios-blue/20 backdrop-blur-md text-ios-blue animate-bounce-x md:hidden z-20 active:scale-95 transition-transform"
                >
                    <span className="material-symbols-outlined font-bold">arrow_forward</span>
                </button>
                <div className="hidden md:absolute md:flex right-0 top-0 h-[calc(100%-3rem)] w-24 items-center justify-end pr-4 bg-gradient-to-l from-background-dark via-background-dark/80 to-transparent pointer-events-none group-hover/scroll:opacity-100 opacity-60 transition-opacity">
                    <button 
                        onClick={scroll}
                        className="p-3 rounded-full bg-ios-blue/5 border border-ios-blue/20 backdrop-blur-sm text-ios-blue/40 hover:text-ios-blue hover:bg-ios-blue/10 pointer-events-auto transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined font-bold">arrow_forward</span>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default ServiceList;
