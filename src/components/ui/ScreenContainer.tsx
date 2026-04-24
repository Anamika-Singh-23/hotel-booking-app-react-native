// src/components/ui/ScreenContainer.tsx
import React from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ViewStyle,
  StatusBar,
  View,
} from 'react-native';
import { Colors, Spacing } from '../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenContainerProps {
  children:        React.ReactNode;
  scrollable?:     boolean;
  padded?:         boolean;
  backgroundColor?: string;
  style?:          ViewStyle;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scrollable     = false,
  padded         = true,
  backgroundColor = Colors.background,
  style,
}) => {
  const contentStyle = [padded && styles.padded, style];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={backgroundColor}
        translucent={false}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scrollable ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[styles.scroll, ...contentStyle]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, ...contentStyle]}>
            {children}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:   { flex: 1 },
  flex:   { flex: 1 },
  padded: { paddingHorizontal: Spacing[5] },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing[5] },
});