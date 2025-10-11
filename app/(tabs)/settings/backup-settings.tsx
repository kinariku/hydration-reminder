import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SettingsDetailTemplate } from '../../../components/SettingsDetailTemplate';
import { commonStyles, DESIGN } from '../../../constants/design';
import { useHydrationStore } from '../../../stores/hydrationStore';

export default function BackupSettingsScreen() {
  const router = useRouter();
  const { settings, setSettings } = useHydrationStore();
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // データバックアップ設定
  const [enableBackup, setEnableBackup] = useState(
    settings?.enableBackup ?? false
  );

  // 変更検知
  useEffect(() => {
    const backupChanged = enableBackup !== (settings?.enableBackup ?? false);
    setHasChanges(backupChanged);
  }, [enableBackup, settings]);

  const handleSave = async () => {
    if (!hasChanges) return;
    
    setIsLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      setSettings({
        ...settings,
        enableBackup,
      });
      
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save backup settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBackup = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEnableBackup(!enableBackup);
  };

  return (
    <SettingsDetailTemplate
      title="データバックアップ"
      onBackPress={() => router.back()}
    >
      <View style={commonStyles.inputGroup}>
        <Text style={commonStyles.label}>データバックアップの有効化</Text>
        <Text style={commonStyles.description}>
          あなたの水分摂取データをクラウドに自動バックアップします
        </Text>
      </View>

      <View style={[commonStyles.infoCard, { marginBottom: 24 }]}>
        <View style={styles.toggleItem}>
          <View style={styles.toggleLeft}>
            <FontAwesome5 name="cloud-upload-alt" size={24} color="#0EA5E9" style={styles.toggleIcon} />
            <View>
              <Text style={styles.toggleLabel}>自動バックアップ</Text>
              <Text style={styles.toggleDescription}>
                データをクラウドに自動保存
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[commonStyles.toggle, enableBackup && commonStyles.toggleActive]}
            onPress={toggleBackup}
          >
            <View style={[commonStyles.toggleThumb, enableBackup && commonStyles.toggleThumbActive]} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[commonStyles.infoCard, { marginBottom: 24 }]}>
        <Text style={commonStyles.infoTitle}>バックアップについて</Text>
        <Text style={commonStyles.infoText}>
          • 水分摂取の記録、目標設定、プロフィール情報が自動的にバックアップされます{'\n'}
          • デバイスを変更した場合でも、データを復元できます{'\n'}
          • インターネット接続があるときに自動的に同期されます{'\n'}
          • データは暗号化されて安全に保存されます
        </Text>
      </View>

      <View style={[commonStyles.infoCard, { marginBottom: 24 }]}>
        <Text style={commonStyles.infoTitle}>現在の設定</Text>
        <Text style={styles.currentSetting}>
          {enableBackup ? '自動バックアップが有効' : '自動バックアップが無効'} です
        </Text>
      </View>

      <View style={[commonStyles.infoCard, { marginBottom: 24 }]}>
        <Text style={commonStyles.infoTitle}>プライバシーとセキュリティ</Text>
        <Text style={commonStyles.infoText}>
          • バックアップデータは暗号化されて保存されます{'\n'}
          • あなたのデータは他のユーザーと共有されることはありません{'\n'}
          • いつでもバックアップを無効にしたり、データを削除したりできます{'\n'}
          • データの使用目的は水分摂取の記録管理のみです
        </Text>
      </View>

      <View style={[commonStyles.infoCard, { marginBottom: 24 }]}>
        <Text style={commonStyles.infoTitle}>注意事項</Text>
        <Text style={commonStyles.infoText}>
          • バックアップにはインターネット接続が必要です{'\n'}
          • 初回のバックアップには時間がかかる場合があります{'\n'}
          • バックアップが無効の場合、デバイスを紛失するとデータが失われる可能性があります{'\n'}
          • 定期的にバックアップの状態を確認することをお勧めします
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
