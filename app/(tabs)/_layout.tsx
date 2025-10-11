import * as Haptics from 'expo-haptics';
import { Tabs, router, usePathname } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { Dimensions } from 'react-native';

import { CustomTabBar } from '@/components/CustomTabBar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { WaterIntakeDialog } from '@/components/WaterIntakeDialog';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHydrationStore } from '@/stores/hydrationStore';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const activeTab = useMemo<'home' | 'settings'>(() => {
    return pathname?.includes('/settings') ? 'settings' : 'home';
  }, [pathname]);

  const { settings, addIntakeLog } = useHydrationStore();
  const [showWaterDialog, setShowWaterDialog] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const addButtonRef = useRef<any>(null);
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  const handleTabPress = (tabKey: string) => {
    if (tabKey === 'home') {
      router.push('/(tabs)/');
    } else if (tabKey === 'settings') {
      router.push('/(tabs)/settings');
    }
  };

  const handleAddPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (addButtonRef.current) {
      addButtonRef.current.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        setButtonPosition({ x: pageX + width / 2, y: pageY + height / 2 });
        setShowWaterDialog(true);
      });
    } else {
      setButtonPosition({ x: screenWidth / 2, y: screenHeight / 2 });
      setShowWaterDialog(true);
    }
  };

  const handleCloseDialog = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowWaterDialog(false);
  };

  const handleSelectAmount = async (amount: number) => {
    try {
      const newLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        dateTime: new Date().toISOString(),
        amountMl: amount,
        source: 'quick' as const,
      };
      const { saveIntakeLog } = await import('@/lib/database');
      saveIntakeLog(newLog);
      addIntakeLog(newLog);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to add water intake:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarStyle: { display: 'none' },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'ホーム',
            headerShown: false,
            headerTitle: '',
            header: () => null,
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: '設定',
            headerShown: false,
            headerTitle: '',
            header: () => null,
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
          }}
        />
      </Tabs>

      <CustomTabBar
        activeTab={activeTab}
        onTabPress={handleTabPress}
        onAddPress={handleAddPress}
        addButtonRef={addButtonRef}
        isDialogOpen={showWaterDialog}
      />

      <WaterIntakeDialog
        visible={showWaterDialog}
        onClose={handleCloseDialog}
        onSelectAmount={handleSelectAmount}
        settings={settings}
        buttonPosition={buttonPosition}
      />
    </>
  );
}