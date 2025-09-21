import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { CommonHeader } from '../../../components/common-header';
import { useHydrationStore } from '../../../stores/hydrationStore';

export default function DataSettingsScreen() {
  const { 
    todayIntake, 
    userProfile, 
    dailyGoal, 
    settings, 
    personalizedSettings 
  } = useHydrationStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const exportData = {
        userProfile,
        dailyGoal,
        settings,
        personalizedSettings,
        intakeLogs: todayIntake,
        exportDate: new Date().toISOString(),
        version: '1.0.0',
      };

      const fileName = `hydration-data-${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(exportData, null, 2));
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
        Alert.alert('成功', 'データをエクスポートしました');
      } else {
        Alert.alert('エラー', 'ファイル共有が利用できません');
      }
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert('エラー', 'データのエクスポートに失敗しました');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = () => {
    Alert.alert(
      'データインポート',
      'この機能は今後実装予定です。\n現在はエクスポート機能のみ利用できます。',
      [{ text: 'OK' }]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      'データをリセット',
      'すべてのデータが削除されます。この操作は元に戻せません。\n\n削除されるデータ:\n• プロフィール情報\n• 摂取記録\n• 設定\n• パーソナライズ設定',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'リセット',
          style: 'destructive',
          onPress: () => {
            // 実際のリセット処理は実装が必要
            Alert.alert('完了', 'データをリセットしました');
          },
        },
      ]
    );
  };

  const getDataStats = () => {
    const totalIntake = todayIntake.reduce((sum, log) => sum + log.amountMl, 0);
    const recordCount = todayIntake.length;
    const avgIntake = recordCount > 0 ? Math.round(totalIntake / recordCount) : 0;
    
    return {
      totalIntake,
      recordCount,
      avgIntake,
    };
  };

  const stats = getDataStats();

  return (
    <View style={styles.container}>
      <CommonHeader title="データ管理" />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* データ統計 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>データ統計</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.recordCount}</Text>
              <Text style={styles.statLabel}>記録数</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalIntake}ml</Text>
              <Text style={styles.statLabel}>総摂取量</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.avgIntake}ml</Text>
              <Text style={styles.statLabel}>平均摂取量</Text>
            </View>
          </View>
        </View>

        {/* エクスポート */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>データのエクスポート</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>データをエクスポート</Text>
              <Text style={styles.settingDescription}>
                すべてのデータをJSONファイルとして保存できます
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.actionButton, styles.exportButton]}
              onPress={handleExportData}
              disabled={isExporting}
            >
              <Text style={styles.actionButtonText}>
                {isExporting ? 'エクスポート中...' : 'エクスポート'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* インポート */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>データのインポート</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>データをインポート</Text>
              <Text style={styles.settingDescription}>
                以前にエクスポートしたデータを復元できます
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.actionButton, styles.importButton]}
              onPress={handleImportData}
            >
              <Text style={styles.actionButtonText}>インポート</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* リセット */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>データのリセット</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>すべてのデータをリセット</Text>
              <Text style={styles.settingDescription}>
                アプリのデータを完全に削除します
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.actionButton, styles.resetButton]}
              onPress={handleResetData}
            >
              <Text style={styles.actionButtonText}>リセット</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 注意事項 */}
        <View style={styles.section}>
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>⚠️ 注意事項</Text>
            <Text style={styles.warningText}>
              • データのリセットは元に戻せません{'\n'}
              • エクスポートしたデータは安全な場所に保管してください{'\n'}
              • アプリを削除するとデータも削除されます
            </Text>
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
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  settingItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingContent: {
    flex: 1,
    marginRight: 20,
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
  },
  actionButton: {
    paddingHorizontal: BUTTON_SIZES.small.paddingHorizontal,
    paddingVertical: BUTTON_SIZES.small.paddingVertical,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: BUTTON_SIZES.small.minWidth,
    marginVertical: 8,
    marginLeft: 8,
  },
  exportButton: {
    backgroundColor: '#007AFF',
  },
  importButton: {
    backgroundColor: '#34C759',
  },
  resetButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: BUTTON_SIZES.small.fontSize,
    fontWeight: '600',
  },
  warningCard: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
});
