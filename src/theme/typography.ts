// src/theme/typography.ts
import { Platform } from 'react-native';

// System fonts — fast, native, beautiful
export const FontFamily = {
  regular:  Platform.select({ ios: 'System',       android: 'Roboto' })!,
  medium:   Platform.select({ ios: 'System',       android: 'Roboto-Medium' })!,
  semiBold: Platform.select({ ios: 'System',       android: 'Roboto-Medium' })!,
  bold:     Platform.select({ ios: 'System',       android: 'Roboto-Bold' })!,
};

export const FontSize = {
  xs:   11,
  sm:   13,
  base: 15,
  md:   16,
  lg:   18,
  xl:   20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 38,
};

export const FontWeight = {
  regular:  '400' as const,
  medium:   '500' as const,
  semiBold: '600' as const,
  bold:     '700' as const,
  extraBold:'800' as const,
};

export const LineHeight = {
  tight:   1.2,
  snug:    1.35,
  normal:  1.5,
  relaxed: 1.65,
};

// Pre-built text styles — use directly in components
export const TextStyles = {
  h1: {
    fontSize:   FontSize['4xl'],
    fontWeight: FontWeight.bold,
    lineHeight: FontSize['4xl'] * LineHeight.tight,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize:   FontSize['3xl'],
    fontWeight: FontWeight.bold,
    lineHeight: FontSize['3xl'] * LineHeight.tight,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize:   FontSize['2xl'],
    fontWeight: FontWeight.semiBold,
    lineHeight: FontSize['2xl'] * LineHeight.snug,
  },
  h4: {
    fontSize:   FontSize.xl,
    fontWeight: FontWeight.semiBold,
    lineHeight: FontSize.xl * LineHeight.snug,
  },
  bodyLarge: {
    fontSize:   FontSize.md,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.md * LineHeight.relaxed,
  },
  body: {
    fontSize:   FontSize.base,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.base * LineHeight.normal,
  },
  bodySmall: {
    fontSize:   FontSize.sm,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.sm * LineHeight.normal,
  },
  label: {
    fontSize:   FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: FontSize.sm * LineHeight.normal,
    letterSpacing: 0.1,
  },
  caption: {
    fontSize:   FontSize.xs,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.xs * LineHeight.normal,
    letterSpacing: 0.2,
  },
  button: {
    fontSize:   FontSize.base,
    fontWeight: FontWeight.semiBold,
    letterSpacing: 0.2,
  },
};