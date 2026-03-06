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

        // Safety timeout to prevent infinite loading screen
        const safetyTimeout = setTimeout(() => {
            if (isMounted) setLoading(false);
        }, 5000);

        // Check active sessions and sets the user
        const getSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!isMounted) return;

                setUser(session?.user ?? null);
                if (session?.user) {
                    await fetchBusinessProfile(session.user.id);
                }
            } catch (error) {
                console.error('Error getting session:', error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                    clearTimeout(safetyTimeout);
                }
            }
        };

        getSession();

        // Listen for changes on auth state (sign in, sign out, etc.)
        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            try {
                const currentUser = session?.user ?? null;
                setUser(currentUser);
                if (currentUser) {
                    await fetchBusinessProfile(currentUser.id);
                } else {
                    setBusiness(null);
                }
            } catch (err) {
                console.error('Auth state change error:', err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                    clearTimeout(safetyTimeout);
                }
            }
        });

        return () => {
            isMounted = false;
            clearTimeout(safetyTimeout);
            if (authListener?.subscription) {
                authListener.subscription.unsubscribe();
            }
        };
    }, []);

    const fetchBusinessProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('businesses')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (data) {
                setBusiness(data);
                localStorage.setItem('masterkey_business_id', data.id);
            } else {
                setBusiness(null);
                // Clear local storage if no business is found for the logged in user
                localStorage.removeItem('masterkey_business_id');
            }
        } catch (error) {
            console.error('Error fetching business profile:', error.message);
            setBusiness(null);
            localStorage.removeItem('masterkey_business_id');
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('masterkey_business_id');
        localStorage.removeItem('masterkey_user_name');
        localStorage.removeItem('masterkey_user_phone');
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, business, loading, signOut, fetchBusinessProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
