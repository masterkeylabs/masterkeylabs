'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import IntakeWizard from './IntakeWizard';
import DashboardGrid from './DashboardGrid';
import Link from 'next/link';

export default function DashboardFallback() {
    const router = useRouter();
    const { business, loading, user } = useAuth();
    const { t } = useLanguage();
    const [localId, setLocalId] = useState(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const id = localStorage.getItem('masterkey_business_id');
            setLocalId(id);
        }
    }, []);

    useEffect(() => {
        if (loading) return;

        const id = business?.id || localId;
        if (id && id !== 'null' && id !== 'undefined' && id !== '') {
            // Business ID found — redirect with it
            router.replace(`/dashboard?id=${id}`);
        }
    }, [business, loading, router, localId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-10 text-center">
                <div className="w-16 h-16 border-4 border-ios-blue/20 border-t-ios-blue rounded-full animate-spin mb-6"></div>
                <p className="text-white/40 uppercase tracking-[0.2em] text-[10px] font-bold">Synchronizing Terminal...</p>
            </div>
        );
    }

    // If we've finished loading and STILL don't have a business ID,
    // show the DashboardGrid with empty values so they see the "4 audits" directly.
    if (!business?.id && (!localId || localId === 'null')) {
        const dummyData = {
            lossAudit: { saving_target: 0 },
            nightLoss: { monthly_loss: 0 },
            missedCustomers: { missed_customers: 0 },
            aiThreat: { score: 0 }
        };
        const placeholderBusiness = {
            entity_name: user?.user_metadata?.full_name || 'Initialize System',
            email: user?.email || '',
            id: null
        };

        return (
            <div className="animate-fade-in w-full">
                <DashboardGrid
                    business={placeholderBusiness}
                    computedData={dummyData}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-10 text-center animate-fade-in">
            <span className="material-symbols-outlined text-6xl text-white/10 mb-6">
                manage_accounts
            </span>
            <h2 className="text-2xl font-bold tracking-tight mb-3">No Active Business Session</h2>
            <p className="text-white/40 mb-8 max-w-sm leading-relaxed">
                No business session was found associated with your account. Please complete the intake protocol to activate your diagnostic dashboard.
            </p>
            <Link
                href="/"
                className="inline-flex items-center gap-2 bg-ios-blue hover:bg-ios-blue/80 text-white font-bold px-8 py-4 rounded-2xl uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-ios-blue/20"
            >
                <span className="material-symbols-outlined text-sm">rocket_launch</span>
                Start Business Intake
            </Link>
        </div>
    );
}
