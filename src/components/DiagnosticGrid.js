"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Format INR currency
const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount || 0);
};

// Formatter for Extinction Horizon based on AI Threat Score (0-100)
const getThreatLabel = (score) => {
    if (score >= 80) return { label: 'KHATRA', color: 'text-red-500' };
    if (score >= 50) return { label: 'SAVDHAN', color: 'text-yellow-500' };
    return { label: 'SAFE', color: 'text-green-500' };
};

// Reusable Glassmorphism Card Wrapper
const CardWrapper = ({ children, title, href }) => (
    <Link href={href} className="block group">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-[15px] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transition-all group-hover:bg-white/10 group-hover:border-white/20 group-hover:scale-[1.02] cursor-pointer">
            {/* Top accent line using --color-ios-blue */}
            <div
                className="absolute top-0 left-0 h-1 w-full opacity-80"
                style={{ backgroundColor: 'var(--color-ios-blue, #0A84FF)' }}
            ></div>

            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{title}</h3>
                <span className="material-symbols-outlined text-white/20 group-hover:text-ios-blue transition-colors text-sm">open_in_new</span>
            </div>
            {children}
        </div>
    </Link>
);

// 1. Operational Waste Card
const LossAuditCard = ({ waste, businessId }) => (
    <CardWrapper title="Operational Waste" href={`/dashboard/loss-audit${businessId ? `?id=${businessId}` : ''}`}>
        <div className="flex flex-col gap-1">
            <span className="text-3xl font-bold text-white tracking-tight">{formatINR(waste)}</span>
            <span className="text-xs text-gray-500 mt-1">Recoverable monthly savings</span>
        </div>
    </CardWrapper>
);

// 2. Missed After-Hours Revenue Card
const NightLossCard = ({ nightRevenueLoss, businessId }) => (
    <CardWrapper title="Missed After-Hours Revenue" href={`/dashboard/night-loss${businessId ? `?id=${businessId}` : ''}`}>
        <div className="flex flex-col gap-1">
            <span className="text-3xl font-bold text-white tracking-tight">{formatINR(nightRevenueLoss)}</span>
            <span className="text-xs text-gray-500 mt-1">Value of unserviced leads</span>
        </div>
    </CardWrapper>
);

// 3. Missed Local Customers Card
const VisibilityCard = ({ missedCustomers, businessId }) => (
    <CardWrapper title="Missed Local Customers" href={`/dashboard/visibility${businessId ? `?id=${businessId}` : ''}`}>
        <div className="flex flex-col gap-1">
            <span className="text-3xl font-bold text-white tracking-tight">
                {missedCustomers || 0}
            </span>
            <span className="text-xs text-gray-500 mt-1">Based on current search volume gap</span>
        </div>
    </CardWrapper>
);

const AIThreatCard = ({ aiRiskScore, businessId }) => {
    const threat = getThreatLabel(aiRiskScore || 0);
    return (
        <CardWrapper title="Extinction Horizon" href={businessId ? `/dashboard/ai-threat?id=${businessId}` : '/dashboard/ai-threat'}>
            <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white tracking-tight">
                        {aiRiskScore || 0}
                    </span>
                    <span className="text-sm font-medium text-gray-400">/100</span>
                </div>
                <span className={`text-sm font-bold tracking-wider mt-2 ${threat.color}`}>
                    {threat.label}
                </span>
            </div>
        </CardWrapper>
    );
};

export default function DiagnosticGrid({ data }) {
    const searchParams = useSearchParams();
    const businessId = searchParams.get('id');

    // Destructure expected values from auditResults payload
    const {
        lossAudit = 0,
        nightLoss = 0,
        missedCustomers = 0,
        aiThreat = 0
    } = data || {};

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full max-w-7xl mx-auto py-4">
            <LossAuditCard waste={lossAudit} businessId={businessId} />
            <NightLossCard nightRevenueLoss={nightLoss} businessId={businessId} />
            <VisibilityCard missedCustomers={missedCustomers} businessId={businessId} />
            <AIThreatCard aiRiskScore={aiThreat} businessId={businessId} />
        </div>
    );
}
