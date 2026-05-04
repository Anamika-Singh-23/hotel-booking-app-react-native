// src/screens/payment/PaymentScreen.tsx

import React, {
  useState,
  useCallback,
  useMemo,
}                                   from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  ActivityIndicator,
}                                   from 'react-native';
import { NativeStackScreenProps }   from '@react-navigation/native-stack';
import { AppStackParamList }        from '../../navigation/types';
import { useBooking }               from '../../context/BookingContext';

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<AppStackParamList, 'Payment'>;

type PaymentMethodId = 'upi' | 'card' | 'cash';

interface PaymentMethod {
  id:          PaymentMethodId;
  icon:        string;
  title:       string;
  subtitle:    string;
  badge?:      string;         // optional "Recommended" label
  badgeColor?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id:          'upi',
    icon:        '⚡',
    title:       'UPI',
    subtitle:    'GPay, PhonePe, Paytm & more',
    badge:       'Recommended',
    badgeColor:  '#059669',
  },
  {
    id:          'card',
    icon:        '💳',
    title:       'Credit / Debit Card',
    subtitle:    'Visa, Mastercard, RuPay',
  },
  {
    id:          'cash',
    icon:        '🏨',
    title:       'Cash on Arrival',
    subtitle:    'Pay directly at the hotel',
  },
];

const FAKE_PAYMENT_DELAY_MS = 2000;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const formatDate = (date: Date | null): string => {
  if (!date) return '—';
  return date.toLocaleDateString('en-IN', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  });
};

const formatPrice = (amount: number): string =>
  `₹${amount.toLocaleString('en-IN')}`;

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

// ── Screen header ─────────────────────────────────────────────────────────────

interface HeaderProps {
  onBack: () => void;
}
const Header: React.FC<HeaderProps> = ({ onBack }) => (
  <View style={styles.header}>
    <TouchableOpacity
      style={styles.backBtn}
      onPress={onBack}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      activeOpacity={0.7}
    >
      <Text style={styles.backBtnText}>←</Text>
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Payment</Text>
    <View style={styles.headerSpacer} />
  </View>
);

// ── Secure badge ──────────────────────────────────────────────────────────────

const SecureBadge: React.FC = () => (
  <View style={styles.secureBadge}>
    <Text style={styles.secureBadgeIcon}>🔒</Text>
    <Text style={styles.secureBadgeText}>100% Secure & Encrypted</Text>
  </View>
);

// ── Booking summary card ──────────────────────────────────────────────────────

interface BookingSummaryProps {
  hotelName:    string;
  location:     string;
  checkIn:      Date | null;
  checkOut:     Date | null;
  nights:       number;
  totalGuests:  number;
}
const BookingSummaryCard: React.FC<BookingSummaryProps> = ({
  hotelName,
  location,
  checkIn,
  checkOut,
  nights,
  totalGuests,
}) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>Booking Summary</Text>

    {/* Hotel row */}
    <View style={styles.hotelRow}>
      <View style={styles.hotelAvatar}>
        <Text style={styles.hotelAvatarText}>
          {hotelName.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.hotelInfo}>
        <Text style={styles.hotelName} numberOfLines={1}>{hotelName}</Text>
        <Text style={styles.hotelLocation} numberOfLines={1}>
          📍 {location}
        </Text>
      </View>
    </View>

    <View style={styles.cardDivider} />

    {/* Date + guests chips */}
    <View style={styles.chipsRow}>
      <View style={styles.chip}>
        <Text style={styles.chipIcon}>📅</Text>
        <Text style={styles.chipText}>{formatDate(checkIn)}</Text>
      </View>

      <Text style={styles.chipArrow}>→</Text>

      <View style={styles.chip}>
        <Text style={styles.chipIcon}>📅</Text>
        <Text style={styles.chipText}>{formatDate(checkOut)}</Text>
      </View>
    </View>

    <View style={styles.tagsRow}>
      <View style={styles.tag}>
        <Text style={styles.tagText}>
          🌙 {nights} {nights === 1 ? 'night' : 'nights'}
        </Text>
      </View>
      <View style={styles.tag}>
        <Text style={styles.tagText}>
          👤 {totalGuests} {totalGuests === 1 ? 'guest' : 'guests'}
        </Text>
      </View>
    </View>
  </View>
);

// ── Price breakdown card ──────────────────────────────────────────────────────

interface PriceCardProps {
  pricePerNight: number;
  nights:        number;
  totalPrice:    number;
}
const PriceCard: React.FC<PriceCardProps> = ({
  pricePerNight,
  nights,
  totalPrice,
}) => {
  const subtotal = pricePerNight * nights;
  const tax      = totalPrice - subtotal;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Price Breakdown</Text>

      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>
          {formatPrice(pricePerNight)} × {nights} {nights === 1 ? 'night' : 'nights'}
        </Text>
        <Text style={styles.priceValue}>{formatPrice(subtotal)}</Text>
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Taxes & fees (18% GST)</Text>
        <Text style={styles.priceValue}>{formatPrice(tax)}</Text>
      </View>

      <View style={styles.priceDivider} />

      <View style={styles.priceRow}>
        <Text style={styles.priceTotalLabel}>Total</Text>
        <Text style={styles.priceTotalValue}>{formatPrice(totalPrice)}</Text>
      </View>
    </View>
  );
};

// ── Payment method option ─────────────────────────────────────────────────────

interface PaymentMethodOptionProps {
  method:     PaymentMethod;
  isSelected: boolean;
  onSelect:   (id: PaymentMethodId) => void;
}
const PaymentMethodOption: React.FC<PaymentMethodOptionProps> = ({
  method,
  isSelected,
  onSelect,
}) => (
  <TouchableOpacity
    style={[
      styles.methodOption,
      isSelected && styles.methodOptionSelected,
    ]}
    onPress={() => onSelect(method.id)}
    activeOpacity={0.75}
  >
    {/* Left: icon + text */}
    <View style={styles.methodLeft}>
      <View style={[
        styles.methodIconBox,
        isSelected && styles.methodIconBoxSelected,
      ]}>
        <Text style={styles.methodIcon}>{method.icon}</Text>
      </View>

      <View style={styles.methodText}>
        <View style={styles.methodTitleRow}>
          <Text style={[
            styles.methodTitle,
            isSelected && styles.methodTitleSelected,
          ]}>
            {method.title}
          </Text>

          {/* "Recommended" badge */}
          {method.badge && (
            <View style={[
              styles.methodBadge,
              { backgroundColor: method.badgeColor ?? '#059669' },
            ]}>
              <Text style={styles.methodBadgeText}>{method.badge}</Text>
            </View>
          )}
        </View>
        <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
      </View>
    </View>

    {/* Right: radio circle */}
    <View style={[
      styles.radioOuter,
      isSelected && styles.radioOuterSelected,
    ]}>
      {isSelected && <View style={styles.radioInner} />}
    </View>
  </TouchableOpacity>
);

// ── Payment methods card ──────────────────────────────────────────────────────

interface PaymentMethodsCardProps {
  selected:  PaymentMethodId;
  onSelect:  (id: PaymentMethodId) => void;
}
const PaymentMethodsCard: React.FC<PaymentMethodsCardProps> = ({
  selected,
  onSelect,
}) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>Payment Method</Text>

    <View style={styles.methodsList}>
      {PAYMENT_METHODS.map((method, index) => (
        <React.Fragment key={method.id}>
          <PaymentMethodOption
            method={method}
            isSelected={selected === method.id}
            onSelect={onSelect}
          />
          {index < PAYMENT_METHODS.length - 1 && (
            <View style={styles.methodDivider} />
          )}
        </React.Fragment>
      ))}
    </View>
  </View>
);

// ── Sticky footer ─────────────────────────────────────────────────────────────

interface PaymentFooterProps {
  total:           number;
  methodId:        PaymentMethodId;
  loading:         boolean;
  onPress:         () => void;
}
const PaymentFooter: React.FC<PaymentFooterProps> = ({
  total,
  methodId,
  loading,
  onPress,
}) => {
  // Button label changes based on method
  const buttonLabel: Record<PaymentMethodId, string> = {
    upi:  'Pay with UPI',
    card: 'Pay with Card',
    cash: 'Confirm Booking',
  };

  return (
    <View style={styles.footer}>
      {/* Amount row above button */}
      <View style={styles.footerAmountRow}>
        <Text style={styles.footerAmountLabel}>Amount to Pay</Text>
        <Text style={styles.footerAmountValue}>{formatPrice(total)}</Text>
      </View>

      <TouchableOpacity
        style={[styles.payBtn, loading && styles.payBtnLoading]}
        onPress={onPress}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <View style={styles.payBtnInner}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.payBtnText}>Processing...</Text>
          </View>
        ) : (
          <Text style={styles.payBtnText}>{buttonLabel[methodId]}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PaymentScreen
// ─────────────────────────────────────────────────────────────────────────────

export const PaymentScreen: React.FC<Props> = ({ navigation }) => {

  // ── Context ───────────────────────────────────────────────────────────────
  const { booking, computed, addBookingToHistory } = useBooking();

  const { selectedHotel, checkInDate, checkOutDate, guests } = booking;
  const { totalNights, totalPrice }                          = computed;

  // ── Local state ───────────────────────────────────────────────────────────
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethodId>('upi');
  const [paying, setPaying] = useState(false);

  // ── Derived ───────────────────────────────────────────────────────────────
  const totalGuests = guests.adults + guests.children;

  // Guard: booking context empty — shouldn't happen but handle gracefully
  const isBookingValid = selectedHotel && checkInDate && checkOutDate;

  // ── Pay Now handler ───────────────────────────────────────────────────────

  const handlePayNow = useCallback(() => {
    if (!isBookingValid || paying) return;

    setPaying(true);

    setTimeout(async () => {
        try {
        // Build the record — dates are already Date objects in context
        await addBookingToHistory({
            hotel:        selectedHotel!,
            checkInDate:  checkInDate!.toISOString(),
            checkOutDate: checkOutDate!.toISOString(),
            guests:       guests,
            totalPrice:   totalPrice,
        });
        } catch (err) {
        if (__DEV__) {
            console.error('[PaymentScreen] addBookingToHistory error:', err);
        }
        // Navigate anyway — booking is confirmed even if history fails
        } finally {
        setPaying(false);
        navigation.navigate('PaymentSuccess', {
        paymentMethod: selectedMethod,
        });
        }
    }, FAKE_PAYMENT_DELAY_MS);

    }, [
    isBookingValid,
    paying,
    selectedHotel,
    checkInDate,
    checkOutDate,
    guests,
    totalPrice,
    selectedMethod,
    addBookingToHistory,
    navigation,
    ]);

  // ── Guard screen ──────────────────────────────────────────────────────────

  if (!isBookingValid) {
    return (
      <View style={styles.errorScreen}>
        <Text style={styles.errorText}>Booking details not found.</Text>
        <TouchableOpacity
          style={styles.errorBtn}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
        >
          <Text style={styles.errorBtnText}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

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

        {/* Secure badge */}
        <SecureBadge />

        {/* Booking summary */}
        <BookingSummaryCard
          hotelName={selectedHotel.name}
          location={selectedHotel.location}
          checkIn={checkInDate}
          checkOut={checkOutDate}
          nights={totalNights}
          totalGuests={totalGuests}
        />

        {/* Price breakdown */}
        <PriceCard
          pricePerNight={selectedHotel.price}
          nights={totalNights}
          totalPrice={totalPrice}
        />

        {/* Payment methods */}
        <PaymentMethodsCard
          selected={selectedMethod}
          onSelect={setSelectedMethod}
        />

        {/* UPI input hint — only when UPI selected */}
        {selectedMethod === 'upi' && (
          <View style={styles.upiHint}>
            <Text style={styles.upiHintIcon}>💡</Text>
            <Text style={styles.upiHintText}>
              You'll be redirected to your UPI app after tapping Pay.
            </Text>
          </View>
        )}

        {/* Card hint */}
        {selectedMethod === 'card' && (
          <View style={styles.upiHint}>
            <Text style={styles.upiHintIcon}>💡</Text>
            <Text style={styles.upiHintText}>
              Your card details are encrypted and never stored.
            </Text>
          </View>
        )}

        {/* Cash hint */}
        {selectedMethod === 'cash' && (
          <View style={[styles.upiHint, styles.cashHint]}>
            <Text style={styles.upiHintIcon}>ℹ️</Text>
            <Text style={[styles.upiHintText, styles.cashHintText]}>
              Payment will be collected at the property during check-in.
            </Text>
          </View>
        )}

        {/* Bottom spacer — clears sticky footer */}
        <View style={styles.footerSpacer} />

      </ScrollView>

      {/* Sticky footer */}
      <PaymentFooter
        total={totalPrice}
        methodId={selectedMethod}
        loading={paying}
        onPress={handlePayNow}
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
    padding: 16,
    gap:     14,
  },
  footerSpacer: { height: 120 },

  // ── Secure badge ───────────────────────────────────────────────────────────
  secureBadge: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'center',
    gap:               6,
    backgroundColor:   '#F0FDF4',
    borderRadius:      10,
    paddingVertical:   9,
    borderWidth:       1,
    borderColor:       '#BBF7D0',
  },
  secureBadgeIcon: { fontSize: 13 },
  secureBadgeText: {
    fontSize:   13,
    color:      '#166534',
    fontWeight: '600',
  },

  // ── Generic card ───────────────────────────────────────────────────────────
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius:    16,
    padding:         16,
    gap:             12,
    borderWidth:     1,
    borderColor:     '#E9ECEF',
    ...Platform.select({
      ios: {
        shadowColor:   '#000',
        shadowOffset:  { width: 0, height: 2 },
        shadowOpacity: 0.055,
        shadowRadius:  8,
      },
      android: { elevation: 2 },
    }),
  },
  cardTitle: {
    fontSize:      13,
    fontWeight:    '700',
    color:         '#6C757D',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom:  2,
  },
  cardDivider: {
    height:          1,
    backgroundColor: '#F1F3F5',
  },

  // ── Booking summary ─────────────────────────────────────────────────────────
  hotelRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12,
  },
  hotelAvatar: {
    width:           46,
    height:          46,
    borderRadius:    13,
    backgroundColor: '#1A2340',
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },
  hotelAvatarText: {
    fontSize:   20,
    fontWeight: '800',
    color:      '#FFFFFF',
  },
  hotelInfo: {
    flex: 1,
    gap:   3,
  },
  hotelName: {
    fontSize:   15,
    fontWeight: '700',
    color:      '#212529',
  },
  hotelLocation: {
    fontSize: 13,
    color:    '#6C757D',
  },

  // Date chips
  chipsRow: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            8,
  },
  chip: {
    flex:              1,
    flexDirection:     'row',
    alignItems:        'center',
    gap:               6,
    backgroundColor:   '#F8F9FA',
    borderRadius:      10,
    paddingHorizontal: 10,
    paddingVertical:   8,
    borderWidth:       1,
    borderColor:       '#E9ECEF',
  },
  chipIcon:  { fontSize: 13 },
  chipText: {
    fontSize:   12,
    color:      '#495057',
    fontWeight: '500',
    flexShrink: 1,
  },
  chipArrow: {
    fontSize:   16,
    color:      '#ADB5BD',
    fontWeight: '300',
  },

  // Tags row
  tagsRow: {
    flexDirection: 'row',
    gap:           8,
  },
  tag: {
    backgroundColor:   '#F0F2FF',
    borderRadius:      20,
    paddingHorizontal: 10,
    paddingVertical:   5,
    borderWidth:       1,
    borderColor:       '#D0D7FF',
  },
  tagText: {
    fontSize:   12,
    color:      '#4338CA',
    fontWeight: '600',
  },

  // ── Price breakdown ─────────────────────────────────────────────────────────
  priceRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  priceLabel: {
    fontSize: 14,
    color:    '#6C757D',
  },
  priceValue: {
    fontSize:   14,
    color:      '#495057',
    fontWeight: '500',
  },
  priceDivider: {
    height:          1,
    backgroundColor: '#E9ECEF',
    marginVertical:  4,
  },
  priceTotalLabel: {
    fontSize:   16,
    fontWeight: '700',
    color:      '#212529',
  },
  priceTotalValue: {
    fontSize:   18,
    fontWeight: '800',
    color:      '#059669',
  },

  // ── Payment methods ─────────────────────────────────────────────────────────
  methodsList: { gap: 0 },

  methodOption: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius:   12,
  },
  methodOptionSelected: {
    backgroundColor: '#FFF8F0',
    paddingHorizontal: 10,
    marginHorizontal: -10,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12,
    flex:          1,
  },
  methodIconBox: {
    width:           44,
    height:          44,
    borderRadius:    12,
    backgroundColor: '#F8F9FA',
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1,
    borderColor:     '#E9ECEF',
    flexShrink:      0,
  },
  methodIconBoxSelected: {
    backgroundColor: '#FFF8F0',
    borderColor:     '#FDECD6',
  },
  methodIcon: { fontSize: 20 },
  methodText: {
    flex: 1,
    gap:   3,
  },
  methodTitleRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
    flexWrap:      'wrap',
  },
  methodTitle: {
    fontSize:   15,
    fontWeight: '600',
    color:      '#495057',
  },
  methodTitleSelected: {
    color: '#212529',
  },
  methodBadge: {
    borderRadius:      20,
    paddingHorizontal: 7,
    paddingVertical:   2,
  },
  methodBadgeText: {
    fontSize:   10,
    color:      '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  methodSubtitle: {
    fontSize: 12,
    color:    '#ADB5BD',
  },
  methodDivider: {
    height:           1,
    backgroundColor:  '#F1F3F5',
    marginVertical:   2,
    marginHorizontal: 56,  // aligns under text, skips icon
  },

  // ── Radio button ───────────────────────────────────────────────────────────
  radioOuter: {
    width:           22,
    height:          22,
    borderRadius:    11,
    borderWidth:     2,
    borderColor:     '#DEE2E6',
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },
  radioOuterSelected: {
    borderColor: '#F09030',
  },
  radioInner: {
    width:           10,
    height:          10,
    borderRadius:    5,
    backgroundColor: '#F09030',
  },

  // ── Method hint cards ───────────────────────────────────────────────────────
  upiHint: {
    flexDirection:   'row',
    alignItems:      'flex-start',
    gap:             8,
    backgroundColor: '#FFFBEB',
    borderRadius:    12,
    padding:         12,
    borderWidth:     1,
    borderColor:     '#FDE68A',
  },
  upiHintIcon: { fontSize: 14, marginTop: 1 },
  upiHintText: {
    fontSize:   13,
    color:      '#92400E',
    lineHeight: 18,
    flex:       1,
  },
  cashHint: {
    backgroundColor: '#EFF6FF',
    borderColor:     '#BFDBFE',
  },
  cashHintText: {
    color: '#1D4ED8',
  },

  // ── Sticky footer ───────────────────────────────────────────────────────────
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
  footerAmountRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  footerAmountLabel: {
    fontSize: 13,
    color:    '#6C757D',
  },
  footerAmountValue: {
    fontSize:   18,
    fontWeight: '800',
    color:      '#212529',
  },
  payBtn: {
    backgroundColor: '#F09030',
    borderRadius:    14,
    paddingVertical: 16,
    alignItems:      'center',
    justifyContent:  'center',
  },
  payBtnLoading: {
    backgroundColor: '#F4A553',
  },
  payBtnInner: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
  },
  payBtnText: {
    color:         '#FFFFFF',
    fontSize:      16,
    fontWeight:    '700',
    letterSpacing: 0.2,
  },

  // ── Error state ─────────────────────────────────────────────────────────────
  errorScreen: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    padding:        32,
    backgroundColor: '#F8F9FA',
    gap:            16,
  },
  errorText: {
    fontSize:  16,
    color:     '#6C757D',
    textAlign: 'center',
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