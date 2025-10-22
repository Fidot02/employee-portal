

import { supabase } from '../lib/supabase';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            (async () => {
                setUser(session?.user ?? null);
            })();
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { error };
    };

    const signUp = async (email, password, firstName, lastName, employeeId) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error || !data.user) {
            return { error };
        }

        const { error: profileError } = await supabase
            .from('employees')
            .insert({
                id: data.user.id,
                employee_id: employeeId,
                first_name: firstName,
                last_name: lastName,
                email: email,
            });

        return { error: profileError };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const value = {
        user,
        loading,
        signIn,
        signUp,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
 
