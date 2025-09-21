import React, { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MainHeader } from '../../components/main-header';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { QuickAddButton } from '../../components/ui/QuickAddButton';
import { getIntakeLogs, saveIntakeLog } from '../../lib/database';
import { getLocalDateString } from '../../lib/date';
import { requestNotificationPermission, scheduleButtonTriggeredReminders, scheduleNextReminder } from '../../lib/notifications';
import { formatVolume } from '../../lib/unitConverter';
import { useHydrationStore } from '../../stores/hydrationStore';

export default function HomeScreen() {
  const {
    userProfile,
    dailyGoal,
    todayIntake,
    getTodayTotal,
    getTodayProgress,
    setTodayIntake,
    addIntakeLog: addLog,
    settings,
    notificationPermission,
    setNotificationPermission,
  } = useHydrationStore();

  const todayTotal = getTodayTotal();
  const progress = getTodayProgress();
  const remaining = Math.max(0, (dailyGoal?.targetMl || 0) - todayTotal);

  const stats = useMemo(() => {
    const totalIntake = todayIntake.reduce((sum, log) => sum + log.amountMl, 0);
    const recordCount = todayIntake.length;
    const avgIntake = recordCount > 0 ? Math.round(totalIntake / recordCount) : 0;
    return { totalIntake, recordCount, avgIntake };
  }, [todayIntake]); // todayIntakeが変更された時のみ再計算

  // 通知権限の確認と初期通知のスケジュール
  useEffect(() => {
    const initializeNotifications = async () => {
      if (!notificationPermission) {
        const permission = await requestNotificationPermission();
        if (permission) {
          setNotificationPermission(true);
        }
      }
      
      // 通知権限がある場合、初期通知をスケジュール
      if (notificationPermission && userProfile && dailyGoal) {
        try {
          const nextReminder = await scheduleNextReminder({
            wakeTime: userProfile.wakeTime,
            sleepTime: userProfile.sleepTime,
            targetMl: dailyGoal.targetMl,
            consumedMl: todayTotal,
            userSnoozeMin: settings.snoozeMinutes,
          });
          
          if (nextReminder) {
            console.log('Initial reminder scheduled:', nextReminder.nextAt?.toISOString());
          }
        } catch (error) {
          console.error('Failed to schedule initial reminder:', error);
        }
      }
    };
    
    initializeNotifications();
  }, [notificationPermission, userProfile, dailyGoal, todayTotal, settings.snoozeMinutes]);

  // 今日の摂取ログの読み込み（初回のみ）
  useEffect(() => {
    const loadTodayIntake = () => {
      const today = getLocalDateString();
      const todayLogs = getIntakeLogs(today);
      setTodayIntake(todayLogs);
    };

    loadTodayIntake();
  }, []);

  const handleQuickAdd = async (amount: number) => {
    const log = {
      id: Date.now().toString(),
      dateTime: new Date().toISOString(),
      amountMl: amount,
      source: 'quick' as const,
    };

    addLog(log);
    
    // Save to database
    try {
      await saveIntakeLog(log);
    } catch (error) {
      console.error('Failed to save intake log:', error);
    }

    // 次の通知とスヌーズ・朝のリマインダーをまとめて再登録
    if (notificationPermission && userProfile && dailyGoal) {
      try {
        await scheduleButtonTriggeredReminders({
          wakeTime: userProfile.wakeTime,
          sleepTime: userProfile.sleepTime,
          targetMl: dailyGoal.targetMl,
          consumedMl: todayTotal + amount,
          userSnoozeMin: settings.snoozeMinutes,
        });
        console.log('Notifications rescheduled after water intake');
      } catch (error) {
        console.error('Failed to reschedule notifications:', error);
      }
    }
  };

  if (!userProfile || !dailyGoal) {
    return (
      <View style={styles.container}>
        <MainHeader title="StayHydrated" />
        <View style={styles.centerContent}>
          <Text style={styles.title}>水分補給リマインダー</Text>
          <Text style={styles.subtitle}>
            プロフィールを設定して始めましょう
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MainHeader title="StayHydrated" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={true}
      >
        {/* メイン進捗カード */}
        <View style={styles.mainProgressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>今日の水分摂取</Text>
            <Text style={styles.progressSubtitle}>
              {formatVolume(todayTotal, settings.units)} / {formatVolume(dailyGoal.targetMl, settings.units)}
            </Text>
          </View>
          
          <View style={styles.progressContainer}>
            <ProgressRing
              progress={progress}
              size={180}
              color={progress >= 1 ? '#34C759' : '#007AFF'}
            >
              <View style={styles.progressContent}>
                <Text style={styles.progressText}>
                  {Math.round(progress * 100)}%
                </Text>
                <Text style={styles.progressLabel}>達成率</Text>
              </View>
            </ProgressRing>
          </View>

          <View style={styles.remainingContainer}>
            <Text style={styles.remainingText}>
              {remaining > 0 ? `あと ${formatVolume(remaining, settings.units)} で目標達成！` : '🎉 目標達成！おめでとうございます！'}
            </Text>
          </View>
        </View>

        {/* クイック追加セクション */}
        <View style={styles.quickAddCard}>
          <Text style={styles.quickAddTitle}>💧 水分を追加</Text>
          <View style={styles.buttonGrid}>
            {settings.presetMl.map((amount) => (
              <QuickAddButton
                key={amount}
                amount={amount}
                onPress={handleQuickAdd}
              />
            ))}
          </View>
        </View>

        {/* 今日の記録カード */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>📊 今日の記録</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.recordCount}</Text>
              <Text style={styles.statLabel}>記録回数</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatVolume(stats.avgIntake, settings.units)}</Text>
              <Text style={styles.statLabel}>平均摂取量</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {progress >= 1 ? '🎉' : Math.round(progress * 100) + '%'}
              </Text>
              <Text style={styles.statLabel}>進捗状況</Text>
            </View>
          </View>
        </View>

        {/* モチベーションカード */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationTitle}>💪 今日も頑張ろう！</Text>
          <Text style={styles.motivationText}>
            {progress >= 1 
              ? '素晴らしい！水分補給の習慣が身についています。'
              : progress >= 0.7
              ? '順調です！あと少しで目標達成です。'
              : progress >= 0.3
              ? '良いペースです！この調子で続けましょう。'
              : '今日から始めましょう！小さな一歩が大きな変化につながります。'
            }
          </Text>
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
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  
  // メイン進捗カード
  mainProgressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  progressContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  progressContent: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  progressLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  remainingContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  remainingText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    textAlign: 'center',
  },

  // クイック追加カード
  quickAddCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  quickAddTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },

  // 統計カード
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },

  // モチベーションカード
  motivationCard: {
    backgroundColor: '#F0F8FF',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  motivationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 14,
    color: '#1C1C1E',
    lineHeight: 20,
  },
});
