// src/hooks/useLogin.ts
import { useState, useCallback } from 'react';
import { fakeAuthService, AuthError } from '../services/fakeAuthService';
import { LoginCredentials }           from '../types/auth.types';
import { SignInPayload }               from '../types/auth.types';

interface UseLoginReturn {
  login:      (credentials: LoginCredentials) => Promise<SignInPayload | null>;
  loading:    boolean;
  error:      string | null;
  clearError: () => void;
}

const ERROR_MESSAGES: Record<string, string> = {
  MISSING_FIELDS:      'Please enter your email and password.',
  USER_NOT_FOUND:      'No account found with this email.',
  INVALID_CREDENTIALS: 'Incorrect password. Please try again.',
  DEFAULT:             'Something went wrong. Please try again.',
};

export const useLogin = (): UseLoginReturn => {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<SignInPayload | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await fakeAuthService.loginWithEmail(credentials);

        // SignInPayload return karo — storage AuthProvider handle karega
        return {
          user:   result.user,
          tokens: result.tokens,
        };
      } catch (err) {
        if (err instanceof AuthError) {
          setError(ERROR_MESSAGES[err.code] ?? ERROR_MESSAGES.DEFAULT);
        } else {
          setError(ERROR_MESSAGES.DEFAULT);
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const clearError = useCallback(() => setError(null), []);

  return { login, loading, error, clearError };
};