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
        console.log('--- AuthProvider: Initializing native session check ---');
        let isMounted = true;

        const initializeAuth = async () => {
            try {
                // Use getUser() instead of getSession() to force a server-side verification
                // This ensures that if a user was deleted from the DB, the client-side session is invalidated.
                const { data: { user: currentUser }, error } = await supabase.auth.getUser();
                if (error && error.name !== 'AuthSessionMissingError') {
                    console.warn('--- AuthProvider: Session verification failed ---', error.message);
                }

                if (isMounted) {
                    setUser(currentUser);
                    if (currentUser) {
                        await fetchBusinessProfile(currentUser);
                    } else {
                        // Safe fallback for guests (legacy cleanup)
                        setBusiness(null);
                        if (typeof window !== 'undefined') {
                            localStorage.removeItem('masterkey_business_id');
                        }
                    }
                }
            } catch (err) {
                console.error('--- AuthProvider: Init Error ---', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        initializeAuth();

        // Listen for all auth events (Login, SignOut, Password Recovery, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`--- Auth Event: ${event} ---`, session?.user?.email);

            if (!isMounted) return;

            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
                if (currentUser) await fetchBusinessProfile(currentUser);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setBusiness(null);
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('masterkey_business_id');
                    localStorage.removeItem('masterkey_returning_user');
                }
                router.push('/');
            }

            setLoading(false);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [router]);

    const fetchBusinessProfile = async (userObj) => {
        if (!userObj) return;

        try {
            // Priority 1: Direct link by user_id
            let { data } = await supabase
                .from('businesses')
                .select('*')
                .eq('user_id', userObj.id)
                .maybeSingle();

            // Priority 2: Auto-connect by email match (Recovery)
            if (!data && userObj.email) {
                console.log('--- AuthProvider: Auto-connecting verified user to profile ---', userObj.email);
                const { data: emailMatch } = await supabase
                    .from('businesses')
                    .select('*')
                    .ilike('email', userObj.email)
                    .maybeSingle();

                if (emailMatch) {
                    // This is the CRITICAL STEP: link the auth user to the existing business data
                    const { data: linked } = await supabase
                        .from('businesses')
                        .update({ user_id: userObj.id })
                        .eq('id', emailMatch.id)
                        .select()
                        .single();
                    data = linked;
                }
            }

            if (data) {
                setBusiness(data);
                if (typeof window !== 'undefined') {
                    localStorage.setItem('masterkey_business_id', data.id);
                }
            }
        } catch (err) {
            console.error('--- AuthProvider: Profile lookup failed ---', err);
        } finally {
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
