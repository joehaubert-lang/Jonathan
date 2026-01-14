import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type UserRole = 'trainer' | 'student' | 'doctor' | 'psychologist' | null;

type AuthContextType = {
    session: Session | null;
    user: User | null;
    role: UserRole;
    loading: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    role: null,
    loading: true,
    signIn: async () => { },
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async (session: Session | null) => {
            if (session?.user) {
                // Check if user is a trainer
                const { data: trainerData } = await supabase
                    .from('trainers')
                    .select('id')
                    .eq('id', session.user.id)
                    .single();

                if (trainerData) {
                    setRole('trainer');
                } else {
                    // Check if user is a student
                    const { data: studentData } = await supabase
                        .from('students')
                        .select('id')
                        .eq('id', session.user.id)
                        .single();

                    if (studentData) {
                        setRole('student');
                    } else {
                        setRole(null);
                    }
                }
            } else {
                setRole(null);
            }
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        };

        supabase.auth.getSession().then(({ data: { session } }) => {
            fetchProfile(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            fetchProfile(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async () => { };

    const signOut = async () => {
        await supabase.auth.signOut();
        setRole(null);
    };

    return (
        <AuthContext.Provider value={{ session, user, role, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
