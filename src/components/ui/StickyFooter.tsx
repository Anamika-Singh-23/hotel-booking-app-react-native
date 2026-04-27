// src/components/ui/StickyFooter.tsx

import React       from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ViewStyle,
}                  from 'react-native';

interface StickyFooterProps {
  buttonLabel:    string;
  onPress:        () => void;
  disabled?:      boolean;
  buttonColor?:   string;
  topContent?:    React.ReactNode;  // optional price display above button
  style?:         ViewStyle;
}

export const StickyFooter: React.FC<StickyFooterProps> = ({
  buttonLabel,
  onPress,
  disabled     = false,
  buttonColor  = '#F09030',
  topContent,
  style,
}) => (
  <View style={[styles.footer, style]}>
    {topContent}
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: buttonColor },
        disabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      <Text style={styles.buttonText}>{buttonLabel}</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  footer: {
    position:          'absolute',
    bottom:            0,
    left:              0,
    right:             0,
    paddingHorizontal: 16,
    paddingTop:        12,
    paddingBottom:     Platform.OS === 'ios' ? 32 : 16,
    backgroundColor:   '#FFFFFF',
    borderTopWidth:    1,
    borderTopColor:    '#E9ECEF',
    gap:               10,
    ...Platform.select({
      ios: {
        shadowColor:   '#000',
        shadowOffset:  { width: 0, height: -3 },
        shadowOpacity: 0.07,
        shadowRadius:  8,
      },
      android: { elevation: 12 },
    }),
  },
  button: {
    borderRadius:    14,
    paddingVertical: 16,
    alignItems:      'center',
    justifyContent:  'center',
  },
  buttonDisabled: {
    backgroundColor: '#DEE2E6',
  },
  buttonText: {
    color:         '#FFFFFF',
    fontSize:      16,
    fontWeight:    '700',
    letterSpacing: 0.2,
  },
});