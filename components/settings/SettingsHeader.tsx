import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface SettingsHeaderProps {
  title: string;
}

export function SettingsHeader({ title }: SettingsHeaderProps) {
  return (
    <View style={styles.headerSection}>
      <View style={styles.titleContainer}>
        <Text style={styles.appTitle}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0369A1',
    letterSpacing: -0.5,
  },
});
