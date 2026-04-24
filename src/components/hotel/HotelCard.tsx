// src/components/hotel/HotelCard.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ViewStyle,
} from 'react-native';
import { Hotel } from '../../types/hotel.types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface HotelCardProps {
  hotel:     Hotel;
  onPress?:  (hotel: Hotel) => void;  // optional — detail screen ke liye ready
  style?:    ViewStyle;               // optional override from parent
}

// ─────────────────────────────────────────────────────────────────────────────
// ImagePlaceholder
// Shown when: image URL is empty, null, or fails to load
// Displays hotel name initials on a colored background
// ─────────────────────────────────────────────────────────────────────────────

interface ImagePlaceholderProps {
  name: string;
}

const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({ name }) => {
  // Take first letter of each word, max 2 letters
  // "The Taj Palace" → "TP"
  // "Leela Ambience" → "LA"
  const initials = name
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word[0].toUpperCase())
    .slice(0, 2)
    .join('');

  // Pick a background color based on first char
  // Gives each hotel a consistent, unique color
  const colorIndex = name.charCodeAt(0) % PLACEHOLDER_COLORS.length;
  const bgColor    = PLACEHOLDER_COLORS[colorIndex];

  return (
    <View style={[styles.placeholderContainer, { backgroundColor: bgColor }]}>
      <Text style={styles.placeholderInitials}>{initials}</Text>
      <Text style={styles.placeholderLabel}>No Image</Text>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// HotelImage
// Handles three cases:
//   1. No URL         → ImagePlaceholder immediately
//   2. URL exists, loads successfully  → shows image
//   3. URL exists, fails to load → ImagePlaceholder on error
// ─────────────────────────────────────────────────────────────────────────────

interface HotelImageProps {
  imageUrl: string;
  hotelName: string;
}

const HotelImage: React.FC<HotelImageProps> = ({ imageUrl, hotelName }) => {
  const [hasError, setHasError] = useState(false);

  // Case 1 & 3: no URL or load failed → placeholder
  if (!imageUrl || hasError) {
    return <ImagePlaceholder name={hotelName} />;
  }

  // Case 2: valid URL → try loading
  return (
    <Image
      source={{ uri: imageUrl }}
      style={styles.image}
      resizeMode="cover"
      onError={() => setHasError(true)}  // triggers placeholder on fail
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// RatingBadge
// ─────────────────────────────────────────────────────────────────────────────

interface RatingBadgeProps {
  rating: number;
}

const RatingBadge: React.FC<RatingBadgeProps> = ({ rating }) => {
  // Color shifts based on rating value
  const badgeColor = rating >= 4.5
    ? '#059669'  // green  — excellent
    : rating >= 4.0
    ? '#D97706'  // amber  — very good
    : '#6C757D'; // gray   — average

  return (
    <View style={[styles.ratingBadge, { backgroundColor: badgeColor }]}>
      <Text style={styles.ratingBadgeStar}>★</Text>
      <Text style={styles.ratingBadgeText}>{rating.toFixed(1)}</Text>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// HotelCard — main export
// ─────────────────────────────────────────────────────────────────────────────

export const HotelCard: React.FC<HotelCardProps> = ({
  hotel,
  onPress,
  style,
}) => {
  const handlePress = () => {
    onPress?.(hotel);
  };

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={handlePress}
      activeOpacity={onPress ? 0.85 : 1}  // no press effect if no handler
      disabled={!onPress}
    >
      {/* ── Image area ── */}
      <View style={styles.imageContainer}>
        <HotelImage imageUrl={hotel.image} hotelName={hotel.name} />

        {/* Rating badge floats over image — top right corner */}
        <View style={styles.ratingBadgeWrapper}>
          <RatingBadge rating={hotel.rating} />
        </View>
      </View>

      {/* ── Content area ── */}
      <View style={styles.content}>

        {/* Name */}
        <Text style={styles.hotelName} numberOfLines={1}>
          {hotel.name}
        </Text>

        {/* Location */}
        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText} numberOfLines={1}>
            {hotel.location}
          </Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Price row */}
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.priceLabel}>Price per night</Text>
            <View style={styles.priceValueRow}>
              <Text style={styles.priceCurrency}>₹</Text>
              <Text style={styles.priceAmount}>
                {hotel.price.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          {/* "View Details" hint — only shown if onPress is provided */}
          {onPress && (
            <View style={styles.viewDetailsChip}>
              <Text style={styles.viewDetailsText}>View →</Text>
            </View>
          )}
        </View>

      </View>
    </TouchableOpacity>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const PLACEHOLDER_COLORS = [
  '#1A2340',  // navy
  '#0F6E56',  // teal
  '#7F77DD',  // purple
  '#D85A30',  // coral
  '#BA7517',  // amber
  '#185FA5',  // blue
  '#639922',  // green
  '#993556',  // pink
];

const IMAGE_HEIGHT = 180;

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  // ── Card ───────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius:    16,
    overflow:        'hidden',   // clips image to card's rounded corners

    // Shadow — iOS
    ...Platform.select({
      ios: {
        shadowColor:   '#000000',
        shadowOffset:  { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius:  12,
      },
      // Shadow — Android
      android: {
        elevation: 4,
      },
    }),
  },

  // ── Image ──────────────────────────────────────────────────────────────────
  imageContainer: {
    width:  '100%',
    height: IMAGE_HEIGHT,
  },
  image: {
    width:  '100%',
    height: '100%',
  },

  // ── Placeholder ────────────────────────────────────────────────────────────
  placeholderContainer: {
    width:          '100%',
    height:         '100%',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            6,
  },
  placeholderInitials: {
    fontSize:   42,
    fontWeight: '800',
    color:      'rgba(255,255,255,0.9)',
    letterSpacing: 2,
  },
  placeholderLabel: {
    fontSize: 12,
    color:    'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },

  // ── Rating badge (floats over image) ───────────────────────────────────────
  ratingBadgeWrapper: {
    position: 'absolute',
    top:      12,
    right:    12,
  },
  ratingBadge: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 8,
    paddingVertical:   4,
    borderRadius:      20,
    gap:               3,
  },
  ratingBadgeStar: {
    fontSize: 11,
    color:    '#FFFFFF',
  },
  ratingBadgeText: {
    fontSize:   12,
    fontWeight: '700',
    color:      '#FFFFFF',
  },

  // ── Content ────────────────────────────────────────────────────────────────
  content: {
    padding: 16,
    gap:     8,
  },
  hotelName: {
    fontSize:   17,
    fontWeight: '700',
    color:      '#212529',
    letterSpacing: -0.2,
  },

  // ── Location ───────────────────────────────────────────────────────────────
  locationRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
  },
  locationIcon: {
    fontSize: 12,
  },
  locationText: {
    fontSize: 13,
    color:    '#6C757D',
    flex:     1,
  },

  // ── Divider ────────────────────────────────────────────────────────────────
  divider: {
    height:          1,
    backgroundColor: '#F1F3F5',
    marginVertical:  4,
  },

  // ── Price ──────────────────────────────────────────────────────────────────
  priceRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-end',
  },
  priceLabel: {
    fontSize:     11,
    color:        '#ADB5BD',
    marginBottom:  2,
    fontWeight:   '500',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  priceValueRow: {
    flexDirection: 'row',
    alignItems:    'flex-end',
    gap:           1,
  },
  priceCurrency: {
    fontSize:    15,
    fontWeight:  '600',
    color:       '#F09030',
    lineHeight:  26,
  },
  priceAmount: {
    fontSize:   22,
    fontWeight: '800',
    color:      '#F09030',
    lineHeight: 28,
  },

  // ── View details chip ──────────────────────────────────────────────────────
  viewDetailsChip: {
    backgroundColor:   '#FFF8F0',
    paddingHorizontal: 12,
    paddingVertical:   6,
    borderRadius:      20,
    borderWidth:       1,
    borderColor:       '#FDECD6',
  },
  viewDetailsText: {
    fontSize:   13,
    fontWeight: '600',
    color:      '#F09030',
  },
});