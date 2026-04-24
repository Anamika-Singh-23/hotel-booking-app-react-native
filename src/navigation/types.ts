// src/navigation/types.ts

import { Hotel } from '../types/hotel.types'; // 🆕 import add karo

export type AuthStackParamList = {
  Login: undefined;
};

// ✏️ HotelDetails add karo — Hotel object param ke saath
export type AppStackParamList = {
  Home:         undefined;
  HotelDetails: { hotel: Hotel };  // 🆕 full hotel object pass hoga
  Booking:      { hotel: Hotel }; 
};

export type RootStackParamList = {
  Auth: undefined;
  App:  undefined;
};