import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { HEADER_CONSTANTS } from '@/constants/header';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        tabBarButton: HapticTab,
        headerStyle: {
          height: HEADER_CONSTANTS.CONTENT_HEIGHT + 44, // SafeArea + コンテンツ高さ
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'ホーム',
          headerTitle: 'StayHydrated',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '設定',
          headerTitle: '設定',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings/profile"
        options={{
          href: null, // タブバーに表示しない
          headerShown: false, // ヘッダーを非表示
          tabBarStyle: { display: 'none' }, // タブバーを完全に非表示
          headerStyle: {
            height: HEADER_CONSTANTS.CONTENT_HEIGHT + 44, // 統一されたヘッダー高さ
          },
        }}
      />
      <Tabs.Screen
        name="settings/notifications"
        options={{
          href: null, // タブバーに表示しない
          headerShown: false, // ヘッダーを非表示
          tabBarStyle: { display: 'none' }, // タブバーを完全に非表示
          headerStyle: {
            height: HEADER_CONSTANTS.CONTENT_HEIGHT + 44, // 統一されたヘッダー高さ
          },
        }}
      />
      <Tabs.Screen
        name="settings/app"
        options={{
          href: null, // タブバーに表示しない
          headerShown: false, // ヘッダーを非表示
          tabBarStyle: { display: 'none' }, // タブバーを完全に非表示
          headerStyle: {
            height: HEADER_CONSTANTS.CONTENT_HEIGHT + 44, // 統一されたヘッダー高さ
          },
        }}
      />
      <Tabs.Screen
        name="settings/data"
        options={{
          href: null, // タブバーに表示しない
          headerShown: false, // ヘッダーを非表示
          tabBarStyle: { display: 'none' }, // タブバーを完全に非表示
          headerStyle: {
            height: HEADER_CONSTANTS.CONTENT_HEIGHT + 44, // 統一されたヘッダー高さ
          },
        }}
      />
    </Tabs>
  );
}
