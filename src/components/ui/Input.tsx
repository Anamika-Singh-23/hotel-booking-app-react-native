// src/components/ui/Input.tsx

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
  TextInputProps,
  Platform,
} from 'react-native';
import { Colors, Spacing, BorderRadius, TextStyles, FontSize } from '../../theme';

// ─── Types ───────────────────────────────────────────────────────────────────

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;            // Label shown above the input
  error?: string;            // Error message — triggers red border
  hint?: string;             // Subtle helper text below (only shown when no error)
  isPassword?: boolean;      // Enables show/hide toggle
  disabled?: boolean;        // Greys out and blocks interaction
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  required?: boolean;        // Appends * to label
}

// ─── Component ───────────────────────────────────────────────────────────────

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  isPassword = false,
  disabled = false,
  leftIcon,
  rightIcon,
  containerStyle,
  required = false,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused]       = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Animated border width on focus (subtle emphasis)
  const borderAnim = useRef(new Animated.Value(1.5)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(borderAnim, {
      toValue: 2,
      duration: 150,
      useNativeDriver: false,
    }).start();
    textInputProps.onFocus?.({} as any);
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(borderAnim, {
      toValue: 1.5,
      duration: 150,
      useNativeDriver: false,
    }).start();
    textInputProps.onBlur?.({} as any);
  };

  // ── Border color logic ──────────────────────────────────────────────────
  const borderColor = (() => {
    if (disabled)  return Colors.border;
    if (error)     return Colors.error;
    if (isFocused) return Colors.primary;
    return Colors.border;
  })();

  const backgroundColor = (() => {
    if (disabled) return Colors.slate100;  // slightly greyed
    if (error)    return Colors.errorSurface;
    return Colors.surface;
  })();

  // ── Eye toggle icon ─────────────────────────────────────────────────────
  const EyeIcon = () => (
    <TouchableOpacity
      onPress={() => setShowPassword(prev => !prev)}
      style={styles.eyeButton}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      activeOpacity={0.7}
    >
      {/* Simple text-based eye — replace with your icon library later */}
      <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
    </TouchableOpacity>
  );

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.wrapper, containerStyle]}>

      {/* ── Label ── */}
      {label && (
        <View style={styles.labelRow}>
          <Text style={[styles.label, disabled && styles.labelDisabled]}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}

      {/* ── Input Container ── */}
      <Animated.View
        style={[
          styles.inputContainer,
          {
            borderColor,
            borderWidth: borderAnim,
            backgroundColor,
          },
          isFocused && styles.focusShadow,
        ]}
      >
        {/* Left icon slot */}
        {leftIcon && (
          <View style={styles.iconLeft}>{leftIcon}</View>
        )}

        {/* Actual TextInput */}
        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputPaddingLeft : undefined,
            (rightIcon || isPassword) ? styles.inputPaddingRight : undefined,
            disabled ? styles.inputDisabled : undefined,
          ]}
          placeholderTextColor={Colors.textDisabled}
          editable={!disabled}
          secureTextEntry={isPassword && !showPassword}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCapitalize="none"
          autoCorrect={false}
          {...textInputProps}
        />

        {/* Right slot — eye toggle OR custom icon */}
        {isPassword
          ? <EyeIcon />
          : rightIcon
          ? <View style={styles.iconRight}>{rightIcon}</View>
          : null
        }
      </Animated.View>

      {/* ── Helper Row: error OR hint ── */}
      {(error || hint) && (
        <View style={styles.helperRow}>
          {error
            ? <Text style={styles.errorText}>{error}</Text>
            : <Text style={styles.hintText}>{hint}</Text>
          }
        </View>
      )}

    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

// Pull slate100 directly from our extended palette
// const palette = {
//   slate100: '#F1F3F5',
// };

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing[5],
  },

  // Label
  labelRow: {
    flexDirection: 'row',
    marginBottom:  Spacing[1.5],
  },
  label: {
    ...TextStyles.label,
    color: Colors.textPrimary,
  },
  labelDisabled: {
    color: Colors.textDisabled,
  },
  required: {
    color: Colors.error,
  },

  // Container
  inputContainer: {
    flexDirection:     'row',
    alignItems:        'center',
    borderRadius:      BorderRadius.md,
    minHeight:         52,
    paddingHorizontal: Spacing[4],
    // transition handled by Animated.View
  },
  focusShadow: {
    // Soft glow on focus — iOS only (elevation handles Android)
    ...Platform.select({
      ios: {
        shadowColor:   Colors.primary,
        shadowOffset:  { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius:  6,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  // TextInput
  input: {
    flex:            1,
    fontSize:        FontSize.base,
    color:           Colors.textPrimary,
    paddingVertical: Spacing[3],
    // Remove default Android underline
    textAlignVertical: 'center',
  },
  inputPaddingLeft:  { paddingLeft:  Spacing[2] },
  inputPaddingRight: { paddingRight: Spacing[2] },
  inputDisabled: {
    color: Colors.textDisabled,
  },

  // Icons
  iconLeft: {
    justifyContent: 'center',
    alignItems:     'center',
    marginRight:    Spacing[1],
  },
  iconRight: {
    justifyContent: 'center',
    alignItems:     'center',
    marginLeft:     Spacing[1],
  },
  eyeButton: {
    justifyContent: 'center',
    alignItems:     'center',
    marginLeft:     Spacing[1],
    padding:        Spacing[1],
  },
  eyeIcon: {
    fontSize: 16,
  },

  // Helper text
  helperRow: {
    marginTop:    Spacing[1.5],
    paddingLeft:  Spacing[1],
  },
  errorText: {
    ...TextStyles.caption,
    color: Colors.error,
  },
  hintText: {
    ...TextStyles.caption,
    color: Colors.textSecondary,
  },
});