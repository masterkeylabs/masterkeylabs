import React from 'react';

/**
 * RangeSelector Component
 * A premium grid of selectable range buttons for discrete metric input.
 */
export const RangeSelector = ({ label, value, onChange, options, colorClass = 'ios-cyan' }) => {
    // Determine the glow and active colors based on the colorClass (e.g., ios-cyan, alert-orange, ios-blue)
    const activeBg = `bg-${colorClass}/20`;
    const activeBorder = `border-${colorClass}`;
    const activeText = `text-${colorClass}`;
    const glowShadow = `shadow-[0_0_15px_rgba(0,210,255,0.2)]`; // Defaulting shadow for now, could be dynamic

    return (
        <div className="space-y-3 bg-white/[0.03] border border-white/5 p-6 rounded-2xl group hover:border-white/20 transition-all duration-500">
            {label && (
                <label className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                    <span className={`w-1 h-1 bg-${colorClass} rounded-full`}></span>
                    {label}
                </label>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {options.map((opt) => (
                    <button
                        key={opt.label}
                        type="button"
                        onClick={() => onChange(opt.value)}
                        className={`py-3 px-2 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${value === opt.value
                            ? `${activeBg} ${activeBorder} ${activeText} ${glowShadow} scale-[1.05]`
                            : 'bg-black/30 border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
                            }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

// --- PRE-DEFINED OPTIONS ---

export const REVENUE_OPTIONS = [
    { label: '< 10L', value: 500000 },
    { label: '10L-50L', value: 3000000 },
    { label: '50L-1Cr', value: 7500000 },
    { label: '1Cr-5Cr', value: 30000000 },
    { label: '> 5Cr', value: 75000000 }
];

export const EMPLOYEE_OPTIONS = [
    { label: '1-10', value: 5 },
    { label: '11-50', value: 30 },
    { label: '51-200', value: 125 },
    { label: '201-500', value: 350 },
    { label: '500+', value: 750 }
];

export const PAYROLL_OPTIONS = [
    { label: '< 1L', value: 50000 },
    { label: '1L-5L', value: 300000 },
    { label: '5L-15L', value: 1000000 },
    { label: '15L-50L', value: 3250000 },
    { label: '> 50L', value: 7500000 }
];

export const MARKETING_OPTIONS = [
    { label: 'None / Zero', value: 0 },
    { label: '< 1L', value: 50000 },
    { label: '1L-5L', value: 300000 },
    { label: '5L-15L', value: 1000000 },
    { label: '15L-50L', value: 3250000 },
    { label: '> 50L', value: 7500000 }
];

export const MANUAL_HOURS_OPTIONS = [
    { label: '0-1', value: 0.5 },
    { label: '1-4', value: 2.5 },
    { label: '4-6', value: 5 },
    { label: '6-10', value: 8 },
    { label: '10+', value: 12 }
];

export const DAILY_LEADS_OPTIONS = [
    { label: '< 5', value: 3 },
    { label: '5-20', value: 12 },
    { label: '21-50', value: 35 },
    { label: '51-100', value: 75 },
    { label: '100+', value: 150 }
];

export const TXN_VALUE_OPTIONS = [
    { label: '< 1k', value: 500 },
    { label: '1k-10k', value: 5000 },
    { label: '10k-50k', value: 30000 },
    { label: '50k-1L', value: 75000 },
    { label: '> 1L', value: 250000 }
];
