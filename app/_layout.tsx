import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { FullScreenLoader } from '@/components/FullScreenLoader';
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
      <FullScreenLoader
        message="アプリを初期化しています..."
        spinnerAccessibilityLabel="アプリを初期化しています"
      />
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
