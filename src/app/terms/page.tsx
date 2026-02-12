"use client";

import Header from "@/components/layout/Header";
import { motion } from "framer-motion";

export default function TermsPage() {
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
                        <h1 className="text-7xl md:text-8xl font-black mb-6 tracking-tighter silver-gradient-text">FORCE TERMS</h1>
                        <p className="text-silver/60 text-[10px] font-black uppercase tracking-[0.3em]">Terms of Service | Masterkey Labs</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-10 border-white/5"
                    >
                        <h2 className="text-3xl font-black mb-6 tracking-tight text-white">1. Acceptance of Terms</h2>
                        <p className="text-silver/80 leading-relaxed font-medium mb-6">
                            By accessing and using the Masterkey Labs platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-8 glass-card p-10 border-white/5"
                    >
                        <h2 className="text-3xl font-black mb-6 tracking-tight text-white">2. Use License</h2>
                        <p className="text-silver/80 leading-relaxed font-medium mb-6">
                            Permission is granted to temporarily download one copy of the materials (information or software) on Masterkey Labs' platform for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                        </p>
                        <ul className="space-y-3 ml-6">
                            <li className="text-silver/80 font-medium">• Modifying or copying the materials</li>
                            <li className="text-silver/80 font-medium">• Using the materials for any commercial purpose or for any public display</li>
                            <li className="text-silver/80 font-medium">• Attempting to decompile or reverse engineer any software contained on the platform</li>
                            <li className="text-silver/80 font-medium">• Removing any copyright or other proprietary notations from the materials</li>
                            <li className="text-silver/80 font-medium">• Transferring the materials to another person or "mirroring" the materials on any other server</li>
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8 glass-card p-10 border-white/5"
                    >
                        <h2 className="text-3xl font-black mb-6 tracking-tight text-white">3. Disclaimer</h2>
                        <p className="text-silver/80 leading-relaxed font-medium mb-6">
                            The materials on Masterkey Labs' platform are provided on an 'as is' basis. Masterkey Labs makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-8 glass-card p-10 border-white/5"
                    >
                        <h2 className="text-3xl font-black mb-6 tracking-tight text-white">4. Limitations</h2>
                        <p className="text-silver/80 leading-relaxed font-medium mb-6">
                            In no event shall Masterkey Labs or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Masterkey Labs' platform, even if Masterkey Labs or an authorized representative has been notified orally or in writing of the possibility of such damage.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-8 glass-card p-10 border-white/5"
                    >
                        <h2 className="text-3xl font-black mb-6 tracking-tight text-white">5. Accuracy of Materials</h2>
                        <p className="text-silver/80 leading-relaxed font-medium mb-6">
                            While we strive to provide accurate audit reports and recommendations, Masterkey Labs does not warrant the accuracy, completeness, or usefulness of this information. Any reliance you place on such information is strictly at your own risk.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-8 glass-card p-10 border-white/5"
                    >
                        <h2 className="text-3xl font-black mb-6 tracking-tight text-white">6. Modifications</h2>
                        <p className="text-silver/80 leading-relaxed font-medium mb-6">
                            Masterkey Labs may revise these terms of service for its platform at any time without notice. By using this platform, you are agreeing to be bound by the then current version of these terms of service.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="mt-8 glass-card p-10 border-white/5"
                    >
                        <h2 className="text-3xl font-black mb-6 tracking-tight text-white">7. Governing Law</h2>
                        <p className="text-silver/80 leading-relaxed font-medium mb-6">
                            These terms and conditions are governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction of the courts located in Indore, India.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-16 glass-card p-10 border-white/5 bg-white/[0.02]"
                    >
                        <h2 className="text-2xl font-black mb-4 tracking-tight text-white">Questions About Our Terms?</h2>
                        <p className="text-silver/80 leading-relaxed font-medium mb-4">
                            If you have any questions about these Terms of Service, please contact us at:
                        </p>
                        <a href="mailto:support@masterkeylabs.in" className="text-lg font-bold text-[var(--cyan-accent)] hover:text-white transition-colors">
                            support@masterkeylabs.in
                        </a>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
