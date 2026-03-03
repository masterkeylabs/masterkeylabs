'use client';
import Link from 'next/link';

export default function TermsPage() {
    return (
        <div className="bg-background-dark min-h-screen text-slate-100 p-8 md:p-24 font-sans">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="text-ios-blue flex items-center gap-2 mb-12 hover:underline">
                    <span className="material-symbols-outlined">arrow_back</span>
                    Back to Home
                </Link>
                <h1 className="text-4xl font-bold mb-8 tracking-tight">Terms & Conditions</h1>
                <div className="space-y-6 text-slate-400 leading-relaxed">
                    <p>Last Updated: February 28, 2026</p>
                    <p>By accessing MasterKey Labs, you agree to comply with and be bound by the following terms and conditions.</p>

                    <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Use of Services</h2>
                    <p>Our audit tools are provided for diagnostic and informational purposes. While we strive for accuracy, decisions made based on our reports are the sole responsibility of the business owner.</p>

                    <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Intellectual Property</h2>
                    <p>The MasterKey OS, including all algorithms, designs, and protocols, remains the intellectual property of MasterKey Labs.</p>

                    <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Limitation of Liability</h2>
                    <p>MasterKey Labs shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use our services.</p>
                </div>
            </div>
        </div>
    );
}
