// src/screens/splash/SplashScreen.tsx

import React, {
  useEffect,
  useRef,
}                                   from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Platform,
  StatusBar,
  Dimensions,
}                                   from 'react-native';
import { NativeStackScreenProps }   from '@react-navigation/native-stack';
import { AppStackParamList }        from '../../navigation/types';

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<AppStackParamList, 'Splash'>;

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  background:   '#1A2340',    // deep navy — brand secondary
  logoCircle:   '#F09030',    // brand primary — saffron
  logoText:     '#FFFFFF',
  appName:      '#FFFFFF',
  tagline:      'rgba(255,255,255,0.55)',
  dotsActive:   '#F09030',
  dotsInactive: 'rgba(255,255,255,0.25)',
};

const TIMING = {
  logoIn:     600,    // logo scale + fade in
  nameIn:     400,    // name fades in after logo
  nameDelay:  350,    // starts while logo is still animating
  taglineIn:  350,
  tagDelay:   600,
  navigate:   2600,   // total before navigating away
};

// ─────────────────────────────────────────────────────────────────────────────
// Animated dot loader
// Three dots that pulse in sequence — shows app is "working"
// ─────────────────────────────────────────────────────────────────────────────

const PulsingDots: React.FC = () => {
  const dot1 = useRef(new Animated.Value(0.25)).current;
  const dot2 = useRef(new Animated.Value(0.25)).current;
  const dot3 = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    // Staggered pulse — each dot starts 200ms after previous
    const pulse = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue:         1,
            duration:        400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue:         0.25,
            duration:        400,
            useNativeDriver: true,
          }),
          // Pause before repeating so loop feels natural
          Animated.delay(400),
        ]),
      );

    const anim1 = pulse(dot1, 0);
    const anim2 = pulse(dot2, 200);
    const anim3 = pulse(dot3, 400);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, []);

  return (
    <View style={styles.dotsRow}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View
          key={i}
          style={[styles.dot, { opacity: dot }]}
        />
      ))}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SplashScreen
// ─────────────────────────────────────────────────────────────────────────────

export const SplashScreen: React.FC<Props> = ({ navigation }) => {

  // ── Animation values ──────────────────────────────────────────────────────

  // Logo: scale from 0.4 → 1 + fade from 0 → 1
  const logoScale   = useRef(new Animated.Value(0.4)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  // App name: translate up from +20 → 0 + fade
  const nameOpacity   = useRef(new Animated.Value(0)).current;
  const nameTranslate = useRef(new Animated.Value(20)).current;

  // Tagline: same pattern, later delay
  const tagOpacity   = useRef(new Animated.Value(0)).current;
  const tagTranslate = useRef(new Animated.Value(12)).current;

  // ── Animation sequence ────────────────────────────────────────────────────

  useEffect(() => {
    Animated.parallel([

      // Logo scales + fades in
      Animated.spring(logoScale, {
        toValue:         1,
        tension:         55,
        friction:        7,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue:         1,
        duration:        TIMING.logoIn,
        useNativeDriver: true,
      }),

      // App name slides up + fades in
      Animated.sequence([
        Animated.delay(TIMING.nameDelay),
        Animated.parallel([
          Animated.timing(nameOpacity, {
            toValue:         1,
            duration:        TIMING.nameIn,
            useNativeDriver: true,
          }),
          Animated.timing(nameTranslate, {
            toValue:         0,
            duration:        TIMING.nameIn,
            useNativeDriver: true,
          }),
        ]),
      ]),

      // Tagline slides up + fades in
      Animated.sequence([
        Animated.delay(TIMING.tagDelay),
        Animated.parallel([
          Animated.timing(tagOpacity, {
            toValue:         1,
            duration:        TIMING.taglineIn,
            useNativeDriver: true,
          }),
          Animated.timing(tagTranslate, {
            toValue:         0,
            duration:        TIMING.taglineIn,
            useNativeDriver: true,
          }),
        ]),
      ]),

    ]).start();

    // Navigate after delay — replace removes Splash from stack
    const navTimer = setTimeout(() => {
      navigation.replace('MainTabs', {});
    }, TIMING.navigate);

    return () => clearTimeout(navTimer);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background}
        translucent={false}
      />

      {/* ── Center content ── */}
      <View style={styles.centerContent}>

        {/* Logo circle — scale + fade in */}
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity:   logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          {/* Outer glow ring */}
          <View style={styles.logoRing} />

          {/* Inner circle with letter */}
          <View style={styles.logoCircle}>
            <Text style={styles.logoLetter}>A</Text>
          </View>
        </Animated.View>

        {/* App name — slide up + fade */}
        <Animated.View
          style={{
            opacity:   nameOpacity,
            transform: [{ translateY: nameTranslate }],
            alignItems: 'center',
          }}
        >
          <Text style={styles.appName}>AasthaBooking</Text>
        </Animated.View>

        {/* Tagline — slide up + fade */}
        <Animated.View
          style={{
            opacity:   tagOpacity,
            transform: [{ translateY: tagTranslate }],
          }}
        >
          <Text style={styles.tagline}>Your perfect stay, every time</Text>
        </Animated.View>

      </View>

      {/* ── Bottom: loading dots + version ── */}
      <View style={styles.bottomContent}>
        <PulsingDots />
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>

    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  screen: {
    flex:            1,
    backgroundColor: COLORS.background,
    alignItems:      'center',
    justifyContent:  'center',
  },

  // ── Center content ──────────────────────────────────────────────────────────
  centerContent: {
    flex:       1,
    alignItems: 'center',
    justifyContent: 'center',
    gap:        16,
  },

  // ── Logo ────────────────────────────────────────────────────────────────────
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
    borderColor:     'rgba(240, 144, 48, 0.3)',
  },
  logoCircle: {
    width:           88,
    height:          88,
    borderRadius:    44,
    backgroundColor: COLORS.logoCircle,
    alignItems:      'center',
    justifyContent:  'center',
    ...Platform.select({
      ios: {
        shadowColor:   COLORS.logoCircle,
        shadowOffset:  { width: 0, height: 8 },
        shadowOpacity: 0.45,
        shadowRadius:  16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  logoLetter: {
    fontSize:      42,
    fontWeight:    '800',
    color:         COLORS.logoText,
    letterSpacing: -1,
  },

  // ── App name ────────────────────────────────────────────────────────────────
  appName: {
    fontSize:      28,
    fontWeight:    '800',
    color:         COLORS.appName,
    letterSpacing: -0.5,
    textAlign:     'center',
  },

  // ── Tagline ─────────────────────────────────────────────────────────────────
  tagline: {
    fontSize:   14,
    color:      COLORS.tagline,
    textAlign:  'center',
    fontWeight: '400',
    letterSpacing: 0.3,
  },

  // ── Bottom ──────────────────────────────────────────────────────────────────
  bottomContent: {
    paddingBottom: Platform.OS === 'ios' ? 48 : 36,
    alignItems:    'center',
    gap:           14,
  },

  // ── Pulsing dots ────────────────────────────────────────────────────────────
  dotsRow: {
    flexDirection: 'row',
    gap:           8,
    alignItems:    'center',
  },
  dot: {
    width:           8,
    height:          8,
    borderRadius:    4,
    backgroundColor: COLORS.dotsActive,
  },

  // ── Version ─────────────────────────────────────────────────────────────────
  versionText: {
    fontSize:      12,
    color:         'rgba(255,255,255,0.25)',
    letterSpacing: 0.3,
  },

});