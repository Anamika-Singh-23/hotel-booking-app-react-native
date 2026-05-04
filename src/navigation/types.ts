// src/navigation/types.ts
import { Hotel }                     from '../types/hotel.types';
import { BookingConfirmationParams } from '../types/booking.types';

// Root — sirf Auth aur App, Splash nahi
export type RootStackParamList = {
  Auth: undefined;
  App:  undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type TabParamList = {
  Home:       undefined;
  MyBookings: undefined;
  Profile:    undefined;
};

export type PaymentMethodType = 'upi' | 'card' | 'cash';

export type AppStackParamList = {
  Splash:               undefined;
  MainTabs:            { screen?: keyof TabParamList } | undefined;
  HotelDetails:        { hotel: Hotel };
  Booking:             { hotel: Hotel };
  BookingConfirmation: { details: BookingConfirmationParams };
  Payment:             undefined;
  PaymentSuccess:      { paymentMethod: PaymentMethodType };
};