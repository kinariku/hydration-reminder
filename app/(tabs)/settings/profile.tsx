import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { saveUserProfile } from '../../../lib/database';
import { useHydrationStore } from '../../../stores/hydrationStore';

export default function ProfileSettingsScreen() {
  const { userProfile, setUserProfile } = useHydrationStore();
  
  const [weight, setWeight] = useState(userProfile?.weightKg?.toString() || '');
  const [height, setHeight] = useState(userProfile?.heightCm?.toString() || '');
  const [sex, setSex] = useState<'male' | 'female' | 'other'>(userProfile?.sex || 'male');
  const [activityLevel, setActivityLevel] = useState<'low' | 'medium' | 'high'>(userProfile?.activityLevel || 'medium');
  const [wakeTime, setWakeTime] = useState(userProfile?.wakeTime || '07:00');
  const [sleepTime, setSleepTime] = useState(userProfile?.sleepTime || '23:00');
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // 変更検知
  useEffect(() => {
    if (!userProfile) return;
    
    const hasProfileChanges = 
      weight !== userProfile.weightKg?.toString() ||
      height !== userProfile.heightCm?.toString() ||
      sex !== userProfile.sex ||
      activityLevel !== userProfile.activityLevel ||
      wakeTime !== userProfile.wakeTime ||
      sleepTime !== userProfile.sleepTime;
    
    setHasChanges(hasProfileChanges);
  }, [weight, height, sex, activityLevel, wakeTime, sleepTime, userProfile]);

  // 保存関数
  const handleSave = async () => {
    if (!userProfile || !weight || isNaN(Number(weight)) || Number(weight) <= 0) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    try {
      const updatedProfile = {
        ...userProfile,
        weightKg: Number(weight),
        heightCm: Number(height),
        sex,
        activityLevel,
        wakeTime,
        sleepTime,
      };

      await saveUserProfile(updatedProfile);
      setUserProfile(updatedProfile);
      setHasChanges(false);
      console.log('Profile saved successfully');
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsLoading(false);
    }
  };



  // 性別選択のオプション
  const sexOptions = [
    { label: '男性', value: 'male', icon: '👨' },
    { label: '女性', value: 'female', icon: '👩' },
    { label: 'その他', value: 'other', icon: '👤' },
  ];

  // 活動レベル選択のオプション
  const activityOptions = [
    { label: '低い', value: 'low', description: 'デスクワーク中心', icon: '🪑' },
    { label: '中程度', value: 'medium', description: '適度な運動', icon: '🚶' },
    { label: '高い', value: 'high', description: '激しい運動', icon: '🏃' },
  ];

  return (
    <View style={styles.container}>
      <Svg style={styles.backgroundGradient} width="100%" height="100%">
        <Defs>
          <LinearGradient id="profileGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#E0F2FE" />
            <Stop offset="25%" stopColor="#BAE6FD" />
            <Stop offset="50%" stopColor="#7DD3FC" />
            <Stop offset="75%" stopColor="#38BDF8" />
            <Stop offset="100%" stopColor="#0EA5E9" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#profileGradient)" />
      </Svg>
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.headerSection}>
          <View style={styles.titleContainer}>
            <FontAwesome5 name="user-circle" size={28} color="#0EA5E9" />
            <Text style={styles.appTitle}>プロフィール設定</Text>
          </View>
        </View>
      </SafeAreaView>
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        {/* 体重入力 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>体重 (kg) *</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              placeholder="70"
              keyboardType="numeric"
              maxLength={3}
            />
            <Text style={styles.unit}>kg</Text>
          </View>
        </View>

        {/* 身長入力 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>身長 (cm) - 任意</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              placeholder="170"
              keyboardType="numeric"
              maxLength={3}
            />
            <Text style={styles.unit}>cm</Text>
          </View>
        </View>

        {/* 性別選択 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>性別</Text>
          <View style={styles.cardContainer}>
            {sexOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sexCard,
                  sex === option.value && styles.sexCardSelected
                ]}
                onPress={() => setSex(option.value as 'male' | 'female' | 'other')}
              >
                <Text style={styles.sexIcon}>{option.icon}</Text>
                <Text style={[
                  styles.sexLabel,
                  sex === option.value && styles.sexLabelSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 活動レベル選択 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>活動レベル</Text>
          <View style={styles.activityContainer}>
            {activityOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.activityCard,
                  activityLevel === option.value && styles.activityCardSelected
                ]}
                onPress={() => setActivityLevel(option.value as 'low' | 'medium' | 'high')}
              >
                <Text style={styles.activityIcon}>{option.icon}</Text>
                <Text style={[
                  styles.activityLabel,
                  activityLevel === option.value && styles.activityLabelSelected
                ]}>
                  {option.label}
                </Text>
                <Text style={[
                  styles.activityDescription,
                  activityLevel === option.value && styles.activityDescriptionSelected
                ]}>
                  {option.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 保存ボタン */}
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              !hasChanges && styles.saveButtonDisabled
            ]}
            onPress={handleSave}
            disabled={!hasChanges || isLoading}
          >
            <Text style={[
              styles.saveButtonText,
              !hasChanges && styles.saveButtonTextDisabled
            ]}>
              {isLoading ? '保存中...' : '保存'}
            </Text>
          </TouchableOpacity>
        </View>

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
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0369A1',
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 120,
    flexGrow: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0369A1',
    fontWeight: '600',
  },
  unit: {
    fontSize: 16,
    color: '#0284C7',
    marginLeft: 8,
    fontWeight: '600',
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  sexCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  sexCardSelected: {
    borderColor: '#0EA5E9',
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
  },
  sexIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  sexLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0369A1',
  },
  sexLabelSelected: {
    color: '#0EA5E9',
  },
  activityContainer: {
    gap: 12,
  },
  activityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  activityCardSelected: {
    borderColor: '#0EA5E9',
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
  },
  activityIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  activityLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0369A1',
    flex: 1,
  },
  activityLabelSelected: {
    color: '#0EA5E9',
  },
  activityDescription: {
    fontSize: 14,
    color: '#0284C7',
    fontWeight: '500',
  },
  activityDescriptionSelected: {
    color: '#0EA5E9',
  },
  saveButtonContainer: {
    marginTop: 32,
  },
  saveButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 24,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(14, 165, 233, 0.3)',
    shadowOpacity: 0.1,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  saveButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
});
