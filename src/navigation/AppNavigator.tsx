// src/navigation/AppNavigator.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/home/HomeScreen';
import { HotelDetailsScreen } from '../screens/hotel/HotelDetailsScreen'; 
import { AppStackParamList } from './types'; 
import { BookingScreen } from '../screens/booking/BookingScreen'; 


const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown:  false,
        animation:    'slide_from_right',
        contentStyle: { backgroundColor: '#F8F9FA' },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="HotelDetails" component={HotelDetailsScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      {/*
        Future screens:
        <Stack.Screen name="BookingConf"  component={BookingConfirmScreen} />
      */}
    </Stack.Navigator>
  );
};