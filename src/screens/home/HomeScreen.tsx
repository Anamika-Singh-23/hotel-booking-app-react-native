// src/screens/home/HomeScreen.tsx
// ♻️ FULL REPLACE

import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
}                                        from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ListRenderItem,
  ActivityIndicator,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
}                                        from 'react-native';
import { SafeAreaView }                 from 'react-native-safe-area-context';
import { useNavigation }                 from '@react-navigation/native';
import { NativeStackNavigationProp }     from '@react-navigation/native-stack';
import { useHotels }                     from '../../hooks/useHotels';
import { HotelCard }                     from '../../components/hotel/HotelCard';
import { Hotel }                         from '../../types/hotel.types';
import { AppStackParamList }             from '../../navigation/types';

// ── Types ─────────────────────────────────────────────────────────────────────

type HomeNavProp = NativeStackNavigationProp<AppStackParamList>;

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const DEBOUNCE_MS = 300;

// ─────────────────────────────────────────────────────────────────────────────
// Custom hook — useDebounce
// Delays updating the value until user stops typing for DEBOUNCE_MS
// Keeps filtering logic out of the component body
// ─────────────────────────────────────────────────────────────────────────────

const useDebounce = (value: string, delay: number): string => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: cancel previous timer if value changes before delay
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

// ── Search bar ────────────────────────────────────────────────────────────────

interface SearchBarProps {
  value:       string;
  onChange:    (text: string) => void;
  onClear:     () => void;
  resultCount: number;
  isFiltering: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onClear,
  resultCount,
  isFiltering,
}) => {
  const inputRef = useRef<TextInput>(null);
  const hasText  = value.length > 0;

  return (
    <View style={styles.searchWrapper}>
      <View style={styles.searchContainer}>

        {/* Search icon */}
        <Text style={styles.searchIcon}>🔍</Text>

        {/* Input */}
        <TextInput
          ref={inputRef}
          style={styles.searchInput}
          value={value}
          onChangeText={onChange}
          placeholder="Search hotels or locations..."
          placeholderTextColor="#ADB5BD"
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="never"   // we handle clear ourselves
        />

        {/* Clear button — only when text exists */}
        {hasText && (
          <TouchableOpacity
            onPress={onClear}
            style={styles.clearBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Result count — shown only when filtering */}
      {isFiltering && (
        <Text style={styles.resultCount}>
          {resultCount} {resultCount === 1 ? 'result' : 'results'} found
        </Text>
      )}
    </View>
  );
};

// ── Full screen loader ────────────────────────────────────────────────────────

const FullScreenLoader: React.FC = () => (
  <View style={styles.centeredView}>
    <ActivityIndicator size="large" color="#F09030" />
    <Text style={styles.loadingText}>Finding hotels...</Text>
  </View>
);

// ── Full screen error ─────────────────────────────────────────────────────────

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

// ── Inline refresh failure banner ─────────────────────────────────────────────

interface InlineErrorBannerProps {
  message: string;
  onRetry: () => void;
}
const InlineErrorBanner: React.FC<InlineErrorBannerProps> = ({
  message,
  onRetry,
}) => (
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

// ── No hotels found — search empty state ──────────────────────────────────────

interface SearchEmptyStateProps {
  query: string;
  onClear: () => void;
}
const SearchEmptyState: React.FC<SearchEmptyStateProps> = ({
  query,
  onClear,
}) => (
  <View style={styles.centeredView}>
    <Text style={styles.emptyIcon}>🔍</Text>
    <Text style={styles.emptyTitle}>No hotels found</Text>
    <Text style={styles.emptySubText}>
      No results for{' '}
      <Text style={styles.emptyQuery}>"{query}"</Text>
      {'\n'}Try a different name or location.
    </Text>
    <TouchableOpacity
      style={styles.clearSearchBtn}
      onPress={onClear}
      activeOpacity={0.8}
    >
      <Text style={styles.clearSearchBtnText}>Clear Search</Text>
    </TouchableOpacity>
  </View>
);

// ── Generic list empty state ──────────────────────────────────────────────────

const ListEmptyState: React.FC = () => (
  <View style={styles.centeredView}>
    <Text style={styles.emptyIcon}>🏨</Text>
    <Text style={styles.emptyTitle}>No hotels available</Text>
    <Text style={styles.emptySubText}>Check back soon.</Text>
  </View>
);

// ── Separator between FlatList items ─────────────────────────────────────────

const ItemSeparator: React.FC = () => <View style={styles.separator} />;

// ─────────────────────────────────────────────────────────────────────────────
// HomeScreen
// ─────────────────────────────────────────────────────────────────────────────

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeNavProp>();

  // ── Data ─────────────────────────────────────────────────────────────────
  const { hotels, loading, isRefreshing, error, refetch } = useHotels();

  // ── Search state ──────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');

  // Debounced value — actual filtering uses this, not raw query
  // Prevents filtering on every keystroke
  const debouncedQuery = useDebounce(searchQuery, DEBOUNCE_MS);

  // ── Filtered hotels ───────────────────────────────────────────────────────
  // useMemo: only recomputes when hotels list OR debounced query changes
  const filteredHotels = useMemo(() => {
    const query = debouncedQuery.trim().toLowerCase();

    // No query — return full list (no filtering cost)
    if (!query) return hotels;

    return hotels.filter(hotel => {
      const nameMatch     = hotel.name.toLowerCase().includes(query);
      const locationMatch = hotel.location.toLowerCase().includes(query);
      return nameMatch || locationMatch;
    });
  }, [hotels, debouncedQuery]);

  // ── Derived state ─────────────────────────────────────────────────────────
  const isFiltering  = debouncedQuery.trim().length > 0;
  const isSearchEmpty = isFiltering && filteredHotels.length === 0;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleHotelPress = useCallback((hotel: Hotel) => {
    navigation.navigate('HotelDetails', { hotel });
  }, [navigation]);

  // ── Render hotel card ─────────────────────────────────────────────────────
  const renderHotel: ListRenderItem<Hotel> = useCallback(
    ({ item }) => (
      <HotelCard
        hotel={item}
        onPress={handleHotelPress}
      />
    ),
    [handleHotelPress],
  );

  const keyExtractor = useCallback(
    (item: Hotel) => item.id,
    [],
  );

  // ── List header — search bar + inline error ────────────────────────────────
  // Inside ListHeaderComponent so it scrolls with the list
  const ListHeader = useMemo(() => (
    <View>
      <SearchBar
        value={searchQuery}
        onChange={handleSearchChange}
        onClear={handleClearSearch}
        resultCount={filteredHotels.length}
        isFiltering={isFiltering}
      />
      {error && hotels.length > 0 && (
        <InlineErrorBanner
          message="Refresh failed. Showing last results."
          onRetry={() => refetch(true)}
        />
      )}
    </View>
  ), [
    searchQuery,
    handleSearchChange,
    handleClearSearch,
    filteredHotels.length,
    isFiltering,
    error,
    hotels.length,
    refetch,
  ]);

  // ─────────────────────────────────────────────────────────────────────────
  // Render states
  // ─────────────────────────────────────────────────────────────────────────

  // State 1: Initial load
  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader
          total={0}
          showCount={false}
          navigation={navigation}
        />
        <FullScreenLoader />
      </SafeAreaView>
    );
  }

  // State 2: First load failed
  if (error && hotels.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader
          total={0}
          showCount={false}
          navigation={navigation}
        />
        <ErrorView
          message={error}
          onRetry={() => refetch(false)}
        />
      </SafeAreaView>
    );
  }

  // State 3: Data loaded (with or without search active)
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScreenHeader
        total={isFiltering ? filteredHotels.length : hotels.length}
        showCount
        navigation={navigation}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      ></KeyboardAvoidingView>

      <FlatList
        data={filteredHotels}
        keyExtractor={keyExtractor}
        renderItem={renderHotel}
        ItemSeparatorComponent={ItemSeparator}

        ListHeaderComponent={ListHeader}

        // Empty state — changes based on whether search is active
        ListEmptyComponent={
          isSearchEmpty
            ? <SearchEmptyState
                query={debouncedQuery}
                onClear={handleClearSearch}
              />
            : <ListEmptyState />
        }

        contentContainerStyle={[
          styles.listContent,
          filteredHotels.length === 0 && styles.listContentEmpty,
        ]}

        // Pull-to-refresh — only makes sense when not searching
        refreshing={isRefreshing}
        onRefresh={() => refetch(true)}

        // Performance
        removeClippedSubviews
        initialNumToRender={4}
        maxToRenderPerBatch={6}
        windowSize={8}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ScreenHeader — extracted to avoid re-render on search changes
// ─────────────────────────────────────────────────────────────────────────────

interface ScreenHeaderProps {
  total:      number;
  showCount:  boolean;
  navigation: HomeNavProp;
}
const ScreenHeader: React.FC<ScreenHeaderProps> = React.memo(({
  total,
  showCount,
  navigation,
}) => (
  <View style={styles.header}>
    <View>
      <Text style={styles.headerTitle}>Available Hotels</Text>
      {showCount && (
        <Text style={styles.headerSubtitle}>
          {total} {total === 1 ? 'property' : 'properties'} found
        </Text>
      )}
    </View>

    <View style={styles.headerActions}>
      <TouchableOpacity
        style={styles.headerIconBtn}
        onPress={() => navigation.navigate('MainTabs', { screen: 'MyBookings' })}
        activeOpacity={0.75}
      >
        <Text style={styles.headerIconBtnText}>📋</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.headerIconBtn}
        onPress={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
        activeOpacity={0.75}
      >
        <Text style={styles.headerIconBtnText}>👤</Text>
      </TouchableOpacity>
    </View>
  </View>
));

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  safe: {
    flex:            1,
    backgroundColor: '#F8F9FA',
  },
  flex: {
    flex: 1,
  },

  // ── Header ─────────────────────────────────────────────────────────────────
  header: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
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
  headerActions: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
  },
  headerIconBtn: {
    width:           38,
    height:          38,
    borderRadius:    19,
    backgroundColor: '#F1F3F5',
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1,
    borderColor:     '#E9ECEF',
  },
  headerIconBtnText: {
    fontSize: 18,
  },

  // ── Search ─────────────────────────────────────────────────────────────────
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop:        14,
    paddingBottom:     4,
    gap:               8,
  },
  searchContainer: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   '#FFFFFF',
    borderRadius:      14,
    paddingHorizontal: 14,
    borderWidth:       1.5,
    borderColor:       '#E9ECEF',
    height:            48,
    gap:               10,
    ...Platform.select({
      ios: {
        shadowColor:   '#000',
        shadowOffset:  { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius:  6,
      },
      android: { elevation: 2 },
    }),
  },
  searchIcon: {
    fontSize:  16,
    opacity:   0.5,
  },
  searchInput: {
    flex:       1,
    fontSize:   15,
    color:      '#212529',
    paddingVertical: 0,   // removes Android extra padding
  },
  clearBtn: {
    width:           24,
    height:          24,
    borderRadius:    12,
    backgroundColor: '#E9ECEF',
    alignItems:      'center',
    justifyContent:  'center',
  },
  clearBtnText: {
    fontSize:   11,
    color:      '#6C757D',
    fontWeight: '700',
  },
  resultCount: {
    fontSize:   12,
    color:      '#6C757D',
    paddingLeft: 4,
    fontWeight: '500',
  },

  // ── List ───────────────────────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: 16,
    paddingBottom:     24,
    paddingTop:        10,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  separator: {
    height: 14,
  },

  // ── Centered states ────────────────────────────────────────────────────────
  centeredView: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    padding:        40,
    gap:            10,
  },
  loadingText: {
    fontSize:  15,
    color:     '#6C757D',
    marginTop:  8,
  },

  // Error
  errorIcon: {
    fontSize:     40,
    marginBottom:  4,
  },
  errorTitle: {
    fontSize:   17,
    fontWeight: '600',
    color:      '#212529',
  },
  errorMessage: {
    fontSize:   14,
    color:      '#6C757D',
    textAlign:  'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop:         8,
    backgroundColor:   '#F09030',
    paddingHorizontal: 28,
    paddingVertical:   11,
    borderRadius:      10,
  },
  retryText: {
    color:      '#FFFFFF',
    fontWeight: '600',
    fontSize:   14,
  },

  // Inline error
  inlineBanner: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    backgroundColor:   '#FEF2F2',
    borderRadius:      10,
    marginHorizontal:  16,
    marginTop:         8,
    paddingHorizontal: 14,
    paddingVertical:   10,
    borderWidth:       1,
    borderColor:       '#FECACA',
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

  // Search empty state
  emptyIcon: {
    fontSize:     48,
    marginBottom:  4,
  },
  emptyTitle: {
    fontSize:   18,
    fontWeight: '700',
    color:      '#212529',
  },
  emptySubText: {
    fontSize:   14,
    color:      '#6C757D',
    textAlign:  'center',
    lineHeight: 21,
  },
  emptyQuery: {
    fontWeight: '600',
    color:      '#212529',
  },
  clearSearchBtn: {
    marginTop:         12,
    backgroundColor:   '#1A2340',
    paddingHorizontal: 24,
    paddingVertical:   11,
    borderRadius:      10,
  },
  clearSearchBtnText: {
    color:      '#FFFFFF',
    fontWeight: '600',
    fontSize:   14,
  },
});