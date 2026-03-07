'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;

        const getSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!isMounted) return;

                setUser(session?.user ?? null);
                if (session?.user) {
                    await fetchBusinessProfile(session.user.id);
                } else {
                    // Restore localStorage fallback (Bug-Free flow)
                    const localBizId = typeof window !== 'undefined' ? localStorage.getItem('masterkey_business_id') : null;
                    if (localBizId) {
                        const { data } = await supabase.from('businesses').select('*').eq('id', localBizId).maybeSingle();
                        if (data && isMounted) setBusiness(data);
                    }
                }
            } catch (error) {
                console.error('Session retrieval error:', error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        getSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                await fetchBusinessProfile(currentUser.id);
            }
            if (isMounted) setLoading(false);
        });

        return () => {
            isMounted = false;
            if (authListener?.subscription) authListener.subscription.unsubscribe();
        };
    }, []);

    const fetchBusinessProfile = async (userId) => {
        try {
            const { data } = await supabase
                .from('businesses')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (data) {
                setBusiness(data);
                localStorage.setItem('masterkey_business_id', data.id);
            }
        } catch (error) {
            console.error('Error fetching business profile:', error);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('masterkey_business_id');
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, business, loading, signOut, fetchBusinessProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
