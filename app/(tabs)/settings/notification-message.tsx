import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SettingsDetailTemplate } from '../../../components/SettingsDetailTemplate';
import { commonStyles, DESIGN } from '../../../constants/design';
import { RADIUS } from '../../../constants/radius';
import { useHydrationStore } from '../../../stores/hydrationStore';

const SAMPLE_MESSAGES = [
  '水分補給の時間です！',
  'お水を飲みましょう💧',
  '水分不足にご注意を',
  'リフレッシュタイムです',
  'お疲れ様！水分補給を',
];

export default function NotificationMessageScreen() {
  const router = useRouter();
  const { settings, setSettings } = useHydrationStore();
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // カスタムメッセージ設定
  const [customMessage, setCustomMessage] = useState(
    (settings as any)?.customNotificationMessage || ''
  );

  // 変更検知
  useEffect(() => {
    const messageChanged = customMessage !== ((settings as any)?.customNotificationMessage || '');
    setHasChanges(messageChanged);
  }, [customMessage, settings]);

  const handleSave = async () => {
    if (!hasChanges) return;
    
    setIsLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      setSettings({
        ...settings,
        customNotificationMessage: customMessage,
      } as any);
      
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save custom message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectSampleMessage = (message: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCustomMessage(message);
  };

  const clearMessage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCustomMessage('');
  };

  return (
    <SettingsDetailTemplate
      title="カスタムメッセージ"
      onBackPress={() => router.push("/(tabs)/settings")}
    >
      <View style={commonStyles.inputGroup}>
        <Text style={commonStyles.label}>通知メッセージ</Text>
        <Text style={commonStyles.description}>
          通知に表示するカスタムメッセージを設定できます
        </Text>
      </View>

      <View style={[commonStyles.infoCard, { marginBottom: 24 }]}>
        <Text style={commonStyles.infoTitle}>メッセージを入力</Text>
        <View style={commonStyles.inputContainer}>
          <TextInput
            style={[commonStyles.input, styles.messageInput]}
            value={customMessage}
            onChangeText={setCustomMessage}
            placeholder="例: 水分補給の時間です！"
            placeholderTextColor={DESIGN.colors.secondary}
            multiline
            numberOfLines={3}
            maxLength={100}
          />
        </View>
        <Text style={styles.characterCount}>
          {customMessage.length}/100文字
        </Text>
      </View>

      <View style={[commonStyles.infoCard, { marginBottom: 24 }]}>
        <Text style={commonStyles.infoTitle}>サンプルメッセージ</Text>
        <Text style={commonStyles.description}>
          タップして選択できます
        </Text>
        <View style={styles.sampleContainer}>
          {SAMPLE_MESSAGES.map((message, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.sampleButton,
                customMessage === message && styles.sampleButtonSelected
              ]}
              onPress={() => selectSampleMessage(message)}
            >
              <Text style={[
                styles.sampleText,
                customMessage === message && styles.sampleTextSelected
              ]}>
                {message}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearMessage}
        >
          <FontAwesome5 name="times" size={14} color="#8E8E93" />
          <Text style={styles.clearButtonText}>クリア</Text>
        </TouchableOpacity>
      </View>

      <View style={[commonStyles.infoCard, { marginBottom: 24 }]}>
        <Text style={commonStyles.infoTitle}>設定について</Text>
        <Text style={commonStyles.infoText}>
          • カスタムメッセージを設定すると、デフォルトのメッセージの代わりに表示されます{'\n'}
          • 空欄の場合は、デフォルトのメッセージが使用されます{'\n'}
          • 最大100文字まで入力できます{'\n'}
          • 改行も使用できます
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
  messageInput: {
    minHeight: 80,
    textAlignVertical: 'top' as const,
  },
  characterCount: {
    fontSize: 12,
    color: DESIGN.colors.secondary,
    textAlign: 'right' as const,
    marginTop: 8,
  },
  sampleContainer: {
    marginTop: 16,
  },
  sampleButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.2)',
  },
  sampleButtonSelected: {
    backgroundColor: DESIGN.colors.primary,
    borderColor: DESIGN.colors.primary,
  },
  sampleText: {
    fontSize: 14,
    color: DESIGN.colors.primary,
    textAlign: 'center' as const,
  },
  sampleTextSelected: {
    color: DESIGN.colors.white,
  },
  clearButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: 12,
    paddingVertical: 8,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
  },
};
