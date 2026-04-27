// src/navigation/types.ts

import { Hotel }                     from '../types/hotel.types';
import { BookingConfirmationParams } from '../types/booking.types';

// ── Tab navigator screens ─────────────────────────────────────────────────────
// Sirf woh screens jo tab bar mein dikhenge

export type TabParamList = {
  Home:       undefined;
  MyBookings: undefined;
  Profile:    undefined;
};

// ── Stack navigator screens ───────────────────────────────────────────────────
// MainTabs ek entry hai — baki sab stack screens

export type AppStackParamList = {
  Splash:              undefined;
  MainTabs:            { screen?: keyof TabParamList };  // tab switch support
  HotelDetails:        { hotel: Hotel };
  Booking:             { hotel: Hotel };
  BookingConfirmation: { details: BookingConfirmationParams };
  Payment:             undefined;
  PaymentSuccess:      undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  App:  undefined;
};