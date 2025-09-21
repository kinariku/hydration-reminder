import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COMMON_HEADER_STYLES } from '../constants/header';

interface MainHeaderProps {
  title: string;
  rightElement?: React.ReactNode;
}

export function MainHeader({ title, rightElement }: MainHeaderProps) {
  return (
    <SafeAreaView style={COMMON_HEADER_STYLES.headerContainer}>
      <View style={COMMON_HEADER_STYLES.header}>
        <View style={COMMON_HEADER_STYLES.headerLeft} />
        
        <Text style={COMMON_HEADER_STYLES.headerTitle}>{title}</Text>
        
        <View style={COMMON_HEADER_STYLES.headerRight}>
          {rightElement}
        </View>
      </View>
    </SafeAreaView>
  );
}
