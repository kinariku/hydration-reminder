import { FontAwesome5 } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RADIUS } from '../constants/radius';

interface TabItem {
  key: string;
  icon: string;
  activeIcon: string;
}

interface CustomTabBarProps {
  activeTab: string;
  onTabPress: (tabKey: string) => void;
  onAddPress?: () => void;
  addButtonRef?: React.RefObject<any>;
  isDialogOpen?: boolean;
}

const tabs: TabItem[] = [
  {
    key: 'home',
    icon: 'tint',
    activeIcon: 'tint',
  },
  {
    key: 'settings',
    icon: 'user',
    activeIcon: 'user',
  },
];

export function CustomTabBar({ activeTab, onTabPress, onAddPress, addButtonRef, isDialogOpen = false }: CustomTabBarProps) {
  const insets = useSafeAreaInsets();
  
  // アニメーション用の値
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // パルスアニメーション（ダイアログが閉じている時のみ実行）
    if (!isDialogOpen) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
      };
    }
  }, [isDialogOpen]);


  const handleButtonPress = () => {
    // ハプティックフィードバック
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // ボタンアニメーション
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onAddPress?.();
    });
  };
  
  return (
    <View style={styles.wrapper}>
      <BlurView intensity={30} style={[styles.container, { paddingBottom: insets.bottom }]} tint="light">
        <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'home' && styles.activeTabItem]}
          onPress={() => onTabPress('home')}
          activeOpacity={0.7}
        >
          <FontAwesome5
            name="tint"
            size={24}
            color={activeTab === 'home' ? '#0EA5E9' : '#0369A1'}
          />
          <Text style={[styles.tabLabel, activeTab === 'home' && styles.activeTabLabel]}>
            ホーム
          </Text>
        </TouchableOpacity>

          <View style={styles.addButtonPlaceholder} />

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'settings' && styles.activeTabItem]}
            onPress={() => onTabPress('settings')}
            activeOpacity={0.7}
          >
            <FontAwesome5
              name="user"
              size={24}
              color={activeTab === 'settings' ? '#0EA5E9' : '#0369A1'}
            />
            <Text style={[styles.tabLabel, activeTab === 'settings' && styles.activeTabLabel]}>
              設定
            </Text>
          </TouchableOpacity>
        </View>
      </BlurView>

      {onAddPress && (
        <Animated.View
          style={[
            styles.addButton,
            {
              transform: [
                { scale: Animated.multiply(pulseAnim, scaleAnim) },
              ],
            },
          ]}
        >
          <TouchableOpacity
            ref={addButtonRef}
            style={styles.addButtonTouchable}
            onPress={handleButtonPress}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="plus" size={32} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    // より自然な影を追加
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 80,
  },
  addButtonPlaceholder: {
    width: 100, // アクションボタンと同じ幅
    height: 50, // タブバーの高さの半分
  },
  tabItem: {
    width: 80,
    height: 60,
    borderRadius: RADIUS.tab,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 8,
  },
  activeTabItem: {
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369A1',
    marginTop: 4,
  },
  activeTabLabel: {
    color: '#0EA5E9',
  },
  addButton: {
    position: 'absolute',
    bottom: 60, // タブバーから60px上に配置
    left: '50%',
    marginLeft: -40, // ボタンの幅の半分（80px）を左にオフセット
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    backgroundColor: '#0EA5E9',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
    zIndex: 200,
  },
  addButtonTouchable: {
    width: '100%',
    height: '100%',
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
