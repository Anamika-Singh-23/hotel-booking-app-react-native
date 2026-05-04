// src/screens/auth/SignupScreen.tsx
// FULL REPLACE

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
}                                        from 'react-native';
import { SafeAreaView }                   from 'react-native-safe-area-context';
import { NativeStackScreenProps }        from '@react-navigation/native-stack';
import { AuthStackParamList }            from '../../navigation/types';
import { useAuth }                       from '../../context/AuthContext';
import { useSignup }                     from '../../hooks/useSignup';
import { Input }                         from '../../components/ui/Input';
import { Button }                        from '../../components/ui/Button';
import { Colors, Spacing, BorderRadius } from '../../theme';

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;
type SignupMode = 'email' | 'phone';

// ── Validators ────────────────────────────────────────────────────────────────

const validators = {
  name: (v: string) => {
    if (!v.trim())           return 'Name is required.';
    if (v.trim().length < 2) return 'Name must be at least 2 characters.';
    return '';
  },
  email: (v: string) => {
    if (!v.trim())                         return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email.';
    return '';
  },
  phone: (v: string) => {
    const digits = v.replace(/\D/g, '');
    if (!digits)         return 'Phone number is required.';
    if (digits.length < 10) return 'Enter a valid 10-digit number.';
    return '';
  },
  password: (v: string) => {
    if (!v)            return 'Password is required.';
    if (v.length < 6)  return 'Minimum 6 characters.';
    return '';
  },
  confirm: (pass: string, confirm: string) => {
    if (!confirm)        return 'Please confirm your password.';
    if (pass !== confirm) return 'Passwords do not match.';
    return '';
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SignupScreen
// ─────────────────────────────────────────────────────────────────────────────

export const SignupScreen: React.FC<Props> = ({ navigation }) => {
  const { signIn }                              = useAuth();
  const { signup, loading, error: apiError,
          clearError }                          = useSignup();

  const [mode,            setMode]            = useState<SignupMode>('email');
  const [name,            setName]            = useState('');
  const [identity,        setIdentity]        = useState(''); // email or phone
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Field errors
  const [nameErr,    setNameErr]    = useState('');
  const [identErr,   setIdentErr]   = useState('');
  const [passErr,    setPassErr]    = useState('');
  const [confirmErr, setConfirmErr] = useState('');

  // ── Form validity ─────────────────────────────────────────────────────────
  // Button enable/disable — real-time check without validation messages
  const isFormFilled = useCallback((): boolean => {
    const nameOk     = name.trim().length >= 2;
    const identOk    = mode === 'email'
      ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity)
      : identity.replace(/\D/g, '').length >= 10;
    const passOk     = password.length >= 6;
    const confirmOk  = confirmPassword === password && confirmPassword.length > 0;
    return nameOk && identOk && passOk && confirmOk;
  }, [name, identity, mode, password, confirmPassword]);

  // ── Mode switch ───────────────────────────────────────────────────────────
  const handleModeSwitch = useCallback((next: SignupMode) => {
    setMode(next);
    setIdentity('');
    setIdentErr('');
    if (apiError) clearError();
  }, [apiError, clearError]);

  // ── Change handlers ───────────────────────────────────────────────────────
  const handleNameChange = useCallback((text: string) => {
    setName(text);
    if (nameErr)  setNameErr('');
    if (apiError) clearError();
  }, [nameErr, apiError, clearError]);

  const handleIdentityChange = useCallback((text: string) => {
    setIdentity(text);
    if (identErr) setIdentErr('');
    if (apiError) clearError();
  }, [identErr, apiError, clearError]);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
    if (passErr) setPassErr('');
    // Live confirm check
    if (confirmPassword && text !== confirmPassword) {
      setConfirmErr('Passwords do not match.');
    } else if (confirmPassword) {
      setConfirmErr('');
    }
    if (apiError) clearError();
  }, [passErr, confirmPassword, apiError, clearError]);

  const handleConfirmChange = useCallback((text: string) => {
    setConfirmPassword(text);
    if (text && text !== password) {
      setConfirmErr('Passwords do not match.');
    } else {
      setConfirmErr('');
    }
    if (apiError) clearError();
  }, [password, apiError, clearError]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleCreateAccount = useCallback(async () => {
    // Run all validations and show errors
    const nErr = validators.name(name);
    const iErr = mode === 'email'
      ? validators.email(identity)
      : validators.phone(identity);
    const pErr = validators.password(password);
    const cErr = validators.confirm(password, confirmPassword);

    setNameErr(nErr);
    setIdentErr(iErr);
    setPassErr(pErr);
    setConfirmErr(cErr);

    if (nErr || iErr || pErr || cErr) return;

    // For phone mode, use phone as email field (backend will handle)
    // In real app, you'd have separate API for phone signup
    const emailOrPhone = mode === 'email' ? identity : identity;

    const payload = await signup({
      name,
      email:           emailOrPhone,
      password,
      confirmPassword,
    });

    if (payload) {
      await signIn(payload);
      // RootNavigator auto-switches — no manual navigation needed
    }
  }, [
    name, identity, mode,
    password, confirmPassword,
    signup, signIn,
  ]);

  // ─────────────────────────────────────────────────────────────────────────
  // Render — single flex column, no ScrollView
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.container}>

        {/* ── TOP: Logo + heading ── */}
        <View style={styles.topSection}>
          <Image
            // 🔁 Same logo as LoginScreen
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.welcomeTitle}>Create Account</Text>
          <Text style={styles.welcomeSub}>
            Sign up to start booking your perfect stays
          </Text>
        </View>

        {/* ── MIDDLE: Form ── */}
        <View style={styles.formSection}>

          {/* Email / Phone toggle */}
          <View style={styles.tabBar}>
            {(['email', 'phone'] as SignupMode[]).map(m => (
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

          {/* Name */}
          <Input
            label="Full name"
            placeholder="Aastha"
            autoCapitalize="words"
            value={name}
            onChangeText={handleNameChange}
            error={nameErr}
          />

          {/* Email or Phone */}
          {mode === 'email' ? (
            <Input
              label="Email address"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={identity}
              onChangeText={handleIdentityChange}
              error={identErr}
            />
          ) : (
            <Input
              label="Phone number"
              placeholder="+91 98765 43210"
              keyboardType="phone-pad"
              value={identity}
              onChangeText={handleIdentityChange}
              error={identErr}
            />
          )}

          {/* Password */}
          <Input
            label="Password"
            placeholder="Minimum 6 characters"
            isPassword
            value={password}
            onChangeText={handlePasswordChange}
            error={passErr}
          />

          {/* Confirm password */}
          <Input
            label="Confirm password"
            placeholder="Re-enter your password"
            isPassword
            value={confirmPassword}
            onChangeText={handleConfirmChange}
            error={confirmErr}
          />

          {/* API error */}
          {apiError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>{apiError}</Text>
            </View>
          ) : null}

          {/* Submit */}
          <Button
            label="Create Account"
            onPress={handleCreateAccount}
            loading={loading}
            disabled={!isFormFilled() || loading}
          />

        </View>

        {/* ── BOTTOM: Login link — natural bottom ── */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.footerLink}>Sign In</Text>
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

  container: {
    flex:              1,
    paddingHorizontal: Spacing[5],
    paddingTop:        Spacing[3],
    paddingBottom:     Spacing[4],
  },

  // ── Top ────────────────────────────────────────────────────────────────────
  topSection: {
    alignItems:   'center',
    marginBottom: Spacing[4],
  },
  logo: {
    width:        120,
    height:       50,
    marginBottom: Spacing[3],
  },
  welcomeTitle: {
    fontSize:      20,
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

  // ── Form ───────────────────────────────────────────────────────────────────
  formSection: {
    // No flex:1 — natural height so footer goes to bottom via marginTop auto
  },

  tabBar: {
    flexDirection:   'row',
    backgroundColor: Colors.surface,
    borderRadius:    BorderRadius.md,
    borderWidth:     1,
    borderColor:     Colors.border,
    padding:         Spacing[1],
    marginBottom:    Spacing[3],
  },
  tab: {
    flex:           1,
    height:         32,
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

  errorBox: {
    backgroundColor: Colors.errorSurface,
    borderRadius:    BorderRadius.md,
    borderWidth:     1,
    borderColor:     Colors.errorBorder,
    padding:         Spacing[2],
    marginBottom:    Spacing[2],
  },
  errorBoxText: {
    fontSize:  12,
    color:     Colors.error,
    textAlign: 'center',
  },

  // ── Footer ─────────────────────────────────────────────────────────────────
  footerRow: {
    flexDirection:  'row',
    justifyContent: 'center',
    alignItems:     'center',
    marginTop:      'auto',  // natural bottom — no absolute
    paddingTop:     Spacing[3],
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