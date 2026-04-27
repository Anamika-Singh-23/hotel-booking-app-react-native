// src/navigation/AppNavigator.tsx

import React                             from 'react';
import { createNativeStackNavigator }    from '@react-navigation/native-stack';
import { AppStackParamList }             from './types';
import { SplashScreen }                  from '../screens/splash/SplashScreen';
import { BottomTabs }                    from './BottomTabs';
import { HotelDetailsScreen }            from '../screens/hotel/HotelDetailsScreen';
import { BookingScreen }                 from '../screens/booking/BookingScreen';
import { BookingConfirmationScreen }     from '../screens/booking/BookingConfirmationScreen';
import { PaymentScreen }                 from '../screens/payment/PaymentScreen';
import { PaymentSuccessScreen }          from '../screens/booking/PaymentSuccessScreen';

// HomeScreen, MyBookingsScreen, ProfileScreen — AppNavigator se HATA DIYE
// Ab yeh BottomTabs ke andar hain

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppNavigator: React.FC = () => (
  <Stack.Navigator
    initialRouteName="Splash"
    screenOptions={{
      headerShown: false,
      animation:   'slide_from_right',
    }}
  >

    {/* Splash — no animation needed, it IS the entry */}
    <Stack.Screen
      name="Splash"
      component={SplashScreen}
      options={{ animation: 'none' }}  // instant show, no nav animation
    />

    {/* ── Main tabs — app ka default landing ── */}
    <Stack.Screen
      name="MainTabs"
      component={BottomTabs}
      options={{ animation: 'fade' }}   // smooth entry from auth screen
    />

    {/* ── Stack screens — tab bar inpe nahi dikhta ── */}
    <Stack.Screen name="HotelDetails"        component={HotelDetailsScreen}        />
    <Stack.Screen name="Booking"             component={BookingScreen}             />
    <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
    <Stack.Screen name="Payment"             component={PaymentScreen}             />
    <Stack.Screen name="PaymentSuccess"      component={PaymentSuccessScreen}      />
  </Stack.Navigator>
);