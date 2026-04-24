// src/screens/home/HomeScreen.tsx

import React                        from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ListRenderItem,
}                                   from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHotels }                from '../../hooks/useHotels';
import { Hotel }                    from '../../types/hotel.types';
import { HotelCard }                from '../../components/hotel/HotelCard';

import { useNavigation }            from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList }         from '../../navigation/types';

type HomeNavProp = NativeStackNavigationProp<AppStackParamList, 'Home'>;

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components (same as before — no changes needed)
// ─────────────────────────────────────────────────────────────────────────────

const FullScreenLoader: React.FC = () => (
  <View style={styles.centeredView}>
    <ActivityIndicator size="large" color="#F09030" />
    <Text style={styles.loadingText}>Finding hotels...</Text>
  </View>
);

interface ErrorViewProps {
  message: string;
  onRetry: () => void;
}
const ErrorView: React.FC<ErrorViewProps> = ({ message, onRetry }) => (
  <View style={styles.centeredView}>
    <Text style={styles.errorIcon}>⚠️</Text>
    <Text style={styles.errorTitle}>Something went wrong</Text>
    <Text style={styles.errorMessage}>{message}</Text>
    <TouchableOpacity
      style={styles.retryButton}
      onPress={onRetry}
      activeOpacity={0.8}
    >
      <Text style={styles.retryText}>Try Again</Text>
    </TouchableOpacity>
  </View>
);

interface InlineErrorBannerProps {
  message: string;
  onRetry: () => void;
}
const InlineErrorBanner: React.FC<InlineErrorBannerProps> = ({ message, onRetry }) => (
  <View style={styles.inlineBanner}>
    <Text style={styles.inlineBannerText}>{message}</Text>
    <TouchableOpacity
      onPress={onRetry}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Text style={styles.inlineBannerRetry}>Retry</Text>
    </TouchableOpacity>
  </View>
);

const EmptyView: React.FC = () => (
  <View style={styles.centeredView}>
    <Text style={styles.emptyIcon}>🏨</Text>
    <Text style={styles.emptyText}>No hotels available right now.</Text>
    <Text style={styles.emptySubText}>Check back soon.</Text>
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// HomeScreen
// ─────────────────────────────────────────────────────────────────────────────

export const HomeScreen: React.FC = () => {
  const { hotels, loading, isRefreshing, error, refetch } = useHotels();

  const navigation = useNavigation<HomeNavProp>();

  // ── Render function — now uses HotelCard ──────────────────────────────────
  const renderHotel: ListRenderItem<Hotel> = ({ item }) => (
    <HotelCard
        hotel={item}
        onPress={(hotel) => {
        navigation.navigate('HotelDetails', { hotel });
        }}
    />
    );


  // ── State: first load ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <FullScreenLoader />
      </SafeAreaView>
    );
  }

  // ── State: first load failed ───────────────────────────────────────────────
  if (error && hotels.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <ErrorView
          message={error}
          onRetry={() => refetch()}
        />
      </SafeAreaView>
    );
  }

  // ── State: data loaded ─────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Available Hotels</Text>
          <Text style={styles.headerSubtitle}>
            {hotels.length} properties found
          </Text>
        </View>
      </View>

      {/* Refresh failure banner */}
      {error && hotels.length > 0 && (
        <InlineErrorBanner
          message="Refresh failed. Showing last results."
          onRetry={() => refetch()}
        />
      )}

      {/* ── Hotel list — HotelCard replaces inline card ── */}
      <FlatList
        data={hotels}
        keyExtractor={(item) => item.id}
        renderItem={renderHotel}
        ListEmptyComponent={<EmptyView />}

        contentContainerStyle={[
          styles.listContent,
          hotels.length === 0 && styles.listContentEmpty,
        ]}

        // Gap between cards via ItemSeparatorComponent
        // Better than margin on card — no extra space after last item
        ItemSeparatorComponent={() => <View style={styles.separator} />}

        // Pull-to-refresh
        refreshing={isRefreshing}
        onRefresh={() => refetch()}

        decelerationRate="normal"
        bounces={false}
        overScrollMode='never'
        scrollEventThrottle={16}

        // Performance
        removeClippedSubviews
        initialNumToRender={4}      // cards are taller now — render fewer
        showsVerticalScrollIndicator={false}
      />

    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex:            1,
    backgroundColor: '#F8F9FA',
  },

  // Header
  header: {
    paddingHorizontal: 16,
    paddingVertical:   14,
    backgroundColor:   '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize:     18,
    fontWeight:   '700',
    color:        '#212529',
    marginBottom:  2,
  },
  headerSubtitle: {
    fontSize: 13,
    color:    '#6C757D',
  },

  // List
  listContent: {
    padding: 16,
  },
  listContentEmpty: {
    flex: 1,
  },
  separator: {
    height: 16,   // gap between cards
  },

  // Centered states
  centeredView: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    padding:        32,
  },
  loadingText: {
    marginTop: 12,
    fontSize:  15,
    color:     '#6C757D',
  },
  errorIcon: {
    fontSize:     40,
    marginBottom:  12,
  },
  errorTitle: {
    fontSize:     17,
    fontWeight:   '600',
    color:        '#212529',
    marginBottom:  6,
  },
  errorMessage: {
    fontSize:     14,
    color:        '#6C757D',
    textAlign:    'center',
    lineHeight:   20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor:   '#F09030',
    paddingHorizontal: 32,
    paddingVertical:   12,
    borderRadius:      10,
  },
  retryText: {
    color:      '#FFFFFF',
    fontWeight: '600',
    fontSize:   15,
  },
  inlineBanner: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    backgroundColor:   '#FEF2F2',
    borderBottomWidth: 1,
    borderBottomColor: '#FECACA',
    paddingHorizontal: 16,
    paddingVertical:   10,
  },
  inlineBannerText: {
    fontSize: 13,
    color:    '#EF4444',
    flex:     1,
  },
  inlineBannerRetry: {
    fontSize:   13,
    fontWeight: '600',
    color:      '#EF4444',
    marginLeft: 12,
  },
  emptyIcon: {
    fontSize:     48,
    marginBottom:  12,
  },
  emptyText: {
    fontSize:     16,
    fontWeight:   '600',
    color:        '#495057',
    marginBottom:  4,
  },
  emptySubText: {
    fontSize: 13,
    color:    '#ADB5BD',
  },
});