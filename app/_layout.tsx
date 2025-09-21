import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { initDatabase } from '../lib/database';
import { useHydrationStore } from '../stores/hydrationStore';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isOnboarded, userProfile, setUserProfile, setOnboarded } = useHydrationStore();
  const [isLoading, setIsLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  useEffect(() => {
    // Only initialize database here, navigation is handled by index.tsx
    const initializeApp = async () => {
      try {
        console.log('RootLayout: Initializing database...');
        initDatabase();
        console.log('RootLayout: Database initialized');
      } catch (error) {
        console.error('RootLayout: Failed to initialize database:', error);
      } finally {
        console.log('RootLayout: Initialization complete');
        setIsLoading(false);
      }
    };
    
    initializeApp();
  }, []);

  // Show loading screen while initializing
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F2F7' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#8E8E93' }}>
          読み込み中...
        </Text>
      </View>
    );
  }

  console.log('Render state:', { isLoading, hasOnboarded });
  console.log('RootLayout: Rendering');
  
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
