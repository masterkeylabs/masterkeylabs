"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type AuditTabId = "survival" | "efficiency" | "presence" | "web";

export interface AuditTabData {
    survival?: { riskLevel: number; zone: string };
    efficiency?: { selectedModules: string[]; systemOrder: number };
    presence?: { brand: string; score: string };
    web?: { url: string; metrics: Record<string, string> };
}

interface AuditDataContextType {
    auditData: AuditTabData;
    updateAuditData: (tab: AuditTabId, data: Record<string, unknown>) => void;
    clearAuditData: () => void;
}

const AuditDataContext = createContext<AuditDataContextType | undefined>(undefined);

export function AuditDataProvider({ children }: { children: ReactNode }) {
    const [auditData, setAuditData] = useState<AuditTabData>({});

    const updateAuditData = useCallback((tab: AuditTabId, data: Record<string, unknown>) => {
        setAuditData((prev) => ({ ...prev, [tab]: data }));
    }, []);

    const clearAuditData = useCallback(() => {
        setAuditData({});
    }, []);

    return (
        <AuditDataContext.Provider value={{ auditData, updateAuditData, clearAuditData }}>
            {children}
        </AuditDataContext.Provider>
    );
}

export function useAuditData() {
    const context = useContext(AuditDataContext);
    if (context === undefined) {
        throw new Error("useAuditData must be used within an AuditDataProvider");
    }
    return context;
}
