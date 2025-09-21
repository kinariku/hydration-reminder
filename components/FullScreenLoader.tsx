import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export const FULL_SCREEN_LOADER_COLORS = {
  background: '#F2F2F7',
  spinner: '#007AFF',
  text: '#1C1C1E',
} as const;

export const FULL_SCREEN_LOADER_MESSAGES = {
  defaultMessage: '読み込み中...',
  defaultAccessibilityLabel: '読み込み中',
} as const;

export type FullScreenLoaderProps = {
  message?: string;
  spinnerAccessibilityLabel?: string;
};

export function FullScreenLoader({
  message = FULL_SCREEN_LOADER_MESSAGES.defaultMessage,
  spinnerAccessibilityLabel = FULL_SCREEN_LOADER_MESSAGES.defaultAccessibilityLabel,
}: FullScreenLoaderProps) {
  return (
    <View style={styles.container} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <ActivityIndicator
        size="large"
        color={FULL_SCREEN_LOADER_COLORS.spinner}
        accessibilityLabel={spinnerAccessibilityLabel}
      />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: FULL_SCREEN_LOADER_COLORS.background,
    paddingHorizontal: 24,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: FULL_SCREEN_LOADER_COLORS.text,
    textAlign: 'center',
  },
});

