'use client';
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from './supabaseClient';
import { useRouter } from 'next/navigation';
import { useDiagnosticStore } from '@/store/diagnosticStore';

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
                    // CRITICAL: We do NOT await here. Awaiting inside the listener can block 
                    // the main Auth promise and cause deadlocks during signup.
                    fetchBusinessProfile(currentUser);
                }
            } else if (event === 'SIGNED_OUT') {
                useDiagnosticStore.getState().resetStore();
                setUser(null);
                setBusiness(null);
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('masterkey_business_id');
                    localStorage.removeItem('masterkey_returning_user');
                }
                router.push('/');
            }

            // If we aren't fetching a profile, we can stop loading
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

    const fetchBusinessProfile = async (userObj, force = false) => {
        if (!userObj) {
            console.log('--- AuthProvider: No user object, skipping lookup ---');
            setLoading(false);
            return;
        }

        if (!force && fetchingRef.current === userObj.id) {
            console.log('--- AuthProvider: Lookup already in progress for this user, skipping. ---');
            return;
        }

        fetchingRef.current = userObj.id;
        console.log('--- AuthProvider: Starting lookup sequence for ---', { email: userObj.email, id: userObj.id, force });

        const timeoutLimit = 10000; // 10 second hard limit for DB loopups

        try {
            // Priority 1: Match by user_id
            const lookupById = async () => {
                console.log('--- AuthProvider: Attempting Priority 1 (user_id lookup) ---');
                const { data, error } = await supabase
                    .from('businesses')
                    .select('*')
                    .eq('user_id', userObj.id)
                    .maybeSingle();
                if (error) throw error;
                return data;
            };

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('DATABASE_TIMEOUT')), timeoutLimit)
            );

            let profile = await Promise.race([lookupById(), timeoutPromise]).catch(err => {
                if (err.message === 'DATABASE_TIMEOUT') {
                    console.warn('--- AuthProvider: ID lookup timed out after 10s ---');
                } else {
                    console.warn('--- AuthProvider: id lookup error ---', err.message);
                }
                return null;
            });

            // Priority 2: Fallback to email if user_id not found
            if (!profile && userObj.email) {
                console.log('--- AuthProvider: Fallback - Attempting Priority 2 (email lookup) ---', userObj.email);
                
                const lookupByEmail = async () => {
                    const { data, error } = await supabase
                        .from('businesses')
                        .select('*')
                        .ilike('email', userObj.email.trim())
                        .maybeSingle();
                    if (error) throw error;
                    return data;
                };

                profile = await Promise.race([lookupByEmail(), timeoutPromise]).catch(err => {
                    if (err.message === 'DATABASE_TIMEOUT') {
                        console.warn('--- AuthProvider: Email lookup timed out after 10s ---');
                    } else {
                        console.warn('--- AuthProvider: email lookup error ---', err.message);
                    }
                    return null;
                });
            }

            if (profile) {
                console.log('--- AuthProvider: Profile identified! ---', { bizId: profile.id, owner: profile.owner_name });
                // Link user_id if missing (Fire and forget, don't block)
                if (!profile.user_id) {
                    console.log('--- AuthProvider: Linking user_id to business profile ---');
                    supabase.from('businesses').update({ user_id: userObj.id }).eq('id', profile.id).then(({ error }) => {
                        if (error) console.error('--- AuthProvider: Linking failed ---', error.message);
                        else console.log('--- AuthProvider: Linking success ---');
                    });
                }
                setBusiness(profile);
                if (typeof window !== 'undefined') {
                    localStorage.setItem('masterkey_business_id', profile.id);
                }
            } else {
                console.log('--- AuthProvider: Result - No business profile exists for this session. ---');
                setBusiness(null);
            }
        } catch (err) {
            console.error('--- AuthProvider: UNHANDLED LOOKUP EXCEPTION ---', err);
        } finally {
            fetchingRef.current = null;
            setLoading(false);
            console.log('--- AuthProvider: Lookup sequence finished. Loading state cleared. ---');
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
