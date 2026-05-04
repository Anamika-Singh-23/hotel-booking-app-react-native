// src/screens/booking/PaymentSuccessScreen.tsx
// FULL REPLACE

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
import { AppStackParamList,
         PaymentMethodType }              from '../../navigation/types';
import { useBooking }                     from '../../context/BookingContext';
import { SectionCard }                    from '../../components/ui/SectionCard';
import { InfoRow }                        from '../../components/ui/InfoRow';
import { StickyFooter }                   from '../../components/ui/StickyFooter';

type Props = NativeStackScreenProps<AppStackParamList, 'PaymentSuccess'>;

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (date: Date | null): string => {
  if (!date) return '—';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
};

const formatPrice = (amount: number): string =>
  `₹${amount.toLocaleString('en-IN')}`;

const generateBookingId = (): string =>
  `BK-${Date.now().toString().slice(-8)}`;

// ── Payment method display config ─────────────────────────────────────────────
// Yahan se correct label aur icon aata hai

const PAYMENT_METHOD_CONFIG: Record<
  PaymentMethodType,
  { label: string; icon: string }
> = {
  upi:  { label: 'UPI', icon: '⚡' },
  card: { label: 'Credit / Debit Card', icon: '💳' },
  cash: { label: 'Pay on Arrival', icon: '🏨' },
};

// ── AnimatedCheckmark ─────────────────────────────────────────────────────────

const AnimatedCheckmark: React.FC = () => {
  const scaleAnim   = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(100),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1, tension: 55, friction: 6, useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1, duration: 250, useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View style={{
      transform: [{ scale: scaleAnim }],
      opacity:   opacityAnim,
    }}>
      <View style={styles.checkOuter}>
        <View style={styles.checkInner}>
          <Text style={styles.checkText}>✓</Text>
        </View>
      </View>
    </Animated.View>
  );
};

// ── What's Next ───────────────────────────────────────────────────────────────

const NEXT_STEPS = [
  { icon: '📧', text: 'Confirmation email sent to your registered address' },
  { icon: '🪪', text: 'Carry a valid photo ID for check-in' },
  { icon: '🕐', text: 'Check-in starts at 2:00 PM' },
  { icon: '📞', text: 'Hotel contact shared 24hrs before arrival' },
];

// ── PaymentSuccessScreen ──────────────────────────────────────────────────────

export const PaymentSuccessScreen: React.FC<Props> = ({
  route,
  navigation,
}) => {
  // ← Route se paymentMethod lo
  const { paymentMethod } = route.params;

  const { booking, computed, clearBooking } = useBooking();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bookingId = useRef(generateBookingId()).current;

  const { selectedHotel, checkInDate, checkOutDate, guests } = booking;
  const { totalNights, totalPrice } = computed;
  const totalGuests = guests.adults + guests.children;

  // Payment method config — dynamic based on param
  const methodConfig = PAYMENT_METHOD_CONFIG[paymentMethod];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 500, delay: 300, useNativeDriver: true,
    }).start();
  }, []);

  const handleGoHome = () => {
    clearBooking();
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

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
        <View style={styles.hero}>
          <AnimatedCheckmark />

          <Animated.View style={[styles.heroText, { opacity: fadeAnim }]}>
            <Text style={styles.successTitle}>Payment Successful!</Text>
            <Text style={styles.successSubtitle}>
              Your booking is confirmed.{'\n'}Have a wonderful stay! 🏨
            </Text>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.bookingIdPill}>
              <Text style={styles.bookingIdLabel}>Booking ID  </Text>
              <Text style={styles.bookingIdValue}>{bookingId}</Text>
            </View>
          </Animated.View>
        </View>

        {/* ── Booking summary ── */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <SectionCard title="Booking Summary">
            <InfoRow icon="🏨" label="Hotel"     value={selectedHotel?.name     ?? '—'} />
            <InfoRow icon="📍" label="Location"  value={selectedHotel?.location ?? '—'} />
            <InfoRow icon="📅" label="Check-in"  value={formatDate(checkInDate)}        />
            <InfoRow icon="📅" label="Check-out" value={formatDate(checkOutDate)}        />
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
        </Animated.View>

        {/* ── Payment details ── */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <SectionCard title="Payment Details">

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Amount Paid</Text>
              <Text style={styles.paymentPaid}>{formatPrice(totalPrice)}</Text>
            </View>

            {/* ← Dynamic payment method — route param se */}
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Payment Method</Text>
              <View style={styles.methodChip}>
                <Text style={styles.methodChipText}>
                  {methodConfig.icon}  {methodConfig.label}
                </Text>
              </View>
            </View>

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Payment Status</Text>
              <View style={styles.statusChip}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Success</Text>
              </View>
            </View>

          </SectionCard>
        </Animated.View>

        {/* ── What's next ── */}
        <Animated.View style={{ opacity: fadeAnim }}>
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
        </Animated.View>

        <View style={styles.spacer} />
      </ScrollView>

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

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8F9FA' },
  scroll: { flex: 1 },
  scrollContent: {
    padding:    16,
    gap:        14,
    paddingTop: Platform.OS === 'android' ? 32 : 56,
  },
  spacer: { height: 100 },

  // Hero
  hero: { alignItems: 'center', gap: 16, paddingBottom: 8 },
  checkOuter: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#BBF7D0',
  },
  checkInner: {
    width: 78, height: 78, borderRadius: 39,
    backgroundColor: '#059669', alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios:     { shadowColor: '#059669', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10 },
      android: { elevation: 6 },
    }),
  },
  checkText: { fontSize: 38, color: '#FFFFFF', fontWeight: '700', lineHeight: 44 },
  heroText:  { alignItems: 'center', gap: 6 },
  successTitle: {
    fontSize: 26, fontWeight: '800', color: '#212529',
    textAlign: 'center', letterSpacing: -0.4,
  },
  successSubtitle: {
    fontSize: 15, color: '#6C757D', textAlign: 'center', lineHeight: 22,
  },
  bookingIdPill: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#EFF6FF', borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, borderColor: '#BFDBFE',
  },
  bookingIdLabel: {
    fontSize: 12, fontWeight: '600', color: '#3B82F6',
    textTransform: 'uppercase', letterSpacing: 0.4,
  },
  bookingIdValue: {
    fontSize: 13, fontWeight: '800', color: '#1D4ED8', letterSpacing: 0.5,
  },

  // Payment rows
  paymentRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#F1F3F5',
  },
  paymentLabel: { fontSize: 14, color: '#6C757D' },
  paymentPaid:  { fontSize: 18, fontWeight: '800', color: '#059669' },
  methodChip: {
    backgroundColor: '#F8F9FA', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: '#E9ECEF',
  },
  methodChipText: { fontSize: 13, color: '#495057', fontWeight: '500' },
  statusChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F0FDF4', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  statusDot: {
    width: 7, height: 7, borderRadius: 4, backgroundColor: '#059669',
  },
  statusText: { fontSize: 13, fontWeight: '600', color: '#059669' },

  // What's next
  nextStep: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: 10, paddingVertical: 10,
  },
  nextStepBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F3F5' },
  nextStepIcon:   { fontSize: 16, marginTop: 1 },
  nextStepText:   { fontSize: 14, color: '#495057', lineHeight: 20, flex: 1 },
});