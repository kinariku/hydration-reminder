import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NotificationStatusCardProps {
  isEnabled: boolean;
  onOpenSettings?: () => void;
  showOpenButton?: boolean;
}

export const NotificationStatusCard: React.FC<NotificationStatusCardProps> = ({
  isEnabled,
  onOpenSettings,
  showOpenButton = false,
}) => {
  return (
    <View style={styles.notificationCard}>
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationTitle}>通知の有効化</Text>
        {isEnabled ? (
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>ON</Text>
          </View>
        ) : (
          <View style={styles.statusBadgeDisabled}>
            <Text style={styles.statusBadgeTextDisabled}>OFF</Text>
          </View>
        )}
      </View>
      
      {isEnabled ? (
        <Text style={styles.notificationDescription}>
          通知は正常に動作しています
        </Text>
      ) : (
        <>
          <Text style={styles.notificationDescription}>
            iPhone設定で通知を有効にしてください
          </Text>
          {showOpenButton && onOpenSettings && (
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={onOpenSettings}
            >
              <Text style={styles.settingsButtonText}>設定を開く</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  statusBadge: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadgeDisabled: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusBadgeTextDisabled: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
  },
  notificationDescription: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
  },
  settingsButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  settingsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
