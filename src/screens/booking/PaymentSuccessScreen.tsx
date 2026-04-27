// src/screens/booking/PaymentSuccessScreen.tsx

import React, { useEffect, useRef }      from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  Animated,
  StatusBar,
}                                         from 'react-native';
import { NativeStackScreenProps }         from '@react-navigation/native-stack';
import { AppStackParamList }              from '../../navigation/types';
import { useBooking }                     from '../../context/BookingContext';
import { SectionCard }                    from '../../components/ui/SectionCard';
import { InfoRow }                        from '../../components/ui/InfoRow';
import { StickyFooter }                   from '../../components/ui/StickyFooter';

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<AppStackParamList, 'PaymentSuccess'>;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const formatDate = (date: Date | null): string => {
  if (!date) return '—';
  return date.toLocaleDateString('en-IN', {
    day:   '2-digit',
    month: 'long',
    year:  'numeric',
  });
};

const formatPrice = (amount: number): string =>
  `₹${amount.toLocaleString('en-IN')}`;

const generateBookingId = (): string =>
  `BK${Date.now().toString().slice(-8)}`;

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

// ── Animated checkmark ────────────────────────────────────────────────────────

const AnimatedCheckmark: React.FC = () => {
  const scaleAnim   = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Brief pause — lets screen render first
      Animated.delay(100),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue:         1,
          tension:         55,
          friction:        6,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue:         1,
          duration:        250,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View style={{
      transform: [{ scale: scaleAnim }],
      opacity:   opacityAnim,
    }}>
      <View style={styles.checkmarkOuter}>
        <View style={styles.checkmarkInner}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      </View>
    </Animated.View>
  );
};

// ── Booking reference chip ────────────────────────────────────────────────────

interface BookingRefProps {
  bookingId: string;
}
const BookingRef: React.FC<BookingRefProps> = ({ bookingId }) => (
  <View style={styles.bookingRef}>
    <Text style={styles.bookingRefLabel}>Booking Reference</Text>
    <Text style={styles.bookingRefId}>{bookingId}</Text>
  </View>
);

// ── What's next checklist ─────────────────────────────────────────────────────

const NEXT_STEPS = [
  { icon: '📧', text: 'Confirmation email sent to your registered address' },
  { icon: '🪪', text: 'Carry a valid photo ID for check-in' },
  { icon: '🕐', text: 'Check-in starts at 2:00 PM' },
  { icon: '📞', text: 'Hotel contact will be shared 24hrs before arrival' },
];

const WhatsNext: React.FC = () => (
  <SectionCard title="What's Next">
    {NEXT_STEPS.map((step, index) => (
      <View
        key={index}
        style={[
          styles.nextStep,
          index < NEXT_STEPS.length - 1 && styles.nextStepBorder,
        ]}
      >
        <Text style={styles.nextStepIcon}>{step.icon}</Text>
        <Text style={styles.nextStepText}>{step.text}</Text>
      </View>
    ))}
  </SectionCard>
);

// ─────────────────────────────────────────────────────────────────────────────
// PaymentSuccessScreen
// ─────────────────────────────────────────────────────────────────────────────

export const PaymentSuccessScreen: React.FC<Props> = ({ navigation }) => {
  const { booking, computed, clearBooking } = useBooking();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Stable booking ID for this session
  const bookingId = useRef(generateBookingId()).current;

  const { selectedHotel, checkInDate, checkOutDate, guests } = booking;
  const { totalNights, totalPrice }                          = computed;

  const tax   = Math.round(totalPrice * 0.18 / 1.18);   // extract from total
  const paid  = totalPrice;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue:         1,
      duration:        500,
      delay:           300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleGoHome = () => {
    clearBooking();
    navigation.reset({
      index:  0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >

        {/* ── Success hero ── */}
        <View style={styles.successHero}>
          <AnimatedCheckmark />

          <Animated.View style={[styles.heroTextBlock, { opacity: fadeAnim }]}>
            <Text style={styles.successTitle}>Payment Successful!</Text>
            <Text style={styles.successSubtitle}>
              Your booking is confirmed.{'\n'}
              Have a wonderful stay! 🏨
            </Text>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim }}>
            <BookingRef bookingId={bookingId} />
          </Animated.View>
        </View>

        {/* ── Booking summary card ── */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <SectionCard title="Booking Summary">
            <InfoRow
              icon="🏨"
              label="Hotel"
              value={selectedHotel?.name ?? '—'}
            />
            <InfoRow
              icon="📍"
              label="Location"
              value={selectedHotel?.location ?? '—'}
            />
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
              value={`${guests.adults} ${guests.adults === 1 ? 'guest' : 'guests'}`}
              isLast
            />
          </SectionCard>
        </Animated.View>

        {/* ── Payment card ── */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <SectionCard title="Payment Details">

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Amount Paid</Text>
              <Text style={styles.paymentPaid}>{formatPrice(paid)}</Text>
            </View>

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Payment Method</Text>
              <View style={styles.paymentMethodChip}>
                <Text style={styles.paymentMethodText}>
                    💳  UPI / Card
                </Text>
              </View>
            </View>

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Payment Status</Text>
              <View style={styles.paymentStatusChip}>
                <View style={styles.paymentStatusDot} />
                <Text style={styles.paymentStatusText}>Success</Text>
              </View>
            </View>

          </SectionCard>
        </Animated.View>

        {/* ── What's next ── */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <WhatsNext />
        </Animated.View>

        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* ── Sticky footer ── */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <StickyFooter
          buttonLabel="Back to Home"
          onPress={handleGoHome}
          buttonColor="#1A2340"
        />
      </Animated.View>

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
  scroll:        { flex: 1 },
  scrollContent: {
    padding:    16,
    gap:        14,
    paddingTop: Platform.OS === 'android' ? 32 : 56,
  },
  footerSpacer: { height: 100 },

  // ── Success hero ────────────────────────────────────────────────────────────
  successHero: {
    alignItems:    'center',
    gap:           16,
    paddingBottom: 8,
  },
  checkmarkOuter: {
    width:           100,
    height:          100,
    borderRadius:    50,
    backgroundColor: '#F0FDF4',
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     3,
    borderColor:     '#BBF7D0',
  },
  checkmarkInner: {
    width:           78,
    height:          78,
    borderRadius:    39,
    backgroundColor: '#059669',
    alignItems:      'center',
    justifyContent:  'center',
    ...Platform.select({
      ios: {
        shadowColor:   '#059669',
        shadowOffset:  { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius:  10,
      },
      android: { elevation: 6 },
    }),
  },
  checkmarkText: {
    fontSize:   38,
    color:      '#FFFFFF',
    fontWeight: '700',
    lineHeight: 44,
  },
  heroTextBlock: {
    alignItems: 'center',
    gap:        6,
  },
  successTitle: {
    fontSize:      28,
    fontWeight:    '800',
    color:         '#212529',
    textAlign:     'center',
    letterSpacing: -0.4,
  },
  successSubtitle: {
    fontSize:   15,
    color:      '#6C757D',
    textAlign:  'center',
    lineHeight: 22,
  },

  // Booking reference
  bookingRef: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               12,
    backgroundColor:   '#EFF6FF',
    borderRadius:      12,
    paddingHorizontal: 16,
    paddingVertical:   10,
    borderWidth:       1,
    borderColor:       '#BFDBFE',
  },
  bookingRefLabel: {
    fontSize:   12,
    fontWeight: '600',
    color:      '#3B82F6',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  bookingRefId: {
    fontSize:   13,
    fontWeight: '800',
    color:      '#1D4ED8',
    letterSpacing: 0.8,
  },

  // ── Payment card rows ───────────────────────────────────────────────────────
  paymentRow: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  paymentLabel: {
    fontSize: 14,
    color:    '#6C757D',
  },
  paymentPaid: {
    fontSize:   18,
    fontWeight: '800',
    color:      '#059669',
  },
  paymentMethodChip: {
    backgroundColor:   '#F8F9FA',
    borderRadius:      8,
    paddingHorizontal: 10,
    paddingVertical:   5,
    borderWidth:       1,
    borderColor:       '#E9ECEF',
  },
  paymentMethodText: {
    fontSize:   13,
    color:      '#495057',
    fontWeight: '500',
  },
  paymentStatusChip: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               6,
    backgroundColor:   '#F0FDF4',
    borderRadius:      20,
    paddingHorizontal: 10,
    paddingVertical:   5,
    borderWidth:       1,
    borderColor:       '#BBF7D0',
  },
  paymentStatusDot: {
    width:           7,
    height:          7,
    borderRadius:    4,
    backgroundColor: '#059669',
  },
  paymentStatusText: {
    fontSize:   13,
    fontWeight: '600',
    color:      '#059669',
  },

  // ── What's next ─────────────────────────────────────────────────────────────
  nextStep: {
    flexDirection:   'row',
    alignItems:      'flex-start',
    gap:             10,
    paddingVertical: 10,
  },
  nextStepBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  nextStepIcon: {
    fontSize: 16,
    marginTop: 1,
  },
  nextStepText: {
    fontSize:   14,
    color:      '#495057',
    lineHeight: 20,
    flex:       1,
  },
});