// src/screens/app/HomeScreen.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { Colors, Spacing, TextStyles, BorderRadius } from '../../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = () => {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Header bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.subGreeting}>Where would you like to stay?</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>R</Text>
          </View>
        </View>

        {/* Placeholder card */}
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderIcon}>🏨</Text>
          <Text style={styles.placeholderTitle}>Home Screen</Text>
          <Text style={styles.placeholderSub}>
            Hotel listings will appear here in the next step
          </Text>
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex:            1,
    backgroundColor: Colors.background,
  },
  container: {
    flex:    1,
    padding: Spacing[5],
  },
  topBar: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   Spacing[8],
  },
  greeting: {
    ...TextStyles.h3,
    color:        Colors.textPrimary,
    marginBottom: Spacing[0.5],
  },
  subGreeting: {
    ...TextStyles.body,
    color: Colors.textSecondary,
  },
  avatar: {
    width:           42,
    height:          42,
    borderRadius:    BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems:      'center',
    justifyContent:  'center',
  },
  avatarText: {
    ...TextStyles.h4,
    color: Colors.textOnPrimary,
  },
  placeholderCard: {
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: Colors.surface,
    borderRadius:    BorderRadius.xl,
    borderWidth:     1,
    borderColor:     Colors.border,
    borderStyle:     'dashed',
    padding:         Spacing[8],
  },
  placeholderIcon:  { fontSize: 48, marginBottom: Spacing[4] },
  placeholderTitle: {
    ...TextStyles.h3,
    color:        Colors.textPrimary,
    marginBottom: Spacing[2],
  },
  placeholderSub: {
    ...TextStyles.body,
    color:     Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});