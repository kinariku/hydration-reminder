import { router } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useHydrationStore } from '../../stores/hydrationStore';

export default function SettingsScreen() {
  const { 
    userProfile, 
    settings, 
    setSettings, 
    personalizedSettings,
    setPersonalizedSettings,
    initializePersonalizedSettings,
    dailyGoal,
    calculateDailyGoal
  } = useHydrationStore();

  const handleEditPress = (categoryId: string) => {
    router.push(`/(tabs)/settings/${categoryId}`);
  };

  const handleNotificationToggle = (value: boolean) => {
    setSettings({ notificationPermission: value });
  };

  const handleAnalyticsToggle = (value: boolean) => {
    setSettings({ analyticsOptIn: value });
  };

  const handleAdaptiveModeToggle = (value: boolean) => {
    if (personalizedSettings) {
      setPersonalizedSettings({
        ...personalizedSettings,
        notificationPattern: {
          ...personalizedSettings.notificationPattern,
          adaptiveMode: value
        }
      });
    }
  };


  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* プロフィール情報 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>👤 プロフィール情報</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => handleEditPress('profile')}
            >
              <Text style={styles.editButtonText}>編集</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRowWithBorder}>
              <Text style={styles.infoLabel}>体重</Text>
              <Text style={styles.infoValue}>{userProfile?.weightKg || '未設定'}kg</Text>
            </View>
            <View style={styles.infoRowWithBorder}>
              <Text style={styles.infoLabel}>身長</Text>
              <Text style={styles.infoValue}>{userProfile?.heightCm || '未設定'}cm</Text>
            </View>
            <View style={styles.infoRowWithBorder}>
              <Text style={styles.infoLabel}>性別</Text>
              <Text style={styles.infoValue}>
                {userProfile?.sex === 'male' ? '男性' : 
                 userProfile?.sex === 'female' ? '女性' : 'その他'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>活動レベル</Text>
              <Text style={styles.infoValue}>
                {userProfile?.activityLevel === 'low' ? '低い' :
                 userProfile?.activityLevel === 'medium' ? '中程度' : '高い'}
              </Text>
            </View>
          </View>
        </View>

        {/* 目標摂取水分量 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💧 目標摂取水分量</Text>
          </View>
          
          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>今日の目標</Text>
              <Text style={styles.goalAmount}>{dailyGoal?.targetMl || 0}ml</Text>
            </View>
            <Text style={styles.goalDescription}>
              体重 {userProfile?.weightKg || 0}kg × 35ml + 活動レベル補正
            </Text>
            <View style={styles.goalBar}>
              <View style={[styles.goalBarFill, { width: '100%' }]} />
            </View>
          </View>
        </View>

        {/* 通知設定 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔔 通知設定</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => handleEditPress('notifications')}
            >
              <Text style={styles.editButtonText}>詳細設定</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoCard}>
            <View style={styles.switchRowWithBorder}>
              <View style={styles.switchContent}>
                <Text style={styles.switchLabel}>通知を有効にする</Text>
                <Text style={styles.switchDescription}>
                  水分補給のリマインダーを受け取ります
                </Text>
              </View>
              <Switch
                value={settings.notificationPermission}
                onValueChange={handleNotificationToggle}
              />
            </View>

            <View style={styles.infoRowWithBorder}>
              <Text style={styles.infoLabel}>起床・就寝時刻</Text>
              <Text style={styles.infoValue}>
                {userProfile?.wakeTime || '未設定'} - {userProfile?.sleepTime || '未設定'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>スヌーズ時間</Text>
              <Text style={styles.infoValue}>{settings.snoozeMinutes}分</Text>
            </View>

            {personalizedSettings && (
              <>
                <View style={styles.infoRowWithBorder}>
                  <Text style={styles.infoLabel}>通知頻度</Text>
                  <Text style={styles.infoValue}>
                    {personalizedSettings.notificationPattern.frequency === 'high' ? '高' :
                     personalizedSettings.notificationPattern.frequency === 'medium' ? '中' : '低'}
                  </Text>
                </View>
                <View style={styles.switchRow}>
                  <View style={styles.switchContent}>
                    <Text style={styles.switchLabel}>学習モード</Text>
                    <Text style={styles.switchDescription}>
                      あなたの行動パターンに基づいて通知時間を自動調整
                    </Text>
                  </View>
                  <Switch
                    value={personalizedSettings.notificationPattern.adaptiveMode}
                    onValueChange={handleAdaptiveModeToggle}
                  />
                </View>
              </>
            )}
          </View>
        </View>

        {/* アプリ設定 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⚙️ アプリ設定</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => handleEditPress('app')}
            >
              <Text style={styles.editButtonText}>詳細設定</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRowWithBorder}>
              <Text style={styles.infoLabel}>単位</Text>
              <Text style={styles.infoValue}>{settings.units === 'ml' ? 'ミリリットル (ml)' : 'オンス (oz)'}</Text>
            </View>
            <View style={styles.infoRowWithBorder}>
              <Text style={styles.infoLabel}>クイックボタン</Text>
              <Text style={styles.infoValue}>{settings.presetMl.join(', ')}ml</Text>
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchContent}>
                <Text style={styles.switchLabel}>分析データの送信</Text>
                <Text style={styles.switchDescription}>
                  アプリの改善のための匿名データを送信します
                </Text>
              </View>
              <Switch
                value={settings.analyticsOptIn}
                onValueChange={handleAnalyticsToggle}
              />
            </View>
          </View>
        </View>


        {/* データ管理 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💾 データ管理</Text>
          </View>

          <View style={styles.infoCard}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleEditPress('data')}
            >
              <Text style={styles.actionButtonText}>データのエクスポート・管理</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* アプリ情報 */}
        <View style={styles.appInfoSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ℹ️ アプリ情報</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRowWithBorder}>
              <Text style={styles.infoLabel}>アプリ名</Text>
              <Text style={styles.infoValue}>StayHydrated</Text>
            </View>
            <View style={styles.infoRowWithBorder}>
              <Text style={styles.infoLabel}>バージョン</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoRowWithBorder}>
              <Text style={styles.infoLabel}>開発者</Text>
              <Text style={styles.infoValue}>StayHydrated Team</Text>
            </View>
            <View style={styles.infoRowWithBorder}>
              <Text style={styles.infoLabel}>プラットフォーム</Text>
              <Text style={styles.infoValue}>React Native + Expo</Text>
            </View>
            {personalizedSettings && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>最終更新</Text>
                <Text style={styles.infoValue}>
                  {new Date(personalizedSettings.learningData.lastUpdated).toLocaleDateString('ja-JP')}
                </Text>
              </View>
            )}
          </View>
        </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  section: {
    marginBottom: 20,
  },
  appInfoSection: {
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 0,
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoRowWithBorder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  infoLabel: {
    fontSize: 16,
    color: '#8E8E93',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
    textAlign: 'right',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchRowWithBorder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  switchContent: {
    flex: 1,
    marginRight: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
    marginTop: 2,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  actionButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    marginVertical: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statusCard: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  goalCard: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginTop: 4,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
  goalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  goalDescription: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  goalBar: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  goalBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
});