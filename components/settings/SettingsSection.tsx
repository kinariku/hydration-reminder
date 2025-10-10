import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RADIUS } from '../../constants/radius';
import { SettingItem } from '../../types/settings';
import { SettingListItem } from '../SettingListItem';

interface SettingsSectionProps {
  title: string;
  items: SettingItem[];
  onItemPress: (route: string) => void;
  onNotificationSetup?: () => void;
}

export function SettingsSection({ 
  title, 
  items, 
  onItemPress, 
  onNotificationSetup 
}: SettingsSectionProps) {
  const handleItemPress = (item: SettingItem) => {
    if (item.id === 'enable-notifications' && onNotificationSetup) {
      onNotificationSetup();
    } else if (item.route) {
      onItemPress(item.route);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      
      <View style={styles.settingsGroup}>
        {items.map((item, index) => (
          <SettingListItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            value={item.value}
            onPress={() => handleItemPress(item)}
            isLast={item.isLast || index === items.length - 1}
            showChevron={item.id !== 'version'}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0369A1',
    marginBottom: 12,
  },
  settingsGroup: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: RADIUS.card,
    overflow: 'hidden',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
});
