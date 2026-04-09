'use client';
import { useLanguage } from '@/lib/LanguageContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import VideoLogo from '@/components/VideoLogo';

const icons = {
    p1: 'psychology',
    p2: 'precision_manufacturing',
    p3: 'brand_awareness',
    p4: 'account_tree',
    p5: 'rocket_launch',
    p6: 'query_stats',
    p7: 'language',
    p8: 'smartphone',
    p9: 'cloud_done'
};

const serviceHighlights = {
    p1: ["Autonomous Neural Workflows", "Voice AI Implementation", "Custom LLM Integration", "Predictive Analytics Engine"],
    p2: ["Legacy System Migration", "Cloud-Native Infrastructure", "Digital Continuity Audits", "Scalable Data Backbones"],
    p3: ["Market Position Optimization", "High-Authority Design Systems", "Narrative Architecture", "Brand Sentiment Analysis"],
    p4: ["Custom ERP Development", "Complex CRM Architectures", "API Ecosystem Design", "Security Protocol Hardening"],
    p5: ["Multi-Channel Growth Loops", "Automated Funnel Optimization", "LTV-Driven Scaling", "Precision Lead Scoring"],
    p6: ["Global Intelligence Scanning", "Competitive Defense Shields", "Risk Mitigation Protocols", "Adaptive Strategy Engines"],
    p7: ["Headless CMS Architecture", "High-Velocity Deployment", "SEO-Core Infrastructure", "Adaptive Multi-modal UIs"],
    p8: ["Native iOS/Android Stacks", "Cross-Platform Scalability", "Low-Latency Synchronization", "Encrypted Data Transmission"],
    p9: ["Full-Stack Product Engineering", "Multi-Tenant Architecture", "Recurring Value Engineering", "Self-Healing Product Design"]
};

export default function ServicePage() {
    const { id } = useParams();
    const { t, lang } = useLanguage();
    const service = t.services?.[id];

    if (!service) {
        return (
            <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-6">
                <p className="text-white/40 mb-8 tracking-widest font-black uppercase text-xs">Protocol Not Found</p>
                <Link href="/" className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full uppercase text-[10px] font-black tracking-widest hover:bg-white/10 transition-all">
                    Back to Command Center
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-dark font-sans text-slate-100 selection:bg-ios-blue/30 selection:text-ios-blue overflow-x-hidden">
            {/* Minimal Grid Background */}
            <div className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>
            
            {/* Navigation Header */}
            <header className="relative z-50 pt-8 pb-4 px-6 sticky top-0 flex justify-center">
                <div className="flex items-center gap-4 glass-premium p-2 pl-4 rounded-full shadow-2xl">
                    <Link href="/" className="flex items-center gap-2 group">
                        <span className="material-symbols-outlined text-[18px] text-white/40 group-hover:text-ios-blue transition-colors">arrow_back</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">Home</span>
                    </Link>
                    <div className="w-[1px] h-4 bg-white/10"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ios-blue pr-4">{service.title}</span>
                </div>
            </header>

            <main className="container mx-auto px-6 pt-20 pb-32 max-w-5xl">
                <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-20 items-start">
                    {/* Left Column: Content */}
                    <div className="flex flex-col">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ios-blue/10 border border-ios-blue/20 mb-8">
                                <span className="w-1.5 h-1.5 rounded-full bg-ios-blue animate-pulse"></span>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-ios-blue">Protocol Active</span>
                            </div>
                            
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-8">
                                {service.title}
                            </h1>
                            
                            <p className="text-white/40 text-lg md:text-xl leading-relaxed mb-12 max-w-2xl italic font-light">
                                &quot;{service.sub}&quot;
                            </p>

                            <div className="space-y-4 mb-12">
                                {(serviceHighlights[id] || []).map((highlight, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + (index * 0.1) }}
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] group hover:bg-white/[0.06] transition-all"
                                    >
                                        <span className="material-symbols-outlined text-ios-blue text-[20px] group-hover:scale-110 transition-transform">star</span>
                                        <span className="text-sm font-medium text-white/60 group-hover:text-white transition-colors">{highlight}</span>
                                    </motion.div>
                                ))}
                            </div>

                            <button className="px-10 py-5 bg-gradient-to-br from-ios-blue to-[#0099FF] text-black font-black rounded-2xl transition-all hover:scale-105 hover:brightness-110 active:scale-95 shadow-[0_20px_50px_rgba(0,229,255,0.3)] flex justify-center items-center gap-3 group w-fit">
                                <span className="text-sm uppercase tracking-widest">Speak to an Architect</span>
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                        </motion.div>
                    </div>

                    {/* Right Column: Visual Component */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="sticky top-32"
                    >
                        <div className="relative aspect-square rounded-[40px] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 flex items-center justify-center overflow-hidden p-12 group">
                            {/* Decorative Elements */}
                            <div className="absolute inset-0 bg-ios-blue/5 blur-[80px] -z-10 group-hover:bg-ios-blue/10 transition-colors duration-1000" />
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[40px] -translate-y-1/2 translate-x-1/2 rounded-full" />
                            
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-24 h-24 rounded-3xl bg-ios-blue/10 border border-ios-blue/20 flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 transition-transform duration-700">
                                    <span className="material-symbols-outlined text-5xl font-light text-ios-blue">
                                        {icons[id] || 'rocket_launch'}
                                    </span>
                                </div>
                                <div className="text-center">
                                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-2">Expansion Module</div>
                                    <div className="text-2xl font-bold text-white tracking-widest">{id?.toUpperCase()}</div>
                                </div>
                            </div>

                            {/* Circular Tech rings */}
                            <div className="absolute inset-0 border-[1px] border-white/5 rounded-full scale-[0.6] opacity-50 animate-spin-slow" />
                            <div className="absolute inset-0 border-[1px] border-white/[0.02] rounded-full scale-[0.8] animate-reverse-spin" />
                        </div>
                    </motion.div>
                </div>
            </main>

            <footer className="border-t border-white/5 py-12 bg-black/40">
                <div className="container mx-auto px-6 flex flex-col items-center">
                    <Link href="/">
                        <VideoLogo src="/video-logo.mp4" poster="/logo-new.png" className="h-16 opacity-50 hover:opacity-100 transition-opacity" />
                    </Link>
                </div>
            </footer>
        </div>
    );
}
