import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initDatabase } from '../lib/database';
import { useHydrationStore } from '../stores/hydrationStore';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isOnboarded, userProfile, setUserProfile, setOnboarded } = useHydrationStore();
  const [isLoading, setIsLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  useEffect(() => {
    // Initialize database and load existing profile
    const initializeApp = async () => {
      try {
        console.log('Initializing app...');
        initDatabase();
        
        // Check AsyncStorage directly for onboarding status
        const storedData = await AsyncStorage.getItem('hydration-storage');
        console.log('Stored data:', storedData);
        
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          console.log('Parsed data:', parsedData);
          
          if (parsedData.state?.userProfile) {
            console.log('Found user profile in storage, setting up store');
            setUserProfile(parsedData.state.userProfile);
            setOnboarded(true);
            setHasOnboarded(true);
          } else {
            console.log('No user profile in storage, will show onboarding');
            setHasOnboarded(false);
          }
        } else {
          console.log('No stored data found, will show onboarding');
          setHasOnboarded(false);
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setHasOnboarded(false);
      } finally {
        console.log('App initialization complete');
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

  // Determine initial route based on onboarding status
  const shouldShowOnboarding = !hasOnboarded;
  
  console.log('Render state:', { isLoading, hasOnboarded, shouldShowOnboarding });

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          {shouldShowOnboarding ? (
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          ) : (
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          )}
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
        </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
