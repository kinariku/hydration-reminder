import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SettingsDetailTemplate } from '../../../components/SettingsDetailTemplate';
import { commonStyles } from '../../../constants/design';
import { saveUserProfile } from '../../../lib/database';
import { useHydrationStore } from '../../../stores/hydrationStore';

export default function SexSettingsScreen() {
  const router = useRouter();
  const { userProfile, setUserProfile } = useHydrationStore();
  const [sex, setSex] = useState<'male' | 'female' | 'other'>(userProfile?.sex || 'male');
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // 性別選択のオプション
  const sexOptions = [
    { label: '男性', value: 'male', icon: '👨' },
    { label: '女性', value: 'female', icon: '👩' },
    { label: 'その他', value: 'other', icon: '🧑' },
  ];

  // 変更検知
  useEffect(() => {
    setHasChanges(sex !== userProfile?.sex);
  }, [sex, userProfile?.sex]);

  // 保存関数
  const handleSave = async () => {
    if (!userProfile) return;

    setIsLoading(true);
    try {
      const updatedProfile = {
        ...userProfile,
        sex,
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
      title="性別設定"
      onBackPress={() => router.back()}
    >
      <View style={commonStyles.inputGroup}>
        <Text style={commonStyles.label}>性別</Text>
        <View style={styles.cardContainer}>
          {sexOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                commonStyles.optionButton,
                sex === option.value && commonStyles.optionButtonSelected
              ]}
              onPress={() => setSex(option.value as 'male' | 'female' | 'other')}
            >
              <Text style={styles.sexIcon}>{option.icon}</Text>
              <Text style={[
                commonStyles.optionText,
                sex === option.value && commonStyles.optionTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={commonStyles.description}>
          水分摂取量の計算に使用されます
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

const styles = {
  cardContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    gap: 12,
  },
  sexIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
};