import { useState, useCallback } from 'react';
import { fakeAuthService, AuthError } from '../services/fakeAuthService';
import { LoginCredentials, SignInPayload } from '../types/auth.types';

// 🔹 Return type
export interface UseLoginReturn {
  login:      (credentials: LoginCredentials) => Promise<SignInPayload | null>; // boolean tha
  loading:    boolean;
  error:      string | null;
  clearError: () => void;
}

// 🔹 Error messages
const ERROR_MESSAGES: Record<string, string> = {
  MISSING_FIELDS: 'Please enter your email and password.',
  USER_NOT_FOUND: 'No account found with this email.',
  INVALID_CREDENTIALS: 'Incorrect password. Please try again.',
  ACCOUNT_LOCKED: 'Account locked. Please contact support.',
  DEFAULT: 'Something went wrong. Please try again.',
};

const getFriendlyMessage = (err: AuthError): string =>
  ERROR_MESSAGES[err.code] ?? ERROR_MESSAGES.DEFAULT;

// 🔹 Hook
export const useLogin = (): UseLoginReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<SignInPayload | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await fakeAuthService.loginWithEmail(credentials);

        // ✅ return full payload (NO storage here)
        return {
          user: result.user,
          tokens: result.tokens,
        };

      } catch (err) {
        if (err instanceof AuthError) {
          setError(getFriendlyMessage(err));
        } else {
          setError(ERROR_MESSAGES.DEFAULT);
        }

        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => setError(null), []);

  return { login, loading, error, clearError };
};