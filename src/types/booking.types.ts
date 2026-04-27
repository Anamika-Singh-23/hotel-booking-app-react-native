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

   // ── history fields ────────────────────────────────────────────────────
    bookingHistory:      BookingRecord[];
    addBookingToHistory: (
      record: Omit<BookingRecord, 'bookingId' | 'bookedAt' | 'status'>,
    ) => Promise<string>;
    historyLoading:      boolean;
  }

// What gets passed to BookingConfirmationScreen as route params
// Snapshot of booking at confirm time — independent of context state
export interface BookingConfirmationParams {
  hotelName:     string;
  hotelLocation: string;
  checkInDate:   string;   // ISO string — Date objects can't go in nav params
  checkOutDate:  string;   // ISO string
  guests:        number;
  nights:        number;
  pricePerNight: number;
  totalPrice:    number;
  bookingId:     string;   // fake for now — real API will return this
}

export interface BookingRecord {
  bookingId:    string;          // unique — BK-XXXXXXXX
  hotel:        Hotel;           // full hotel snapshot at time of booking
  checkInDate:  string;          // ISO string — Date objects can't be serialized
  checkOutDate: string;          // ISO string
  guests:       GuestCount;
  totalPrice:   number;
  bookedAt:     string;          // ISO string — when user confirmed
  status:       BookingStatus;
}

export type BookingStatus =
  | 'confirmed'
  | 'cancelled'
  | 'completed';

// Updated context value — replaces the old BookingContextValue
// Add these two fields to the existing BookingContextValue interface

export interface BookingHistoryContextAdditions {
  bookingHistory:      BookingRecord[];
  addBookingToHistory: (record: Omit<BookingRecord, 'bookingId' | 'bookedAt' | 'status'>) => Promise<string>;
  // returns bookingId so caller can show it in confirmation UI
  historyLoading:      boolean;   // true while AsyncStorage loads on app start
}

