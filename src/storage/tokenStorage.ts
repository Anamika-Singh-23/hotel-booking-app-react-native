// src/storage/tokenStorage.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistedSession } from '../types/auth.types';

// ── Key constants ─────────────────────────────────────────────────────────────
// Namespaced with @appname/ to avoid collision with other libs

const STORAGE_KEYS = {
  ACCESS_TOKEN:  '@aastha/access_token',
  REFRESH_TOKEN: '@aastha/refresh_token',
  USER:          '@aastha/user',
} as const;

const KEYS = {
  SESSION: '@aastha/session',   // store as one JSON blob — single read on launch
} as const;

// ── Save ──────────────────────────────────────────────────────────────────────

export const persistSession = async (
  session: PersistedSession,
): Promise<void> => {
  await AsyncStorage.setItem(KEYS.SESSION, JSON.stringify(session));
};

// ── Read ──────────────────────────────────────────────────────────────────────

export const loadSession = async (): Promise<PersistedSession | null> => {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SESSION);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedSession;
  } catch {
    // Corrupted data — treat as no session
    return null;
  }
};



// ── Clear (logout) ────────────────────────────────────────────────────────────

export const destroySession = async (): Promise<void> => {
  await AsyncStorage.removeItem(KEYS.SESSION);
};