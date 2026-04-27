// src/storage/bookingStorage.ts

import AsyncStorage      from '@react-native-async-storage/async-storage';
import { BookingRecord } from '../types/booking.types';

// ─────────────────────────────────────────────────────────────────────────────
// Key
// ─────────────────────────────────────────────────────────────────────────────

const BOOKING_HISTORY_KEY = '@aastha/booking_history';

// ─────────────────────────────────────────────────────────────────────────────
// Load
// ─────────────────────────────────────────────────────────────────────────────

export const loadBookingHistory = async (): Promise<BookingRecord[]> => {
  try {
    const raw = await AsyncStorage.getItem(BOOKING_HISTORY_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    // Safety check — ensure it's actually an array before returning
    return Array.isArray(parsed) ? parsed : [];

  } catch (err) {
    if (__DEV__) {
      console.error('[bookingStorage] loadBookingHistory failed:', err);
    }
    return [];  // corrupt data — return empty, don't crash
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Save — replaces entire array (source of truth)
// ─────────────────────────────────────────────────────────────────────────────

export const saveBookingHistory = async (
  history: BookingRecord[],
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      BOOKING_HISTORY_KEY,
      JSON.stringify(history),
    );
  } catch (err) {
    if (__DEV__) {
      console.error('[bookingStorage] saveBookingHistory failed:', err);
    }
    // Don't throw — failing to persist shouldn't crash the app
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Append — reads current, pushes new record, saves back
// Used internally by BookingProvider
// ─────────────────────────────────────────────────────────────────────────────

export const appendBookingRecord = async (
  record: BookingRecord,
): Promise<void> => {
  const existing = await loadBookingHistory();
  const updated  = [record, ...existing];  // newest first
  await saveBookingHistory(updated);
};

// ─────────────────────────────────────────────────────────────────────────────
// Clear — for testing / logout
// ─────────────────────────────────────────────────────────────────────────────

export const clearBookingHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(BOOKING_HISTORY_KEY);
  } catch (err) {
    if (__DEV__) {
      console.error('[bookingStorage] clearBookingHistory failed:', err);
    }
  }
};