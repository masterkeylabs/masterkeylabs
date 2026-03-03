import { create } from 'zustand';

export const useDiagnosticStore = create((set) => ({
    staffWaste: 0,
    opsWaste: 0,
    marketingWaste: 0,
    nightLossRevenue: 0,
    missedCustomers: 0,
    extinctionHorizon: 0,
    totalAnnualBleed: 0,

    setAuditData: (data) => set((state) => {
        const { lossAudit, nightLoss, missedCustomers, aiThreat } = data;

        const staffWaste = lossAudit?.payroll_waste || 0;
        const marketingWaste = lossAudit?.marketing_waste || 0;
        const opsWaste = lossAudit?.saving_target || 0; // Total operational waste

        // Night loss is typically monthly in DB, we need annual for total bleed
        const nightLossRevenue = nightLoss?.monthly_loss || 0;
        const annualNightLoss = nightLossRevenue * 12;

        // Visibility loss = missed customers * avg customer value (approx 1500 INR if not provided)
        const visibilityLoss = (missedCustomers?.missed_customers || 0) * 1500;
        const annualVisibilityLoss = visibilityLoss * 12;

        const annualOpsWaste = opsWaste * 12;

        const totalAnnualBleed = annualOpsWaste + annualNightLoss + annualVisibilityLoss;

        return {
            staffWaste,
            opsWaste,
            marketingWaste,
            nightLossRevenue,
            missedCustomers: missedCustomers?.missed_customers || 0,
            extinctionHorizon: aiThreat?.score || 30, // TTL in months
            totalAnnualBleed
        };
    }),
}));
