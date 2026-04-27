// src/screens/booking/BookingConfirmationScreen.tsx

import React, { useMemo }                  from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
}                                           from 'react-native';
import { NativeStackScreenProps }           from '@react-navigation/native-stack';
import { AppStackParamList }                from '../../navigation/types';
import { useBooking }                       from '../../context/BookingContext';
import { SectionCard }                      from '../../components/ui/SectionCard';
import { InfoRow }                          from '../../components/ui/InfoRow';
import { StickyFooter }                     from '../../components/ui/StickyFooter';

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<AppStackParamList, 'BookingConfirmation'>;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const formatDate = (date: Date | null): string => {
  if (!date) return '—';
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day:     '2-digit',
    month:   'long',
    year:    'numeric',
  });
};

const formatPrice = (amount: number): string =>
  `₹${amount.toLocaleString('en-IN')}`;

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

// ── Screen header with back button ───────────────────────────────────────────

interface HeaderProps {
  onBack: () => void;
}
const Header: React.FC<HeaderProps> = ({ onBack }) => (
  <View style={styles.header}>
    <TouchableOpacity
      onPress={onBack}
      style={styles.backBtn}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      activeOpacity={0.7}
    >
      <Text style={styles.backBtnText}>←</Text>
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Review Booking</Text>
    <View style={styles.headerSpacer} />
  </View>
);

// ── Step indicator ────────────────────────────────────────────────────────────
// Shows user where they are: Details → Review → Payment

const StepIndicator: React.FC = () => (
  <View style={styles.stepIndicator}>
    {STEPS.map((step, index) => (
      <React.Fragment key={step.label}>
        <View style={styles.stepItem}>
          <View style={[
            styles.stepDot,
            index <= 1 && styles.stepDotActive,   // Details + Review are done
          ]}>
            {index < 1
              ? <Text style={styles.stepDotCheck}>✓</Text>
              : <Text style={[
                  styles.stepDotNumber,
                  index === 1 && styles.stepDotNumberActive,
                ]}>
                  {index + 1}
                </Text>
            }
          </View>
          <Text style={[
            styles.stepLabel,
            index <= 1 && styles.stepLabelActive,
          ]}>
            {step.label}
          </Text>
        </View>

        {/* Connector line between steps */}
        {index < STEPS.length - 1 && (
          <View style={[
            styles.stepLine,
            index < 1 && styles.stepLineActive,
          ]} />
        )}
      </React.Fragment>
    ))}
  </View>
);

const STEPS = [
  { label: 'Details'  },
  { label: 'Review'   },
  { label: 'Payment'  },
];

// ── Price row inside price breakdown card ─────────────────────────────────────

interface PriceRowProps {
  label:       string;
  value:       string;
  isTotal?:    boolean;
  valueColor?: string;
}
const PriceRow: React.FC<PriceRowProps> = ({
  label,
  value,
  isTotal    = false,
  valueColor = '#495057',
}) => (
  <View style={[styles.priceRow, isTotal && styles.priceRowTotal]}>
    <Text style={[styles.priceLabel, isTotal && styles.priceLabelTotal]}>
      {label}
    </Text>
    <Text style={[
      styles.priceValue,
      isTotal && styles.priceValueTotal,
      { color: isTotal ? '#059669' : valueColor },
    ]}>
      {value}
    </Text>
  </View>
);

// ── Cancellation policy note ──────────────────────────────────────────────────

const CancellationNote: React.FC = () => (
  <View style={styles.policyNote}>
    <Text style={styles.policyIcon}>🛡️</Text>
    <View style={styles.policyTextBlock}>
      <Text style={styles.policyTitle}>Free Cancellation</Text>
      <Text style={styles.policyBody}>
        Cancel before 24 hours of check-in for a full refund.
      </Text>
    </View>
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// BookingConfirmationScreen
// ─────────────────────────────────────────────────────────────────────────────

export const BookingConfirmationScreen: React.FC<Props> = ({
  navigation,
}) => {
  // ── Read from context — single source of truth ────────────────────────────
  const { booking, computed } = useBooking();

  const {
    selectedHotel,
    checkInDate,
    checkOutDate,
    guests,
  } = booking;

  const { totalNights, totalGuests, totalPrice } = computed;

  // ── Computed price breakdown ───────────────────────────────────────────────
  const priceBreakdown = useMemo(() => {
    const pricePerNight = selectedHotel?.price ?? 0;
    const subtotal      = pricePerNight * totalNights;
    const tax           = Math.round(subtotal * 0.18);
    const total         = subtotal + tax;
    return { pricePerNight, subtotal, tax, total };
  }, [selectedHotel, totalNights]);

  // Guard — should never happen if navigation is set up correctly
  if (!selectedHotel || !checkInDate || !checkOutDate) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Booking details not found.</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={styles.errorBtn}
        >
          <Text style={styles.errorBtnText}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleProceedToPayment = () => {
    navigation.navigate('Payment');
  };

  // ── Footer content — price + button ───────────────────────────────────────

  const FooterPriceContent = (
    <View style={styles.footerPriceRow}>
      <View>
        <Text style={styles.footerPriceLabel}>Total Amount</Text>
        <Text style={styles.footerPriceValue}>
          {formatPrice(priceBreakdown.total)}
        </Text>
      </View>
      <View style={styles.footerNightsChip}>
        <Text style={styles.footerNightsText}>
          {totalNights} {totalNights === 1 ? 'night' : 'nights'}
        </Text>
      </View>
    </View>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Fixed header */}
      <Header onBack={() => navigation.goBack()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* Step indicator */}
        <StepIndicator />

        {/* ── Hotel info card ── */}
        <SectionCard title="Hotel">
          <View style={styles.hotelRow}>
            <View style={styles.hotelAvatar}>
              <Text style={styles.hotelAvatarText}>
                {selectedHotel.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.hotelInfo}>
              <Text style={styles.hotelName} numberOfLines={2}>
                {selectedHotel.name}
              </Text>
              <Text style={styles.hotelLocation} numberOfLines={1}>
                📍 {selectedHotel.location}
              </Text>
              <View style={styles.ratingChip}>
                <Text style={styles.ratingChipText}>
                  ★ {selectedHotel.rating.toFixed(1)}
                </Text>
              </View>
            </View>
          </View>
        </SectionCard>

        {/* ── Stay details card ── */}
        <SectionCard title="Stay Details">
          <InfoRow
            icon="📅"
            label="Check-in"
            value={formatDate(checkInDate)}
          />
          <InfoRow
            icon="📅"
            label="Check-out"
            value={formatDate(checkOutDate)}
          />
          <InfoRow
            icon="🌙"
            label="Duration"
            value={`${totalNights} ${totalNights === 1 ? 'night' : 'nights'}`}
          />
          <InfoRow
            icon="👤"
            label="Guests"
            value={`${totalGuests} ${totalGuests === 1 ? 'guest' : 'guests'}`}
            isLast
          />
        </SectionCard>

        {/* ── Price breakdown card ── */}
        <SectionCard title="Price Breakdown">

          <PriceRow
            label={`₹${selectedHotel.price.toLocaleString('en-IN')} × ${totalNights} nights`}
            value={formatPrice(priceBreakdown.subtotal)}
          />

          <View style={styles.priceDivider} />

          <PriceRow
            label="Taxes & fees (18% GST)"
            value={formatPrice(priceBreakdown.tax)}
          />

          <View style={styles.priceDividerThick} />

          <PriceRow
            label="Total"
            value={formatPrice(priceBreakdown.total)}
            isTotal
          />

        </SectionCard>

        {/* ── Cancellation policy ── */}
        <CancellationNote />

        {/* ── Terms note ── */}
        <Text style={styles.termsNote}>
          By proceeding, you agree to our{' '}
          <Text style={styles.termsLink}>Terms & Conditions</Text>
          {' '}and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>.
        </Text>

        {/* Bottom spacer — clears sticky footer */}
        <View style={styles.footerSpacer} />

      </ScrollView>

      {/* ── Sticky footer — price + proceed button ── */}
      <StickyFooter
        buttonLabel="Proceed to Payment  →"
        onPress={handleProceedToPayment}
        buttonColor="#F09030"
        topContent={FooterPriceContent}
      />

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
    justifyContent:    'space-between',
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
  headerTitle: {
    fontSize:   17,
    fontWeight: '700',
    color:      '#212529',
  },
  headerSpacer: { width: 36 },

  // ── Scroll ─────────────────────────────────────────────────────────────────
  scroll:        { flex: 1 },
  scrollContent: {
    padding:    16,
    gap:        14,
    paddingBottom: 16,
  },
  footerSpacer: { height: 110 },

  // ── Step indicator ──────────────────────────────────────────────────────────
  stepIndicator: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap:            0,
  },
  stepItem: {
    alignItems: 'center',
    gap:        6,
  },
  stepDot: {
    width:           28,
    height:          28,
    borderRadius:    14,
    backgroundColor: '#E9ECEF',
    alignItems:      'center',
    justifyContent:  'center',
  },
  stepDotActive: {
    backgroundColor: '#F09030',
  },
  stepDotCheck: {
    fontSize:   13,
    color:      '#FFFFFF',
    fontWeight: '700',
  },
  stepDotNumber: {
    fontSize:   12,
    color:      '#6C757D',
    fontWeight: '700',
  },
  stepDotNumberActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize:   10,
    color:      '#ADB5BD',
    fontWeight: '500',
  },
  stepLabelActive: {
    color: '#F09030',
  },
  stepLine: {
    flex:            1,
    height:          2,
    backgroundColor: '#E9ECEF',
    marginBottom:    18,
    marginHorizontal: 4,
    minWidth:        32,
  },
  stepLineActive: {
    backgroundColor: '#F09030',
  },

  // ── Hotel card ──────────────────────────────────────────────────────────────
  hotelRow: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap:           12,
  },
  hotelAvatar: {
    width:           52,
    height:          52,
    borderRadius:    14,
    backgroundColor: '#1A2340',
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },
  hotelAvatarText: {
    fontSize:   22,
    fontWeight: '800',
    color:      '#FFFFFF',
  },
  hotelInfo: {
    flex: 1,
    gap:  4,
  },
  hotelName: {
    fontSize:   16,
    fontWeight: '700',
    color:      '#212529',
    lineHeight: 22,
  },
  hotelLocation: {
    fontSize: 13,
    color:    '#6C757D',
  },
  ratingChip: {
    alignSelf:         'flex-start',
    backgroundColor:   '#FFF8F0',
    borderRadius:      20,
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderWidth:       1,
    borderColor:       '#FDECD6',
    marginTop:         2,
  },
  ratingChipText: {
    fontSize:   12,
    fontWeight: '600',
    color:      '#F09030',
  },

  // ── Price breakdown ─────────────────────────────────────────────────────────
  priceRow: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    paddingVertical: 8,
  },
  priceRowTotal: {
    paddingVertical: 4,
  },
  priceLabel: {
    fontSize: 14,
    color:    '#6C757D',
  },
  priceLabelTotal: {
    fontSize:   16,
    fontWeight: '700',
    color:      '#212529',
  },
  priceValue: {
    fontSize:   14,
    fontWeight: '500',
  },
  priceValueTotal: {
    fontSize:   18,
    fontWeight: '800',
  },
  priceDivider: {
    height:          1,
    backgroundColor: '#F1F3F5',
    marginVertical:  2,
  },
  priceDividerThick: {
    height:          2,
    backgroundColor: '#E9ECEF',
    marginVertical:  8,
  },

  // ── Cancellation policy ─────────────────────────────────────────────────────
  policyNote: {
    flexDirection:   'row',
    alignItems:      'flex-start',
    gap:             12,
    backgroundColor: '#F0FDF4',
    borderRadius:    14,
    padding:         14,
    borderWidth:     1,
    borderColor:     '#BBF7D0',
  },
  policyIcon: {
    fontSize:  20,
    marginTop:  1,
  },
  policyTextBlock: {
    flex: 1,
    gap:   3,
  },
  policyTitle: {
    fontSize:   14,
    fontWeight: '700',
    color:      '#15803D',
  },
  policyBody: {
    fontSize:   13,
    color:      '#166534',
    lineHeight: 18,
  },

  // ── Terms ───────────────────────────────────────────────────────────────────
  termsNote: {
    fontSize:   12,
    color:      '#ADB5BD',
    textAlign:  'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  termsLink: {
    color:      '#F09030',
    fontWeight: '600',
  },

  // ── Footer price row ────────────────────────────────────────────────────────
  footerPriceRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  footerPriceLabel: {
    fontSize: 12,
    color:    '#6C757D',
    marginBottom: 2,
  },
  footerPriceValue: {
    fontSize:   20,
    fontWeight: '800',
    color:      '#212529',
  },
  footerNightsChip: {
    backgroundColor:   '#FFF8F0',
    borderRadius:      20,
    paddingHorizontal: 12,
    paddingVertical:   6,
    borderWidth:       1,
    borderColor:       '#FDECD6',
  },
  footerNightsText: {
    fontSize:   13,
    fontWeight: '600',
    color:      '#F09030',
  },

  // ── Error state ─────────────────────────────────────────────────────────────
  errorContainer: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    padding:        32,
    backgroundColor: '#F8F9FA',
  },
  errorText: {
    fontSize:     16,
    color:        '#6C757D',
    marginBottom: 20,
    textAlign:    'center',
  },
  errorBtn: {
    backgroundColor:   '#F09030',
    paddingHorizontal: 24,
    paddingVertical:   12,
    borderRadius:      10,
  },
  errorBtnText: {
    color:      '#FFFFFF',
    fontWeight: '600',
    fontSize:   15,
  },
});