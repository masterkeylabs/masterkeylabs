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
        // Force-clear loading after 12s, even if a fetch is technically "active"
        // (to handle hung network requests that never resolve)
        const safetyTimer = setTimeout(() => {
            if (loading && isMounted) {
                console.warn('--- AuthProvider: SAFETY TIMEOUT TRIGGERED (Forced Clear) ---');
                if (fetchingRef.current) {
                    console.warn(`--- AuthProvider: Clearing stuck fetch for ID: ${fetchingRef.current} ---`);
                    fetchingRef.current = null;
                }
                setLoading(false);
            }
        }, 12000);

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
                        setLoading(false); // Force finish loading for guest users
                        if (typeof window !== 'undefined') {
                            localStorage.removeItem('masterkey_business_id');
                        }
                    }
                }
            } catch (err) {
                console.error('--- AuthProvider: Init Error ---', err);
                if (isMounted) setLoading(false);
            } finally {
                if (isMounted) {
                    console.log('--- AuthProvider: Init complete sequence finished ---');
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
        console.log('--- AuthContext: Starting SignOut sequence ---');
        try {
            // Priority 1: Clear local state and storage FIRST to make it feel instant
            if (typeof window !== 'undefined') {
                localStorage.removeItem('masterkey_business_id');
                localStorage.removeItem('masterkey_returning_user');
                localStorage.removeItem('masterkey_temp_form');
                localStorage.removeItem('masterkey_temp_results');
                localStorage.removeItem('masterkey-auth-token'); // Clear supabase persistence
            }

            setUser(null);
            setBusiness(null);

            // Priority 2: Attempt Supabase Signout with a hard timeout
            // If Supabase is blocked (e.g. in India) or hangs, we don't want the UI stuck.
            const supabaseSignOut = supabase.auth.signOut();
            const timeoutPromise = new Promise((resolve) => setTimeout(() => {
                console.warn('--- AuthContext: Supabase signOut timed out, forcing redirect ---');
                resolve({ error: null });
            }, 3000));

            await Promise.race([supabaseSignOut, timeoutPromise]);

            console.log('--- AuthContext: Logout sequence complete ---');
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
