// src/navigation/BottomTabs.tsx

import React                          from 'react';
import { Platform, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator }   from '@react-navigation/bottom-tabs';
import { TabParamList }               from './types';
import { HomeScreen }                 from '../screens/home/HomeScreen';
import { MyBookingsScreen }           from '../screens/booking/MyBookingsScreen';
import { ProfileScreen }              from '../screens/profile/ProfileScreen';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const TAB_CONFIG: Record<
  keyof TabParamList,
  { icon: string; label: string }
> = {
  Home:       { icon: '🏠', label: 'Home' },
  MyBookings: { icon: '📖', label: 'My Bookings' },
  Profile:    { icon: '👤', label: 'Profile' },
};

const COLORS = {
  active:      '#F09030',
  inactive:    '#ADB5BD',
  background:  '#FFFFFF',
  border:      '#E9ECEF',
  labelActive: '#F09030',
};

// ─────────────────────────────────────────────────────────────────────────────
// Tab icon component
// ─────────────────────────────────────────────────────────────────────────────

interface TabIconProps {
  emoji:    string;
  focused:  boolean;
}

const TabIcon: React.FC<TabIconProps> = ({ emoji, focused }) => (
  <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
    {emoji}
  </Text>
);

// ─────────────────────────────────────────────────────────────────────────────
// Bottom Tab Navigator
// ─────────────────────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<TabParamList>();

export const BottomTabs: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => {
        const config = TAB_CONFIG[route.name as keyof TabParamList];

        return {
          // ── Header ─────────────────────────────────────────────────────────
          headerShown: false,

          // ── Tab icon ───────────────────────────────────────────────────────
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji={config.icon} focused={focused} />
          ),

          // ── Tab label ──────────────────────────────────────────────────────
          tabBarLabel: ({ focused }) => (
            <Text style={[
              styles.tabLabel,
              focused ? styles.tabLabelActive : styles.tabLabelInactive,
            ]}>
              {config.label}
            </Text>
          ),

          // ── Tab bar style ──────────────────────────────────────────────────
          tabBarStyle: styles.tabBar,

          // ── Active / inactive colors ───────────────────────────────────────
          tabBarActiveTintColor:   COLORS.active,
          tabBarInactiveTintColor: COLORS.inactive,

          // ── Active indicator pill ──────────────────────────────────────────
          tabBarItemStyle: styles.tabBarItem,
        };
      }}
    >
      <Tab.Screen name="Home"       component={HomeScreen}       />
      <Tab.Screen name="MyBookings" component={MyBookingsScreen} />
      <Tab.Screen name="Profile"    component={ProfileScreen}    />
    </Tab.Navigator>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  // ── Tab bar container ───────────────────────────────────────────────────────
  tabBar: {
    backgroundColor:  COLORS.background,
    borderTopWidth:   1,
    borderTopColor:   COLORS.border,
    height:           Platform.OS === 'ios' ? 84 : 64,
    paddingTop:       8,
    paddingBottom:    Platform.OS === 'ios' ? 28 : 10,
    paddingHorizontal: 8,

    // Shadow above tab bar
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

  // ── Each tab item ───────────────────────────────────────────────────────────
  tabBarItem: {
    borderRadius: 12,
    paddingTop:   4,
  },

  // ── Icon ────────────────────────────────────────────────────────────────────
  tabIcon: {
    fontSize:   22,
    opacity:    0.5,
    marginBottom: 2,
  },
  tabIconFocused: {
    opacity:   1,
    transform: [{ scale: 1.1 }],
  },

  // ── Label ───────────────────────────────────────────────────────────────────
  tabLabel: {
    fontSize:     10,
    fontWeight:   '600',
    marginTop:    0,
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: COLORS.labelActive,
  },
  tabLabelInactive: {
    color: COLORS.inactive,
  },
});