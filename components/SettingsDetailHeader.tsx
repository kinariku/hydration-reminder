import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RADIUS } from '../constants/radius';

interface SettingsDetailHeaderProps {
  title: string;
  onBackPress: () => void;
}

export function SettingsDetailHeader({ title, onBackPress }: SettingsDetailHeaderProps) {
  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBackPress();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.headerSection}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <FontAwesome5 name="chevron-left" size={20} color="#0369A1" />
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
          </View>
          
          <View style={styles.placeholder} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  safeArea: {
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0369A1',
    letterSpacing: -0.3,
  },
  placeholder: {
    width: 40,
  },
});
