
// src/theme/colors.ts

const palette = {
  // Brand
  saffron50:  '#FFF8F0',
  saffron100: '#FDECD6',
  saffron400: '#F4A553',
  saffron500: '#F09030',  // Primary brand
  saffron600: '#D97820',

  // Neutral
  slate50:  '#F8F9FA',
  slate100: '#F1F3F5',
  slate200: '#E9ECEF',
  slate300: '#DEE2E6',
  slate400: '#ADB5BD',
  slate500: '#6C757D',
  slate700: '#495057',
  slate900: '#212529',

  // Semantic
  emerald400: '#34D399',
  emerald500: '#10B981',
  red400:     '#F87171',
  red500:     '#EF4444',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const Colors = {
  // Brand
  primary:        palette.saffron500,
  primaryLight:   palette.saffron400,
  primaryDark:    palette.saffron600,
  primarySurface: palette.saffron50,

  // Secondary (deep navy — contrasts warmly)
  secondary:      '#1A2340',
  secondaryLight: '#2C3A5C',

  // Backgrounds
  background:     palette.slate50,
  surface:        palette.white,
  surfaceElevated:'#FFFFFF',  // cards, modals
  border:         palette.slate200,
  borderFocus:    palette.saffron500,

  // Text
  textPrimary:    palette.slate900,
  textSecondary:  palette.slate500,
  textDisabled:   palette.slate400,
  textInverse:    palette.white,
  textOnPrimary:  palette.white,

  // Semantic
  success:        palette.emerald500,
  successSurface: '#ECFDF5',
  error:          palette.red500,
  errorSurface:   '#FEF2F2',
  errorBorder:    palette.red400,

  // Utility
  overlay:        'rgba(0,0,0,0.45)',
  shadow:         'rgba(0,0,0,0.08)',

  slate100: palette.slate100,
};

export type ColorKey = keyof typeof Colors;