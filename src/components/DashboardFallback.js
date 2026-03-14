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

    console.log('--- DashboardFallback: State ---', {
        isLoading: loading,
        hasBusinessId: business?.id,
        hasUserId: user?.id,
        businessName: business?.entity_name
    });

    useEffect(() => {
        const recoverAndVerify = async () => {
            if (loading) return;

            // If fully loaded and no business profile, but we have a user session:
            // REMOVED REDIRECT: DashboardGrid is now designed to handle 'Initialize System'
            // placeholder with an internal wizard. This prevents the redirection loop.
            if (!business?.id && user) {
                console.log('--- DashboardFallback: No business profile, proceeding with placeholder ---');
                return;
            }

            // If we have a business via context, redirect to the ID-specific URL
            if (business?.id) {
                console.log('--- DashboardFallback: Business detected, redirecting to ID ---', business.id);
                router.replace(`/dashboard?id=${business.id}`);
                return;
            }

            const localBizId = typeof window !== 'undefined' ? localStorage.getItem('masterkey_business_id') : null;
            if (localBizId) {
                console.log('--- DashboardFallback: Recovering by localBizId ---', localBizId);
                const { data } = await supabase.from('businesses').select('*').eq('id', localBizId).maybeSingle();
                if (data) {
                    router.replace(`/dashboard?id=${localBizId}`);
                }
            }
        };
        recoverAndVerify();
    }, [loading, business, user, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-10 text-center">
                <div className="w-16 h-16 border-4 border-ios-blue/20 border-t-ios-blue rounded-full animate-spin mb-6"></div>
                <p className="text-white/40 uppercase tracking-[0.2em] text-[10px] font-bold">Synchronizing Terminal...</p>
            </div>
        );
    }

    const dummyData = {
        lossAudit: null,
        nightLoss: null,
        missedCustomers: null,
        aiThreat: null
    };

    const placeholderBusiness = business?.id ? business : {
        entity_name: 'Initialize System',
        owner_name: user?.user_metadata?.full_name || '',
        email: user?.email || '',
        id: null
    };

    console.log('--- DashboardFallback: Rendering Grid Catch-all ---', { isPlaceholder: !business?.id });
    return <DashboardGrid business={placeholderBusiness} computedData={dummyData} />;
}
