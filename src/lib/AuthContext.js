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
                            await fetchBusinessProfile(manualSession.user);

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
                    await fetchBusinessProfile(session.user);
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
                await fetchBusinessProfile(currentUser);
            }
            if (isMounted) setLoading(false);
        });

        return () => {
            isMounted = false;
            if (authListener?.subscription) authListener.subscription.unsubscribe();
        };
    }, []);

    const fetchBusinessProfile = async (userObj) => {
        if (!userObj) return;
        const userId = userObj.id;

        try {
            // 1. Primary Look: Linked user_id
            let { data } = await supabase
                .from('businesses')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle();

            // 2. Secondary Lookup: Match by Verified Email (Auto-Link)
            if (!data && userObj.email) {
                console.log('--- AuthProvider: Finding business by email to link ---', userObj.email);
                const { data: emailMatch } = await supabase
                    .from('businesses')
                    .select('*')
                    .ilike('email', userObj.email)
                    .maybeSingle();

                if (emailMatch) {
                    console.log('--- AuthProvider: Auto-linking profile to verified user ---');
                    const { data: linkedData } = await supabase
                        .from('businesses')
                        .update({ user_id: userId })
                        .eq('id', emailMatch.id)
                        .select()
                        .single();
                    data = linkedData;
                }
            }

            if (data) {
                setBusiness(data);
                localStorage.setItem('masterkey_business_id', data.id);
            }
        } catch (error) {
            console.error('Error fetching business profile:', error);
        }
    };

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
            // Clear ALL MasterKey related storage
            localStorage.removeItem('masterkey_business_id');
            localStorage.removeItem('masterkey_returning_user');
            localStorage.removeItem('masterkey_temp_form');
            localStorage.removeItem('masterkey_temp_results');

            setUser(null);
            setBusiness(null);

            console.log('--- AuthContext: User Signed Out ---');
            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
            // Fallback redirect
            window.location.href = '/';
        }
    };

    return (
        <AuthContext.Provider value={{ user, business, loading, signOut, fetchBusinessProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
