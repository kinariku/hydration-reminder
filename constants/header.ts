// ヘッダー関連の定数
export const HEADER_CONSTANTS = {
  // ヘッダーコンテンツの高さ（パディング含む）
  CONTENT_HEIGHT: 56,
  // パディング
  PADDING_HORIZONTAL: 16,
  PADDING_VERTICAL: 12,
  // ボタンサイズ
  BUTTON_SIZE: 40,
  BUTTON_RADIUS: 20,
} as const;

// ヘッダーのスタイルを統一するための共通スタイル
export const COMMON_HEADER_STYLES = {
  headerContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderBottomWidth: 0,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: HEADER_CONSTANTS.PADDING_HORIZONTAL,
    paddingVertical: HEADER_CONSTANTS.PADDING_VERTICAL,
    height: HEADER_CONSTANTS.CONTENT_HEIGHT,
  },
  backButton: {
    width: HEADER_CONSTANTS.BUTTON_SIZE,
    height: HEADER_CONSTANTS.BUTTON_SIZE,
    borderRadius: HEADER_CONSTANTS.BUTTON_RADIUS,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  backButtonContent: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  backButtonIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center' as const,
    marginHorizontal: 16,
    letterSpacing: -0.3,
  },
  headerLeft: {
    width: HEADER_CONSTANTS.BUTTON_SIZE,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  headerRight: {
    width: HEADER_CONSTANTS.BUTTON_SIZE,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
} as const;
