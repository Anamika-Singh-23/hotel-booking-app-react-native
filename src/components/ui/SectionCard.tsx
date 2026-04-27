// src/components/ui/SectionCard.tsx

import React       from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  Platform,
}                  from 'react-native';

interface SectionCardProps {
  title?:    string;
  children:  React.ReactNode;
  style?:    ViewStyle;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  children,
  style,
}) => (
  <View style={[styles.card, style]}>
    {title ? <Text style={styles.cardTitle}>{title}</Text> : null}
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius:    16,
    padding:         16,
    borderWidth:     1,
    borderColor:     '#E9ECEF',
    ...Platform.select({
      ios: {
        shadowColor:   '#000',
        shadowOffset:  { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius:  8,
      },
      android: { elevation: 2 },
    }),
  },
  cardTitle: {
    fontSize:     14,
    fontWeight:   '700',
    color:        '#212529',
    marginBottom: 12,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
});