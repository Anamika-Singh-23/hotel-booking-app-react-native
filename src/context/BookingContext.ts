// src/context/BookingContext.ts

import { createContext, useContext } from 'react';
import { BookingContextValue }      from '../types/booking.types';

// ── Safe default — used only outside provider ─────────────────────────────────

const noop = () => {
  if (__DEV__) {
    console.warn('[BookingContext] Called outside of BookingProvider.');
  }
};

const noopAsync = async () => {
  if (__DEV__) {
    console.warn('[BookingContext] Async action called outside of BookingProvider.');
  }
  return '';   // matches Promise<string> return type of addBookingToHistory
};

export const defaultBookingContext: BookingContextValue = {
  booking: {
    selectedHotel: null,
    checkInDate:   null,
    checkOutDate:  null,
    guests: {
      adults:   1,
      children: 0,
    },
  },
  computed: {
    totalNights:   0,
    totalGuests:   1,
    totalPrice:    0,
    isReadyToBook: false,
  },
  setBookingDetails: noop,
  clearBooking:      noop,

  bookingHistory:      [],
  addBookingToHistory: noopAsync,
  historyLoading:      true,
};

export const BookingContext = createContext<BookingContextValue>(
  defaultBookingContext,
);

// ── useBooking hook ───────────────────────────────────────────────────────────
// Only import this in components — never import BookingContext directly

export const useBooking = (): BookingContextValue => {
  const context = useContext(BookingContext);

  if (__DEV__ && context === defaultBookingContext) {
    console.warn(
      '[useBooking] Used outside <BookingProvider>. ' +
      'Wrap your app with <BookingProvider> in App.tsx.',
    );
  }

  return context;
};