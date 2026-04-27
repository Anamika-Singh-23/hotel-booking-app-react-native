// src/screens/booking/BookingScreen.tsx


import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
}                                                  from 'react-native';
import { NativeStackScreenProps }                  from '@react-navigation/native-stack';
import { AppStackParamList }                       from '../../navigation/types';
import { useBooking }                              from '../../context/BookingContext';
import { BookingConfirmationParams } from '../../types/booking.types';

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<AppStackParamList, 'Booking'>;

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const MIN_GUESTS = 1;
const MAX_GUESTS = 5;

// Generate next N dates starting from today
// Used to build a simple date picker without a library
const generateDates = (fromDate: Date, count: number): Date[] => {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(fromDate);
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });
};

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const formatDate = (date: Date | null): string => {
  if (!date) return 'Select date';
  return date.toLocaleDateString('en-IN', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  });
};

const formatPrice = (amount: number): string =>
  `₹${amount.toLocaleString('en-IN')}`;

const calcNights = (checkIn: Date | null, checkOut: Date | null): number => {
  if (!checkIn || !checkOut) return 0;
  const diff = Math.floor(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
  );
  return diff > 0 ? diff : 0;
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

// ── Header ────────────────────────────────────────────────────────────────────

interface ScreenHeaderProps {
  onBack: () => void;
}
const ScreenHeader: React.FC<ScreenHeaderProps> = ({ onBack }) => (
  <View style={styles.header}>
    <TouchableOpacity
      onPress={onBack}
      style={styles.backBtn}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      activeOpacity={0.7}
    >
      <Text style={styles.backBtnIcon}>←</Text>
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Book Your Stay</Text>
    <View style={styles.headerRight} />
  </View>
);

// ── Hotel summary card ────────────────────────────────────────────────────────

interface HotelSummaryCardProps {
  name:     string;
  location: string;
  price:    number;
}
const HotelSummaryCard: React.FC<HotelSummaryCardProps> = ({
  name,
  location,
  price,
}) => (
  <View style={styles.hotelCard}>
    <View style={styles.hotelCardLeft}>
      {/* Color swatch as hotel avatar */}
      <View style={styles.hotelAvatar}>
        <Text style={styles.hotelAvatarText}>
          {name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.hotelCardInfo}>
        <Text style={styles.hotelCardName} numberOfLines={1}>{name}</Text>
        <Text style={styles.hotelCardLocation} numberOfLines={1}>
          📍 {location}
        </Text>
      </View>
    </View>
    <View style={styles.hotelCardPriceBlock}>
      <Text style={styles.hotelCardPrice}>{formatPrice(price)}</Text>
      <Text style={styles.hotelCardPriceLabel}>/ night</Text>
    </View>
  </View>
);

// ── Section wrapper ───────────────────────────────────────────────────────────

interface SectionProps {
  title:    string;
  children: React.ReactNode;
}
const Section: React.FC<SectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

// ── Date picker row ───────────────────────────────────────────────────────────
// Horizontal scroll of date chips — no library needed

interface DatePickerProps {
  label:          string;
  selectedDate:   Date | null;
  availableDates: Date[];
  onSelect:       (date: Date) => void;
  disabledBefore?: Date | null;  // greys out dates before this
}
const DatePicker: React.FC<DatePickerProps> = ({
  label,
  selectedDate,
  availableDates,
  onSelect,
  disabledBefore,
}) => {
  const isDisabled = (date: Date): boolean => {
    if (!disabledBefore) return false;
    return date <= disabledBefore;
  };

  const isSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  return (
    <View style={styles.datePickerWrapper}>
      {/* Selected value display */}
      <View style={styles.dateSelectedDisplay}>
        <Text style={styles.dateSelectedIcon}>📅</Text>
        <Text style={[
          styles.dateSelectedText,
          !selectedDate && styles.dateSelectedPlaceholder,
        ]}>
          {formatDate(selectedDate)}
        </Text>
      </View>

      {/* Scrollable date chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={styles.dateScroll}
        keyboardShouldPersistTaps="handled"
        style={{ flexGrow: 0 }} 
      >
        {availableDates.map((date, index) => {
          const disabled = isDisabled(date);
          const selected = isSelected(date);

          return (
            <TouchableOpacity
              key={index}
              onPress={() => !disabled && onSelect(date)}
              disabled={disabled}
              activeOpacity={0.75}
              style={[
                styles.dateChip,
                selected  && styles.dateChipSelected,
                disabled  && styles.dateChipDisabled,
              ]}
            >
              {/* Day name */}
              <Text style={[
                styles.dateChipDay,
                selected && styles.dateChipTextSelected,
                disabled && styles.dateChipTextDisabled,
              ]}>
                {date.toLocaleDateString('en-IN', { weekday: 'short' })}
              </Text>

              {/* Date number */}
              <Text style={[
                styles.dateChipNumber,
                selected && styles.dateChipTextSelected,
                disabled && styles.dateChipTextDisabled,
              ]}>
                {date.getDate()}
              </Text>

              {/* Month */}
              <Text style={[
                styles.dateChipMonth,
                selected && styles.dateChipTextSelected,
                disabled && styles.dateChipTextDisabled,
              ]}>
                {date.toLocaleDateString('en-IN', { month: 'short' })}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

// ── Guest selector ────────────────────────────────────────────────────────────

interface GuestSelectorProps {
  guests:      number;
  onIncrement: () => void;
  onDecrement: () => void;
}
const GuestSelector: React.FC<GuestSelectorProps> = ({
  guests,
  onIncrement,
  onDecrement,
}) => (
  <View style={styles.guestSelector}>
    <View style={styles.guestInfo}>
      <Text style={styles.guestIcon}>👤</Text>
      <View>
        <Text style={styles.guestLabel}>Guests</Text>
        <Text style={styles.guestSubLabel}>Maximum {MAX_GUESTS} guests</Text>
      </View>
    </View>

    <View style={styles.guestControls}>
      <TouchableOpacity
        onPress={onDecrement}
        disabled={guests <= MIN_GUESTS}
        style={[
          styles.guestBtn,
          guests <= MIN_GUESTS && styles.guestBtnDisabled,
        ]}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.guestBtnText,
          guests <= MIN_GUESTS && styles.guestBtnTextDisabled,
        ]}>
          −
        </Text>
      </TouchableOpacity>

      <Text style={styles.guestCount}>{guests}</Text>

      <TouchableOpacity
        onPress={onIncrement}
        disabled={guests >= MAX_GUESTS}
        style={[
          styles.guestBtn,
          guests >= MAX_GUESTS && styles.guestBtnDisabled,
        ]}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.guestBtnText,
          guests >= MAX_GUESTS && styles.guestBtnTextDisabled,
        ]}>
          +
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

// ── Price breakdown ───────────────────────────────────────────────────────────

interface PriceBreakdownProps {
  pricePerNight: number;
  nights:        number;
  guests:        number;
}
const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  pricePerNight,
  nights,
  guests,
}) => {
  const subtotal  = pricePerNight * nights;
  const tax       = Math.round(subtotal * 0.18);
  const total     = subtotal + tax;
  const hasNights = nights > 0;

  return (
    <View style={styles.priceBox}>

      {/* Row: per night × nights */}
      <View style={styles.priceRow}>
        <Text style={styles.priceRowLabel}>
          {formatPrice(pricePerNight)} × {hasNights ? nights : '—'}{' '}
          {nights === 1 ? 'night' : 'nights'}
        </Text>
        <Text style={styles.priceRowValue}>
          {hasNights ? formatPrice(subtotal) : '—'}
        </Text>
      </View>

      {/* Row: guests */}
      <View style={styles.priceRow}>
        <Text style={styles.priceRowLabel}>
          {guests} {guests === 1 ? 'guest' : 'guests'}
        </Text>
        <Text style={styles.priceRowValue}>—</Text>
      </View>

      {/* Row: taxes */}
      <View style={styles.priceRow}>
        <Text style={styles.priceRowLabel}>Taxes & fees (18%)</Text>
        <Text style={styles.priceRowValue}>
          {hasNights ? formatPrice(tax) : '—'}
        </Text>
      </View>

      {/* Divider */}
      <View style={styles.priceDivider} />

      {/* Total */}
      <View style={styles.priceRow}>
        <Text style={styles.priceTotalLabel}>Total</Text>
        <Text style={styles.priceTotalValue}>
          {hasNights ? formatPrice(total) : 'Select dates'}
        </Text>
      </View>

    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// BookingScreen
// ─────────────────────────────────────────────────────────────────────────────

export const BookingScreen: React.FC<Props> = ({ route, navigation }) => {
  const { hotel }                        = route.params;
  const { setBookingDetails, clearBooking } = useBooking();

  // ── Local state ───────────────────────────────────────────────────────────
  // Keep local until "Confirm" — avoids polluting context mid-selection

  const [checkIn,  setCheckIn]  = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests,   setGuests]   = useState(1);

  // ── Available dates ───────────────────────────────────────────────────────
  // Check-in: today + 30 days
  // Check-out: day after checkIn + 20 days (or today+1 if no checkIn)

  const checkInDates = useMemo(
    () => generateDates(TODAY, 30),
    [],
  );

  const checkOutDates = useMemo(
    () => generateDates(
      checkIn
        ? new Date(checkIn.getTime() + 86400000) // day after checkIn
        : new Date(TODAY.getTime() + 86400000),
      20,
    ),
    [checkIn],
  );

  // ── Derived ───────────────────────────────────────────────────────────────

  const nights       = calcNights(checkIn, checkOut);
  const isReadyToBook = checkIn !== null && checkOut !== null && nights > 0;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCheckInSelect = useCallback((date: Date) => {
    setCheckIn(date);
    // Clear checkOut if it's now before or equal to new checkIn
    if (checkOut && checkOut <= date) {
      setCheckOut(null);
    }
  }, [checkOut]);

  const handleCheckOutSelect = useCallback((date: Date) => {
    setCheckOut(date);
  }, []);

  const handleGuestIncrement = useCallback(() => {
    setGuests(prev => Math.min(prev + 1, MAX_GUESTS));
  }, []);

  const handleGuestDecrement = useCallback(() => {
    setGuests(prev => Math.max(prev - 1, MIN_GUESTS));
  }, []);

const handleConfirm = useCallback(() => {
    if (!isReadyToBook || !checkIn || !checkOut) return;

    const subtotal  = hotel.price * nights;
    const tax       = Math.round(subtotal * 0.18);
    const total     = subtotal + tax;

    // Commit to BookingContext
    setBookingDetails({
      selectedHotel: hotel,
      checkInDate:   checkIn,
      checkOutDate:  checkOut,
      guests: {
        adults:   guests,
        children: 0,
      },
    });

    // Build confirmation snapshot
    const confirmationDetails: BookingConfirmationParams = {
      hotelName:     hotel.name,
      hotelLocation: hotel.location,
      checkInDate:   checkIn.toISOString(),   // Date → string for nav params
      checkOutDate:  checkOut.toISOString(),
      guests,
      nights,
      pricePerNight: hotel.price,
      totalPrice:    total,
      bookingId:     `BK${Date.now()}`,       // fake ID — replace with API response
    };

    navigation.navigate('BookingConfirmation', { details: confirmationDetails });

  }, [
    isReadyToBook,
    checkIn,
    checkOut,
    guests,
    nights,
    hotel,
    setBookingDetails,
    navigation,
  ]);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Fixed header ── */}
      <ScreenHeader onBack={() => navigation.goBack()} />

      {/* ── Scrollable form ── */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >

        {/* Hotel summary */}
        <HotelSummaryCard
          name={hotel.name}
          location={hotel.location}
          price={hotel.price}
        />

        {/* Check-in */}
        <Section title="Check-in Date">
          <DatePicker
            label="Check-in"
            selectedDate={checkIn}
            availableDates={checkInDates}
            onSelect={handleCheckInSelect}
          />
        </Section>

        {/* Check-out */}
        <Section title="Check-out Date">
          <DatePicker
            label="Check-out"
            selectedDate={checkOut}
            availableDates={checkOutDates}
            onSelect={handleCheckOutSelect}
            disabledBefore={checkIn}  // can't pick before checkIn
          />
        </Section>

        {/* Guests */}
        <Section title="Guests">
          <GuestSelector
            guests={guests}
            onIncrement={handleGuestIncrement}
            onDecrement={handleGuestDecrement}
          />
        </Section>

        {/* Price */}
        <Section title="Price Summary">
          <PriceBreakdown
            pricePerNight={hotel.price}
            nights={nights}
            guests={guests}
          />
        </Section>

        {/* Bottom padding — clears sticky footer */}
        <View style={styles.footerSpacer} />

      </ScrollView>

      {/* ── Sticky confirm footer ── */}
      <View style={styles.footer}>
        {/* Live total */}
        <View style={styles.footerPriceBlock}>
          <Text style={styles.footerPriceLabel}>Total</Text>
          <Text style={styles.footerTotalValue}>
            {isReadyToBook
              ? formatPrice(
                  hotel.price * nights +
                  Math.round(hotel.price * nights * 0.18),
                )
              : 'Select dates'
            }
          </Text>
        </View>

        {/* Confirm button */}
        <TouchableOpacity
          style={[
            styles.confirmBtn,
            !isReadyToBook && styles.confirmBtnDisabled,
          ]}
          onPress={handleConfirm}
          disabled={!isReadyToBook}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmBtnText}>Confirm Booking</Text>
        </TouchableOpacity>
      </View>

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
    width:          36,
    height:         36,
    borderRadius:   18,
    backgroundColor: '#F8F9FA',
    alignItems:     'center',
    justifyContent: 'center',
  },
  backBtnIcon: {
    fontSize:   18,
    color:      '#212529',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize:   17,
    fontWeight: '700',
    color:      '#212529',
  },
  headerRight: {
    width: 36,   // balances back button — keeps title centered
  },

  // ── Scroll ─────────────────────────────────────────────────────────────────
  scroll:        { flex: 1 },
  scrollContent: { padding: 16, gap: 16 },
  footerSpacer:  { height: 100 },

  // ── Hotel summary card ─────────────────────────────────────────────────────
  hotelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius:    14,
    padding:         16,
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     '#E9ECEF',
  },
  hotelCardLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    flex:          1,
    gap:           12,
  },
  hotelAvatar: {
    width:           46,
    height:          46,
    borderRadius:    12,
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
  hotelCardInfo: {
    flex: 1,
    gap:   3,
  },
  hotelCardName: {
    fontSize:   15,
    fontWeight: '700',
    color:      '#212529',
  },
  hotelCardLocation: {
    fontSize: 12,
    color:    '#6C757D',
  },
  hotelCardPriceBlock: {
    alignItems:  'flex-end',
    marginLeft:  12,
    flexShrink:  0,
  },
  hotelCardPrice: {
    fontSize:   16,
    fontWeight: '800',
    color:      '#F09030',
  },
  hotelCardPriceLabel: {
    fontSize: 11,
    color:    '#ADB5BD',
    marginTop: 1,
  },

  // ── Section ────────────────────────────────────────────────────────────────
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius:    14,
    padding:         16,
    gap:             12,
    borderWidth:     1,
    borderColor:     '#E9ECEF',
  },
  sectionTitle: {
    fontSize:   14,
    fontWeight: '700',
    color:      '#212529',
    letterSpacing: 0.1,
  },

  // ── Date picker ────────────────────────────────────────────────────────────
  datePickerWrapper: {
    gap: 10,
  },
  dateSelectedDisplay: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               8,
    backgroundColor:   '#F8F9FA',
    borderRadius:      10,
    paddingHorizontal: 14,
    paddingVertical:   10,
    borderWidth:       1,
    borderColor:       '#E9ECEF',
  },
  dateSelectedIcon: {
    fontSize: 16,
  },
  dateSelectedText: {
    fontSize:   14,
    fontWeight: '600',
    color:      '#212529',
  },
  dateSelectedPlaceholder: {
    color:      '#ADB5BD',
    fontWeight: '400',
  },
  dateScroll: {
    gap:            8,
    paddingVertical: 4,
  },
  dateChip: {
    alignItems:        'center',
    justifyContent:    'center',
    paddingHorizontal: 14,
    paddingVertical:   10,
    borderRadius:      12,
    backgroundColor:   '#F8F9FA',
    borderWidth:       1.5,
    borderColor:       '#E9ECEF',
    minWidth:          62,
    gap:               2,
  },
  dateChipSelected: {
    backgroundColor: '#F09030',
    borderColor:     '#F09030',
  },
  dateChipDisabled: {
    backgroundColor: '#F8F9FA',
    borderColor:     '#F1F3F5',
    opacity:         0.45,
  },
  dateChipDay: {
    fontSize:   10,
    fontWeight: '500',
    color:      '#6C757D',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  dateChipNumber: {
    fontSize:   18,
    fontWeight: '700',
    color:      '#212529',
    lineHeight: 22,
  },
  dateChipMonth: {
    fontSize:   10,
    color:      '#6C757D',
    fontWeight: '500',
  },
  dateChipTextSelected: {
    color: '#FFFFFF',
  },
  dateChipTextDisabled: {
    color: '#ADB5BD',
  },

  // ── Guest selector ─────────────────────────────────────────────────────────
  guestSelector: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius:   12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth:    1,
    borderColor:    '#E9ECEF',
  },
  guestInfo: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
  },
  guestIcon: {
    fontSize: 20,
  },
  guestLabel: {
    fontSize:   14,
    fontWeight: '600',
    color:      '#212529',
  },
  guestSubLabel: {
    fontSize: 11,
    color:    '#ADB5BD',
    marginTop: 1,
  },
  guestControls: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           16,
  },
  guestBtn: {
    width:           36,
    height:          36,
    borderRadius:    18,
    backgroundColor: '#FFFFFF',
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1.5,
    borderColor:     '#F09030',
  },
  guestBtnDisabled: {
    borderColor:     '#DEE2E6',
    backgroundColor: '#F8F9FA',
  },
  guestBtnText: {
    fontSize:   20,
    color:      '#F09030',
    fontWeight: '600',
    lineHeight: 24,
  },
  guestBtnTextDisabled: {
    color: '#ADB5BD',
  },
  guestCount: {
    fontSize:   20,
    fontWeight: '700',
    color:      '#212529',
    minWidth:   24,
    textAlign:  'center',
  },

  // ── Price breakdown ────────────────────────────────────────────────────────
  priceBox: {
    gap: 10,
  },
  priceRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  priceRowLabel: {
    fontSize: 14,
    color:    '#6C757D',
  },
  priceRowValue: {
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
    fontSize:   16,
    fontWeight: '800',
    color:      '#F09030',
  },

  // ── Footer ─────────────────────────────────────────────────────────────────
  footer: {
    position:          'absolute',
    bottom:            0,
    left:              0,
    right:             0,
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 20,
    paddingTop:        14,
    paddingBottom:     Platform.OS === 'ios' ? 28 : 16,
    backgroundColor:   '#FFFFFF',
    borderTopWidth:    1,
    borderTopColor:    '#E9ECEF',
    ...Platform.select({
      ios: {
        shadowColor:   '#000',
        shadowOffset:  { width: 0, height: -3 },
        shadowOpacity: 0.06,
        shadowRadius:  8,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  footerPriceBlock: {
    gap: 2,
  },
  footerPriceLabel: {
    fontSize: 12,
    color:    '#6C757D',
  },
  footerTotalValue: {
    fontSize:   20,
    fontWeight: '800',
    color:      '#F09030',
  },
  confirmBtn: {
    backgroundColor:   '#F09030',
    paddingHorizontal: 28,
    paddingVertical:   14,
    borderRadius:      12,
  },
  confirmBtnDisabled: {
    backgroundColor: '#DEE2E6',
  },
  confirmBtnText: {
    color:      '#FFFFFF',
    fontWeight: '700',
    fontSize:   15,
  },
});