/**
 * アプリ全体で使用する角丸の定数
 */
export const RADIUS = {
  // 基本の角丸（16pxに統一）
  sm: 16,     // 小さな角丸（ボタン、アイコンなど）
  md: 16,     // 中程度の角丸（カード、入力フィールドなど）
  lg: 16,     // 大きな角丸（大きなカード、モーダルなど）
  xl: 16,     // 特大の角丸（セクション、大きなコンテナなど）
  xxl: 16,    // 最大の角丸（メインカード、重要なコンテナなど）
  
  // 完全な円形
  full: 9999, // 完全な円形（アバター、アイコンなど）
  
  // 特殊な用途（16pxに統一）
  button: 16,     // ボタン用
  card: 16,       // カード用
  input: 16,      // 入力フィールド用
  modal: 16,      // モーダル用
  tab: 16,        // タブ用
  chip: 16,       // チップ用
  badge: 16,      // バッジ用
} as const;

/**
 * 角丸の値を取得するヘルパー関数
 */
export const getRadius = (size: keyof typeof RADIUS): number => {
  return RADIUS[size];
};

/**
 * 角丸のスタイルオブジェクトを生成するヘルパー関数
 */
export const createRadiusStyle = (size: keyof typeof RADIUS) => ({
  borderRadius: RADIUS[size],
});
