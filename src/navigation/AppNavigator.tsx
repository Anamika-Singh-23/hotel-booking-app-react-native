// src/navigation/AppNavigator.tsx
import React                             from 'react';
import { createNativeStackNavigator }    from '@react-navigation/native-stack';
import { AppStackParamList }             from './types';
import { SplashScreen }               from '../screens/splash/SplashScreen';
import { BottomTabs }                    from './BottomTabs';
import { HotelDetailsScreen }            from '../screens/hotel/HotelDetailsScreen';
import { BookingScreen }                 from '../screens/booking/BookingScreen';
import { BookingConfirmationScreen }     from '../screens/booking/BookingConfirmationScreen';
import { PaymentScreen }                 from '../screens/payment/PaymentScreen';
import { PaymentSuccessScreen }          from '../screens/booking/PaymentSuccessScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppNavigator: React.FC = () => (
  <Stack.Navigator
    initialRouteName="Splash"   // ← Splash pehle
    screenOptions={{
      headerShown: false,
      animation:   'slide_from_right',
    }}
  >
    {/*
      Splash pehla screen hai App stack mein.
      Yeh already logged-in users ke liye dikhega.
      2 second baad MainTabs pe navigate karega.
    */}
    <Stack.Screen
      name="Splash"
      component={SplashScreen}
      options={{ animation: 'none' }}
    />

    <Stack.Screen
      name="MainTabs"
      component={BottomTabs}
      options={{ animation: 'fade' }}
    />
    <Stack.Screen name="HotelDetails"        component={HotelDetailsScreen}        />
    <Stack.Screen name="Booking"             component={BookingScreen}             />
    <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
    <Stack.Screen name="Payment"             component={PaymentScreen}             />
    <Stack.Screen name="PaymentSuccess"      component={PaymentSuccessScreen}      />
  </Stack.Navigator>
);