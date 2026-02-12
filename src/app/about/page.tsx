"use client";

import Header from "@/components/layout/Header";
import { motion } from "framer-motion";

export default function AboutPage() {
    return (
        <main className="min-h-screen pt-32">
            <Header />
            <div className="container mx-auto px-6 py-20">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-20"
                    >
                        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter">OUR STORY</h1>
                        <p className="text-xl text-silver/60">Bridging the gap between traditional business and AI dominance.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center mb-32">
                        <div className="glass-card p-10 h-full">
                            <h3 className="text-2xl font-bold mb-4 text-electric">The Mission</h3>
                            <p className="text-silver leading-relaxed">
                                At Masterkey Labs India, we don't just "implement AI." We re-engineer the very fabric of business operations for the post-automation era. Our goal is to ensure the 1% who take action today become the market leaders of tomorrow.
                            </p>
                        </div>
                        <div className="glass-card p-10 h-full border-electric/20">
                            <h3 className="text-2xl font-bold mb-4">The Vision</h3>
                            <p className="text-silver leading-relaxed">
                                To become the global hub for AI transition, providing businesses with the tools, strategy, and talent needed to survive and thrive in an increasingly automated world.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
