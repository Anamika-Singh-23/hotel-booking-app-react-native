// src/hooks/useSignup.ts

import { useState, useCallback }          from 'react';
import { fakeAuthService, AuthError }     from '../services/fakeAuthService';
import { SignupCredentials, SignInPayload } from '../types/auth.types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface UseSignupReturn {
  signup:     (credentials: SignupCredentials) => Promise<SignInPayload | null>;
  loading:    boolean;
  error:      string | null;
  clearError: () => void;
}

// ── Error code → friendly message ─────────────────────────────────────────────

const ERROR_MAP: Record<string, string> = {
  USER_EXISTS:  'An account with this email already exists. Please login.',
  MISSING_FIELDS: 'Please fill in all required fields.',
  DEFAULT:      'Something went wrong. Please try again.',
};

// ── useSignup ─────────────────────────────────────────────────────────────────

export const useSignup = (): UseSignupReturn => {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const signup = useCallback(
    async (
      credentials: SignupCredentials,
    ): Promise<SignInPayload | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await fakeAuthService.registerWithEmail(credentials);

        // Return SignInPayload — same shape as useLogin
        // Screen will call signIn(payload) from AuthContext
        return {
          user:   result.user,
          tokens: result.tokens,
        };
      } catch (err) {
        if (err instanceof AuthError) {
          setError(ERROR_MAP[err.code] ?? ERROR_MAP.DEFAULT);
        } else {
          setError(ERROR_MAP.DEFAULT);
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const clearError = useCallback(() => setError(null), []);

  return { signup, loading, error, clearError };
};