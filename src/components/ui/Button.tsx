// src/components/ui/Button.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors, Spacing, BorderRadius, TextStyles } from '../../theme';

type ButtonVariant = 'primary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles[`${variant}_disabled`],
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? Colors.textOnPrimary : Colors.primary}
        />
      ) : (
        <Text
          style={[
            styles.label,
            styles[`label_${variant}`],
            styles[`labelSize_${size}`],
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,

    // ✅ FIX: direct use (safe)
    borderColor: 'transparent',
  },

  fullWidth: {
    width: '100%',
  },

  // Variants
  primary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  outline: {
    backgroundColor: 'transparent',
    borderColor: Colors.primary,
  },

  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },

  // Disabled states
  primary_disabled: {
    backgroundColor: Colors.border,
    borderColor: Colors.border,
  },

  outline_disabled: {
    borderColor: Colors.border,
  },

  ghost_disabled: {},

  // Sizes
  size_sm: {
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[4],
    minHeight: 38,
  },

  size_md: {
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[6],
    minHeight: 50,
  },

  size_lg: {
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[8],
    minHeight: 58,
  },

  // Labels
  label: {
    ...TextStyles.button,
  },

  label_primary: {
    color: Colors.textOnPrimary,
  },

  label_outline: {
    color: Colors.primary,
  },

  label_ghost: {
    color: Colors.primary,
  },

  labelSize_sm: {
    fontSize: 13,
  },

  labelSize_md: {
    fontSize: 15,
  },

  labelSize_lg: {
    fontSize: 16,
  },
});