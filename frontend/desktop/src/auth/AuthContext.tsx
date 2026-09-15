import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import * as authApi from '../api/auth';
import { AuthResponse, User } from '../types/api';

type AuthContextValue = {
  user: User | null;
  accessToken: string | null;
  isSigningIn: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (input: Parameters<typeof authApi.register>[0]) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthResponse | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      isSigningIn,
      async signIn(email, password) {
        setIsSigningIn(true);
        try {
          setSession(await authApi.login(email, password));
        } finally {
          setIsSigningIn(false);
        }
      },
      async register(input) {
        setIsSigningIn(true);
        try {
          setSession(await authApi.register(input));
        } finally {
          setIsSigningIn(false);
        }
      },
      signOut() {
        setSession(null);
      },
    }),
    [isSigningIn, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
