import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SettingsDetailTemplate } from '../../../components/SettingsDetailTemplate';
import { commonStyles, DESIGN } from '../../../constants/design';
import { useHydrationStore } from '../../../stores/hydrationStore';

export default function LearningSettingsScreen() {
  const router = useRouter();
  const { settings, setSettings } = useHydrationStore();
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // 学習機能設定
  const [enableLearning, setEnableLearning] = useState(
    settings?.enableLearning ?? false
  );

  // 変更検知
  useEffect(() => {
    const learningChanged = enableLearning !== (settings?.enableLearning ?? false);
    setHasChanges(learningChanged);
  }, [enableLearning, settings]);

  const handleSave = async () => {
    if (!hasChanges) return;
    
    setIsLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      setSettings({
        ...settings,
        enableLearning,
      });
      
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save learning settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLearning = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEnableLearning(!enableLearning);
  };

  return (
    <SettingsDetailTemplate
      title="学習機能"
      onBackPress={() => router.push("/(tabs)/settings")}
    >
      <View style={commonStyles.inputGroup}>
        <Text style={commonStyles.label}>学習機能の有効化</Text>
        <Text style={commonStyles.description}>
          アプリがあなたの水分摂取パターンを学習し、より適切なリマインダーを提供します
        </Text>
      </View>

      <View style={[commonStyles.infoCard, { marginBottom: 24 }]}>
        <View style={styles.toggleItem}>
          <View style={styles.toggleLeft}>
            <FontAwesome5 name="brain" size={24} color="#0EA5E9" style={styles.toggleIcon} />
            <View>
              <Text style={styles.toggleLabel}>学習機能</Text>
              <Text style={styles.toggleDescription}>
                水分摂取パターンを学習して最適化
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[commonStyles.toggle, enableLearning && commonStyles.toggleActive]}
            onPress={toggleLearning}
          >
            <View style={[commonStyles.toggleThumb, enableLearning && commonStyles.toggleThumbActive]} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[commonStyles.infoCard, { marginBottom: 24 }]}>
        <Text style={commonStyles.infoTitle}>学習機能について</Text>
        <Text style={commonStyles.infoText}>
          • あなたの水分摂取パターンを分析し、最適なタイミングでリマインダーを送信します{'\n'}
          • 活動レベルや時間帯に応じて、適切な水分摂取量を提案します{'\n'}
          • 個人の習慣に合わせて、通知頻度やタイミングを自動調整します{'\n'}
          • 学習データはデバイス内に保存され、外部に送信されることはありません
        </Text>
      </View>

      <View style={[commonStyles.infoCard, { marginBottom: 24 }]}>
        <Text style={commonStyles.infoTitle}>現在の設定</Text>
        <Text style={styles.currentSetting}>
          {enableLearning ? '学習機能が有効' : '学習機能が無効'} です
        </Text>
      </View>

      <View style={[commonStyles.infoCard, { marginBottom: 24 }]}>
        <Text style={commonStyles.infoTitle}>プライバシーについて</Text>
        <Text style={commonStyles.infoText}>
          • 学習に使用されるデータは、あなたのデバイス内でのみ処理されます{'\n'}
          • 個人を特定できる情報は収集されません{'\n'}
          • 学習データは他のアプリやサービスと共有されることはありません{'\n'}
          • いつでも学習機能を無効にすることができます
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
  toggleItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 16,
  },
  toggleLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  toggleIcon: {
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: DESIGN.colors.text,
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 14,
    color: DESIGN.colors.secondary,
    lineHeight: 18,
  },
  currentSetting: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: DESIGN.colors.primary,
    textAlign: 'center' as const,
    marginTop: 8,
  },
};
