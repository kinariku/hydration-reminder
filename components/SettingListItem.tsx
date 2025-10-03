import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RADIUS } from '../constants/radius';

interface SettingListItemProps {
  icon: string;
  label: string;
  value?: string;
  onPress: () => void;
  isLast?: boolean;
  showChevron?: boolean;
}

export function SettingListItem({ 
  icon, 
  label, 
  value, 
  onPress, 
  isLast = false,
  showChevron = true
}: SettingListItemProps) {
  return (
    <TouchableOpacity 
      style={[styles.settingItem, isLast && styles.lastSettingItem]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <FontAwesome5 name={icon as any} size={20} color="#0EA5E9" />
        </View>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        {showChevron && <FontAwesome5 name="chevron-right" size={20} color="#0EA5E9" style={styles.chevron} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 16,
    paddingRight: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.5)',
  },
  lastSettingItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 16,
    color: '#0284C7',
    marginRight: 8,
    fontWeight: '500',
  },
  chevron: {
    opacity: 0.6,
  },
});
