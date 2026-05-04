// src/screens/splash/SplashScreen.tsx
// FULL REPLACE

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Platform,
  StatusBar,
}                                   from 'react-native';
import { NativeStackScreenProps }   from '@react-navigation/native-stack';
import { AppStackParamList }        from '../../navigation/types';  // ← App stack

type Props = NativeStackScreenProps<AppStackParamList, 'Splash'>;

// ── PulsingDots ───────────────────────────────────────────────────────────────

const PulsingDots: React.FC = () => {
  const dots = [
    useRef(new Animated.Value(0.25)).current,
    useRef(new Animated.Value(0.25)).current,
    useRef(new Animated.Value(0.25)).current,
  ];

  useEffect(() => {
    const anims = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(dot, {
            toValue: 1, duration: 400, useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.25, duration: 400, useNativeDriver: true,
          }),
          Animated.delay(400),
        ]),
      ),
    );
    anims.forEach(a => a.start());
    return () => anims.forEach(a => a.stop());
  }, []);

  return (
    <View style={styles.dotsRow}>
      {dots.map((dot, i) => (
        <Animated.View key={i} style={[styles.dot, { opacity: dot }]} />
      ))}
    </View>
  );
};

// ── SplashScreen ──────────────────────────────────────────────────────────────

export const SplashScreen: React.FC<Props> = ({ navigation }) => {

  // Animations
  const logoScale   = useRef(new Animated.Value(0.4)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const nameY       = useRef(new Animated.Value(20)).current;
  const tagOpacity  = useRef(new Animated.Value(0)).current;
  const tagY        = useRef(new Animated.Value(12)).current;

  // Splash is inside AppNavigator — user is already authenticated
  // Sirf 2 second wait karo phir MainTabs pe jao
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('MainTabs', undefined);
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  // Run animations
  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1, tension: 55, friction: 7, useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1, duration: 600, useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(350),
        Animated.parallel([
          Animated.timing(nameOpacity, {
            toValue: 1, duration: 400, useNativeDriver: true,
          }),
          Animated.timing(nameY, {
            toValue: 0, duration: 400, useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.sequence([
        Animated.delay(600),
        Animated.parallel([
          Animated.timing(tagOpacity, {
            toValue: 1, duration: 350, useNativeDriver: true,
          }),
          Animated.timing(tagY, {
            toValue: 0, duration: 350, useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#1A2340" />

      <View style={styles.center}>
        <Animated.View style={[
          styles.logoWrapper,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}>
          <View style={styles.logoRing} />
          <View style={styles.logoCircle}>
            <Text style={styles.logoLetter}>A</Text>
          </View>
        </Animated.View>

        <Animated.Text style={[
          styles.appName,
          { opacity: nameOpacity, transform: [{ translateY: nameY }] },
        ]}>
          AasthaBooking
        </Animated.Text>

        <Animated.Text style={[
          styles.tagline,
          { opacity: tagOpacity, transform: [{ translateY: tagY }] },
        ]}>
          Your perfect stay, every time
        </Animated.Text>
      </View>

      <View style={styles.bottom}>
        <PulsingDots />
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex:            1,
    backgroundColor: '#1A2340',
    alignItems:      'center',
    justifyContent:  'center',
  },
  center: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            16,
  },
  logoWrapper: {
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   8,
  },
  logoRing: {
    position:        'absolute',
    width:           110,
    height:          110,
    borderRadius:    55,
    borderWidth:     2,
    borderColor:     'rgba(240,144,48,0.3)',
  },
  logoCircle: {
    width:           88,
    height:          88,
    borderRadius:    44,
    backgroundColor: '#F09030',
    alignItems:      'center',
    justifyContent:  'center',
    ...Platform.select({
      ios: {
        shadowColor:   '#F09030',
        shadowOffset:  { width: 0, height: 8 },
        shadowOpacity: 0.45,
        shadowRadius:  16,
      },
      android: { elevation: 12 },
    }),
  },
  logoLetter: {
    fontSize:   42,
    fontWeight: '800',
    color:      '#FFFFFF',
  },
  appName: {
    fontSize:      28,
    fontWeight:    '800',
    color:         '#FFFFFF',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize:  14,
    color:     'rgba(255,255,255,0.55)',
    textAlign: 'center',
  },
  bottom: {
    paddingBottom: Platform.OS === 'ios' ? 48 : 36,
    alignItems:    'center',
    gap:           14,
  },
  dotsRow: {
    flexDirection: 'row',
    gap:           8,
    alignItems:    'center',
  },
  dot: {
    width:           8,
    height:          8,
    borderRadius:    4,
    backgroundColor: '#F09030',
  },
  version: {
    fontSize: 12,
    color:    'rgba(255,255,255,0.25)',
  },
});