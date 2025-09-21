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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
    backgroundColor: '#F2F2F7',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  backButtonContent: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  backButtonIcon: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: '600' as const,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1C1C1E',
    flex: 1,
    textAlign: 'center' as const,
    marginHorizontal: 16,
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
