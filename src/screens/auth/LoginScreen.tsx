// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input }  from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing, BorderRadius, TextStyles, FontSize } from '../../theme';

import { useLogin } from '../../hooks/useLogin';

// ─── Login mode: email or phone ───────────────────────────────────────────────
type LoginMode = 'email' | 'phone';

export const LoginScreen: React.FC = () => {
  const [mode,     setMode]     = useState<LoginMode>('email');
  const [identity, setIdentity] = useState('');   // email OR phone
  const [password, setPassword] = useState('');

  // Inline validation — purely for UI state (no API yet)
  const [identityError, setIdentityError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { login, loading, error: apiError, clearError } = useLogin();
  const { signIn } = useAuth();

  const isFormFilled = identity.trim().length > 0 && password.length >= 6;

  // Clear API error whenever user starts retyping
  // Add onChangeText wrappers:
  const handleEmailChange = (text: string) => {
    setIdentity(text);
    if (apiError) clearError();
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (apiError) clearError();
  };


  // Clear API error whenever user starts retyping
  // Add onChangeText wrappers:
  const handleSignIn = async () => {
  // Client-side validation (yeh same rahega)
    let valid = true;
    if (!identity.includes('@')) {
      setIdentityError('Enter a valid email address');
      valid = false;
    } else {
      setIdentityError('');
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      valid = false;
    } else {
      setPasswordError('');
    }
    if (!valid) return;

    // Hook se payload lo
    const payload = await login({ email: identity, password });

    if (payload) {
      // AuthProvider ko do — woh storage aur state dono handle karega
      await signIn(payload);
      // Navigation automatic — isAuthenticated true hoga → AppNavigator
    }
  }; 

  const handleModeSwitch = (next: LoginMode) => {
    setMode(next);
    setIdentity('');
    setIdentityError('');
    setPasswordError('');
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* ── Brand ──────────────────────────────────────────────── */}
          <View style={styles.brandHeader}>
            <View style={styles.logoMark}>
              <Text style={styles.logoLetter}>A</Text>
            </View>
            <Text style={styles.brandName}>AasthaBooking</Text>
            <Text style={styles.brandTagline}>Your perfect stay, every time</Text>
          </View>

          {/* ── Welcome copy ────────────────────────────────────────── */}
          <View style={styles.welcomeBlock}>
            <Text style={styles.welcomeTitle}>Welcome back</Text>
            <Text style={styles.welcomeSub}>
              Sign in to continue to your bookings
            </Text>
          </View>

          {/* ── Email / Phone toggle ─────────────────────────────────── */}
          <View style={styles.tabBar}>
            {(['email', 'phone'] as LoginMode[]).map(m => (
              <TouchableOpacity
                key={m}
                style={[styles.tab, mode === m && styles.tabActive]}
                onPress={() => handleModeSwitch(m)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabLabel, mode === m && styles.tabLabelActive]}>
                  {m === 'email' ? 'Email' : 'Phone'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Form ─────────────────────────────────────────────────── */}
          <View style={styles.form}>

            {mode === 'email' ? (
              <Input
                label="Email address"
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={identity}
                onChangeText={handleEmailChange}
                error={identityError}
                required
              />
            ) : (
              <Input
                label="Phone number"
                placeholder="+91 98765 43210"
                keyboardType="phone-pad"
                value={identity}
                onChangeText={handleEmailChange}
                error={identityError}
                required
              />
            )}

            <Input
              label="Password"
              placeholder="Enter your password"
              isPassword
              value={password}
              onChangeText={handlePasswordChange}
              error={passwordError}
              hint={!passwordError ? 'Minimum 6 characters' : undefined}
              required
            />

            {/* Forgot password */}
            <TouchableOpacity
              style={styles.forgotRow}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.forgotLink}>Forgot password?</Text>
            </TouchableOpacity>

            <View style={styles.gap} />

              {apiError ? (
                <View style={styles.apiErrorBox}>
                  <Text style={styles.apiErrorText}>{apiError}</Text>
                </View>
              ) : null}

            {/* Primary CTA */}
            <Button
              label="Sign In"
              onPress={handleSignIn}
              loading={loading}
              disabled={!isFormFilled || loading}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google — outline variant */}
            <Button
              label="Continue with Google"
              onPress={() => { /* Google OAuth — Step 5 */ }}
              variant="outline"
            />
          </View>

          {/* ── Footer ─────────────────────────────────────────────── */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Create account</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },

  scroll: {
    flexGrow:          1,
    paddingHorizontal: Spacing[5],
    paddingBottom:     Spacing[8],
  },

  // Brand
  brandHeader: {
    alignItems:    'center',
    paddingTop:    Spacing[8],
    paddingBottom: Spacing[8],
  },
  logoMark: {
    width:           54,
    height:          54,
    borderRadius:    BorderRadius.lg,
    backgroundColor: Colors.primary,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    Spacing[3],
  },
  logoLetter: {
    fontSize:   26,
    fontWeight: '700',
    color:      Colors.textOnPrimary,
    lineHeight: 30,
  },
  brandName: {
    ...TextStyles.h4,
    color:        Colors.secondary,
    marginBottom: Spacing[1],
  },
  brandTagline: {
    ...TextStyles.bodySmall,
    color: Colors.textSecondary,
  },

  // Welcome
  welcomeBlock: { marginBottom: Spacing[6] },
  welcomeTitle: {
    ...TextStyles.h2,
    color:        Colors.textPrimary,
    marginBottom: Spacing[1],
  },
  welcomeSub: {
    ...TextStyles.body,
    color: Colors.textSecondary,
  },

  // Tab switcher
  tabBar: {
    flexDirection:  'row',
    backgroundColor: Colors.surface,
    borderRadius:   BorderRadius.md,
    borderWidth:    1,
    borderColor:    Colors.border,
    padding:        Spacing[1],
    marginBottom:   Spacing[6],
  },
  tab: {
    flex:           1,
    height:         36,
    borderRadius:   BorderRadius.sm,
    alignItems:     'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabLabel: {
    ...TextStyles.label,
    color: Colors.textSecondary,
  },
  tabLabelActive: {
    color:      Colors.textOnPrimary,
    fontWeight: '600',
  },

  // Form
  form: {},
  forgotRow: {
    alignSelf:    'flex-end',
    marginTop:    -Spacing[3],
    marginBottom: Spacing[2],
  },
  forgotLink: {
    ...TextStyles.label,
    color: Colors.primary,
  },
  gap: { height: Spacing[4] },

  // Divider
  divider: {
    flexDirection:  'row',
    alignItems:     'center',
    marginVertical: Spacing[5],
    gap:            Spacing[3],
  },
  dividerLine: {
    flex:            1,
    height:          1,
    backgroundColor: Colors.border,
  },
  dividerLabel: {
    ...TextStyles.caption,
    color: Colors.textSecondary,
  },
  apiErrorBox: {
  backgroundColor: Colors.errorSurface,
  borderRadius:    BorderRadius.md,
  borderWidth:     1,
  borderColor:     Colors.errorBorder,
  padding:         Spacing[3],
  marginBottom:    Spacing[4],
},
apiErrorText: {
  ...TextStyles.bodySmall,
  color:     Colors.error,
  textAlign: 'center',
},

  // Footer
  footer: {
    flexDirection:   'row',
    justifyContent:  'center',
    alignItems:      'center',
    paddingTop:      Spacing[8],
  },
  footerText: {
    ...TextStyles.body,
    color: Colors.textSecondary,
  },
  footerLink: {
    ...TextStyles.body,
    color:      Colors.primary,
    fontWeight: '600',
  },
});