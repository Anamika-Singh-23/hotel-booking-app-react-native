// src/context/BookingContext.ts

import { createContext, useContext } from 'react';
import { BookingContextValue }      from '../types/booking.types';

export const defaultBookingContext: BookingContextValue = {
  booking: {
    selectedHotel: null,
    checkInDate:   null,
    checkOutDate:  null,
    guests:        { adults: 1, children: 0 },
  },
  computed: {
    totalNights:   0,
    totalGuests:   1,
    totalPrice:    0,
    isReadyToBook: false,
  },
  bookingHistory:      [],
  historyLoading:      true,
  setBookingDetails:   () => {},
  clearBooking:        () => {},
  addBookingToHistory: async () => '',
};

export const BookingContext = createContext<BookingContextValue>(
  defaultBookingContext,
);

export const useBooking = (): BookingContextValue => {
  return useContext(BookingContext);
};