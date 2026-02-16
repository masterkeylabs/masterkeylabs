'use client';
import Link from 'next/link';

export default function PrivacyPolicy() {
    return (
        <div className="bg-background-dark font-display text-slate-100 min-h-screen selection:bg-primary/30">
            {/* Grid Background */}
            <div className="fixed inset-0 pointer-events-none z-[-1] opacity-10" style={{ backgroundImage: 'linear-gradient(#00e5ff 1px, transparent 1px), linear-gradient(90deg, #00e5ff 1px, transparent 1px)', backgroundSize: '80px 80px' }}></div>

            <header className="p-6 border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto flex items-center justify-between">
                    <Link href="/" className="hover:opacity-80 transition-opacity">
                        <img src="/logo.png" alt="MasterKey Labs" className="h-16 w-auto" />
                    </Link>
                    <Link href="/" className="text-xs font-bold text-primary uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back to Home
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-6 py-20 max-w-4xl">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Privacy Policy</h1>
                    <div className="h-1 w-20 bg-primary rounded-full mb-6"></div>
                    <p className="text-slate-400 text-sm">Last Updated: February 17, 2024</p>
                </div>

                <div className="space-y-10 text-slate-300 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm border border-primary/20">01</span>
                            Introduction
                        </h2>
                        <p>
                            At MasterKey Labs, we are committed to protecting your business intelligence and personal data. This Privacy Policy outlines how we collect, use, and safeguard the information you provide when using our diagnostic tools and consultancy services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm border border-primary/20">02</span>
                            Information We Collect
                        </h2>
                        <p className="mb-4">We collect information that helps us provide a precise business diagnostic, including:</p>
                        <ul className="list-disc pl-6 space-y-2 text-sm">
                            <li><strong>Business Profile:</strong> Entity name, industry, location, and operational age.</li>
                            <li><strong>Contact Details:</strong> Owner name, email address, and phone number.</li>
                            <li><strong>Diagnostic Data:</strong> Operational costs, digital footprint metrics, and market positioning data provided during audits.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm border border-primary/20">03</span>
                            How We Use Your Information
                        </h2>
                        <p className="mb-4">Your data is processed strictly for the following purposes:</p>
                        <ul className="list-disc pl-6 space-y-2 text-sm">
                            <li>To generate personalized business diagnostic reports and AI threat assessments.</li>
                            <li>To provide tailored recommendations for business automation and growth.</li>
                            <li>To communicate vital updates regarding your account and market insights.</li>
                            <li>To improve our diagnostic algorithms and service accuracy.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm border border-primary/20">04</span>
                            Data Security
                        </h2>
                        <p>
                            We implement enterprise-grade security protocols (SaaS-standard encryption) to ensure your business data remains confidential. We do not sell or lease your information to third-party marketing agencies. Access to your diagnostic history is restricted via encrypted sessions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm border border-primary/20">05</span>
                            Contact Us
                        </h2>
                        <p>
                            If you have any questions regarding this Privacy Policy or wish to request data deletion, please contact our data protection team:
                        </p>
                        <div className="mt-4 p-6 glass rounded-2xl border-white/5 inline-block">
                            <p className="text-white font-bold mb-1">MasterKey Labs Support</p>
                            <p className="text-primary text-sm">Email: support@masterkeylabs.in</p>
                            <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest">Protocol Version: 1.0.4 - Secure</p>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="py-10 border-t border-white/5 text-center px-6">
                <p className="text-slate-600 text-[10px] uppercase tracking-[0.3em]">© 2024 MasterKey Labs. All Intelligence Reserved.</p>
            </footer>
        </div>
    );
}
