import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SettingsDetailTemplate } from '../../../components/SettingsDetailTemplate';
import { commonStyles, DESIGN } from '../../../constants/design';
import { saveUserProfile } from '../../../lib/database';
import { useHydrationStore } from '../../../stores/hydrationStore';

export default function HeightSettingsScreen() {
  const router = useRouter();
  const { userProfile, setUserProfile } = useHydrationStore();
  const [height, setHeight] = useState(userProfile?.heightCm?.toString() || '');
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // 変更検知
  useEffect(() => {
    const currentHeight = userProfile?.heightCm?.toString() || '';
    setHasChanges(height !== currentHeight && height.trim() !== '');
  }, [height, userProfile?.heightCm]);

  // 保存関数
  const handleSave = async () => {
    if (!userProfile) return;

    const heightValue = parseInt(height);
    if (isNaN(heightValue) || heightValue <= 0) {
      return;
    }

    setIsLoading(true);
    try {
      const updatedProfile = {
        ...userProfile,
        heightCm: heightValue,
      };
      await saveUserProfile(updatedProfile);
      setUserProfile(updatedProfile);
      setHasChanges(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SettingsDetailTemplate
      title="身長設定"
      onBackPress={() => router.back()}
    >
      <View style={commonStyles.inputGroup}>
        <Text style={commonStyles.label}>身長 (cm) - 任意</Text>
        <View style={commonStyles.inputContainer}>
          <TextInput
            style={commonStyles.input}
            value={height}
            onChangeText={setHeight}
            placeholder="170"
            keyboardType="numeric"
            maxLength={3}
            placeholderTextColor={DESIGN.colors.secondary}
          />
          <Text style={commonStyles.unit}>cm</Text>
        </View>
        <Text style={commonStyles.description}>
          より正確な水分摂取量の計算に使用されます（任意）
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