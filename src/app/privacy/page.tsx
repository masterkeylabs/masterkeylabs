"use client";

import Header from "@/components/layout/Header";
import { motion } from "framer-motion";

export default function PrivacyPage() {
    const sections = [
        {
            title: "Information We Collect",
            content: `To provide you with the "Elite 1%" experience and accurate audit reports, we collect the following:

• Account Information: Name, email address, and professional contact details provided during registration.

• Audit Data: Information regarding your industry, business efficiency, digital footprint, and website URL entered into our four Audit Tabs.

• Technical Data: IP address, browser type, and interaction data (via cookies) to ensure our space-grade UI performs optimally for you.`
        },
        {
            title: "How We Use Your Data",
            content: `Your data is used specifically to build your AI Blueprint:

• To generate and secure your personalized Audit Reports.

• To facilitate the 60-minute Deep Dive Audit bookings.

• To improve our AI algorithms and efficiency calculators.

• To send you critical updates regarding the AI Revolution and Masterkey Labs services.`
        },
        {
            title: "Data Security",
            content: `We utilize Supabase (Enterprise-grade encryption) and Vercel (Secure Edge Hosting) to ensure your data is locked and protected. We do not sell your business data to third parties. Access to your audit results is restricted to you and our senior consultants for the purpose of providing solutions.`
        },
        {
            title: "User Control & The Lock",
            content: `Unlocking Reports: Full audit reports are locked behind a registration wall to prevent unauthorized access to your business's strategic weaknesses.

Data Deletion: You have the right to request the deletion of your account and audit history at any time by contacting our Admin team.`
        },
        {
            title: "Cookies & Tracking",
            content: `We use minimal cookies to maintain your login session and to render the high-fidelity space animations on our site. By using Masterkey Labs, you consent to these performance-enhancing technologies.`
        }
    ];

    return (
        <main className="min-h-screen pt-32 bg-black pb-20">
            <Header />
            <div className="container mx-auto px-6 py-20">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-20"
                    >
                        <h1 className="text-7xl md:text-8xl font-black mb-6 tracking-tighter silver-gradient-text">PRIVACY POLICY</h1>
                        <p className="text-silver/60 text-[10px] font-black uppercase tracking-[0.3em]">Last Updated: February 2026</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="mb-16 glass-card p-10 border-white/5"
                    >
                        <p className="text-silver leading-relaxed text-lg mb-6">
                            At Masterkey Labs, we believe the future of business is built on intelligence and trust. This Privacy Policy explains how we collect, use, and protect your information when you join the AI Revolution through our platform.
                        </p>
                    </motion.div>

                    <div className="space-y-12">
                        {sections.map((section, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                                className="glass-card p-10 border-white/5 hover:border-[var(--cyan-accent)]/20 transition-all"
                            >
                                <h2 className="text-3xl font-black mb-6 tracking-tight text-white">
                                    {index + 1}. {section.title}
                                </h2>
                                <p className="text-silver/80 whitespace-pre-line leading-relaxed font-medium">
                                    {section.content}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="mt-16 glass-card p-10 border-white/5 bg-white/[0.02]"
                    >
                        <h2 className="text-3xl font-black mb-6 tracking-tight text-white">6. Contact Us</h2>
                        <p className="text-silver/80 leading-relaxed font-medium mb-4">
                            If you have questions regarding your data or our AI-Proofing systems, reach out to the Labs:
                        </p>
                        <div className="space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-silver/40">Email:</p>
                            <a href="mailto:support@masterkeylabs.in" className="text-lg font-bold text-[var(--cyan-accent)] hover:text-white transition-colors">
                                support@masterkeylabs.in
                            </a>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-silver/40 pt-4">Subject:</p>
                            <p className="text-silver">Data Privacy Inquiry</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
