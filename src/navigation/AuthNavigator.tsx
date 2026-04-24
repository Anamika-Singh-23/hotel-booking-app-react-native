// src/navigation/AuthNavigator.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import { LoginScreen } from '../screens/auth/LoginScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,          // we build our own headers
        animation:   'fade',         // clean crossfade between auth screens
        contentStyle: { backgroundColor: '#F8F9FA' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      {/*
        Future screens slot in here — order = default initial route:
        <Stack.Screen name="Register"       component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="OTPVerify"      component={OTPVerifyScreen} />
      */}
    </Stack.Navigator>
  );
};