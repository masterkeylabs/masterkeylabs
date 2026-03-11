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

        // --- DEDUPLICATION ---
        // Prevent multiple simultaneous lookups for the same user
        if (fetchingRef.current === userObj.id) {
            console.log('--- AuthProvider: Profile fetch already in progress for ---', userObj.id);
            return;
        }

        fetchingRef.current = userObj.id;
        console.log('--- AuthProvider: Starting profile lookup for ---', userObj.email);

        try {
            // OPTIMIZED: Unified search by user_id OR email in one round-trip
            // Using ilike for 'email' to be case-insensitive, eq for 'user_id'
            const { data: matchedBusiness, error: lookupError } = await supabase
                .from('businesses')
                .select('*')
                .or(`user_id.eq.${userObj.id}${userObj.email ? `,email.ilike.${userObj.email}` : ''}`)
                .maybeSingle();

            if (lookupError) {
                console.error('--- AuthProvider: Unified lookup error ---', lookupError.message);
            }

            if (matchedBusiness) {
                // AUTO-LINK: If we found by email but user_id is missing, link it in the background
                if (matchedBusiness.email?.toLowerCase() === userObj.email?.toLowerCase() && !matchedBusiness.user_id) {
                    console.log('--- AuthProvider: Auto-linking profile ---', matchedBusiness.id);
                    supabase
                        .from('businesses')
                        .update({ user_id: userObj.id })
                        .eq('id', matchedBusiness.id)
                        .then(({ error: linkError }) => {
                            if (linkError) console.error('--- AuthProvider: Background link error ---', linkError.message);
                        });
                }

                setBusiness(matchedBusiness);
                if (typeof window !== 'undefined') {
                    localStorage.setItem('masterkey_business_id', matchedBusiness.id);
                }
            } else {
                setBusiness(null);
            }
        } catch (err) {
            console.error('--- AuthProvider: Profile lookup exception ---', err);
        } finally {
            fetchingRef.current = null;
            setLoading(false);
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
