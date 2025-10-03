import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { SettingsDetailHeader } from './SettingsDetailHeader';

interface SettingsDetailTemplateProps {
  title: string;
  onBackPress: () => void;
  children: React.ReactNode;
}

export function SettingsDetailTemplate({ 
  title, 
  onBackPress, 
  children 
}: SettingsDetailTemplateProps) {
  return (
    <View style={styles.container}>
      <Svg style={styles.backgroundGradient} width="100%" height="100%">
        <Defs>
          <LinearGradient id="detailGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#E0F2FE" />
            <Stop offset="25%" stopColor="#BAE6FD" />
            <Stop offset="50%" stopColor="#7DD3FC" />
            <Stop offset="75%" stopColor="#38BDF8" />
            <Stop offset="100%" stopColor="#0EA5E9" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#detailGradient)" />
      </Svg>
      
      <SettingsDetailHeader 
        title={title}
        onBackPress={onBackPress}
      />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F2FE',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 120,
    flexGrow: 1,
  },
});
