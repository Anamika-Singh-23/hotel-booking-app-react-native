import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { AuthContext }                       from './AuthContext';
import { persistSession,
         loadSession,
         destroySession }                    from '../storage/tokenStorage';
import {
  AuthUser,
  AuthContextValue,
  SignInPayload,
  PersistedSession,
} from '../types/auth.types';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {

  // ── State ────────────────────────────────────────────────────────────────
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true); // true = session check chal rahi hai

  const isAuthenticated = user !== null; // derived — no extra useState

  // ── restoreSession ────────────────────────────────────────────────────────
  // App launch pe AsyncStorage se session padho.
  // Yeh function RootNavigator ko bhi expose hota hai future use ke liye.

  const restoreSession = useCallback(async (): Promise<void> => {
    try {
      const session: PersistedSession | null = await loadSession();

      if (session?.user && session?.accessToken) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      if (__DEV__) {
        console.error('[AuthProvider] restoreSession failed:', err);
      }
      setUser(null);
    } finally {
      // Loading hamesha band honi chahiye — chahe success ho ya fail
      setLoading(false);
    }
  }, []);

  // App mount hote hi session restore karo
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // ── signIn ────────────────────────────────────────────────────────────────
  // LoginScreen se payload aata hai { user, tokens }
  // AuthProvider storage handle karta hai — LoginScreen nahi

  const signIn = useCallback(async (payload: SignInPayload): Promise<void> => {
    const session: PersistedSession = {
      user:         payload.user,
      accessToken:  payload.tokens.accessToken,
      refreshToken: payload.tokens.refreshToken,
    };

    // Pehle storage mein save karo, phir state update karo
    // Agar ulta karo aur storage fail ho — user logged in dikhega lekin
    // next app open pe session nahi milega
    await persistSession(session);
    setUser(payload.user);
  }, []);

  // ── signOut ───────────────────────────────────────────────────────────────
  // Storage pehle clear karo, phir state — same reason as above

  const signOut = useCallback(async (): Promise<void> => {
    try {
      await destroySession();
    } catch (err) {
      if (__DEV__) {
        console.error('[AuthProvider] destroySession failed:', err);
      }
      // Storage fail bhi ho — local state toh clear karo
    } finally {
      setUser(null);
    }
  }, []);

  // ── Context value ─────────────────────────────────────────────────────────
  // useMemo zaruri hai — iske bina har parent re-render pe
  // naya object banta hai aur SAARE consumers re-render hote hain

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      user,
      loading,
      signIn,
      signOut,
      restoreSession,
    }),
    [isAuthenticated, user, loading, signIn, signOut, restoreSession],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};