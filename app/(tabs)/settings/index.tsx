import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomTabBar } from '../../../components/CustomTabBar';
import { SettingsBackground } from '../../../components/settings/SettingsBackground';
import { SettingsHeader } from '../../../components/settings/SettingsHeader';
import { SettingsSection } from '../../../components/settings/SettingsSection';
import { useNotificationStatus } from '../../../hooks/useNotificationStatus';
import { createSettingsData } from '../../../lib/settingsData';
import { useHydrationStore } from '../../../stores/hydrationStore';

export default function SettingsScreen() {
  const { 
    userProfile, 
    settings, 
  } = useHydrationStore();

  const { notificationStatus, handleNotificationSetup } = useNotificationStatus();

  const handleItemPress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route);
  };

  const handleAddPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/modal');
  };

  const settingsData = createSettingsData(userProfile, settings, notificationStatus);

  return (
    <SettingsBackground>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <SettingsHeader title="設定" />
      </SafeAreaView>
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        {settingsData.map((section) => (
          <SettingsSection
            key={section.id}
            title={section.title}
            items={section.items}
            onItemPress={handleItemPress}
            onNotificationSetup={section.id === 'notification' ? handleNotificationSetup : undefined}
          />
        ))}
      </ScrollView>
      
      <CustomTabBar 
        activeTab="settings" 
        onTabPress={(tab) => {
          if (tab === 'home') {
            router.push('/(tabs)/');
          }
        }}
        onAddPress={handleAddPress}
      />
    </SettingsBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 120,
    flexGrow: 1,
  },
});