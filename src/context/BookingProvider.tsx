// src/context/BookingProvider.tsx

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
}                                from 'react';
import { BookingContext }        from './BookingContext';
import {
  loadBookingHistory,
  appendBookingRecord,
}                                from '../storage/bookingStorage';
import {
  BookingDetails,
  BookingUpdatePayload,
  BookingComputedValues,
  BookingContextValue,
  BookingRecord,
  GuestCount,
}                                from '../types/booking.types';

// ─────────────────────────────────────────────────────────────────────────────
// Initial state
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_GUESTS: GuestCount = {
  adults:   1,
  children: 0,
};

const INITIAL_BOOKING: BookingDetails = {
  selectedHotel: null,
  checkInDate:   null,
  checkOutDate:  null,
  guests:        INITIAL_GUESTS,
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const calcNights = (
  checkIn:  Date | null,
  checkOut: Date | null,
): number => {
  if (!checkIn || !checkOut) return 0;
  const diff = Math.floor(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
  );
  return diff > 0 ? diff : 0;
};

const computeValues = (booking: BookingDetails): BookingComputedValues => {
  const totalNights   = calcNights(booking.checkInDate, booking.checkOutDate);
  const totalGuests   = booking.guests.adults + booking.guests.children;
  const pricePerNight = booking.selectedHotel?.price ?? 0;
  const subtotal      = totalNights * pricePerNight;
  const tax           = Math.round(subtotal * 0.18);
  const totalPrice    = subtotal + tax;

  const isReadyToBook =
    booking.selectedHotel !== null &&
    booking.checkInDate   !== null &&
    booking.checkOutDate  !== null &&
    totalNights            >  0   &&
    booking.guests.adults  >  0;

  return { totalNights, totalGuests, totalPrice, isReadyToBook };
};

// Unique booking ID — timestamp based, no library needed
const generateBookingId = (): string =>
  `BK-${Date.now().toString(36).toUpperCase().slice(-8)}`;

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

interface BookingProviderProps {
  children: React.ReactNode;
}

export const BookingProvider: React.FC<BookingProviderProps> = ({
  children,
}) => {

  // ── Current booking flow state ─────────────────────────────────────────────
  const [booking, setBooking] = useState<BookingDetails>(INITIAL_BOOKING);

  // ── Booking history state ──────────────────────────────────────────────────
  const [bookingHistory, setBookingHistory] = useState<BookingRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // ── Load history from AsyncStorage on mount ────────────────────────────────
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await loadBookingHistory();
        setBookingHistory(history);
      } catch (err) {
        if (__DEV__) {
          console.error('[BookingProvider] Failed to load history:', err);
        }
        // Stay with empty array — don't crash
      } finally {
        setHistoryLoading(false);
      }
    };

    loadHistory();
  }, []);

  // ── Derived from booking ───────────────────────────────────────────────────
  const computed = useMemo(
    () => computeValues(booking),
    [booking],
  );

  // ── setBookingDetails ──────────────────────────────────────────────────────
  const setBookingDetails = useCallback(
    (payload: BookingUpdatePayload): void => {
      setBooking(prev => {
        const next: BookingDetails = {
          ...prev,
          ...payload,
          guests: payload.guests
            ? { ...prev.guests, ...payload.guests }
            : prev.guests,
        };

        // Guard: auto-clear checkOut if new checkIn is after it
        if (
          payload.checkInDate                               &&
          next.checkOutDate                                 &&
          next.checkOutDate <= payload.checkInDate
        ) {
          next.checkOutDate = null;
        }

        return next;
      });
    },
    [],
  );

  // ── clearBooking ───────────────────────────────────────────────────────────
  const clearBooking = useCallback((): void => {
    setBooking(INITIAL_BOOKING);
  }, []);

  // ── addBookingToHistory ────────────────────────────────────────────────────
  // Called by PaymentScreen (or any screen) after payment success.
  // Accepts partial record — generates bookingId, bookedAt, status internally.
  // Returns the generated bookingId so UI can display it.

  const addBookingToHistory = useCallback(
    async (
      record: Omit<BookingRecord, 'bookingId' | 'bookedAt' | 'status'>,
    ): Promise<string> => {

      const bookingId = generateBookingId();

      const fullRecord: BookingRecord = {
        ...record,
        // Serialize dates as ISO strings — AsyncStorage can't store Date objects
        checkInDate:  typeof record.checkInDate === 'string'
          ? record.checkInDate
          : (record.checkInDate as unknown as Date).toISOString(),
        checkOutDate: typeof record.checkOutDate === 'string'
          ? record.checkOutDate
          : (record.checkOutDate as unknown as Date).toISOString(),
        bookingId,
        bookedAt: new Date().toISOString(),
        status:   'confirmed',
      };

      try {
        // 1. Persist to AsyncStorage first
        await appendBookingRecord(fullRecord);

        // 2. Update in-memory state — newest booking at the top
        setBookingHistory(prev => [fullRecord, ...prev]);

      } catch (err) {
        if (__DEV__) {
          console.error('[BookingProvider] addBookingToHistory failed:', err);
        }
        // State already updated — storage failure is non-fatal
        // App works fine, just won't persist across restarts
      }

      return bookingId;
    },
    [],
  );

  // ── Context value ──────────────────────────────────────────────────────────

  const value = useMemo<BookingContextValue>(
    () => ({
      // Current booking flow
      booking,
      computed,
      setBookingDetails,
      clearBooking,

      // History
      bookingHistory,
      addBookingToHistory,
      historyLoading,
    }),
    [
      booking,
      computed,
      setBookingDetails,
      clearBooking,
      bookingHistory,
      addBookingToHistory,
      historyLoading,
    ],
  );

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};