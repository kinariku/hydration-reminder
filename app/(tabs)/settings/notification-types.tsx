import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SettingsDetailTemplate } from '../../../components/SettingsDetailTemplate';
import { commonStyles, DESIGN } from '../../../constants/design';
import { useHydrationStore } from '../../../stores/hydrationStore';

export default function NotificationTypesScreen() {
  const router = useRouter();
  const { settings, setSettings } = useHydrationStore();
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // 通知の種類設定
  const [enableMorningNotification, setEnableMorningNotification] = useState(
    (settings as any)?.enableMorningNotification ?? true
  );
  const [enableReminderNotification, setEnableReminderNotification] = useState(
    (settings as any)?.enableReminderNotification ?? true
  );
  const [enableSnoozeNotification, setEnableSnoozeNotification] = useState(
    (settings as any)?.enableSnoozeNotification ?? true
  );

  // 変更検知
  useEffect(() => {
    const morningChanged = enableMorningNotification !== ((settings as any)?.enableMorningNotification ?? true);
    const reminderChanged = enableReminderNotification !== ((settings as any)?.enableReminderNotification ?? true);
    const snoozeChanged = enableSnoozeNotification !== ((settings as any)?.enableSnoozeNotification ?? true);
    
    setHasChanges(morningChanged || reminderChanged || snoozeChanged);
  }, [enableMorningNotification, enableReminderNotification, enableSnoozeNotification, settings]);

  const handleSave = async () => {
    if (!hasChanges) return;
    
    setIsLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      setSettings({
        ...settings,
        enableMorningNotification,
        enableReminderNotification,
        enableSnoozeNotification,
      } as any);
      
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save notification types:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNotification = (type: 'morning' | 'reminder' | 'snooze') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    switch (type) {
      case 'morning':
        setEnableMorningNotification(!enableMorningNotification);
        break;
      case 'reminder':
        setEnableReminderNotification(!enableReminderNotification);
        break;
      case 'snooze':
        setEnableSnoozeNotification(!enableSnoozeNotification);
        break;
    }
  };

  return (
    <SettingsDetailTemplate
      title="通知の種類"
      onBackPress={() => router.push("/(tabs)/settings")}
    >
      <View style={commonStyles.inputGroup}>
        <Text style={commonStyles.label}>有効にする通知の種類</Text>
        <Text style={commonStyles.description}>
          必要な通知の種類を選択してください
        </Text>
      </View>

      <View style={[commonStyles.infoCard, { marginBottom: 24 }]}>
        <View style={styles.toggleItem}>
          <View style={styles.toggleLeft}>
            <FontAwesome5 name="sun" size={20} color="#0EA5E9" style={styles.toggleIcon} />
            <View>
              <Text style={styles.toggleLabel}>朝の目覚め通知</Text>
              <Text style={styles.toggleDescription}>起床時間に水分補給を促す通知</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[commonStyles.toggle, enableMorningNotification && commonStyles.toggleActive]}
            onPress={() => toggleNotification('morning')}
          >
            <View style={[commonStyles.toggleThumb, enableMorningNotification && commonStyles.toggleThumbActive]} />
          </TouchableOpacity>
        </View>

        <View style={styles.toggleItem}>
          <View style={styles.toggleLeft}>
            <FontAwesome5 name="clock" size={20} color="#0EA5E9" style={styles.toggleIcon} />
            <View>
              <Text style={styles.toggleLabel}>リマインダー通知</Text>
              <Text style={styles.toggleDescription}>定期的な水分補給を促す通知</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[commonStyles.toggle, enableReminderNotification && commonStyles.toggleActive]}
            onPress={() => toggleNotification('reminder')}
          >
            <View style={[commonStyles.toggleThumb, enableReminderNotification && commonStyles.toggleThumbActive]} />
          </TouchableOpacity>
        </View>

        <View style={[styles.toggleItem, styles.lastToggleItem]}>
          <View style={styles.toggleLeft}>
            <FontAwesome5 name="bell-slash" size={20} color="#0EA5E9" style={styles.toggleIcon} />
            <View>
              <Text style={styles.toggleLabel}>スヌーズ通知</Text>
              <Text style={styles.toggleDescription}>スヌーズ後の再通知</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[commonStyles.toggle, enableSnoozeNotification && commonStyles.toggleActive]}
            onPress={() => toggleNotification('snooze')}
          >
            <View style={[commonStyles.toggleThumb, enableSnoozeNotification && commonStyles.toggleThumbActive]} />
          </TouchableOpacity>
        </View>
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
  toggleIcon: {
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
