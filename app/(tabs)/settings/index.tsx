import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    AppState,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { MainHeader } from '../../../components/main-header';
import { NotificationStatusCard } from '../../../components/ui/NotificationStatusCard';
import { checkNotificationStatus, openNotificationSettings } from '../../../lib/notifications';
import { formatVolume, getUnitLabel } from '../../../lib/unitConverter';
import { useHydrationStore } from '../../../stores/hydrationStore';

export default function SettingsScreen() {
  const { 
    userProfile, 
    settings, 
    setSettings, 
    dailyGoal,
    notificationPermission,
    setNotificationPermission,
  } = useHydrationStore();

  // 実際の通知権限状態を管理
  const [notificationStatus, setNotificationStatus] = useState({
    isEnabled: false,
    canRequest: false,
    status: 'unknown' as 'granted' | 'denied' | 'undetermined' | 'unknown'
  });

  // デバッグ用：notificationStatusの変更をログ出力
  useEffect(() => {
    console.log('Settings page: notificationStatus changed:', notificationStatus);
  }, [notificationStatus]);

  // 通知権限状態をチェック
  const checkNotificationStatusOnLoad = async () => {
    try {
      console.log('Settings page: Checking notification status...');
      const status = await checkNotificationStatus();
      setNotificationStatus(status);
      console.log('Settings page: Notification status checked:', status);
    } catch (error) {
      console.error('Settings page: Failed to check notification status:', error);
    }
  };

  // iPhone設定を開く
  const handleOpenSettings = async () => {
    try {
      await openNotificationSettings();
    } catch (error) {
      console.error('Failed to open settings:', error);
    }
  };

  // アプリ起動時とフォアグラウンド復帰時に通知権限をチェック
  useEffect(() => {
    checkNotificationStatusOnLoad();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkNotificationStatusOnLoad();
      }
    });

    return () => subscription?.remove();
  }, []);

  const handleEditPress = (categoryId: string) => {
    router.push(`/(tabs)/settings/${categoryId}`);
  };





  return (
    <View style={styles.container}>
      <MainHeader title="設定" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* プロフィール情報 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="person" size={20} color="#007AFF" />
              <Text style={styles.sectionTitle}>プロフィール情報</Text>
            </View>
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
          
          {/* 目標摂取水分量 */}
          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>目標摂取水分量</Text>
              <Text style={styles.goalAmount}>{formatVolume(dailyGoal?.targetMl || 0, settings.units)}</Text>
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
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="notifications" size={20} color="#007AFF" />
              <Text style={styles.sectionTitle}>通知設定</Text>
            </View>
            {notificationStatus.isEnabled && (
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => handleEditPress('notifications')}
              >
                <Text style={styles.editButtonText}>詳細設定</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <NotificationStatusCard 
            isEnabled={notificationStatus.isEnabled}
            onOpenSettings={handleOpenSettings}
            showOpenButton={true}
          />

          {notificationStatus.isEnabled && (
            <View style={styles.infoCard}>
              <View style={styles.infoRowWithBorder}>
                <Text style={styles.infoLabel}>起床・就寝時刻</Text>
                <Text style={styles.infoValue}>
                  {userProfile?.wakeTime || '未設定'} - {userProfile?.sleepTime || '未設定'}
                </Text>
              </View>

              <View style={styles.infoRowWithBorder}>
                <Text style={styles.infoLabel}>スヌーズ時間</Text>
                <Text style={styles.infoValue}>{settings.snoozeMinutes}分</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>通知頻度</Text>
                <Text style={styles.infoValue}>
                  {settings.notificationFrequency === 'high' ? '高' :
                   settings.notificationFrequency === 'medium' ? '中' : '低'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* アプリ設定 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="settings" size={20} color="#007AFF" />
              <Text style={styles.sectionTitle}>アプリ設定</Text>
            </View>
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
              <Text style={styles.infoValue}>{getUnitLabel(settings.units)}</Text>
            </View>
            <View style={styles.infoRowWithBorder}>
              <Text style={styles.infoLabel}>クイックボタン</Text>
              <Text style={[styles.infoValue, styles.presetValue]}>{settings.presetMl.map(preset => formatVolume(preset, settings.units)).join(', ')}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>分析データの送信</Text>
              <Text style={styles.infoValue}>
                {settings.analyticsOptIn ? '有効' : '無効'}
              </Text>
            </View>
          </View>
        </View>


        {/* データ管理 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="server" size={20} color="#007AFF" />
              <Text style={styles.sectionTitle}>データ管理</Text>
            </View>
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
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="information-circle" size={20} color="#007AFF" />
              <Text style={styles.sectionTitle}>アプリ情報</Text>
            </View>
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
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>最終更新</Text>
              <Text style={styles.infoValue}>
                {new Date().toLocaleDateString('ja-JP')}
              </Text>
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
  scrollView: {
    flex: 1,
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
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  presetValue: {
    flex: 1,
    flexWrap: 'wrap',
    textAlign: 'right',
    maxWidth: '50%',
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
    marginTop: 12,
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
