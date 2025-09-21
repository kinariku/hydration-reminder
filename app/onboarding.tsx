import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveUserProfile } from '../lib/database';
import { useHydrationStore } from '../stores/hydrationStore';

export default function OnboardingScreen() {
  console.log('OnboardingScreen: Component rendered');
  const { setUserProfile, setOnboarded } = useHydrationStore();
  
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 自動保存機能
  const autoSave = useCallback(async () => {
    if (!weight || isNaN(Number(weight)) || Number(weight) <= 0) return;

    try {
      const profile = {
        id: Date.now().toString(),
        weightKg: Number(weight),
        sex: 'male', // デフォルト値
        heightCm: height ? Number(height) : undefined,
        activityLevel: 'medium', // デフォルト値
        wakeTime: '07:00', // デフォルト値
        sleepTime: '23:00', // デフォルト値
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      await saveUserProfile(profile);
      setUserProfile(profile);
      console.log('Profile auto-saved during onboarding');
    } catch (error) {
      console.error('Auto-save failed during onboarding:', error);
    }
  }, [weight, height, setUserProfile]);

  // デバウンス付き自動保存
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (weight && height) {
        autoSave();
      }
    }, 1000); // 1秒後に自動保存

    return () => clearTimeout(timeoutId);
  }, [weight, height, autoSave]);

  const handleComplete = async () => {
    if (!weight || isNaN(Number(weight)) || Number(weight) <= 0) {
      Alert.alert('エラー', '体重を正しく入力してください');
      return;
    }

    setIsLoading(true);

    try {
      const profile = {
        id: Date.now().toString(),
        weightKg: Number(weight),
        sex: 'male', // デフォルト値
        heightCm: height ? Number(height) : undefined,
        activityLevel: 'medium', // デフォルト値
        wakeTime: '07:00', // デフォルト値
        sleepTime: '23:00', // デフォルト値
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      // Save to database
      await saveUserProfile(profile);
      
      // Update store
      setUserProfile(profile);
      setOnboarded(true);

      // ホーム画面に移動
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to save profile:', error);
      Alert.alert('エラー', 'プロフィールの保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetStorage = async () => {
    try {
      console.log('Resetting storage...');
      await AsyncStorage.clear();
      console.log('Storage cleared successfully');
      Alert.alert('成功', 'ストレージがリセットされました。アプリを再起動してください。');
    } catch (error) {
      console.error('Failed to reset storage:', error);
      Alert.alert('エラー', 'ストレージのリセットに失敗しました');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.content} 
        activeOpacity={1}
        onPress={() => {
          // キーボードを閉じる
          Keyboard.dismiss();
        }}
      >
        <Text style={styles.title}>プロフィール設定</Text>
        <Text style={styles.subtitle}>
          あなたに最適な水分補給目標を計算します
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>体重 (kg) *</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              placeholder="例: 65"
              keyboardType="numeric"
              returnKeyType="next"
              blurOnSubmit={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>身長 (cm)</Text>
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              placeholder="例: 170"
              keyboardType="numeric"
              returnKeyType="done"
              blurOnSubmit={true}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleComplete}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? '設定中...' : '完了'}
          </Text>
        </TouchableOpacity>

        {/* デバッグ用リセットボタン */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetStorage}
        >
          <Text style={styles.resetButtonText}>
            ストレージリセット（デバッグ用）
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  form: {
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#8E8E93',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});