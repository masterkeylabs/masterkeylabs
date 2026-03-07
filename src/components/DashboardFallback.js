'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { supabase } from '@/lib/supabaseClient';
import DashboardGrid from './DashboardGrid';

export default function DashboardFallback() {
    const router = useRouter();
    const { business, loading, user, fetchBusinessProfile } = useAuth();
    const { t } = useLanguage();

    useEffect(() => {
        const recoverByLocalStorage = async () => {
            if (loading || business?.id) return;
            const localBizId = localStorage.getItem('masterkey_business_id');
            if (localBizId) {
                const { data } = await supabase.from('businesses').select('*').eq('id', localBizId).maybeSingle();
                if (data) window.location.reload();
            }
        };
        recoverByLocalStorage();
    }, [loading, business]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-10 text-center">
                <div className="w-16 h-16 border-4 border-ios-blue/20 border-t-ios-blue rounded-full animate-spin mb-6"></div>
                <p className="text-white/40 uppercase tracking-[0.2em] text-[10px] font-bold">Synchronizing Terminal...</p>
            </div>
        );
    }

    if (!business?.id) {
        const dummyData = {
            lossAudit: { saving_target: 0 },
            nightLoss: { monthly_loss: 0 },
            missedCustomers: { missed_customers: 0 },
            aiThreat: { score: 0 }
        };
        const placeholderBusiness = {
            entity_name: 'Initialize System',
            owner_name: user?.user_metadata?.full_name || '',
            email: user?.email || '',
            id: null
        };
        return <DashboardGrid business={placeholderBusiness} computedData={dummyData} />;
    }

    return null;
}
