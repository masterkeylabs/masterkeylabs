"use client";

import React from 'react';

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
const CardWrapper = ({ children, title }) => (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-[15px] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transition-all hover:bg-white/10 hover:border-white/20">
        {/* Top accent line using --color-ios-blue */}
        <div
            className="absolute top-0 left-0 h-1 w-full opacity-80"
            style={{ backgroundColor: 'var(--color-ios-blue, #0A84FF)' }}
        ></div>

        <h3 className="mb-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">{title}</h3>
        {children}
    </div>
);

// 1. Operational Waste Card
const LossAuditCard = ({ waste }) => (
    <CardWrapper title="Operational Waste">
        <div className="flex flex-col gap-1">
            <span className="text-3xl font-bold text-white tracking-tight">{formatINR(waste)}</span>
            <span className="text-xs text-gray-500 mt-1">Monthly inefficiency bleed</span>
        </div>
    </CardWrapper>
);

// 2. Missed After-Hours Revenue Card
const NightLossCard = ({ nightRevenueLoss }) => (
    <CardWrapper title="Missed After-Hours Revenue">
        <div className="flex flex-col gap-1">
            <span className="text-3xl font-bold text-white tracking-tight">{formatINR(nightRevenueLoss)}</span>
            <span className="text-xs text-gray-500 mt-1">Value of unserviced leads</span>
        </div>
    </CardWrapper>
);

// 3. Missed Local Customers Card
const VisibilityCard = ({ missedCustomers }) => (
    <CardWrapper title="Missed Local Customers">
        <div className="flex flex-col gap-1">
            <span className="text-3xl font-bold text-white tracking-tight">
                {missedCustomers || 0}
            </span>
            <span className="text-xs text-gray-500 mt-1">Based on current search volume gap</span>
        </div>
    </CardWrapper>
);

// 4. Extinction Horizon (AI Threat) Card
const AIThreatCard = ({ aiRiskScore }) => {
    const threat = getThreatLabel(aiRiskScore || 0);
    return (
        <CardWrapper title="Extinction Horizon">
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
    // Destructure expected values from auditResults payload
    const {
        lossAudit = 0,
        nightLoss = 0,
        missedCustomers = 0,
        aiThreat = 0
    } = data || {};

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full max-w-7xl mx-auto py-4">
            <LossAuditCard waste={lossAudit} />
            <NightLossCard nightRevenueLoss={nightLoss} />
            <VisibilityCard missedCustomers={missedCustomers} />
            <AIThreatCard aiRiskScore={aiThreat} />
        </div>
    );
}
