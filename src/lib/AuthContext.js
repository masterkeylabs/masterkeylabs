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

        const safetyTimeout = setTimeout(() => {
            if (isMounted) setLoading(false);
        }, 5000);

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
            } else {
                setBusiness(null);
            }
        } catch (error) {
            console.error('Error fetching business profile:', error.message);
            setBusiness(null);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, business, loading, signOut, fetchBusinessProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
