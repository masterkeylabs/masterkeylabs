import { create } from 'zustand';

export const useDiagnosticStore = create((set, get) => ({
    lossAudit: null,
    nightLoss: null,
    missedCustomers: null,
    aiThreat: null,
    city: '',
    totalAnnualBleed: 0,

    // Initial hydration/reset
    setAuditData: (data) => {
        const { lossAudit, nightLoss, missedCustomers, aiThreat } = data || {};
        const loadedCity = missedCustomers?.city || '';
        set({
            lossAudit,
            nightLoss,
            missedCustomers,
            aiThreat,
            city: loadedCity || get().city
        });
        get().calculateTotalBleed();
    },

    // Granular updates
    updateLossAudit: (data) => {
        set({ lossAudit: { ...get().lossAudit, ...data } });
        get().calculateTotalBleed();
    },
    updateNightLoss: (data) => {
        set({ nightLoss: { ...get().nightLoss, ...data } });
        get().calculateTotalBleed();
    },
    updateMissedCustomers: (data) => {
        set({ missedCustomers: { ...get().missedCustomers, ...data } });
        get().calculateTotalBleed();
    },
    updateAIThreat: (data) => {
        set({ aiThreat: { ...get().aiThreat, ...data } });
        get().calculateTotalBleed();
    },
    updateCity: (city) => {
        set({ city });
    },

    calculateTotalBleed: () => {
        const state = get();

        const opsWeight = state.lossAudit?.saving_target || 0;
        const nightWeight = (state.nightLoss?.monthly_loss || 0) * 12;

        // Visibility loss calculation logic (sync with Dashboard results)
        const missedCount = state.missedCustomers?.missed_customers || 0;
        const avgVal = state.missedCustomers?.avg_transaction_value || 1500;
        const visibilityWeight = missedCount * avgVal * 12;

        const total = (opsWeight * 12) + nightWeight + visibilityWeight;
        set({ totalAnnualBleed: total });
    }
}));
