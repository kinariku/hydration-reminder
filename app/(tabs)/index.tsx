import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Rect, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { WaterBubbles } from '../../components/WaterBubbles';
import { RADIUS } from '../../constants/radius';
import { getIntakeLogs } from '../../lib/database';
import { getLocalDateString } from '../../lib/date';
import {
    cancelScheduledReminders,
    requestNotificationPermission,
    scheduleButtonTriggeredReminders,
} from '../../lib/notifications';
import { formatVolume } from '../../lib/unitConverter';
import { useHydrationStore } from '../../stores/hydrationStore';
import { IntakeLog } from '../../types';

interface DailySummary {
  date: string;
  logs: IntakeLog[];
  total: number;
  goal: number;
}

const DAYS_IN_WEEK = 7;
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 各日のコンテンツをレンダリングする関数
const renderDayContent = (summary: DailySummary, settings: any) => {
  const progress = getProgressRatio(summary);
  const percent = Math.round(progress * 100);
  const logs = summary.logs;

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
      bounces={true}
    >
      <View style={styles.summaryHeader}>
        <Text style={styles.summaryDate}>{formatDetailedDate(summary.date)}</Text>
      </View>

      <View style={styles.progressRingWrapper}>
        <ProgressRing
          key={`progress-${summary.total}-${summary.goal}`}
          progress={progress}
          size={260}
          strokeWidth={20}
          color="#0EA5E9"
          backgroundColor="#FFFFFF"
          showsGradient={false}
        >
          <View style={styles.progressInnerContent}>
            <Text style={styles.progressPercent}>{percent}%</Text>
            <View style={styles.progressSubLabelContainer}>
              <Text style={styles.progressSubLabel}>
                {formatVolume(summary.total, settings.units)} / {formatVolume(summary.goal, settings.units)}
              </Text>
            </View>
          </View>
        </ProgressRing>
      </View>

        <View style={styles.timelineSection}>
          <View style={styles.timelineHeaderContainer}>
            <Text style={styles.sectionHeading}>最近の記録</Text>
          </View>

          {logs.length === 0 ? (
          <View style={styles.timelineEmptyState}>
            <Text style={styles.emptyIcon}>💧</Text>
            <Text style={styles.timelineEmptyText}>まだ記録がありません</Text>
            <Text style={styles.timelineEmptySubtext}>右下のボタンから追加しましょう</Text>
          </View>
        ) : (
          <View style={styles.timelineContainer}>
            {/* 背景の白い線 */}
            <View style={styles.timelineBackgroundLine} />
            
            {(() => {
              // 5分以内の記録をグループ化
              const groupedLogs = logs.slice(0, 10).reduce((groups, log) => {
                const logTime = new Date(log.dateTime);
                const minutes = logTime.getMinutes();
                const roundedMinutes = Math.floor(minutes / 5) * 5;
                const timeKey = `${logTime.getHours()}:${String(roundedMinutes).padStart(2, '0')}`;
                
                if (!groups[timeKey]) {
                  groups[timeKey] = [];
                }
                groups[timeKey].push(log);
                return groups;
              }, {} as Record<string, typeof logs>);

              const groupedEntries = Object.entries(groupedLogs).slice(0, 5);
              
              return groupedEntries.map(([timeKey, groupLogs], timelineIndex) => {
                const totalAmount = groupLogs.reduce((sum, log) => sum + log.amountMl, 0);
                const firstLog = groupLogs[0];
                const isMultiple = groupLogs.length > 1;
                
                const getWaterColor = (amount: number) => {
                  if (amount >= 500) return '#0EA5E9';
                  if (amount >= 300) return '#38BDF8';
                  if (amount >= 200) return '#7DD3FC';
                  return '#BAE6FD';
                };
                
                const getIconColor = (amount: number) => {
                  return '#0EA5E9';
                };
                
                const getWaterIcon = (amount: number) => {
                  if (amount >= 500) return 'wine-bottle';
                  if (amount >= 300) return 'mug-hot';
                  if (amount >= 200) return 'glass-whiskey';
                  return 'tint';
                };
                
                return (
                  <View key={timeKey} style={styles.timelineItem}>
                    <View style={styles.timelineLeft}>
                      <View style={[styles.timelineDot, { backgroundColor: getWaterColor(totalAmount) }]} />
                    </View>
                    <View style={styles.timelineCard}>
                      <View style={styles.timelineHeader}>
                        <View style={styles.timelineLeftContent}>
                          <View style={styles.timelineIconContainer}>
                            <FontAwesome5 
                              name={getWaterIcon(totalAmount)} 
                              size={20} 
                              color={getIconColor(totalAmount)} 
                            />
                          </View>
                          <View style={styles.timelineAmountContainer}>
                            <Text style={styles.timelineAmount}>{formatVolume(totalAmount, settings.units)}</Text>
                            {isMultiple && (
                              <Text style={styles.timelineDetail}>
                                {groupLogs.map(log => formatVolume(log.amountMl, settings.units)).join(' + ')}
                              </Text>
                            )}
                          </View>
                        </View>
                        <Text style={styles.timelineTime}>{timeKey}</Text>
                      </View>
                      {!isMultiple && firstLog.note && (
                        <Text style={styles.timelineNote}>{firstLog.note}</Text>
                      )}
                    </View>
                  </View>
                );
              });
            })()}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const createDateFromKey = (key: string) => {
  const parts = key.split('-');
  if (parts.length !== 3) {
    return new Date();
  }

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
    return new Date();
  }

  return new Date(year, month - 1, day);
};

const formatDateLabel = (date: string) => {
  try {
    const dateInstance = createDateFromKey(date);
    const label = dateInstance.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
    return `${label}`;
  } catch (error) {
    return '--/--';
  }
};

const formatWeekdayLabel = (date: string) => {
  try {
    const dateInstance = createDateFromKey(date);
    return dateInstance.toLocaleDateString('ja-JP', { weekday: 'short' });
  } catch (error) {
    return '--';
  }
};

const formatDetailedDate = (date: string) => {
  try {
    const dateInstance = createDateFromKey(date);
    return dateInstance.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    return '日付が取得できません';
  }
};

const formatTimeLabel = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
};

const getProgressRatio = (summary?: DailySummary) => {
  if (!summary || summary.goal <= 0) {
    return 0;
  }
  return Math.min(summary.total / summary.goal, 1);
};

const getStartOfWeek = (date: Date) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday as start of week
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

export default function HomeScreen() {
  const {
    userProfile,
    dailyGoal,
    setTodayIntake,
    getTodayTotal,
    addIntakeLog,
    settings,
    notificationPermission,
    setNotificationPermission,
  } = useHydrationStore();

  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());
  const [selectedIndex, setSelectedIndex] = useState(0);
  

  const selectedSummary = useMemo(
    () => dailySummaries.find((item) => item.date === selectedDate),
    [dailySummaries, selectedDate]
  );

  const selectedProgress = getProgressRatio(selectedSummary);
  const selectedPercent = Math.round(selectedProgress * 100);
  const selectedTotal = selectedSummary?.total ?? 0;
  const selectedGoal = selectedSummary?.goal ?? dailyGoal?.targetMl ?? 0;
  const remainingVolume = Math.max(selectedGoal - selectedTotal, 0);
  const selectedLogs = selectedSummary?.logs ?? [];

  const loadDailySummaries = useCallback(() => {
    if (!dailyGoal) {
      setDailySummaries([]);
      return;
    }

    const today = new Date();
    const todayDateKey = getLocalDateString(today);
    const startOfWeek = getStartOfWeek(today);
    const summaries: DailySummary[] = [];

    for (let offset = 0; offset < DAYS_IN_WEEK; offset += 1) {
      const dateInstance = new Date(startOfWeek);
      dateInstance.setDate(startOfWeek.getDate() + offset);
      const dateKey = getLocalDateString(dateInstance);
      const logs = getIntakeLogs(dateKey);
      const total = logs.reduce((sum, log) => sum + log.amountMl, 0);

      summaries.push({
        date: dateKey,
        logs,
        total,
        goal: dailyGoal.targetMl,
      });

      if (dateKey === todayDateKey) {
        setTodayIntake(logs);
        setSelectedIndex(offset); // 今日のインデックスを設定
      }
    }

    setDailySummaries(summaries);
  }, [dailyGoal, setTodayIntake]);

  useEffect(() => {
    if (!dailyGoal) {
      return;
    }
    loadDailySummaries();
    setSelectedDate(getLocalDateString());
  }, [dailyGoal, loadDailySummaries]);

  useFocusEffect(
    useCallback(() => {
      if (!dailyGoal) {
        return;
      }
      loadDailySummaries();
      setSelectedDate(getLocalDateString());
    }, [dailyGoal, loadDailySummaries])
  );



  useEffect(() => {
    const clearExistingNotifications = async () => {
      try {
        await cancelScheduledReminders();
      } catch (error) {
        console.error('Failed to clear notifications on mount:', error);
      }
    };

    clearExistingNotifications();
  }, []);

  useEffect(() => {
    const initializeNotifications = async () => {
      if (!dailyGoal || !userProfile) {
        await cancelScheduledReminders();
        return;
      }

      let hasPermission = notificationPermission;

      if (!hasPermission) {
        hasPermission = await requestNotificationPermission();
        setNotificationPermission(hasPermission);
      }

      if (!hasPermission) {
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
      } catch (error) {
        console.error('Failed to schedule initial notifications:', error);
      }
    };

    initializeNotifications();
  }, [
    dailyGoal,
    getTodayTotal,
    notificationPermission,
    setNotificationPermission,
    settings.notificationFrequency,
    settings.snoozeMinutes,
    userProfile,
  ]);

  const handleSelectDate = (dateIndex: number) => {
    if (dateIndex < 0 || dateIndex >= dailySummaries.length) {
      return;
    }

    const newDate = dailySummaries[dateIndex].date;
    if (newDate === selectedDate) {
      return;
    }

    // 未来の日付への移動を制限
    const selectedDateObj = new Date(newDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (selectedDateObj > today) {
      return; // 未来の日付には移動できない
    }

    Haptics.selectionAsync();
    setSelectedIndex(dateIndex);
    setSelectedDate(newDate);
  };


  

  

  const handleSelectAmount = async (amount: number) => {
    try {
      const newLog: IntakeLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        dateTime: new Date().toISOString(),
        amountMl: amount,
        source: 'quick',
      };

      // データベースに保存
      const { saveIntakeLog } = await import('../../lib/database');
      saveIntakeLog(newLog);
      
      // ストアに追加
      addIntakeLog(newLog);

      // 成功フィードバック
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // データを再読み込み
      loadDailySummaries();
      
    } catch (error) {
      console.error('Failed to add water intake:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // 曜日タブのレンダリング関数
  const renderDateTabs = () => {
    return (
      <View style={styles.dateNavigation}>
        <View style={styles.dateNavContent}>
          {dailySummaries.map((summary, dateIndex) => {
            const isActive = dateIndex === selectedIndex;
            const isFuture = new Date(summary.date) > new Date(getLocalDateString());
            const progressRatio = getProgressRatio(summary);
            
            return (
              <TouchableOpacity
                key={summary.date}
                style={[
                  styles.dateNavItem, 
                  isActive && styles.dateNavItemActive,
                ]}
                onPress={() => !isFuture && handleSelectDate(dateIndex)}
                activeOpacity={isFuture ? 1 : 0.8}
                disabled={isFuture}
              >
                <View style={styles.dateNavCircle}>
                  {!isFuture && (
                    <Svg width={48} height={48} style={styles.dateNavRing}>
                      <Circle
                        cx={24}
                        cy={24}
                        r={20}
                        stroke="#FFFFFF"
                        strokeWidth={3}
                        fill="none"
                      />
                      <Circle
                        cx={24}
                        cy={24}
                        r={20}
                        stroke={isActive ? '#0EA5E9' : '#0284C7'}
                        strokeWidth={3}
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 20}`}
                        strokeDashoffset={`${2 * Math.PI * 20 * (1 - progressRatio)}`}
                        strokeLinecap="round"
                        transform="rotate(-90 24 24)"
                      />
                    </Svg>
                  )}
                  <Text style={[
                    styles.dateNavText, 
                    isActive && styles.dateNavTextActive,
                  ]}>
                    {formatWeekdayLabel(summary.date)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  if (!userProfile || !dailyGoal) {
    return (
      <View style={styles.emptyContainer}>
        <Svg style={styles.backgroundGradient} width="100%" height="100%">
          <Defs>
            <SvgLinearGradient id="macGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#E0F2FE" />
              <Stop offset="25%" stopColor="#BAE6FD" />
              <Stop offset="50%" stopColor="#7DD3FC" />
              <Stop offset="75%" stopColor="#38BDF8" />
              <Stop offset="100%" stopColor="#0EA5E9" />
            </SvgLinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#macGradient)" />
        </Svg>
        
        <WaterBubbles />
        
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.headerSection}>
            <View style={styles.titleContainer}>
              <FontAwesome5 name="tint" size={28} color="#0EA5E9" />
              <Text style={styles.appTitle}>水飲みリマインダー</Text>
            </View>
          </View>
        </SafeAreaView>
        <View style={styles.emptyState}>
          <FontAwesome5 name="user-plus" size={72} color="#0EA5E9" />
          <Text style={styles.emptyStateTitle}>プロフィール設定が必要です</Text>
          <Text style={styles.emptyStateSubtitle}>
            プロフィールを設定して、日々の水分補給をトラッキングしましょう。
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Svg style={styles.backgroundGradient} width="100%" height="100%">
        <Defs>
          <SvgLinearGradient id="macGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#E0F2FE" />
            <Stop offset="25%" stopColor="#BAE6FD" />
            <Stop offset="50%" stopColor="#7DD3FC" />
            <Stop offset="75%" stopColor="#38BDF8" />
            <Stop offset="100%" stopColor="#0EA5E9" />
          </SvgLinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#macGradient)" />
      </Svg>
      
      <WaterBubbles />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.headerSection}>
          <View style={styles.titleContainer}>
            <FontAwesome5 name="tint" size={28} color="#0EA5E9" />
            <Text style={styles.appTitle}>水飲みリマインダー</Text>
          </View>
        </View>
      </SafeAreaView>

      {/* ヘッダーから下へのグラデーション背景 */}
      <LinearGradient
        colors={['rgba(14, 165, 233, 0.1)', 'rgba(14, 165, 233, 0.05)', 'transparent']}
        locations={[0, 0.5, 1]}
        style={styles.gradientOverlay}
        pointerEvents="none"
      />

      {renderDateTabs()}

      <View style={styles.pageContainer}>
        {selectedSummary && renderDayContent(selectedSummary, settings)}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F2FE',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0369A1',
    letterSpacing: -0.5,
  },
    contentContainer: {
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 160, // タブバー + アクションボタンのはみ出し分 + 十分な余白を確保
    },
  dateNavigation: {
    backgroundColor: 'transparent',
    paddingVertical: 20,
  },
  dateNavContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  dateNavItem: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateNavItemActive: {
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  dateNavCircle: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateNavRing: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  dateNavText: {
    fontSize: 13,
    color: '#0369A1',
    fontWeight: '700',
    textAlign: 'center',
  },
  dateNavTextActive: {
    color: '#0EA5E9',
  },
  dateNavDay: {
    marginTop: 4,
    fontSize: 17,
    color: '#111827',
    fontWeight: '700',
    textAlign: 'center',
  },
  dateNavDayActive: {
    color: '#FFFFFF',
  },
  pageContainer: {
    flex: 1,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    zIndex: 1,
  },
  settingsScrollView: {
    flex: 1,
  },
  settingsContent: {
    padding: 24,
    paddingBottom: 120,
    flexGrow: 1,
  },
  summaryHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryDate: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0369A1',
    letterSpacing: 0.2,
  },
  progressRingWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 130,
    width: 260,
    height: 260,
    alignSelf: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  progressInnerContent: {
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: 56,
    fontWeight: '800',
    color: '#0369A1',
    letterSpacing: -2,
  },
  progressLabel: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#0284C7',
    letterSpacing: 0.3,
  },
  progressSubLabelContainer: {
    marginTop: 4,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  progressSubLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0369A1',
    textAlign: 'center',
  },
  progressPrimary: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  progressSecondary: {
    marginTop: 4,
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  statCard: {
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: 8,
    borderRadius: RADIUS.card,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(96, 165, 250, 0.8)',
    letterSpacing: 0.5,
    marginTop: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.8,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 20,
    letterSpacing: -0.2,
  },
  timelineSection: {
    marginTop: 0,
    gap: 4,
  },
  timelineHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  timelineContainer: {
    marginTop: 0,
    paddingHorizontal: 20,
    position: 'relative',
  },
  timelineBackgroundLine: {
    position: 'absolute',
    left: 26,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: 'rgba(6, 182, 212, 0.3)',
    zIndex: 1,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
    zIndex: 2,
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 3,
  },
  timelineLine: {
    position: 'absolute',
    top: 12,
    left: 5,
    width: 2,
    height: 16,
    backgroundColor: 'rgba(14, 165, 233, 0.3)',
  },
  timelineCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  timelineLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timelineIconContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  timelineAmountContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  timelineAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0369A1',
    letterSpacing: -0.5,
  },
  timelineCount: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0369A1',
    opacity: 0.7,
    marginTop: 2,
  },
  timelineDetail: {
    fontSize: 11,
    fontWeight: '400',
    color: '#0369A1',
    opacity: 0.6,
    marginTop: 2,
  },
  timelineTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0EA5E9',
    opacity: 1,
  },
  timelineNote: {
    fontSize: 11,
    color: '#0369A1',
    lineHeight: 16,
    opacity: 0.6,
  },
  timelineEmptyState: {
    padding: 48,
    borderRadius: RADIUS.card,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  timelineEmptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0369A1',
    textAlign: 'center',
    marginBottom: 8,
  },
  timelineEmptySubtext: {
    fontSize: 13,
    color: '#0284C7',
    textAlign: 'center',
    lineHeight: 20,
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.tab,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#E0F2FE',
  },
  emptyState: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  emptyStateSubtitle: {
    fontSize: 15,
    color: '#0284C7',
    textAlign: 'center',
    lineHeight: 24,
  },
});
