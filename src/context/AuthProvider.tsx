// src/context/AuthProvider.tsx
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
}                              from 'react';
import { AuthContext }         from './AuthContext';
import {
  persistSession,
  loadSession,
  clearSession,
}                              from '../storage/tokenStorage';
import {
  AuthUser,
  AuthContextValue,
  SignInPayload,
}                              from '../types/auth.types';

interface Props {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [user,      setUser]      = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // App start pe session restore karo
  useEffect(() => {
    (async () => {
      try {
        const session = await loadSession();
        if (session?.user && session?.accessToken) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (payload: SignInPayload): Promise<void> => {
    try {
      await persistSession({
        user:         payload.user,
        accessToken:  payload.tokens.accessToken,
        refreshToken: payload.tokens.refreshToken,
      });
      setUser(payload.user);
    } catch (err) {
      if (__DEV__) console.error('[AuthProvider] signIn error:', err);
      throw err;
    }
  }, []);

  // CRITICAL: signOut — sab clear karo, user null karo
  const signOut = useCallback(async (): Promise<void> => {
  // ✅ Fix: setUser(null) PEHLE karo
  // Isse React immediately re-render karta hai
  // aur RootNavigator Auth dikhata hai
  // clearSession background mein chal sakta hai
  setUser(null);

  // Storage clear background mein
  try {
    await clearSession();
  } catch (err) {
    if (__DEV__) {
      console.error('[AuthProvider] clearSession failed:', err);
    }
    // setUser(null) already ho gaya — user logout dikh raha hai
    // Storage clear fail hona critical nahi hai UI ke liye
  }
}, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      signIn,
      signOut,
    }),
    [user, isLoading, signIn, signOut],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};