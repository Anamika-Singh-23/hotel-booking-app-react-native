// src/context/BookingProvider.tsx

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
}                                from 'react';
import { BookingContext }        from './BookingContext';
import { useAuth }               from './AuthContext';
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

const INITIAL_GUESTS: GuestCount = { adults: 1, children: 0 };

const INITIAL_BOOKING: BookingDetails = {
  selectedHotel: null,
  checkInDate:   null,
  checkOutDate:  null,
  guests:        INITIAL_GUESTS,
};

const calcNights = (a: Date | null, b: Date | null): number => {
  if (!a || !b) return 0;
  const d = Math.floor((b.getTime() - a.getTime()) / 86400000);
  return d > 0 ? d : 0;
};

const computeValues = (b: BookingDetails): BookingComputedValues => {
  const totalNights   = calcNights(b.checkInDate, b.checkOutDate);
  const totalGuests   = b.guests.adults + b.guests.children;
  const subtotal      = (b.selectedHotel?.price ?? 0) * totalNights;
  const tax           = Math.round(subtotal * 0.18);
  const totalPrice    = subtotal + tax;
  const isReadyToBook =
    b.selectedHotel !== null &&
    b.checkInDate   !== null &&
    b.checkOutDate  !== null &&
    totalNights      >  0   &&
    b.guests.adults  >  0;
  return { totalNights, totalGuests, totalPrice, isReadyToBook };
};

const generateBookingId = (): string =>
  `BK-${Date.now().toString(36).toUpperCase().slice(-8)}`;

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // user object lo — userId ke liye
  const { isAuthenticated, user } = useAuth();

  const [booking,        setBooking]        = useState<BookingDetails>(INITIAL_BOOKING);
  const [bookingHistory, setBookingHistory] = useState<BookingRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // ── isAuthenticated change hone par react karo ────────────────────────────
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // User logged in — US USER ki bookings load karo
      setHistoryLoading(true);
      loadBookingHistory(user.id)          // ← user.id pass karo
        .then(h => setBookingHistory(h))
        .catch(() => setBookingHistory([]))
        .finally(() => setHistoryLoading(false));
    } else {
      // User logged out — sirf memory clear karo
      // AsyncStorage mein bookings SAFE hain — delete NAHI ho rahi
      setBookingHistory([]);
      setBooking(INITIAL_BOOKING);
      setHistoryLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  const computed = useMemo(
    () => computeValues(booking),
    [booking],
  );

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
        if (
          payload.checkInDate &&
          next.checkOutDate   &&
          next.checkOutDate <= payload.checkInDate
        ) {
          next.checkOutDate = null;
        }
        return next;
      });
    },
    [],
  );

  const clearBooking = useCallback(
    (): void => setBooking(INITIAL_BOOKING),
    [],
  );

  const addBookingToHistory = useCallback(
    async (
      record: Omit<BookingRecord, 'bookingId' | 'bookedAt' | 'status'>,
    ): Promise<string> => {
      if (!user?.id) {
        if (__DEV__) console.warn('[BookingProvider] No user id — cannot save booking');
        return '';
      }

      const bookingId   = generateBookingId();
      const fullRecord: BookingRecord = {
        ...record,
        checkInDate:
          typeof record.checkInDate === 'string'
            ? record.checkInDate
            : (record.checkInDate as unknown as Date).toISOString(),
        checkOutDate:
          typeof record.checkOutDate === 'string'
            ? record.checkOutDate
            : (record.checkOutDate as unknown as Date).toISOString(),
        bookingId,
        bookedAt: new Date().toISOString(),
        status:   'confirmed',
      };

      try {
        // user.id ke saath save karo — user-specific storage
        await appendBookingRecord(user.id, fullRecord);
        setBookingHistory(prev => [fullRecord, ...prev]);
      } catch (err) {
        if (__DEV__) console.error('[BookingProvider]', err);
      }

      return bookingId;
    },
    [user?.id],
  );

  const value = useMemo<BookingContextValue>(
    () => ({
      booking,
      computed,
      bookingHistory,
      historyLoading,
      setBookingDetails,
      clearBooking,
      addBookingToHistory,
    }),
    [
      booking, computed, bookingHistory,
      historyLoading, setBookingDetails,
      clearBooking, addBookingToHistory,
    ],
  );

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};