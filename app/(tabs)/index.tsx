import React, { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MainHeader } from '../../components/main-header';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { QuickAddButton } from '../../components/ui/QuickAddButton';
import { getIntakeLogs, saveIntakeLog } from '../../lib/database';
import { getLocalDateString } from '../../lib/date';
import { requestNotificationPermission, scheduleNextReminder } from '../../lib/notifications';
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
  }, [todayIntake]);

  useEffect(() => {
    // Request notification permission on first load
    if (!notificationPermission) {
      requestNotificationPermission().then(setNotificationPermission);
    }

    // Load today's intake logs from database
    const loadTodayIntake = () => {
      const today = getLocalDateString();
      const todayLogs = getIntakeLogs(today);
      setTodayIntake(todayLogs);
    };

    loadTodayIntake();

    // Schedule next reminder if permission is granted and user profile exists
    const scheduleNotifications = async () => {
      if (notificationPermission && userProfile && dailyGoal) {
        try {
          await scheduleNextReminder(
            userProfile.wakeTime,
            userProfile.sleepTime,
            dailyGoal.targetMl
          );
          console.log('Next reminder scheduled on app start');
        } catch (error) {
          console.warn('Failed to schedule next reminder:', error);
        }
      }
    };

    scheduleNotifications();
  }, [notificationPermission, userProfile, dailyGoal]);

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

    // 水を飲んだ後に次の通知をスケジュール
    if (notificationPermission && userProfile && dailyGoal) {
      try {
        await scheduleNextReminder(
          userProfile.wakeTime,
          userProfile.sleepTime,
          dailyGoal.targetMl
        );
        console.log('Next reminder scheduled after water intake');
      } catch (error) {
        console.error('Failed to schedule next reminder:', error);
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
        <Text style={styles.title}>💧 今日の水分摂取</Text>
        
        <View style={styles.progressContainer}>
          <ProgressRing
            progress={progress}
            size={200}
            color={progress >= 1 ? '#34C759' : '#007AFF'}
          >
            <View style={styles.progressContent}>
              <Text style={styles.progressText}>
                {Math.round(progress * 100)}%
              </Text>
              <Text style={styles.amountText}>
                {todayTotal}ml / {dailyGoal.targetMl}ml
              </Text>
            </View>
          </ProgressRing>
        </View>

        <View style={styles.remainingContainer}>
          <Text style={styles.remainingText}>
            あと {remaining}ml で目標達成！
          </Text>
        </View>

        <View style={styles.quickAddContainer}>
          <Text style={styles.quickAddTitle}>クイック追加</Text>
          <View style={styles.buttonRow}>
            {settings.presetMl.map((amount) => (
              <QuickAddButton
                key={amount}
                amount={amount}
                onPress={handleQuickAdd}
              />
            ))}
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{todayTotal}ml</Text>
            <Text style={styles.statLabel}>今日の摂取量</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.round(progress * 100)}%
            </Text>
            <Text style={styles.statLabel}>達成率</Text>
          </View>
        </View>

        {/* データ統計セクション */}
        <View style={styles.dataStatsSection}>
          <Text style={styles.sectionTitle}>📊 今日の記録</Text>
          <View style={styles.dataStatsCard}>
            <View style={styles.dataStatsRow}>
              <View style={styles.dataStatItem}>
                <Text style={styles.dataStatValue}>{stats.recordCount}</Text>
                <Text style={styles.dataStatLabel}>記録数</Text>
              </View>
              <View style={styles.dataStatItem}>
                <Text style={styles.dataStatValue}>{stats.totalIntake}ml</Text>
                <Text style={styles.dataStatLabel}>総摂取量</Text>
              </View>
              <View style={styles.dataStatItem}>
                <Text style={styles.dataStatValue}>{stats.avgIntake}ml</Text>
                <Text style={styles.dataStatLabel}>平均摂取量</Text>
              </View>
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
  content: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
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
  progressContainer: {
    marginVertical: 30,
  },
  progressContent: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  amountText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  remainingContainer: {
    marginBottom: 32,
  },
  remainingText: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
  },
  quickAddContainer: {
    width: '100%',
    marginBottom: 32,
  },
  quickAddTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  dataStatsSection: {
    width: '100%',
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
    textAlign: 'center',
  },
  dataStatsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dataStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dataStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  dataStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  dataStatLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'center',
  },
});
