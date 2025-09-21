import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function IndexScreen() {
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const checkAndNavigate = async () => {
      if (isNavigating) return; // Prevent multiple navigation attempts
      
      try {
        setIsNavigating(true);
        console.log('IndexScreen: Checking user status...');
        
        // Check if user has completed onboarding
        const storedData = await AsyncStorage.getItem('hydration-storage');
        
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          
          if (parsedData.state?.userProfile) {
            console.log('IndexScreen: User has profile, navigating to main app');
            router.replace('/(tabs)');
          } else {
            console.log('IndexScreen: No profile, navigating to onboarding');
            router.replace('/onboarding');
          }
        } else {
          console.log('IndexScreen: No stored data, navigating to onboarding');
          router.replace('/onboarding');
        }
      } catch (error) {
        console.error('IndexScreen: Error during navigation:', error);
        router.replace('/onboarding');
      }
    };
    
    // Add a small delay to ensure the app is fully loaded
    const timeoutId = setTimeout(checkAndNavigate, 100);
    
    return () => clearTimeout(timeoutId);
  }, [isNavigating]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F2F7' }}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={{ marginTop: 16, fontSize: 16, color: '#8E8E93' }}>
        読み込み中...
      </Text>
    </View>
  );
}
