import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SettingsDetailTemplate } from '../../../components/SettingsDetailTemplate';
import { commonStyles, DESIGN } from '../../../constants/design';
import { saveUserProfile } from '../../../lib/database';
import { useHydrationStore } from '../../../stores/hydrationStore';

export default function WeightSettingsScreen() {
  const router = useRouter();
  const { userProfile, setUserProfile } = useHydrationStore();
  const [weight, setWeight] = useState(userProfile?.weightKg?.toString() || '');
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // 変更検知
  useEffect(() => {
    if (!userProfile) return;
    
    const hasWeightChanges = weight !== userProfile.weightKg?.toString();
    setHasChanges(hasWeightChanges);
  }, [weight, userProfile]);

  // 保存関数
  const handleSave = async () => {
    if (!userProfile || !weight || isNaN(Number(weight)) || Number(weight) <= 0) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    try {
      const updatedProfile = {
        ...userProfile,
        weightKg: Number(weight),
      };

      await saveUserProfile(updatedProfile);
      setUserProfile(updatedProfile);
      setHasChanges(false);
      console.log('Weight saved successfully');
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SettingsDetailTemplate
      title="体重設定"
      onBackPress={() => router.push("/(tabs)/settings")}
    >
      <View style={commonStyles.inputGroup}>
        <Text style={commonStyles.label}>体重 (kg) *</Text>
        <View style={commonStyles.inputContainer}>
          <TextInput
            style={commonStyles.input}
            value={weight}
            onChangeText={setWeight}
            placeholder="70"
            keyboardType="numeric"
            maxLength={3}
            placeholderTextColor={DESIGN.colors.secondary}
          />
          <Text style={commonStyles.unit}>kg</Text>
        </View>
        <Text style={commonStyles.description}>
          正確な水分摂取量を計算するために必要です
        </Text>
      </View>

      <TouchableOpacity
        style={[commonStyles.saveButton, !hasChanges && commonStyles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={!hasChanges || isLoading}
        activeOpacity={0.8}
      >
        <Text style={[commonStyles.saveButtonText, !hasChanges && commonStyles.saveButtonTextDisabled]}>
          {isLoading ? '保存中...' : '保存'}
        </Text>
      </TouchableOpacity>
    </SettingsDetailTemplate>
  );
}

// 共通デザインを使用するため、個別のスタイルは不要
