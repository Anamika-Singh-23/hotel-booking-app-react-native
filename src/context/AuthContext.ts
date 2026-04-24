// src/context/AuthContext.ts

import { createContext, useContext } from 'react';
import { AuthContextValue }         from '../types/auth.types';

// ─── Default value ────────────────────────────────────────────────────────────
// This only activates if someone calls useAuth() outside AuthProvider.
// The console.warn makes that mistake immediately obvious during development.

const noop = async () => {
  if (__DEV__) {
    console.warn('[AuthContext] Action called outside of AuthProvider.');
  }
};

export const defaultAuthContext: AuthContextValue = {
  isAuthenticated: false,
  user:            null,
  loading:         true,   // true = "haven't checked storage yet"
  signIn:          noop,
  signOut:         noop,
  restoreSession:  noop,
};

// ─── Context ──────────────────────────────────────────────────────────────────

export const AuthContext = createContext<AuthContextValue>(defaultAuthContext);

// ─── useAuth hook ─────────────────────────────────────────────────────────────
// The only import screens need.
// Usage: const { user, signIn, signOut } = useAuth();

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  // Catch the "used outside provider" mistake in development
  if (__DEV__ && context === defaultAuthContext) {
    console.warn(
      '[useAuth] You are using useAuth() outside of <AuthProvider>. ' +
      'Wrap your app with <AuthProvider> in App.tsx.',
    );
  }

  return context;
};