// src/storage/tokenStorage.ts

import AsyncStorage        from '@react-native-async-storage/async-storage';
import { PersistedSession } from '../types/auth.types';

const SESSION_KEY = '@aastha/session';

export const persistSession = async (
  session: PersistedSession,
): Promise<void> => {
  try {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (err) {
    if (__DEV__) console.error('[tokenStorage] persistSession error:', err);
    throw err;
  }
};

export const loadSession = async (): Promise<PersistedSession | null> => {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedSession;
  } catch {
    return null;
  }
};

export const clearSession = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch (err) {
    if (__DEV__) console.error('[tokenStorage] clearSession error:', err);
    throw err;
  }
};

// Alias for backward compatibility
export const getAccessToken = async (): Promise<string | null> => {
  const session = await loadSession();
  return session?.accessToken ?? null;
};

export const clearAllTokens = clearSession;