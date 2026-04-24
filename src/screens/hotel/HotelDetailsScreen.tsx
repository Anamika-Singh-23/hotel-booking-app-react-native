// src/screens/hotel/HotelDetailsScreen.tsx

import React, { useState }              from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Dimensions,
}                                        from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps, NativeStackNavigationProp }        from '@react-navigation/native-stack';
import { AppStackParamList }             from '../../navigation/types';

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<AppStackParamList, 'HotelDetails'>;
type DetailNavProp = NativeStackNavigationProp<AppStackParamList, 'HotelDetails'>;
const navigation = useNavigation<DetailNavProp>();

// ── Constants ─────────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT             = 280;

const MOCK_DESCRIPTION =
  'Experience world-class hospitality with breathtaking views and ' +
  'exceptional service. Our hotel offers elegantly appointed rooms, ' +
  'fine dining, a rejuvenating spa, and state-of-the-art facilities — ' +
  'all designed to make your stay truly unforgettable.';

const MOCK_AMENITIES = [
  { icon: '🏊', label: 'Pool'      },
  { icon: '🍽️', label: 'Restaurant' },
  { icon: '🧖', label: 'Spa'       },
  { icon: '🅿️', label: 'Parking'   },
  { icon: '📶', label: 'Free WiFi' },
  { icon: '🏋️', label: 'Gym'       },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

// Back button — floats over the hero image
interface BackButtonProps {
  onPress: () => void;
}
const BackButton: React.FC<BackButtonProps> = ({ onPress }) => (
  <TouchableOpacity
    style={styles.backButton}
    onPress={onPress}
    activeOpacity={0.85}
    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
  >
    <Text style={styles.backButtonIcon}>←</Text>
  </TouchableOpacity>
);

// Hero image with placeholder fallback
interface HeroImageProps {
  imageUrl: string;
  hotelName: string;
}
const HeroImage: React.FC<HeroImageProps> = ({ imageUrl, hotelName }) => {
  const [hasError, setHasError] = useState(false);

  // Placeholder colors — same logic as HotelCard
  const colorIndex = hotelName.charCodeAt(0) % PLACEHOLDER_COLORS.length;
  const bgColor    = PLACEHOLDER_COLORS[colorIndex];

  const initials = hotelName
    .split(' ')
    .filter(w => w.length > 0)
    .map(w => w[0].toUpperCase())
    .slice(0, 2)
    .join('');

  if (!imageUrl || hasError) {
    return (
      <View style={[styles.heroPlaceholder, { backgroundColor: bgColor }]}>
        <Text style={styles.heroPlaceholderInitials}>{initials}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: imageUrl }}
      style={styles.heroImage}
      resizeMode="cover"
      onError={() => setHasError(true)}
    />
  );
};

// Single amenity pill
interface AmenityPillProps {
  icon:  string;
  label: string;
}
const AmenityPill: React.FC<AmenityPillProps> = ({ icon, label }) => (
  <View style={styles.amenityPill}>
    <Text style={styles.amenityIcon}>{icon}</Text>
    <Text style={styles.amenityLabel}>{label}</Text>
  </View>
);

// Rating display — star row
interface RatingRowProps {
  rating: number;
}
const RatingRow: React.FC<RatingRowProps> = ({ rating }) => {
  // Fill stars based on rating (out of 5)
  const fullStars  = Math.floor(rating);
  const hasHalf    = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <View style={styles.ratingRow}>
      <View style={styles.starsRow}>
        {'★'.repeat(fullStars).split('').map((_, i) => (
          <Text key={`full-${i}`} style={styles.starFull}>★</Text>
        ))}
        {hasHalf && <Text style={styles.starHalf}>★</Text>}
        {'☆'.repeat(emptyStars).split('').map((_, i) => (
          <Text key={`empty-${i}`} style={styles.starEmpty}>☆</Text>
        ))}
      </View>
      <Text style={styles.ratingNumber}>{rating.toFixed(1)}</Text>
      <Text style={styles.ratingCount}>(128 reviews)</Text>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// HotelDetailsScreen
// ─────────────────────────────────────────────────────────────────────────────

export const HotelDetailsScreen: React.FC<Props> = ({ route }) => {
  // ── Hotel data from navigation params ─────────────────────────────────────
  // Full hotel object — no API call needed
  const { hotel } = route.params;

  const navigation = useNavigation<DetailNavProp>();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleBook = () => {
    navigation.navigate('Booking', { hotel });
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Scrollable content ── */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces
      >

        {/* ── Hero image area ── */}
        <View style={styles.heroContainer}>
          <HeroImage imageUrl={hotel.image} hotelName={hotel.name} />

          {/* Dark gradient overlay — makes back button + text readable */}
          <View style={styles.heroOverlay} />

          {/* Back button floats over image */}
          <View style={styles.heroTopRow}>
            <BackButton onPress={handleBack} />
          </View>

          {/* Hotel name + location on image — bottom left */}
          <View style={styles.heroBottomContent}>
            <Text style={styles.heroHotelName} numberOfLines={2}>
              {hotel.name}
            </Text>
            <View style={styles.heroLocationRow}>
              <Text style={styles.heroLocationIcon}>📍</Text>
              <Text style={styles.heroLocationText}>{hotel.location}</Text>
            </View>
          </View>
        </View>

        {/* ── Content card — sits below hero ── */}
        <View style={styles.contentCard}>

          {/* Rating */}
          <RatingRow rating={hotel.rating} />

          <View style={styles.sectionDivider} />

          {/* About section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.descriptionText}>{MOCK_DESCRIPTION}</Text>
          </View>

          <View style={styles.sectionDivider} />

          {/* Amenities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {MOCK_AMENITIES.map((amenity) => (
                <AmenityPill
                  key={amenity.label}
                  icon={amenity.icon}
                  label={amenity.label}
                />
              ))}
            </View>
          </View>

          <View style={styles.sectionDivider} />

          {/* Price breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Details</Text>
            <View style={styles.priceBreakdown}>

              <View style={styles.priceRow}>
                <Text style={styles.priceRowLabel}>Per night</Text>
                <Text style={styles.priceRowValue}>
                  ₹{hotel.price.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.priceRowLabel}>Taxes & fees (18%)</Text>
                <Text style={styles.priceRowValue}>
                  ₹{Math.round(hotel.price * 0.18).toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.totalDivider} />

              <View style={styles.priceRow}>
                <Text style={styles.totalLabel}>Total per night</Text>
                <Text style={styles.totalValue}>
                  ₹{Math.round(hotel.price * 1.18).toLocaleString('en-IN')}
                </Text>
              </View>

            </View>
          </View>

          {/* Bottom padding so content clears the sticky footer */}
          <View style={styles.footerSpacer} />

        </View>
      </ScrollView>

      {/* ── Sticky booking footer ── */}
      <View style={styles.bookingFooter}>
        <View style={styles.footerPriceBlock}>
          <Text style={styles.footerPriceLabel}>Per night</Text>
          <Text style={styles.footerPrice}>
            ₹{hotel.price.toLocaleString('en-IN')}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBook}
          activeOpacity={0.85}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const PLACEHOLDER_COLORS = [
  '#1A2340', '#0F6E56', '#7F77DD', '#D85A30',
  '#BA7517', '#185FA5', '#639922', '#993556',
];

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  screen: {
    flex:            1,
    backgroundColor: '#F8F9FA',
  },
  scroll: {
    flex: 1,
  },

  // ── Hero ───────────────────────────────────────────────────────────────────
  heroContainer: {
    width:    SCREEN_WIDTH,
    height:   IMAGE_HEIGHT,
    position: 'relative',
  },
  heroImage: {
    width:  '100%',
    height: '100%',
  },
  heroPlaceholder: {
    width:          '100%',
    height:         '100%',
    alignItems:     'center',
    justifyContent: 'center',
  },
  heroPlaceholderInitials: {
    fontSize:   56,
    fontWeight: '800',
    color:      'rgba(255,255,255,0.85)',
    letterSpacing: 3,
  },
  // Dark overlay — bottom to top gradient effect using opacity
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  heroTopRow: {
    position:          'absolute',
    top:               Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 8 : 52,
    left:              0,
    right:             0,
    paddingHorizontal: 16,
  },
  heroBottomContent: {
    position:          'absolute',
    bottom:            20,
    left:              16,
    right:             16,
    gap:               6,
  },
  heroHotelName: {
    fontSize:   24,
    fontWeight: '800',
    color:      '#FFFFFF',
    letterSpacing: -0.3,
  },
  heroLocationRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
  },
  heroLocationIcon: {
    fontSize: 13,
  },
  heroLocationText: {
    fontSize: 14,
    color:    'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },

  // ── Back button ────────────────────────────────────────────────────────────
  backButton: {
    width:           40,
    height:          40,
    borderRadius:    20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  backButtonIcon: {
    fontSize:   20,
    color:      '#FFFFFF',
    fontWeight: '600',
    lineHeight: 24,
  },

  // ── Content card ───────────────────────────────────────────────────────────
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius:  20,
    borderTopRightRadius: 20,
    marginTop:            -20,   // overlaps hero slightly — smooth join
    paddingTop:           8,
    minHeight:            500,   // ensures card fills screen even with little content
  },

  // ── Sections ───────────────────────────────────────────────────────────────
  section: {
    paddingHorizontal: 20,
    paddingVertical:   16,
    gap:               10,
  },
  sectionTitle: {
    fontSize:   15,
    fontWeight: '700',
    color:      '#212529',
    letterSpacing: 0.1,
  },
  sectionDivider: {
    height:          1,
    backgroundColor: '#F1F3F5',
    marginHorizontal: 20,
  },

  // ── Rating ─────────────────────────────────────────────────────────────────
  ratingRow: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               8,
    paddingHorizontal: 20,
    paddingVertical:   16,
  },
  starsRow: {
    flexDirection: 'row',
    gap:           2,
  },
  starFull: {
    fontSize: 16,
    color:    '#F09030',
  },
  starHalf: {
    fontSize: 16,
    color:    '#F09030',
    opacity:  0.6,
  },
  starEmpty: {
    fontSize: 16,
    color:    '#DEE2E6',
  },
  ratingNumber: {
    fontSize:   15,
    fontWeight: '700',
    color:      '#212529',
  },
  ratingCount: {
    fontSize: 13,
    color:    '#6C757D',
  },

  // ── Description ────────────────────────────────────────────────────────────
  descriptionText: {
    fontSize:   14,
    color:      '#495057',
    lineHeight: 22,
  },

  // ── Amenities ──────────────────────────────────────────────────────────────
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           10,
  },
  amenityPill: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               6,
    backgroundColor:   '#F8F9FA',
    borderRadius:      20,
    paddingHorizontal: 12,
    paddingVertical:   8,
    borderWidth:       1,
    borderColor:       '#E9ECEF',
  },
  amenityIcon: {
    fontSize: 14,
  },
  amenityLabel: {
    fontSize:   13,
    color:      '#495057',
    fontWeight: '500',
  },

  // ── Price breakdown ────────────────────────────────────────────────────────
  priceBreakdown: {
    backgroundColor: '#F8F9FA',
    borderRadius:    12,
    padding:         16,
    gap:             10,
    borderWidth:     1,
    borderColor:     '#E9ECEF',
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
  totalDivider: {
    height:          1,
    backgroundColor: '#DEE2E6',
    marginVertical:  4,
  },
  totalLabel: {
    fontSize:   15,
    fontWeight: '700',
    color:      '#212529',
  },
  totalValue: {
    fontSize:   16,
    fontWeight: '800',
    color:      '#F09030',
  },

  // ── Booking footer ─────────────────────────────────────────────────────────
  footerSpacer: {
    height: 100,  // clears sticky footer height
  },
  bookingFooter: {
    position:          'absolute',
    bottom:            0,
    left:              0,
    right:             0,
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 20,
    paddingVertical:   16,
    backgroundColor:   '#FFFFFF',
    borderTopWidth:    1,
    borderTopColor:    '#E9ECEF',
    paddingBottom:     Platform.OS === 'ios' ? 28 : 16,  // safe area for home bar

    // Shadow above footer
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
  footerPrice: {
    fontSize:   22,
    fontWeight: '800',
    color:      '#F09030',
  },
  bookButton: {
    backgroundColor:   '#F09030',
    paddingHorizontal: 36,
    paddingVertical:   14,
    borderRadius:      12,
  },
  bookButtonText: {
    color:      '#FFFFFF',
    fontWeight: '700',
    fontSize:   16,
  },
});