import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { formatVolume } from '../lib/unitConverter';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// プリセット選択肢（プリセット設定ページと同じ）
const PRESET_OPTIONS = [
  { id: 'small', name: '一口分', value: 100, icon: 'tint' },
  { id: 'cup', name: 'カップ1杯', value: 150, icon: 'coffee' },
  { id: 'glass', name: 'グラス1杯', value: 200, icon: 'glass-whiskey' },
  { id: 'mug', name: 'マグカップ1杯', value: 250, icon: 'mug-hot' },
  { id: 'jockey', name: 'ジョッキ1杯', value: 400, icon: 'beer' },
  { id: 'bottle', name: 'ペットボトル1本', value: 500, icon: 'wine-bottle' },
];

interface WaterIntakeDialogProps {
  visible: boolean;
  onClose: () => void;
  onSelectAmount: (amount: number) => void;
  settings: {
    units: 'ml' | 'oz';
    presetMl: number[];
  };
  buttonPosition: {
    x: number;
    y: number;
  };
}

export function WaterIntakeDialog({
  visible,
  onClose,
  onSelectAmount,
  settings,
  buttonPosition,
}: WaterIntakeDialogProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const blurAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;

  // 表示可能なプリセットのみをフィルタリング
  const availablePresets = PRESET_OPTIONS.filter(option => 
    settings.presetMl.includes(option.value)
  );

  useEffect(() => {
    if (visible) {
      // ジニーエフェクト: ボタン位置から拡大して表示
      const dialogWidth = screenWidth * 0.9;
      const targetX = (screenWidth - dialogWidth) / 2; // ダイアログの幅を90%に
      const targetY = (screenHeight - 400) / 2; // ダイアログの高さを400に固定
      
      const fromX = buttonPosition.x - targetX - dialogWidth / 2; // ダイアログの中心から計算
      const fromY = buttonPosition.y - targetY - 200;
      
      // 初期位置を設定
      translateXAnim.setValue(fromX);
      translateYAnim.setValue(fromY);
      
      // アニメーション実行
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(translateXAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(blurAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      // 閉じるアニメーション
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(blurAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [visible, buttonPosition]);

  const handleSelectAmount = (amount: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelectAmount(amount);
    onClose();
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {/* 背景オーバーレイ - ブラーなしの半透明 */}
        <Animated.View
          style={[
            styles.blurContainer,
            {
              opacity: blurAnim,
            },
          ]}
        >
        </Animated.View>
        
        {/* タッチ可能なオーバーレイ */}
        <TouchableOpacity 
          style={styles.overlayTouchable}
          onPress={handleClose}
          activeOpacity={1}
        />
        
        {/* ダイアログ - ブラーの上に表示 */}
        <Animated.View
          style={[
            styles.dialog,
            {
              opacity: opacityAnim,
              transform: [
                { scale: scaleAnim },
                { translateX: translateXAnim },
                { translateY: translateYAnim },
              ],
            },
          ]}
        >
          <View style={styles.dialogContent}>
            <View style={styles.header}>
              <Text style={styles.title}>水分を追加</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <FontAwesome5 name="times" size={18} color="#0369A1" />
              </TouchableOpacity>
            </View>

            <View style={styles.presetList}>
              {availablePresets.map((option, index) => (
                <Animated.View
                  key={option.id}
                  style={{
                    transform: [
                      {
                        scale: scaleAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 1],
                        }),
                      },
                    ],
                    opacity: opacityAnim,
                  }}
                >
                  <TouchableOpacity
                    style={[
                      styles.presetButton,
                      index === availablePresets.length - 1 && styles.lastPresetButton
                    ]}
                    onPress={() => handleSelectAmount(option.value)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.presetButtonContent}>
                      <View style={styles.presetIconContainer}>
                        <FontAwesome5 
                          name={option.icon} 
                          size={20} 
                          color="#0EA5E9"
                        />
                      </View>
                      <View style={styles.presetTextContainer}>
                        <View style={styles.presetInfoContainer}>
                          <Text style={styles.presetText}>
                            {option.name}
                          </Text>
                          <Text style={styles.presetValue}>
                            {formatVolume(option.value, settings.units)}
                          </Text>
                        </View>
                        <View style={styles.addButton}>
                          <Text style={styles.addButtonText}>追加</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  dialog: {
    width: screenWidth * 0.9,
    maxHeight: screenHeight * 0.8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    zIndex: 3,
  },
  dialogContent: {
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0369A1',
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetList: {
    width: '100%',
    marginTop: 12,
    paddingBottom: 12,
  },
  presetButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.2)',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lastPresetButton: {
    marginBottom: 0,
  },
  presetButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  presetTextContainer: {
    flex: 1,
    marginLeft: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  presetInfoContainer: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 12,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  presetIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.2)',
  },
  presetText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0369A1',
    marginBottom: 4,
  },
  presetValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0284C7',
  },
});
