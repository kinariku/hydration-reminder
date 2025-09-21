import { router } from 'expo-router';
import React from 'react';
import {
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COMMON_HEADER_STYLES } from '../constants/header';

interface CommonHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export function CommonHeader({ title, showBackButton = true, onBack, rightElement }: CommonHeaderProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={COMMON_HEADER_STYLES.headerContainer} edges={['top']}>
      <View style={COMMON_HEADER_STYLES.header}>
        {showBackButton ? (
          <TouchableOpacity 
            style={COMMON_HEADER_STYLES.backButton}
            onPress={handleBack}
          >
            <View style={COMMON_HEADER_STYLES.backButtonContent}>
              <Text style={COMMON_HEADER_STYLES.backButtonIcon}>←</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={COMMON_HEADER_STYLES.headerLeft} />
        )}
        
        <Text style={COMMON_HEADER_STYLES.headerTitle}>{title}</Text>
        
        <View style={COMMON_HEADER_STYLES.headerRight}>
          {rightElement}
        </View>
      </View>
    </SafeAreaView>
  );
}

// スタイルは COMMON_HEADER_STYLES を使用
