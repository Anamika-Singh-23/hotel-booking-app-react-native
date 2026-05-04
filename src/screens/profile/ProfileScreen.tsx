

import React, { useCallback }                             from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  StatusBar,
}                                        from 'react-native';
import { SafeAreaView }                  from 'react-native-safe-area-context';
import { useNavigation }                 from '@react-navigation/native';
import { NativeStackNavigationProp }     from '@react-navigation/native-stack';
import { useAuth }                       from '../../context/AuthContext';
import { AppStackParamList }             from '../../navigation/types';

// ── Types ─────────────────────────────────────────────────────────────────────

type ProfileNavProp = NativeStackNavigationProp<AppStackParamList>;

interface OptionRowProps {
  icon:      string;
  title:     string;
  onPress:   () => void;
  isLast?:   boolean;
  textColor?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// OptionRow — reusable menu item
// ─────────────────────────────────────────────────────────────────────────────

const OptionRow: React.FC<OptionRowProps> = ({
  icon,
  title,
  onPress,
  isLast     = false,
  textColor  = '#212529',
}) => (
  <TouchableOpacity
    style={[styles.optionRow, !isLast && styles.optionRowBorder]}
    onPress={onPress}
    activeOpacity={0.65}
  >
    <View style={styles.optionLeft}>
      <View style={styles.optionIconBox}>
        <Text style={styles.optionIcon}>{icon}</Text>
      </View>
      <Text style={[styles.optionTitle, { color: textColor }]}>{title}</Text>
    </View>
    <Text style={styles.optionArrow}>›</Text>
  </TouchableOpacity>
);

// ─────────────────────────────────────────────────────────────────────────────
// ProfileScreen
// ─────────────────────────────────────────────────────────────────────────────

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileNavProp>();
  const { user, signOut } = useAuth();

  // ── Avatar letter ─────────────────────────────────────────────────────────
  const avatarLetter = user?.name
    ? user.name.charAt(0).toUpperCase()
    : '?';

  // ── Logout confirmation ───────────────────────────────────────────────────
  const handleLogout = useCallback(() => {
  Alert.alert(
    'Logout',
    'Are you sure you want to logout?',
    [
      {
        text:  'Cancel',
        style: 'cancel',
      },
      {
        text:  'Logout',
        style: 'destructive',
        onPress: async () => {
          // ✅ Fix 1: properly await karo
          // ✅ Fix 2: try-catch — silent failure prevent karo
          try {
            await signOut();
            // Navigation automatic hoga — RootNavigator handle karega
            // Yahan navigate() call mat karo
          } catch (err) {
            if (__DEV__) {
              console.error('[ProfileScreen] signOut failed:', err);
            }
          }
        },
      },
    ],
    { cancelable: true },
  );
}, [signOut]);

  // ── Menu options ──────────────────────────────────────────────────────────
  const OPTIONS = [
    {
      icon:    '📋',
      title:   'My Bookings',
      onPress: () => navigation.navigate('MainTabs', { screen: 'MyBookings' }),
    },
    {
      icon:    '🎧',
      title:   'Help & Support',
      onPress: () => {},
    },
    {
      icon:    'ℹ️',
      title:   'About App',
      onPress: () => {},
    },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── User card ── */}
        <View style={styles.userCard}>
          {/* Avatar */}
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>{avatarLetter}</Text>
          </View>

          {/* Name + email */}
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.name ?? 'Guest User'}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user?.email ?? '—'}
            </Text>
          </View>

          {/* Member badge */}
          <View style={styles.memberBadge}>
            <Text style={styles.memberBadgeText}>Member</Text>
          </View>
        </View>

        {/* ── Options section ── */}
        <View style={styles.sectionLabel}>
          <Text style={styles.sectionLabelText}>Account</Text>
        </View>

        <View style={styles.optionsCard}>
          {OPTIONS.map((opt, index) => (
            <OptionRow
              key={opt.title}
              icon={opt.icon}
              title={opt.title}
              onPress={opt.onPress}
              isLast={index === OPTIONS.length - 1}
            />
          ))}
        </View>

        {/* ── App version note ── */}
        <Text style={styles.versionText}>AasthaBooking v1.0.0</Text>

      </ScrollView>

      {/* ── Logout button — fixed at bottom ── */}
      <View style={styles.logoutWrapper}>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

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

  // ── Header ─────────────────────────────────────────────────────────────────
  header: {
    alignItems:        'center',
    paddingHorizontal: 16,
    paddingTop:        Platform.OS === 'android' ? 16 : 8,
    paddingBottom:     14,
    backgroundColor:   '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize:   17,
    fontWeight: '700',
    color:      '#212529',
  },

  // ── Scroll ─────────────────────────────────────────────────────────────────
  scroll:        { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom:     100,
    gap:               14,
  },

  // ── User card ──────────────────────────────────────────────────────────────
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius:    20,
    padding:         20,
    marginTop:       16,
    alignItems:      'center',
    gap:             10,
    borderWidth:     1,
    borderColor:     '#E9ECEF',
    ...Platform.select({
      ios: {
        shadowColor:   '#000',
        shadowOffset:  { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius:  10,
      },
      android: { elevation: 3 },
    }),
  },
  avatarCircle: {
    width:           80,
    height:          80,
    borderRadius:    40,
    backgroundColor: '#F09030',
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    4,
    ...Platform.select({
      ios: {
        shadowColor:   '#F09030',
        shadowOffset:  { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius:  8,
      },
      android: { elevation: 5 },
    }),
  },
  avatarLetter: {
    fontSize:   32,
    fontWeight: '800',
    color:      '#FFFFFF',
  },
  userInfo: {
    alignItems: 'center',
    gap:        4,
  },
  userName: {
    fontSize:      20,
    fontWeight:    '700',
    color:         '#212529',
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 14,
    color:    '#6C757D',
  },
  memberBadge: {
    marginTop:         4,
    backgroundColor:   '#FFF8F0',
    borderRadius:      20,
    paddingHorizontal: 14,
    paddingVertical:   5,
    borderWidth:       1,
    borderColor:       '#FDECD6',
  },
  memberBadgeText: {
    fontSize:   12,
    fontWeight: '600',
    color:      '#F09030',
  },

  // ── Section label ───────────────────────────────────────────────────────────
  sectionLabel: {
    paddingHorizontal: 4,
    marginTop:         4,
  },
  sectionLabelText: {
    fontSize:      12,
    fontWeight:    '700',
    color:         '#ADB5BD',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // ── Options card ───────────────────────────────────────────────────────────
  optionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius:    16,
    paddingHorizontal: 16,
    borderWidth:     1,
    borderColor:     '#E9ECEF',
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
  optionRow: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingVertical: 14,
  },
  optionRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12,
    flex:          1,
  },
  optionIconBox: {
    width:           38,
    height:          38,
    borderRadius:    11,
    backgroundColor: '#F8F9FA',
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1,
    borderColor:     '#E9ECEF',
    flexShrink:      0,
  },
  optionIcon: {
    fontSize: 18,
  },
  optionTitle: {
    fontSize:   15,
    fontWeight: '500',
    color:      '#212529',
  },
  optionArrow: {
    fontSize:   22,
    color:      '#CED4DA',
    fontWeight: '300',
    lineHeight: 26,
  },

  // ── Version text ────────────────────────────────────────────────────────────
  versionText: {
    fontSize:   12,
    color:      '#CED4DA',
    textAlign:  'center',
    marginTop:   8,
  },

  // ── Logout button ───────────────────────────────────────────────────────────
  logoutWrapper: {
    position:          'absolute',
    bottom:            0,
    left:              0,
    right:             0,
    paddingHorizontal: 16,
    paddingTop:        12,
    paddingBottom:     Platform.OS === 'ios' ? 32 : 16,
    backgroundColor:   '#F8F9FA',
    borderTopWidth:    1,
    borderTopColor:    '#E9ECEF',
  },
  logoutBtn: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'center',
    gap:               8,
    backgroundColor:   '#FEF2F2',
    borderRadius:      14,
    paddingVertical:   15,
    borderWidth:       1.5,
    borderColor:       '#FECACA',
  },
  logoutIcon: {
    fontSize: 18,
  },
  logoutText: {
    fontSize:   16,
    fontWeight: '700',
    color:      '#DC2626',
  },
});