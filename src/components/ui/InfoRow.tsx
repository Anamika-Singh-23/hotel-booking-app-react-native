// src/components/ui/InfoRow.tsx

import React   from 'react';
import {
  View,
  Text,
  StyleSheet,
}              from 'react-native';

interface InfoRowProps {
  icon:     string;
  label:    string;
  value:    string;
  isLast?:  boolean;
  valueColor?: string;
}

export const InfoRow: React.FC<InfoRowProps> = ({
  icon,
  label,
  value,
  isLast   = false,
  valueColor = '#212529',
}) => (
  <View style={[styles.row, !isLast && styles.rowBorder]}>
    <View style={styles.rowLeft}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
    <Text style={[styles.value, { color: valueColor }]} numberOfLines={2}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'flex-start',
    paddingVertical: 11,
    gap:             12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
    flex:          1,
  },
  icon: {
    fontSize: 15,
    width:    22,
  },
  label: {
    fontSize:   13,
    color:      '#6C757D',
    fontWeight: '500',
  },
  value: {
    fontSize:   13,
    fontWeight: '600',
    textAlign:  'right',
    flex:       1,
  },
});