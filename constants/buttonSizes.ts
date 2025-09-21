// アプリ全体で使用するボタンサイズの定数
export const BUTTON_SIZES = {
  // 小さいボタン（セカンダリアクション用）
  small: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 60,
    fontSize: 12,
  },
  // 中サイズボタン（一般的なアクション用）
  medium: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minWidth: 100,
    fontSize: 14,
  },
  // 大きいボタン（主要アクション用）
  large: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minWidth: 120,
    fontSize: 16,
  },
  // フルワイドボタン（画面幅いっぱい）
  fullWidth: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    width: '100%',
    fontSize: 16,
  },
} as const;

// ボタンの種類
export type ButtonSize = keyof typeof BUTTON_SIZES;
