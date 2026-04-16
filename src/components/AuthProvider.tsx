'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { fetchCurrentUserProfile, isSupabaseConfigured, signOutCurrentUser, supabase, type UserProfile } from '@/lib/supabase';

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  isAdmin: boolean;
  signOut: () => Promise<{ error: string | null }>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadAuth = async () => {
      const [{ data: sessionData }, { data: userData }] = await Promise.all([
        supabase.auth.getSession(),
        supabase.auth.getUser(),
      ]);

      const nextUser = userData.user ?? null;
      const nextProfile = nextUser ? await fetchCurrentUserProfile(nextUser.id) : null;

      if (!isMounted) {
        return;
      }

      setSession(sessionData.session ?? null);
      setUser(nextUser);
      setProfile(nextProfile);
      setIsLoading(false);
    };

    loadAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: string, nextSession: Session | null) => {
      if (!isMounted) {
        return;
      }

      const nextUser = nextSession?.user ?? null;
      const nextProfile = nextUser ? await fetchCurrentUserProfile(nextUser.id) : null;

      if (!isMounted) {
        return;
      }

      setSession(nextSession);
      setUser(nextUser);
      setProfile(nextProfile);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    profile,
    session,
    isLoading,
    isConfigured: isSupabaseConfigured,
    isAdmin: profile?.role === 'admin',
    signOut: signOutCurrentUser,
  }), [isLoading, profile, session, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}