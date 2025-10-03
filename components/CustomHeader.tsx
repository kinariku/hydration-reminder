import { BlurView } from 'expo-blur';
import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CustomHeaderProps {
  title: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export function CustomHeader({ title, leftElement, rightElement }: CustomHeaderProps) {
  return (
    <View style={styles.container}>
      <BlurView intensity={60} style={styles.blurContainer} tint="light">
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {leftElement}
            </View>
            
            <Text style={styles.headerTitle}>{title}</Text>
            
            <View style={styles.headerRight}>
              {rightElement}
            </View>
          </View>
        </SafeAreaView>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 100,
  },
  blurContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  safeArea: {
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 44,
  },
  headerLeft: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0369A1',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
    letterSpacing: -0.4,
  },
});
