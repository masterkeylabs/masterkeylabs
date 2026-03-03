'use client';
import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <div className="bg-background-dark min-h-screen text-slate-100 p-8 md:p-24 font-sans">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="text-ios-blue flex items-center gap-2 mb-12 hover:underline">
                    <span className="material-symbols-outlined">arrow_back</span>
                    Back to Home
                </Link>
                <h1 className="text-4xl font-bold mb-8 tracking-tight">Privacy Policy</h1>
                <div className="space-y-6 text-slate-400 leading-relaxed">
                    <p>Last Updated: February 28, 2026</p>
                    <p>At MasterKey Labs, your privacy is our priority. This document outlines how we collect, use, and protect your data.</p>

                    <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Information Collection</h2>
                    <p>We collect information during the audit process, including business names, contact details, and operational data, to provide accurate diagnostic results.</p>

                    <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Data Usage</h2>
                    <p>Your data is used solely for the purpose of business analysis and protocol recommendations. We do not sell your personal or business data to third parties.</p>

                    <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Security</h2>
                    <p>We implement enterprise-grade security protocols to ensure your data remains protected within our adaptive systems environment.</p>
                </div>
            </div>
        </div>
    );
}
