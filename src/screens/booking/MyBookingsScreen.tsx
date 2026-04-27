// src/screens/bookings/MyBookingsScreen.tsx

import React, {
  useState,
  useCallback,
  useMemo,
}                                   from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  ListRenderItem,
}                                   from 'react-native';
import { NativeStackScreenProps }   from '@react-navigation/native-stack';
import { AppStackParamList }        from '../../navigation/types';
import { useBooking }               from '../../context/BookingContext';
import { BookingRecord }            from '../../types/booking.types';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../../navigation/types';
import { PropsBuilderConfig } from 'react-native-reanimated/lib/typescript/common';

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = BottomTabScreenProps<TabParamList, 'MyBookings'>;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-IN', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  });
};

const formatPrice = (amount: number): string =>
  `₹${amount.toLocaleString('en-IN')}`;

const calcNights = (checkIn: string, checkOut: string): number => {
  const diff =
    new Date(checkOut).getTime() - new Date(checkIn).getTime();
  const nights = Math.floor(diff / (1000 * 60 * 60 * 24));
  return nights > 0 ? nights : 0;
};

// Status → display config
const STATUS_CONFIG: Record<BookingRecord['status'], { label: string; color: string; bg: string }> = {
  confirmed: { label: 'Confirmed', color: '#059669', bg: '#F0FDF4' },
  cancelled: { label: 'Cancelled', color: '#DC2626', bg: '#FEF2F2' },
  completed: { label: 'Completed', color: '#2563EB', bg: '#EFF6FF' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

// ── Screen header ─────────────────────────────────────────────────────────────

interface HeaderProps {
  onBack:       () => void;
  totalCount:   number;
}
const Header: React.FC<HeaderProps> = ({ onBack, totalCount }) => (
  <View style={styles.header}>
    <TouchableOpacity
      style={styles.backBtn}
      onPress={onBack}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      activeOpacity={0.7}
    >
      <Text style={styles.backBtnText}>←</Text>
    </TouchableOpacity>

    <View style={styles.headerCenter}>
      <Text style={styles.headerTitle}>My Bookings</Text>
      {totalCount > 0 && (
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{totalCount}</Text>
        </View>
      )}
    </View>

    <View style={styles.headerSpacer} />
  </View>
);

// ── Status badge ──────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: BookingRecord['status'];
}
const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = STATUS_CONFIG[status];
  return (
    <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
      <View style={[styles.statusDot, { backgroundColor: config.color }]} />
      <Text style={[styles.statusText, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
};

// ── Booking card ──────────────────────────────────────────────────────────────

interface BookingCardProps {
  record: BookingRecord;
}
const BookingCard: React.FC<BookingCardProps> = ({ record }) => {
  const nights      = calcNights(record.checkInDate, record.checkOutDate);
  const totalGuests = record.guests.adults + record.guests.children;

  return (
    <View style={styles.card}>

      {/* ── Card top: hotel name + status ── */}
      <View style={styles.cardTop}>
        <View style={styles.hotelAvatarSmall}>
          <Text style={styles.hotelAvatarText}>
            {record.hotel.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.hotelTitleBlock}>
          <Text style={styles.hotelName} numberOfLines={1}>
            {record.hotel.name}
          </Text>
          <Text style={styles.hotelLocation} numberOfLines={1}>
            📍 {record.hotel.location}
          </Text>
        </View>

        <StatusBadge status={record.status} />
      </View>

      <View style={styles.cardDivider} />

      {/* ── Date range row ── */}
      <View style={styles.dateRow}>
        {/* Check-in */}
        <View style={styles.dateBlock}>
          <Text style={styles.dateLabel}>Check-in</Text>
          <Text style={styles.dateValue}>{formatDate(record.checkInDate)}</Text>
        </View>

        {/* Night count connector */}
        <View style={styles.nightsConnector}>
          <View style={styles.nightsLine} />
          <View style={styles.nightsPill}>
            <Text style={styles.nightsPillText}>
              {nights} {nights === 1 ? 'night' : 'nights'}
            </Text>
          </View>
          <View style={styles.nightsLine} />
        </View>

        {/* Check-out */}
        <View style={[styles.dateBlock, styles.dateBlockRight]}>
          <Text style={styles.dateLabel}>Check-out</Text>
          <Text style={styles.dateValue}>{formatDate(record.checkOutDate)}</Text>
        </View>
      </View>

      <View style={styles.cardDivider} />

      {/* ── Card bottom: guests + price + booking ID ── */}
      <View style={styles.cardBottom}>
        <View style={styles.cardBottomLeft}>
          {/* Guests */}
          <View style={styles.metaChip}>
            <Text style={styles.metaChipText}>
              👤 {totalGuests} {totalGuests === 1 ? 'guest' : 'guests'}
            </Text>
          </View>

          {/* Booking ID */}
          <Text style={styles.bookingIdText}>#{record.bookingId}</Text>
        </View>

        {/* Total price */}
        <View style={styles.priceBlock}>
          <Text style={styles.priceLabel}>Total Paid</Text>
          <Text style={styles.priceValue}>{formatPrice(record.totalPrice)}</Text>
        </View>
      </View>

    </View>
  );
};

// ── Empty state ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  onExplore: () => void;
}
const EmptyState: React.FC<EmptyStateProps> = ({ onExplore }) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyIcon}>🏨</Text>
    <Text style={styles.emptyTitle}>No bookings yet</Text>
    <Text style={styles.emptySubtitle}>
      Your confirmed stays will appear here.{'\n'}
      Start by exploring available hotels.
    </Text>
    <TouchableOpacity
      style={styles.exploreBtn}
      onPress={onExplore}
      activeOpacity={0.85}
    >
      <Text style={styles.exploreBtnText}>Explore Hotels</Text>
    </TouchableOpacity>
  </View>
);

// ── Loading state ─────────────────────────────────────────────────────────────

const LoadingState: React.FC = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.loadingText}>Loading your bookings...</Text>
  </View>
);

// ── Summary bar — shown above list when bookings exist ────────────────────────

interface SummaryBarProps {
  count:      number;
  totalSpent: number;
}
const SummaryBar: React.FC<SummaryBarProps> = ({ count, totalSpent }) => (
  <View style={styles.summaryBar}>
    <View style={styles.summaryItem}>
      <Text style={styles.summaryValue}>{count}</Text>
      <Text style={styles.summaryLabel}>
        {count === 1 ? 'Booking' : 'Bookings'}
      </Text>
    </View>

    <View style={styles.summaryDivider} />

    <View style={styles.summaryItem}>
      <Text style={styles.summaryValue}>{formatPrice(totalSpent)}</Text>
      <Text style={styles.summaryLabel}>Total Spent</Text>
    </View>
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// MyBookingsScreen
// ─────────────────────────────────────────────────────────────────────────────

export const MyBookingsScreen: React.FC<Props> = ({ navigation }) => {

  const { bookingHistory, historyLoading } = useBooking();

  // ── Pull-to-refresh state ─────────────────────────────────────────────────
  // History comes from context (already loaded) — PTR just simulates a sync
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    // Context already has latest data — just simulate a brief refresh feel
    // Replace with real API sync later
    setTimeout(() => setIsRefreshing(false), 800);
  }, []);

  // ── Sorted: newest booking first ──────────────────────────────────────────
  const sortedHistory = useMemo(
    () =>
      [...bookingHistory].sort(
        (a, b) =>
          new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime(),
      ),
    [bookingHistory],
  );

  // ── Total spent across all bookings ──────────────────────────────────────
  const totalSpent = useMemo(
    () => bookingHistory.reduce((sum, r) => sum + r.totalPrice, 0),
    [bookingHistory],
  );

  // ── Render item ───────────────────────────────────────────────────────────
  const renderBooking: ListRenderItem<BookingRecord> = useCallback(
    ({ item }) => <BookingCard record={item} />,
    [],
  );

  const keyExtractor = useCallback(
    (item: BookingRecord) => item.bookingId,
    [],
  );

  const ItemSeparator = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Header
        onBack={() => navigation.goBack()}
        totalCount={bookingHistory.length}
      />

      {/* Loading state — AsyncStorage still reading */}
      {historyLoading ? (
        <LoadingState />
      ) : bookingHistory.length === 0 ? (
        /* Empty state */
        <EmptyState onExplore={() => navigation.navigate('Home')} />
      ) : (
        /* Booking list */
        <FlatList  
          data={sortedHistory}
          keyExtractor={keyExtractor}
          renderItem={renderBooking}
          ItemSeparatorComponent={ItemSeparator}

          ListHeaderComponent={
            <SummaryBar
              count={bookingHistory.length}
              totalSpent={totalSpent}
            />
          }
          ListHeaderComponentStyle={styles.listHeader}

          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}

          // Pull-to-refresh
          refreshing={isRefreshing}
          onRefresh={handleRefresh}

          // Performance
          removeClippedSubviews
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={10}
        />
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  screen: {
    flex:            1,
    backgroundColor: '#F8F9FA',
  },

  // ── Header ─────────────────────────────────────────────────────────────────
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 16,
    paddingTop:        Platform.OS === 'android' ? 16 : 52,
    paddingBottom:     14,
    backgroundColor:   '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backBtn: {
    width:           36,
    height:          36,
    borderRadius:    18,
    backgroundColor: '#F8F9FA',
    alignItems:      'center',
    justifyContent:  'center',
  },
  backBtnText: {
    fontSize:   18,
    color:      '#212529',
    fontWeight: '600',
  },
  headerCenter: {
    flex:          1,
    flexDirection: 'row',
    alignItems:    'center',
    justifyContent:'center',
    gap:           8,
  },
  headerTitle: {
    fontSize:   17,
    fontWeight: '700',
    color:      '#212529',
  },
  countBadge: {
    backgroundColor:   '#F09030',
    borderRadius:      20,
    paddingHorizontal: 8,
    paddingVertical:   2,
    minWidth:          24,
    alignItems:        'center',
  },
  countBadgeText: {
    fontSize:   12,
    fontWeight: '700',
    color:      '#FFFFFF',
  },
  headerSpacer: { width: 36 },

  // ── List ───────────────────────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: 16,
    paddingBottom:     32,
  },
  listHeader: {
    marginBottom: 16,
  },
  separator: {
    height: 12,
  },

  // ── Summary bar ────────────────────────────────────────────────────────────
  summaryBar: {
    flexDirection:   'row',
    backgroundColor: '#FFFFFF',
    borderRadius:    14,
    padding:         16,
    borderWidth:     1,
    borderColor:     '#E9ECEF',
    alignItems:      'center',
    justifyContent:  'space-around',
    marginTop:       16,
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
  summaryItem: {
    alignItems: 'center',
    gap:        2,
  },
  summaryValue: {
    fontSize:   18,
    fontWeight: '800',
    color:      '#212529',
  },
  summaryLabel: {
    fontSize: 12,
    color:    '#6C757D',
  },
  summaryDivider: {
    width:           1,
    height:          32,
    backgroundColor: '#E9ECEF',
  },

  // ── Booking card ───────────────────────────────────────────────────────────
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius:    16,
    padding:         16,
    borderWidth:     1,
    borderColor:     '#E9ECEF',
    gap:             12,
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

  // Card top
  cardTop: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
  },
  hotelAvatarSmall: {
    width:           42,
    height:          42,
    borderRadius:    12,
    backgroundColor: '#1A2340',
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },
  hotelAvatarText: {
    fontSize:   18,
    fontWeight: '800',
    color:      '#FFFFFF',
  },
  hotelTitleBlock: {
    flex: 1,
    gap:   3,
  },
  hotelName: {
    fontSize:   15,
    fontWeight: '700',
    color:      '#212529',
  },
  hotelLocation: {
    fontSize: 12,
    color:    '#6C757D',
  },

  // Status badge
  statusBadge: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               5,
    paddingHorizontal: 9,
    paddingVertical:   4,
    borderRadius:      20,
    flexShrink:        0,
  },
  statusDot: {
    width:        6,
    height:       6,
    borderRadius: 3,
  },
  statusText: {
    fontSize:   11,
    fontWeight: '700',
  },

  cardDivider: {
    height:          1,
    backgroundColor: '#F1F3F5',
  },

  // Date row
  dateRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  dateBlock: {
    gap: 3,
  },
  dateBlockRight: {
    alignItems: 'flex-end',
  },
  dateLabel: {
    fontSize:      10,
    color:         '#ADB5BD',
    fontWeight:    '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  dateValue: {
    fontSize:   13,
    fontWeight: '700',
    color:      '#212529',
  },

  // Nights connector
  nightsConnector: {
    flex:          1,
    flexDirection: 'row',
    alignItems:    'center',
    paddingHorizontal: 8,
    gap:           4,
  },
  nightsLine: {
    flex:            1,
    height:          1,
    backgroundColor: '#DEE2E6',
  },
  nightsPill: {
    backgroundColor:   '#F8F9FA',
    borderRadius:      20,
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderWidth:       1,
    borderColor:       '#E9ECEF',
  },
  nightsPillText: {
    fontSize:   11,
    color:      '#6C757D',
    fontWeight: '600',
  },

  // Card bottom
  cardBottom: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-end',
  },
  cardBottomLeft: {
    gap: 6,
  },
  metaChip: {
    backgroundColor:   '#F0F2FF',
    borderRadius:      20,
    paddingHorizontal: 10,
    paddingVertical:   4,
    alignSelf:         'flex-start',
    borderWidth:       1,
    borderColor:       '#D0D7FF',
  },
  metaChipText: {
    fontSize:   12,
    color:      '#4338CA',
    fontWeight: '600',
  },
  bookingIdText: {
    fontSize: 11,
    color:    '#ADB5BD',
  },
  priceBlock: {
    alignItems: 'flex-end',
    gap:        2,
  },
  priceLabel: {
    fontSize: 11,
    color:    '#ADB5BD',
  },
  priceValue: {
    fontSize:   17,
    fontWeight: '800',
    color:      '#F09030',
  },

  // ── Empty state ─────────────────────────────────────────────────────────────
  emptyContainer: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    padding:        40,
    gap:            12,
  },
  emptyIcon: {
    fontSize:     56,
    marginBottom:  8,
  },
  emptyTitle: {
    fontSize:   20,
    fontWeight: '700',
    color:      '#212529',
  },
  emptySubtitle: {
    fontSize:   14,
    color:      '#6C757D',
    textAlign:  'center',
    lineHeight: 21,
  },
  exploreBtn: {
    backgroundColor:   '#F09030',
    paddingHorizontal: 28,
    paddingVertical:   13,
    borderRadius:      12,
    marginTop:         8,
  },
  exploreBtnText: {
    color:      '#FFFFFF',
    fontWeight: '700',
    fontSize:   15,
  },

  // ── Loading state ───────────────────────────────────────────────────────────
  loadingText: {
    fontSize: 15,
    color:    '#6C757D',
  },
});