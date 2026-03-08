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
        console.log('--- AuthProvider: Initializing ---');
        let isMounted = true;

        const getSession = async () => {
            try {
                // Check if we have a hash session first (fallback for deep links)
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('--- AuthProvider: Session check error ---', error);
                }

                if (!isMounted) return;

                console.log('--- AuthProvider: Session Check ---', session?.user?.email || 'No Session');

                // If no session but hash exists, try manual parsing (Rescue Mode)
                if (!session && typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
                    console.log('--- AuthProvider: Detected access_token in hash, attempting manual rescue ---');

                    const hash = window.location.hash.substring(1); // remove #
                    const params = new URLSearchParams(hash);
                    const accessToken = params.get('access_token');
                    const refreshToken = params.get('refresh_token');

                    if (accessToken) {
                        console.log('--- AuthProvider: Forcing session sync with token ---');
                        const { data: { session: manualSession }, error: manualError } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken || ''
                        });

                        if (manualError) {
                            console.error('--- AuthProvider: Manual setSession error ---', manualError);
                        }

                        if (manualSession?.user) {
                            console.log('--- AuthProvider: Rescue success! ---', manualSession.user.email);
                            setUser(manualSession.user);
                            await fetchBusinessProfile(manualSession.user.id);

                            // Clean up hash to prevent re-processing
                            window.history.replaceState(null, '', window.location.pathname + window.location.search);
                            return;
                        }
                    } else {
                        console.warn('--- AuthProvider: Hash present but access_token not found ---');
                    }
                }

                if (session?.user) {
                    setUser(session.user);
                    if (typeof window !== 'undefined') localStorage.setItem('masterkey_returning_user', 'true');
                    await fetchBusinessProfile(session.user.id);
                } else {
                    setUser(null);
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
                if (typeof window !== 'undefined') localStorage.setItem('masterkey_returning_user', 'true');
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
