import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Switch, Text, TouchableOpacity, View } from 'react-native';
import { SettingsDetailTemplate } from '../../../components/SettingsDetailTemplate';
import { commonStyles, DESIGN } from '../../../constants/design';
import { saveSettings } from '../../../lib/database';
import { updateNotificationHandler } from '../../../lib/notifications';
import { useHydrationStore } from '../../../stores/hydrationStore';

export default function NotificationSoundScreen() {
  const router = useRouter();
  const { settings, setSettings } = useHydrationStore();
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // 通知音・振動設定
  const [notificationSound, setNotificationSound] = useState(
    (settings as any)?.notificationSound ?? true
  );
  const [notificationVibration, setNotificationVibration] = useState(
    (settings as any)?.notificationVibration ?? true
  );

  // 変更検知
  useEffect(() => {
    const soundChanged = notificationSound !== ((settings as any)?.notificationSound ?? true);
    const vibrationChanged = notificationVibration !== ((settings as any)?.notificationVibration ?? true);
    
    setHasChanges(soundChanged || vibrationChanged);
  }, [notificationSound, notificationVibration, settings]);

  const handleSave = async () => {
    if (!hasChanges) return;
    
    setIsLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const updatedSettings = {
        ...settings,
        notificationSound,
        notificationVibration,
      };
      
      await saveSettings(updatedSettings);
      setSettings(updatedSettings);
      await updateNotificationHandler(); // 通知ハンドラーを更新
      setHasChanges(false);
      console.log('Notification sound settings saved successfully');
    } catch (error) {
      console.error('Failed to save notification sound settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSound = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotificationSound(value);
  };

  const toggleVibration = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotificationVibration(value);
  };

  return (
    <SettingsDetailTemplate
      title="通知音・振動"
      onBackPress={() => router.back()}
    >
      <View style={[commonStyles.infoCard, { marginBottom: 24, paddingVertical: 0 }]}>
        <View style={styles.toggleItem}>
          <View style={styles.toggleLeft}>
            <View style={styles.iconContainer}>
              <FontAwesome5 name="volume-up" size={20} color="#0EA5E9" />
            </View>
            <View>
              <Text style={styles.toggleLabel}>通知音</Text>
              <Text style={styles.toggleDescription}>通知時に音を鳴らす</Text>
            </View>
          </View>
          <Switch
            value={notificationSound}
            onValueChange={toggleSound}
            trackColor={{ false: '#E5E7EB', true: '#0EA5E9' }}
            thumbColor={notificationSound ? '#FFFFFF' : '#F3F4F6'}
            ios_backgroundColor="#E5E7EB"
          />
        </View>

        <View style={[styles.toggleItem, styles.lastToggleItem]}>
          <View style={styles.toggleLeft}>
            <View style={styles.iconContainer}>
              <FontAwesome5 name="mobile-alt" size={20} color="#0EA5E9" />
            </View>
            <View>
              <Text style={styles.toggleLabel}>バイブレーション</Text>
              <Text style={styles.toggleDescription}>通知時に振動する</Text>
            </View>
          </View>
          <Switch
            value={notificationVibration}
            onValueChange={toggleVibration}
            trackColor={{ false: '#E5E7EB', true: '#0EA5E9' }}
            thumbColor={notificationVibration ? '#FFFFFF' : '#F3F4F6'}
            ios_backgroundColor="#E5E7EB"
          />
        </View>
      </View>

      <View style={[commonStyles.infoCard, { marginBottom: 24 }]}>
        <Text style={commonStyles.infoTitle}>設定について</Text>
        <Text style={commonStyles.infoText}>
          • 通知音を無効にしても、システムの通知音設定は影響を受けません{'\n'}
          • バイブレーションは、デバイスの設定でバイブレーションが有効になっている場合のみ動作します{'\n'}
          • 両方を無効にした場合、通知は画面に表示されるのみになります
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  lastToggleItem: {
    borderBottomWidth: 0,
  },
  toggleLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: DESIGN.colors.text,
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 14,
    color: DESIGN.colors.secondary,
    lineHeight: 18,
  },
};
