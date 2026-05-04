// src/screens/auth/LoginScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  Platform,
}                                        from 'react-native';
import { SafeAreaView }                  from 'react-native-safe-area-context';
import { NativeStackScreenProps }        from '@react-navigation/native-stack';
import { AuthStackParamList }            from '../../navigation/types';
import { useAuth }                       from '../../context/AuthContext';
import { useLogin }                      from '../../hooks/useLogin';
import { Input }                         from '../../components/ui/Input';
import { Button }                        from '../../components/ui/Button';
import { Colors, Spacing, BorderRadius } from '../../theme';

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;
type LoginMode = 'email' | 'phone';

// ─────────────────────────────────────────────────────────────────────────────
// LoginScreen
// ─────────────────────────────────────────────────────────────────────────────

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { signIn }                              = useAuth();
  const { login, loading, error: apiError,
          clearError }                          = useLogin();

  const [mode,     setMode]     = useState<LoginMode>('email');
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');

  const [identityError, setIdentityError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // ── Form validity ─────────────────────────────────────────────────────────
  const isFormFilled =
    identity.trim().length > 0 && password.length >= 6;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleModeSwitch = useCallback((next: LoginMode) => {
    setMode(next);
    setIdentity('');
    setIdentityError('');
    setPasswordError('');
    if (apiError) clearError();
  }, [apiError, clearError]);

  const handleIdentityChange = useCallback((text: string) => {
    setIdentity(text);
    if (identityError) setIdentityError('');
    if (apiError)      clearError();
  }, [identityError, apiError, clearError]);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
    if (passwordError) setPasswordError('');
    if (apiError)      clearError();
  }, [passwordError, apiError, clearError]);

  const handleLogin = useCallback(async () => {
    let valid = true;

    if (mode === 'email' && !identity.includes('@')) {
      setIdentityError('Enter a valid email address.');
      valid = false;
    } else if (mode === 'phone' && identity.trim().length < 10) {
      setIdentityError('Enter a valid 10-digit phone number.');
      valid = false;
    } else {
      setIdentityError('');
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      valid = false;
    } else {
      setPasswordError('');
    }

    if (!valid) return;

    const payload = await login({ email: identity, password });
    if (payload) {
      await signIn(payload);
    }
  }, [mode, identity, password, login, signIn]);

  // ─────────────────────────────────────────────────────────────────────────
  // Render — single flex column, no ScrollView
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/*
        Single column layout.
        flex: 1 → fills screen height.
        justifyContent: 'space-between' → logo+form at top, footer at bottom.
        No ScrollView, no absolute positioning.
      */}
      <View style={styles.container}>

        {/* ── TOP: Logo + Welcome ── */}
        <View style={styles.topSection}>

          {/* Logo */}
          <View style={styles.logoWrapper}>
            <Image
              // 🔁 Apna logo path yahan set karo:
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Welcome text */}
          <Text style={styles.welcomeTitle}>Welcome back</Text>
          <Text style={styles.welcomeSub}>
            Sign in to continue to your bookings
          </Text>
        </View>

        {/* ── MIDDLE: Form ── */}
        <View style={styles.formSection}>

          {/* Email / Phone tab */}
          <View style={styles.tabBar}>
            {(['email', 'phone'] as LoginMode[]).map(m => (
              <TouchableOpacity
                key={m}
                style={[styles.tab, mode === m && styles.tabActive]}
                onPress={() => handleModeSwitch(m)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.tabLabel,
                  mode === m && styles.tabLabelActive,
                ]}>
                  {m === 'email' ? 'Email' : 'Phone'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Identity input */}
          {mode === 'email' ? (
            <Input
              label="Email address"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={identity}
              onChangeText={handleIdentityChange}
              error={identityError}
            />
          ) : (
            <Input
              label="Phone number"
              placeholder="+91 98765 43210"
              keyboardType="phone-pad"
              value={identity}
              onChangeText={handleIdentityChange}
              error={identityError}
            />
          )}

          {/* Password */}
          <Input
            label="Password"
            placeholder="Enter your password"
            isPassword
            value={password}
            onChangeText={handlePasswordChange}
            error={passwordError}
          />

          {/* Forgot password */}
          <TouchableOpacity
            style={styles.forgotRow}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* API error */}
          {apiError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>{apiError}</Text>
            </View>
          ) : null}

          {/* Submit */}
          <Button
            label="Sign In"
            onPress={handleLogin}
            loading={loading}
            disabled={!isFormFilled || loading}
          />

        </View>

        {/* ── BOTTOM: Signup link — part of same layout ── */}
        {/*
          marginTop: 'auto' pushes this to bottom naturally
          within flex column — no absolute, no fixed footer
        */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Signup')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.footerLink}>Create account</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  safe: {
    flex:            1,
    backgroundColor: Colors.background,
  },

  // Single full-height column
  container: {
    flex:              1,
    paddingHorizontal: Spacing[5],
    paddingTop:        Spacing[4],
    paddingBottom:     Spacing[4],
  },

  // ── Top section ────────────────────────────────────────────────────────────
  topSection: {
    alignItems:   'center',
    marginBottom: Spacing[5],
  },
  logoWrapper: {
    marginBottom: Spacing[3],
  },
  logo: {
    width:  120,
    height: 60,
  },
  welcomeTitle: {
    fontSize:      22,
    fontWeight:    '700',
    color:         Colors.textPrimary,
    marginBottom:  Spacing[1],
    letterSpacing: -0.3,
  },
  welcomeSub: {
    fontSize:  13,
    color:     Colors.textSecondary,
    textAlign: 'center',
  },

  // ── Form section ───────────────────────────────────────────────────────────
  formSection: {
    // Takes natural space — no flex:1 so footer stays at bottom via marginTop auto
  },

  // Tab bar
  tabBar: {
    flexDirection:   'row',
    backgroundColor: Colors.surface,
    borderRadius:    BorderRadius.md,
    borderWidth:     1,
    borderColor:     Colors.border,
    padding:         Spacing[1],
    marginBottom:    Spacing[4],
  },
  tab: {
    flex:           1,
    height:         34,
    borderRadius:   BorderRadius.sm,
    alignItems:     'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabLabel: {
    fontSize:   13,
    fontWeight: '500',
    color:      Colors.textSecondary,
  },
  tabLabelActive: {
    color:      Colors.textOnPrimary,
    fontWeight: '600',
  },

  // Forgot
  forgotRow: {
    alignSelf:    'flex-end',
    marginTop:    -Spacing[2],
    marginBottom: Spacing[3],
  },
  forgotText: {
    fontSize:   13,
    fontWeight: '500',
    color:      Colors.primary,
  },

  // API error
  errorBox: {
    backgroundColor: Colors.errorSurface,
    borderRadius:    BorderRadius.md,
    borderWidth:     1,
    borderColor:     Colors.errorBorder,
    padding:         Spacing[3],
    marginBottom:    Spacing[3],
  },
  errorBoxText: {
    fontSize:  13,
    color:     Colors.error,
    textAlign: 'center',
  },

  // ── Footer — natural bottom via marginTop auto ──────────────────────────────
  footerRow: {
    flexDirection:  'row',
    justifyContent: 'center',
    alignItems:     'center',
    marginTop:      'auto',   // ← pushes to bottom within flex column
    paddingTop:     Spacing[4],
  },
  footerText: {
    fontSize: 14,
    color:    Colors.textSecondary,
  },
  footerLink: {
    fontSize:   14,
    color:      Colors.primary,
    fontWeight: '600',
  },
});