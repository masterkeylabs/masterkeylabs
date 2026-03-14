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
    resetStore: () => {
        set({
            lossAudit: null,
            nightLoss: null,
            missedCustomers: null,
            aiThreat: null,
            city: '',
            totalAnnualBleed: 0
        });
    },

    calculateTotalBleed: () => {
        const state = get();

        // Use official annual_loss fields from the engines to ensure Logic Guards/Caps are respected
        const opsWeight = state.lossAudit?.annual_loss || (state.lossAudit?.saving_target || 0) * 12;
        const nightWeight = state.nightLoss?.annual_loss || (state.nightLoss?.monthly_loss || 0) * 12;
        const visibilityWeight = state.missedCustomers?.annual_loss || 0;

        const total = opsWeight + nightWeight + visibilityWeight;
        set({ totalAnnualBleed: total });
    }
}));
