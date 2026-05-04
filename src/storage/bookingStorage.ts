// src/storage/bookingStorage.ts

import AsyncStorage      from '@react-native-async-storage/async-storage';
import { BookingRecord } from '../types/booking.types';

// User-specific key — har user ka alag storage
const getKey = (userId: string): string =>
  `@aastha/bookings_${userId}`;

// ── Load ──────────────────────────────────────────────────────────────────────

export const loadBookingHistory = async (
  userId: string,
): Promise<BookingRecord[]> => {
  try {
    const raw = await AsyncStorage.getItem(getKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// ── Save ──────────────────────────────────────────────────────────────────────

export const saveBookingHistory = async (
  userId:  string,
  history: BookingRecord[],
): Promise<void> => {
  try {
    await AsyncStorage.setItem(getKey(userId), JSON.stringify(history));
  } catch (err) {
    if (__DEV__) console.error('[bookingStorage] save error:', err);
  }
};

// ── Append ────────────────────────────────────────────────────────────────────

export const appendBookingRecord = async (
  userId: string,
  record: BookingRecord,
): Promise<void> => {
  const existing = await loadBookingHistory(userId);
  await saveBookingHistory(userId, [record, ...existing]);
};

// ── Clear — sirf explicitly call karo (e.g. account delete) ──────────────────
// Logout pe CALL MAT KARO

export const clearBookingHistory = async (
  userId: string,
): Promise<void> => {
  try {
    await AsyncStorage.removeItem(getKey(userId));
  } catch (err) {
    if (__DEV__) console.error('[bookingStorage] clear error:', err);
  }
};