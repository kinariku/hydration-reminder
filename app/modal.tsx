import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { WaterBubbles } from '../components/WaterBubbles';
import { RADIUS } from '../constants/radius';
import { saveIntakeLog } from '../lib/database';
import { formatVolume } from '../lib/unitConverter';
import { useHydrationStore } from '../stores/hydrationStore';
import { IntakeLog } from '../types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function AddWaterModal() {
  const { settings, addIntakeLog, getTodayTotal, dailyGoal } = useHydrationStore();
  const [customAmount, setCustomAmount] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // アニメーション用の値
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const presetAmounts = settings.presetMl || [100, 200, 300, 500];

  useEffect(() => {
    // モーダル表示アニメーション
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.back();
    });
  };

  const handlePresetPress = async (amount: number) => {
    if (isSubmitting) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await addWater(amount);
  };

  const handleCustomSubmit = async () => {
    if (isSubmitting) return;
    
    const amount = parseInt(customAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('エラー', '有効な量を入力してください');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await addWater(amount);
  };

  const addWater = async (amountMl: number) => {
    setIsSubmitting(true);
    
    try {
      const newLog: IntakeLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        dateTime: new Date().toISOString(),
        amountMl,
        source: 'quick',
        note: note.trim() || undefined,
      };

      // データベースに保存
      saveIntakeLog(newLog);
      
      // ストアに追加
      addIntakeLog(newLog);

      // 成功フィードバック
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // 閉じるアニメーション
      handleClose();
      
    } catch (error) {
      console.error('Failed to add water intake:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('エラー', '水分記録の保存に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const todayTotal = getTodayTotal();
  const goal = dailyGoal?.targetMl || 0;
  const progress = goal > 0 ? Math.min(todayTotal / goal, 1) : 0;
  const remaining = Math.max(goal - todayTotal, 0);

  return (
    <View style={styles.container}>
      {/* 背景オーバーレイ */}
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: fadeAnim }
        ]}
      >
        <TouchableOpacity 
          style={styles.overlayTouchable}
          onPress={handleClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* モーダルコンテンツ */}
      <Animated.View
        style={[
          styles.modalContent,
          {
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ],
            opacity: fadeAnim,
          }
        ]}
      >
        <Svg style={styles.backgroundGradient} width="100%" height="100%">
          <Defs>
            <LinearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#E0F2FE" />
              <Stop offset="25%" stopColor="#BAE6FD" />
              <Stop offset="50%" stopColor="#7DD3FC" />
              <Stop offset="75%" stopColor="#38BDF8" />
              <Stop offset="100%" stopColor="#0EA5E9" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#waterGradient)" />
        </Svg>
        
        <WaterBubbles />
        
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={handleClose}
            >
              <FontAwesome5 name="times" size={20} color="#0369A1" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>水分を追加</Text>
            <View style={styles.placeholder} />
          </View>
        </SafeAreaView>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* 進捗表示 */}
          <Animated.View 
            style={[
              styles.progressCard,
              {
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
              }
            ]}
          >
            <Text style={styles.progressTitle}>今日の進捗</Text>
            <View style={styles.progressRow}>
              <Text style={styles.progressAmount}>
                {formatVolume(todayTotal, settings.units)}
              </Text>
              <Text style={styles.progressGoal}>
                / {formatVolume(goal, settings.units)}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min(progress * 100, 100)}%` }
                ]} 
              />
            </View>
            {remaining > 0 && (
              <Text style={styles.remainingText}>
                あと {formatVolume(remaining, settings.units)} で目標達成！
              </Text>
            )}
          </Animated.View>

          {/* プリセットボタン */}
          <Animated.View 
            style={[
              styles.section,
              {
                transform: [{ translateY: slideAnim }],
                opacity: fadeAnim,
              }
            ]}
          >
            <Text style={styles.sectionTitle}>素早く追加</Text>
            <View style={styles.presetGrid}>
              {presetAmounts.map((amount, index) => (
                <Animated.View
                  key={amount}
                  style={{
                    transform: [
                      { 
                        translateY: slideAnim.interpolate({
                          inputRange: [0, screenHeight],
                          outputRange: [0, 50 + index * 20],
                        })
                      }
                    ],
                    opacity: fadeAnim,
                  }}
                >
                  <TouchableOpacity
                    style={[
                      styles.presetButton,
                      isSubmitting && styles.disabledButton
                    ]}
                    onPress={() => handlePresetPress(amount)}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.presetButtonText}>
                      +{formatVolume(amount, settings.units)}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* カスタム入力 */}
          <Animated.View 
            style={[
              styles.section,
              {
                transform: [{ translateY: slideAnim }],
                opacity: fadeAnim,
              }
            ]}
          >
            <Text style={styles.sectionTitle}>カスタム量</Text>
            <View style={styles.customInputContainer}>
              <TextInput
                style={styles.customInput}
                value={customAmount}
                onChangeText={setCustomAmount}
                placeholder="量を入力"
                keyboardType="numeric"
                editable={!isSubmitting}
              />
              <Text style={styles.unitLabel}>
                {settings.units === 'oz' ? 'オンス' : 'ミリリットル'}
              </Text>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!customAmount || isSubmitting) && styles.disabledButton
                ]}
                onPress={handleCustomSubmit}
                disabled={!customAmount || isSubmitting}
              >
                <Text style={styles.submitButtonText}>追加</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* メモ入力 */}
          <Animated.View 
            style={[
              styles.section,
              {
                transform: [{ translateY: slideAnim }],
                opacity: fadeAnim,
              }
            ]}
          >
            <Text style={styles.sectionTitle}>メモ（任意）</Text>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="例：朝食後、運動後など"
              multiline
              numberOfLines={3}
              editable={!isSubmitting}
            />
          </Animated.View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouchable: {
    flex: 1,
  },
  modalContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#E0F2FE',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0369A1',
    letterSpacing: -0.5,
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  progressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: RADIUS.card,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0369A1',
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  progressAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: -1,
  },
  progressGoal: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0369A1',
    marginLeft: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(14, 165, 233, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0EA5E9',
    borderRadius: 4,
  },
  remainingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0284C7',
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  presetButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: RADIUS.button,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 12,
    width: (screenWidth - 72) / 2,
    alignItems: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  presetButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0284C7',
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: RADIUS.input,
    paddingHorizontal: 16,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  customInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#0369A1',
    paddingVertical: 16,
  },
  unitLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0284C7',
    marginRight: 12,
  },
  submitButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: RADIUS.button,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  noteInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: RADIUS.input,
    padding: 16,
    fontSize: 16,
    color: '#0369A1',
    textAlignVertical: 'top',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
