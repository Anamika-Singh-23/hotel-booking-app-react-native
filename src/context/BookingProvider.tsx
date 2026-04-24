// src/context/BookingProvider.tsx

import React, {
  useState,
  useCallback,
  useMemo,
}                              from 'react';
import { BookingContext }      from './BookingContext';
import {
  BookingDetails,
  BookingUpdatePayload,
  BookingComputedValues,
  BookingContextValue,
  GuestCount,
}                              from '../types/booking.types';

// ─────────────────────────────────────────────────────────────────────────────
// Initial state
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_GUESTS: GuestCount = {
  adults:   1,    // minimum 1 adult always
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

// Returns number of nights between two dates
// Returns 0 if either date is null or checkOut <= checkIn
const calcNights = (
  checkIn:  Date | null,
  checkOut: Date | null,
): number => {
  if (!checkIn || !checkOut) return 0;

  const diffMs    = checkOut.getTime() - checkIn.getTime();
  const diffDays  = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
};

// Compute derived values from current booking state
// Pure function — no side effects
const computeValues = (booking: BookingDetails): BookingComputedValues => {
  const totalNights  = calcNights(booking.checkInDate, booking.checkOutDate);
  const totalGuests  = booking.guests.adults + booking.guests.children;
  const pricePerNight = booking.selectedHotel?.price ?? 0;
  const totalPrice   = totalNights * pricePerNight;

  const isReadyToBook =
    booking.selectedHotel  !== null &&
    booking.checkInDate    !== null &&
    booking.checkOutDate   !== null &&
    totalNights             >  0   &&
    booking.guests.adults   >  0;

  return {
    totalNights,
    totalGuests,
    totalPrice,
    isReadyToBook,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

interface BookingProviderProps {
  children: React.ReactNode;
}

export const BookingProvider: React.FC<BookingProviderProps> = ({
  children,
}) => {
  const [booking, setBooking] = useState<BookingDetails>(INITIAL_BOOKING);

  // ── setBookingDetails ──────────────────────────────────────────────────────
  // Partial update — merge incoming payload with current state.
  // Caller only needs to pass what changed:
  //
  // setBookingDetails({ checkInDate: new Date('2025-01-10') })
  // setBookingDetails({ guests: { adults: 2, children: 1 } })
  // setBookingDetails({ selectedHotel: hotel, checkInDate: date })

  const setBookingDetails = useCallback(
    (payload: BookingUpdatePayload): void => {
      setBooking(prev => {
        const next: BookingDetails = {
          ...prev,
          ...payload,
          // Deep merge guests — prevents wiping adults when only children changes
          guests: payload.guests
            ? { ...prev.guests, ...payload.guests }
            : prev.guests,
        };

        // Guard: if checkIn changes, clear checkOut if it's now invalid
        // Prevents: checkIn = Jan 15, checkOut = Jan 10 (impossible range)
        if (
          payload.checkInDate                                &&
          next.checkOutDate                                  &&
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
  // Resets everything to initial state.
  // Call this after booking confirmation or on logout.

  const clearBooking = useCallback((): void => {
    setBooking(INITIAL_BOOKING);
  }, []);

  // ── Computed values ────────────────────────────────────────────────────────
  // Recalculates only when booking state changes

  const computed = useMemo<BookingComputedValues>(
    () => computeValues(booking),
    [booking],
  );

  // ── Context value ──────────────────────────────────────────────────────────
  // useMemo prevents new object reference on every render

  const value = useMemo<BookingContextValue>(
    () => ({
      booking,
      computed,
      setBookingDetails,
      clearBooking,
    }),
    [booking, computed, setBookingDetails, clearBooking],
  );

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};