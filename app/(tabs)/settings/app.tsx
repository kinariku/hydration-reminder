import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHydrationStore } from '../../../stores/hydrationStore';

export default function AppSettingsScreen() {
  const { settings, setSettings } = useHydrationStore();
  const [isEditingPresets, setIsEditingPresets] = useState(false);
  const [newPresets, setNewPresets] = useState(settings.presetMl.join(', '));

  const handleSavePresets = () => {
    const presets = newPresets
      .split(',')
      .map(p => parseInt(p.trim()))
      .filter(p => !isNaN(p) && p > 0)
      .slice(0, 6); // 最大6個まで

    if (presets.length === 0) {
      Alert.alert('エラー', '有効な数値を入力してください');
      return;
    }

    setSettings({ presetMl: presets });
    setIsEditingPresets(false);
    Alert.alert('完了', 'クイックボタンを更新しました');
  };

  const unitOptions = [
    { label: 'ミリリットル (ml)', value: 'ml' },
    { label: 'オンス (oz)', value: 'oz' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/settings')} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backText}>戻る</Text>
        </TouchableOpacity>
        <Text style={styles.title}>アプリ設定</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* 単位設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>表示設定</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>単位</Text>
            <View style={styles.optionContainer}>
              {unitOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    settings.units === option.value && styles.optionButtonSelected
                  ]}
                  onPress={() => setSettings({ units: option.value as 'ml' | 'oz' })}
                >
                  <Text style={[
                    styles.optionText,
                    settings.units === option.value && styles.optionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* クイックボタン設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>クイックボタン</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingHeader}>
              <Text style={styles.settingLabel}>プリセット量</Text>
              <TouchableOpacity
                onPress={() => setIsEditingPresets(!isEditingPresets)}
                style={styles.editButton}
              >
                <Text style={styles.editButtonText}>
                  {isEditingPresets ? 'キャンセル' : '編集'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {isEditingPresets ? (
              <View>
                <TextInput
                  style={styles.textInput}
                  value={newPresets}
                  onChangeText={setNewPresets}
                  placeholder="100, 200, 300, 500"
                  keyboardType="numeric"
                />
                <Text style={styles.helpText}>
                  カンマ区切りで数値を入力してください（例: 100, 200, 300, 500）
                </Text>
                <TouchableOpacity
                  onPress={handleSavePresets}
                  style={styles.saveButton}
                >
                  <Text style={styles.saveButtonText}>保存</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.presetContainer}>
                {settings.presetMl.map((preset, index) => (
                  <View key={index} style={styles.presetItem}>
                    <Text style={styles.presetText}>{preset}ml</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* プライバシー設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>プライバシー</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.switchContainer}>
              <View style={styles.switchContent}>
                <Text style={styles.settingLabel}>分析データの送信</Text>
                <Text style={styles.settingDescription}>
                  アプリの改善のための匿名データを送信します
                </Text>
              </View>
              <Switch
                value={settings.analyticsOptIn}
                onValueChange={(value) => setSettings({ analyticsOptIn: value })}
              />
            </View>
          </View>
        </View>

        {/* アプリ情報 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>アプリ情報</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>バージョン</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>開発者</Text>
            <Text style={styles.settingValue}>StayHydrated Team</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backIcon: {
    fontSize: 20,
    color: '#007AFF',
    marginRight: 4,
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  settingItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  settingDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  settingValue: {
    fontSize: 16,
    color: '#8E8E93',
  },
  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    minWidth: 120,
  },
  optionButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  optionTextSelected: {
    color: '#007AFF',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F2F2F7',
  },
  editButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 12,
    lineHeight: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  presetContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetItem: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  presetText: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchContent: {
    flex: 1,
    marginRight: 12,
  },
});
