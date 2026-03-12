'use client';
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from './supabaseClient';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchingRef = useRef(null);

    useEffect(() => {
        console.log('--- AuthProvider: Initializing native session check ---');
        let isMounted = true;

        // --- SAFETY TIMEOUT ---
        // If the database is slow or a connection hangs, this forces the app
        // to finish its loading state after 10 seconds.
        const safetyTimer = setTimeout(() => {
            if (loading && isMounted && !fetchingRef.current) {
                console.warn('--- AuthProvider: SAFETY TIMEOUT TRIGGERED ---');
                setLoading(false);
            } else if (loading && isMounted && fetchingRef.current) {
                console.log('--- AuthProvider: Safety timer ignored, fetch still active ---');
            }
        }, 10000);

        const initializeAuth = async () => {
            console.log('--- AuthProvider: Running initializeAuth ---');
            try {
                const { data: { user: currentUser }, error } = await supabase.auth.getUser();

                if (error && error.name !== 'AuthSessionMissingError') {
                    console.warn('--- AuthProvider: getUser error ---', error.message);
                }

                console.log('--- AuthProvider: currentUser ---', currentUser?.email || 'none');

                if (isMounted) {
                    setUser(currentUser);
                    if (currentUser) {
                        await fetchBusinessProfile(currentUser);
                    } else {
                        setBusiness(null);
                        if (typeof window !== 'undefined') {
                            localStorage.removeItem('masterkey_business_id');
                        }
                    }
                }
            } catch (err) {
                console.error('--- AuthProvider: Init Error ---', err);
            } finally {
                if (isMounted) {
                    console.log('--- AuthProvider: Init complete, setting loading false ---');
                    setLoading(false);
                }
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`--- Auth Event Trace: ${event} ---`, session?.user?.email || 'no-user');
            if (!isMounted) return;

            const currentUser = session?.user ?? null;

            if (event === 'INITIAL_SESSION' && !currentUser) {
                console.log('--- AuthProvider: No initial session found ---');
            }

            setUser(currentUser);

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
                if (currentUser) {
                    console.log('--- AuthProvider: Profile lookup triggered by event ---', event);
                    await fetchBusinessProfile(currentUser);
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setBusiness(null);
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('masterkey_business_id');
                    localStorage.removeItem('masterkey_returning_user');
                }
                router.push('/');
            }

            // Critical: Only stop loading if we aren't currently fetching a business profile
            if (!fetchingRef.current) {
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
            clearTimeout(safetyTimer);
            subscription.unsubscribe();
        };
    }, [router]);

    const fetchBusinessProfile = async (userObj) => {
        if (!userObj) {
            setLoading(false);
            return;
        }

        if (fetchingRef.current === userObj.id) {
            return;
        }

        fetchingRef.current = userObj.id;
        console.log('--- AuthProvider: Starting lookup for ---', userObj.email);

        try {
            // Priority 1: Match by user_id
            let { data: profile, error: idError } = await supabase
                .from('businesses')
                .select('*')
                .eq('user_id', userObj.id)
                .maybeSingle();

            if (idError) console.warn('--- AuthProvider: user_id lookup error ---', idError.message);

            // Priority 2: Fallback to email if user_id not found
            if (!profile && userObj.email) {
                console.log('--- AuthProvider: Fallback lookup by email ---', userObj.email);
                const { data: emailProfile, error: emailError } = await supabase
                    .from('businesses')
                    .select('*')
                    .ilike('email', userObj.email.trim())
                    .maybeSingle();

                if (emailError) console.warn('--- AuthProvider: email lookup error ---', emailError.message);
                profile = emailProfile;
            }

            if (profile) {
                console.log('--- AuthProvider: Profile found ---', profile.id);
                // Link user_id if missing
                if (!profile.user_id) {
                    console.log('--- AuthProvider: Auto-linking user_id ---');
                    await supabase.from('businesses').update({ user_id: userObj.id }).eq('id', profile.id);
                }
                setBusiness(profile);
                if (typeof window !== 'undefined') {
                    localStorage.setItem('masterkey_business_id', profile.id);
                }
            } else {
                console.log('--- AuthProvider: No profile found for user ---');
                setBusiness(null);
            }
        } catch (err) {
            console.error('--- AuthProvider: Lookup exception ---', err);
        } finally {
            fetchingRef.current = null;
            setLoading(false);
            console.log('--- AuthProvider: Lookup finished ---');
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
