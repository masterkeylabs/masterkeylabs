"use client";

import { useState, createContext, useContext, ReactNode, useEffect } from "react";
import RegistrationModal from "@/components/audit/RegistrationModal";

export interface User {
    name: string;
    email: string;
    phone: string;
    company: string;
}

interface AuthContextType {
    user: User | null;
    isRegistered: boolean;
    openRegistration: () => void;
    setUser: (user: User | null) => void;
}

const STORAGE_KEY = "masterkeylabs_user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUserState] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as User;
                setUserState(parsed);
            }
        } catch (_) {}
        setHydrated(true);
    }, []);

    const setUser = (u: User | null) => {
        setUserState(u);
        try {
            if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
            else localStorage.removeItem(STORAGE_KEY);
        } catch (_) {}
    };

    const openRegistration = () => setIsModalOpen(true);

    if (!hydrated) return null;

    return (
        <AuthContext.Provider value={{ user, isRegistered: !!user, openRegistration, setUser }}>
            {children}
            <RegistrationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={(u) => {
                    setUser(u);
                    setIsModalOpen(false);
                }}
            />
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
