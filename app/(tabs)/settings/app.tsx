import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { CommonHeader } from '../../../components/common-header';
import { formatVolume } from '../../../lib/unitConverter';
import { useHydrationStore } from '../../../stores/hydrationStore';

// プリセット選択肢（一般的な容器の容量）
const PRESET_OPTIONS = [
  { id: 'small', name: '一口分', value: 100 },
  { id: 'cup', name: 'カップ1杯', value: 150 },
  { id: 'glass', name: 'グラス1杯', value: 200 },
  { id: 'mug', name: 'マグカップ1杯', value: 250 },
  { id: 'jockey', name: 'ジョッキ1杯', value: 400 },
  { id: 'bottle', name: 'ペットボトル1本', value: 500 },
];

export default function AppSettingsScreen() {
  const { settings, setSettings } = useHydrationStore();
  const [selectedPresets, setSelectedPresets] = useState<Set<string>>(new Set());

  // 現在の設定を反映
  useEffect(() => {
    const current = new Set<string>();
    settings.presetMl.forEach(preset => {
      const option = PRESET_OPTIONS.find(opt => opt.value === preset);
      if (option) {
        current.add(option.id);
      }
    });
    setSelectedPresets(current);
  }, [settings.presetMl]);

  // プリセット選択
  const togglePreset = (presetId: string) => {
    const newSelected = new Set(selectedPresets);
    if (newSelected.has(presetId)) {
      newSelected.delete(presetId);
    } else {
      newSelected.add(presetId);
    }
    setSelectedPresets(newSelected);
    
    // 自動保存
    const values = Array.from(newSelected)
      .map(id => PRESET_OPTIONS.find(opt => opt.id === id)?.value)
      .filter(val => val !== undefined)
      .sort((a, b) => a - b);
    
    setSettings({ presetMl: values });
  };

  // 単位変更
  const handleUnitChange = (unit: 'ml' | 'oz') => {
    setSettings({ units: unit });
  };

  return (
    <View style={styles.container}>
      <CommonHeader title="アプリ設定" />
      
      <ScrollView style={styles.content}>
        {/* 単位設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>表示設定</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>容量の単位</Text>
            <View style={styles.unitSpacing} />
            <View style={styles.unitOptions}>
              <TouchableOpacity
                style={[
                  styles.unitOption,
                  settings.units === 'ml' && styles.unitOptionSelected
                ]}
                onPress={() => handleUnitChange('ml')}
              >
                <Text style={[
                  styles.unitOptionText,
                  settings.units === 'ml' && styles.unitOptionTextSelected
                ]}>
                  ミリリットル (ml)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.unitOption,
                  settings.units === 'oz' && styles.unitOptionSelected
                ]}
                onPress={() => handleUnitChange('oz')}
              >
                <Text style={[
                  styles.unitOptionText,
                  settings.units === 'oz' && styles.unitOptionTextSelected
                ]}>
                  オンス (oz)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* クイックボタン設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>クイックボタン</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingDescription}>
              ホーム画面に表示する水分量ボタンを選択してください
            </Text>
            <View style={styles.presetGrid}>
              {PRESET_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.presetButton,
                    selectedPresets.has(option.id) && styles.presetButtonSelected
                  ]}
                  onPress={() => togglePreset(option.id)}
                >
                  <View style={styles.presetContent}>
                    <View style={styles.presetTextContainer}>
                      <Text style={[
                        styles.presetButtonText,
                        selectedPresets.has(option.id) && styles.presetButtonTextSelected
                      ]}>
                        {option.name}
                      </Text>
                      <Text style={[
                        styles.presetButtonValue,
                        selectedPresets.has(option.id) && styles.presetButtonValueSelected
                      ]}>
                        {formatVolume(option.value, settings.units)}
                      </Text>
                    </View>
                    <View style={[
                      styles.checkbox,
                      selectedPresets.has(option.id) && styles.checkboxSelected
                    ]}>
                      {selectedPresets.has(option.id) && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.selectedCount}>
              選択済み: {selectedPresets.size}個のボタン
            </Text>
          </View>
        </View>

        {/* プライバシー設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>プライバシー</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingRow}>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>使用データの送信</Text>
                <Text style={styles.settingDescription}>
                  アプリの改善のために匿名化されたデータを送信します
                </Text>
              </View>
              <Switch
                value={settings.analyticsOptIn}
                onValueChange={(value) => setSettings({ analyticsOptIn: value })}
                trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                thumbColor={settings.analyticsOptIn ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  settingItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingContent: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
  unitOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  unitOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    minHeight: 44,
  },
  unitOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  unitOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  unitOptionTextSelected: {
    color: '#007AFF',
  },
  unitSpacing: {
    height: 6,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  presetButton: {
    width: '48%',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  presetButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  presetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  presetButtonTextSelected: {
    color: '#007AFF',
  },
  presetButtonValue: {
    fontSize: 12,
    color: '#8E8E93',
    flexWrap: 'wrap',
  },
  presetButtonValueSelected: {
    color: '#007AFF',
  },
  presetContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  presetTextContainer: {
    flex: 1,
    flexWrap: 'wrap',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  checkboxSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  selectedCount: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
    fontWeight: '500',
  },
});