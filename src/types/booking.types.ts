// src/types/booking.types.ts

import { Hotel } from './hotel.types';

// ─────────────────────────────────────────────────────────────────────────────
// Core booking data shape
// ─────────────────────────────────────────────────────────────────────────────

export interface BookingDetails {
  selectedHotel:  Hotel | null;
  checkInDate:    Date | null;
  checkOutDate:   Date | null;
  guests:         GuestCount;
}

// Separated guest count — scalable for child/infant support later
export interface GuestCount {
  adults:   number;
  children: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Partial update payload
// Allows updating one field without touching others:
// setBookingDetails({ checkInDate: new Date() })
// ─────────────────────────────────────────────────────────────────────────────

export type BookingUpdatePayload = Partial<BookingDetails>;

// ─────────────────────────────────────────────────────────────────────────────
// Derived / computed values the context exposes
// ─────────────────────────────────────────────────────────────────────────────

export interface BookingComputedValues {
  totalNights:   number;        // checkOut - checkIn in days
  totalGuests:   number;        // adults + children
  totalPrice:    number;        // totalNights * hotel.price
  isReadyToBook: boolean;       // all required fields filled
}

// ─────────────────────────────────────────────────────────────────────────────
// What useBooking() returns
// ─────────────────────────────────────────────────────────────────────────────

export interface BookingContextValue {
  // ── State ──────────────────────────────────────────────────────────────────
  booking:   BookingDetails;

  // ── Computed ───────────────────────────────────────────────────────────────
  computed:  BookingComputedValues;

  // ── Actions ────────────────────────────────────────────────────────────────
  setBookingDetails: (payload: BookingUpdatePayload) => void;
  clearBooking:      () => void;
}
