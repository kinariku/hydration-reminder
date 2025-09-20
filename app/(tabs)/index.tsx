import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { QuickAddButton } from '../../components/ui/QuickAddButton';
import { getIntakeLogs, saveIntakeLog } from '../../lib/database';
import { requestNotificationPermission } from '../../lib/notifications';
import { useHydrationStore } from '../../stores/hydrationStore';

export default function HomeScreen() {
  const {
    userProfile,
    dailyGoal,
    getTodayTotal,
    getTodayProgress,
    addIntakeLog: addLog,
    settings,
    notificationPermission,
    setNotificationPermission,
  } = useHydrationStore();

  const todayTotal = getTodayTotal();
  const progress = getTodayProgress();
  const remaining = Math.max(0, (dailyGoal?.targetMl || 0) - todayTotal);

  useEffect(() => {
    // Request notification permission on first load
    if (!notificationPermission) {
      requestNotificationPermission().then(setNotificationPermission);
    }

    // Load today's intake logs from database
    const loadTodayIntake = () => {
      const today = new Date().toISOString().split('T')[0];
      const todayLogs = getIntakeLogs(today);
      // Update store with today's logs
      todayLogs.forEach(log => {
        addLog(log);
      });
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
  };

  if (!userProfile || !dailyGoal) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.title}>水分補給リマインダー</Text>
          <Text style={styles.subtitle}>
            プロフィールを設定して始めましょう
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 16,
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
    marginBottom: 30,
  },
  remainingText: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
  },
  quickAddContainer: {
    width: '100%',
    marginBottom: 30,
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
});