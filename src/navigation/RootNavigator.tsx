// src/navigation/RootNavigator.tsx
// FULL REPLACE

import React                          from 'react';
import { NavigationContainer }        from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  View,
  ActivityIndicator,
  StyleSheet,
}                                     from 'react-native';
import { useAuth }                    from '../context/AuthContext';
import { RootStackParamList }         from './types';
import { AuthNavigator }              from './AuthNavigator';
import { AppNavigator }               from './AppNavigator';
import { SplashScreen }               from '../screens/splash/SplashScreen';

const Root = createNativeStackNavigator<RootStackParamList>();

// ─────────────────────────────────────────────────────────────────────────────
// RootStack — navigation ka decision maker
// ─────────────────────────────────────────────────────────────────────────────

const RootStack: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // ── Step 1: App start ─────────────────────────────────────────────────────
  // isLoading = true matlab AsyncStorage check chal rahi hai
  // Splash dikhao jab tak check complete na ho

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#F09030" />
      </View>
    );
  }

  // ── Step 2: Auth check complete ───────────────────────────────────────────
  // Ab SIRF ek stack render karo — dono ek saath NAHI
  //
  // KEY CONCEPT:
  // Jab isAuthenticated = true  → SIRF App screen
  // Jab isAuthenticated = false → SIRF Auth screen
  //
  // React Navigation isko detect karta hai aur automatically
  // correct screen pe switch kar deta hai
  // Yahi "conditional navigator" ka correct pattern hai

  return (
    <Root.Navigator
      screenOptions={{
        headerShown: false,
        animation:   'fade',      // smooth transition
      }}
    >
      {isAuthenticated
        ? (
          // ── LOGGED IN: sirf App stack ──────────────────────────────────
          // Splash aur Auth yahan bilkul nahi hain
          // Isse guarantee hoti hai ki logout ke baad
          // App screen accessible hi nahi hogi
          <Root.Screen
            name="App"
            component={AppNavigator}
          />
        )
        : (
          // ── NOT LOGGED IN: sirf Auth stack ────────────────────────────
          // App yahan bilkul nahi hai
          // Isse guest user state possible hi nahi hogi
          <Root.Screen
            name="Auth"
            component={AuthNavigator}
          />
        )
      }
    </Root.Navigator>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// RootNavigator — NavigationContainer wrapper
// ─────────────────────────────────────────────────────────────────────────────

export const RootNavigator: React.FC = () => (
  <NavigationContainer>
    <RootStack />
  </NavigationContainer>
);

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  loaderContainer: {
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: '#F8F9FA',
  },
});