import React, { useEffect, useMemo } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { FontAwesome5 } from '@expo/vector-icons';
import { MainHeader } from '../../components/main-header';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { QuickAddButton } from '../../components/ui/QuickAddButton';
import { BodyHydrationTank } from '../../components/ui/BodyHydrationTank';
import { getIntakeLogs, saveIntakeLog } from '../../lib/database';
import { getLocalDateString } from '../../lib/date';
import {
    cancelScheduledReminders,
    requestNotificationPermission,
    scheduleButtonTriggeredReminders,
} from '../../lib/notifications';
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

  // データリセット機能
  const handleResetData = () => {
    Alert.alert(
      'データリセット',
      '今日の水分摂取データをリセットしますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'リセット',
          style: 'destructive',
          onPress: () => {
            setTodayIntake([]);
            console.log('Today\'s intake data reset');
          },
        },
      ]
    );
  };

  const todayTotal = getTodayTotal();
  const progress = getTodayProgress();
  const remaining = Math.max(0, (dailyGoal?.targetMl || 0) - todayTotal);

  const stats = useMemo(() => {
    const totalIntake = todayIntake.reduce((sum, log) => sum + log.amountMl, 0);
    const recordCount = todayIntake.length;
    const avgIntake = recordCount > 0 ? Math.round(totalIntake / recordCount) : 0;
    return { totalIntake, recordCount, avgIntake };
  }, [todayIntake]); // todayIntakeが変更された時のみ再計算

  const progressPercent = Math.min(100, Math.round(progress * 100));
  const statusText = `You're ${progressPercent}% refreshed!`;
  const moodMessage = useMemo(() => {
    if (progress >= 1) {
      return 'Body battery maxed out ✨';
    }
    if (progress >= 0.75) {
      return 'So close — keep sipping!';
    }
    if (progress >= 0.4) {
      return 'Your flow is steady, stay hydrated.';
    }
    if (progress > 0) {
      return 'Great start! Your body thanks you.';
    }
    return 'Let’s kickstart your hydration today!';
  }, [progress]);

  const motivationMessage = useMemo(() => {
    if (progress >= 1) {
      return 'Amazing! Your hydration streak is on fire.';
    }
    if (progress >= 0.7) {
      return 'Almost there — just a couple more sips to victory.';
    }
    if (progress >= 0.3) {
      return 'Great pace! Keep your bottle within reach.';
    }
    return 'Every sip counts. Start with a quick glass of water!';
  }, [progress]);

  const remainingText =
    remaining > 0
      ? `${formatVolume(remaining, settings.units)} remaining today`
      : 'Goal crushed today! 💧';

  const primaryAddAmount = useMemo(() => {
    if (!settings.presetMl || settings.presetMl.length === 0) {
      return null;
    }
    const middleIndex = Math.floor(settings.presetMl.length / 2);
    return settings.presetMl[middleIndex];
  }, [settings.presetMl]);

  const ringColors: [string, string] = progress >= 1
    ? ['#B9F6CA', '#34C759']
    : ['#C3EAFF', '#3B82F6'];

  // 初回マウント時に既存の通知をリセット
  useEffect(() => {
    const clearExistingNotifications = async () => {
      try {
        await cancelScheduledReminders();
        console.log('Cleared scheduled notifications on mount');
      } catch (error) {
        console.error('Failed to clear notifications on mount:', error);
      }
    };

    clearExistingNotifications();
  }, []);

  // 通知権限の確認と初期スケジュール設定
  useEffect(() => {
    const initializeNotifications = async () => {
      let hasPermission = notificationPermission;

      if (!hasPermission) {
        hasPermission = await requestNotificationPermission();
        setNotificationPermission(hasPermission);
      }

      if (!hasPermission) {
        await cancelScheduledReminders();
        return;
      }

      if (!userProfile || !dailyGoal) {
        await cancelScheduledReminders();
        return;
      }

      try {
        await scheduleButtonTriggeredReminders({
          wakeTime: userProfile.wakeTime,
          sleepTime: userProfile.sleepTime,
          targetMl: dailyGoal.targetMl,
          consumedMl: getTodayTotal(),
          userSnoozeMin: settings.snoozeMinutes,
          frequency: settings.notificationFrequency,
        });
        console.log('Initial notifications scheduled');
      } catch (error) {
        console.error('Failed to schedule initial notifications:', error);
      }
    };

    initializeNotifications();
  }, [notificationPermission, userProfile, dailyGoal, settings.snoozeMinutes, getTodayTotal, setNotificationPermission]);

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
          frequency: settings.notificationFrequency,
        });
        console.log('Notifications rescheduled after water intake');
      } catch (error) {
        console.error('Failed to reschedule notifications:', error);
      }
    }
  };

  const handlePrimaryAdd = () => {
    if (!primaryAddAmount) {
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    void handleQuickAdd(primaryAddAmount);
  };

  if (!userProfile || !dailyGoal) {
    return (
      <View style={styles.container}>
        <MainHeader title="StayHydrated" />
        <View style={styles.centerContent}>
          <Text style={styles.emptyTitle}>Hydration companion</Text>
          <Text style={styles.emptySubtitle}>
            Set up your profile to unlock your personalised water goals.
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
        <View style={styles.heroCard}>
          <View style={styles.heroAccentOne} />
          <View style={styles.heroAccentTwo} />
          <View style={styles.heroContent}>
            <View style={styles.progressWrapper}>
              <View style={styles.progressBackdrop} />
              <ProgressRing
                progress={progress}
                size={250}
                strokeWidth={16}
                color={ringColors}
                backgroundColor="rgba(255,255,255,0.18)"
              >
                <BodyHydrationTank
                  progress={progress}
                  size={200}
                  accentColor={ringColors[1]}
                />
              </ProgressRing>
            </View>
            <Text style={styles.statusText}>{statusText}</Text>
            <Text style={styles.statusSubText}>{moodMessage}</Text>
            <View style={styles.dropRow}>
              {Array.from({ length: 4 }).map((_, index) => {
                const fillLevel = Math.max(0, Math.min(1, progress * 4 - index));
                return (
                  <FontAwesome5
                    key={`drop-${index}`}
                    name="tint"
                    size={18}
                    color="#FFFFFF"
                    style={[styles.dropIcon, { opacity: 0.35 + fillLevel * 0.65 }]}
                  />
                );
              })}
            </View>
            <TouchableOpacity
              style={[styles.primaryButton, !primaryAddAmount && styles.primaryButtonDisabled]}
              onPress={handlePrimaryAdd}
              disabled={!primaryAddAmount}
            >
              <Text
                style={[
                  styles.primaryButtonText,
                  !primaryAddAmount && styles.primaryButtonTextDisabled,
                ]}
              >
                Add Intake
              </Text>
            </TouchableOpacity>
            <Text style={styles.remainingText}>{remainingText}</Text>
            <Text style={styles.heroFootnote}>
              {formatVolume(todayTotal, settings.units)} logged • Goal {formatVolume(dailyGoal.targetMl, settings.units)}
            </Text>
          </View>
        </View>

        <View style={styles.quickActionsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Quick add</Text>
            <Text style={styles.cardSubtitle}>Log water with one joyful tap</Text>
          </View>
          <View style={styles.buttonGrid}>
            {settings.presetMl.map((amount) => (
              <View key={amount} style={styles.quickButtonWrapper}>
                <QuickAddButton
                  amount={amount}
                  onPress={handleQuickAdd}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Today’s insights</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatVolume(todayTotal, settings.units)}</Text>
              <Text style={styles.statLabel}>Logged today</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.recordCount}</Text>
              <Text style={styles.statLabel}>Entries</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatVolume(stats.avgIntake, settings.units)}</Text>
              <Text style={styles.statLabel}>Avg. per sip</Text>
            </View>
          </View>
        </View>

        <View style={styles.motivationCard}>
          <Text style={styles.motivationTitle}>Daily boost</Text>
          <Text style={styles.motivationText}>{motivationMessage}</Text>
        </View>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetData}
        >
          <Text style={styles.resetButtonText}>
            Reset today’s intake
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9F4FF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 56,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1B365C',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#5B6B7F',
    textAlign: 'center',
    lineHeight: 22,
  },
  heroCard: {
    backgroundColor: '#5AA7FF',
    borderRadius: 32,
    padding: 24,
    overflow: 'hidden',
    shadowColor: '#1B3B6F',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  heroAccentOne: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.18)',
    top: -80,
    right: -60,
  },
  heroAccentTwo: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.12)',
    bottom: -60,
    left: -40,
  },
  heroContent: {
    alignItems: 'center',
  },
  progressWrapper: {
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBackdrop: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  statusText: {
    marginTop: 24,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  statusSubText: {
    marginTop: 8,
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 22,
  },
  dropRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  dropIcon: {
    marginHorizontal: 6,
  },
  primaryButton: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 52,
    borderRadius: 999,
    shadowColor: '#1B3B6F',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.45)',
    shadowOpacity: 0,
  },
  primaryButtonText: {
    color: '#1C6CF0',
    fontSize: 18,
    fontWeight: '700',
  },
  primaryButtonTextDisabled: {
    color: 'rgba(28,108,240,0.6)',
  },
  remainingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#E1F2FF',
    fontWeight: '600',
    textAlign: 'center',
  },
  heroFootnote: {
    marginTop: 6,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  quickActionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginTop: 16,
    shadowColor: '#1B3B6F',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#12223B',
  },
  cardSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#5B6B7F',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickButtonWrapper: {
    flexBasis: '48%',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginTop: 20,
    shadowColor: '#1B3B6F',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C6CF0',
  },
  statLabel: {
    marginTop: 6,
    fontSize: 13,
    color: '#5B6B7F',
  },
  statDivider: {
    width: 1,
    height: 44,
    backgroundColor: 'rgba(28,108,240,0.12)',
  },
  motivationCard: {
    backgroundColor: '#EEF7FF',
    borderRadius: 24,
    padding: 20,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  motivationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C6CF0',
  },
  motivationText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: '#12223B',
  },
  resetButton: {
    marginTop: 24,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: 'rgba(216,59,59,0.24)',
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#D83B3B',
  },
});
