/**
 * アプリ全体で使用するデザインの定数
 */
import { StyleSheet } from 'react-native';
import { RADIUS } from './radius';

export const DESIGN = {
  // カラー
  colors: {
    primary: '#0EA5E9',
    primaryDark: '#0369A1',
    primaryLight: '#7DD3FC',
    secondary: '#0284C7',
    background: '#F8FAFC',
    white: '#FFFFFF',
    whiteTransparent: 'rgba(255, 255, 255, 0.7)',
    whiteSemiTransparent: 'rgba(255, 255, 255, 0.9)',
    border: '#E2E8F0',
    disabled: '#CBD5E1',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    text: '#0369A1', // より青くした
    textLight: '#0284C7', // より青くした
    black: '#0C1A2E', // 青みのある黒
  },
  
  // フォントサイズ
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
  },
  
  // フォントウェイト
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // スペーシング
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  // シャドウ
  shadow: {
    sm: {
      shadowColor: '#0C1A2E', // 青みのある黒に変更
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#0C1A2E', // 青みのある黒に変更
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#0C1A2E', // 青みのある黒に変更
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
  },
} as const;

/**
 * 共通のスタイル
 */
export const commonStyles = StyleSheet.create({
  // ラベル
  label: {
    fontSize: DESIGN.fontSize.base, // lgからbaseに変更（16px）
    fontWeight: DESIGN.fontWeight.semibold, // boldからsemiboldに変更
    color: '#0369A1', // 水色系に変更
    marginBottom: DESIGN.spacing.md,
    letterSpacing: -0.3,
  },
  
  // 説明テキスト
  description: {
    fontSize: DESIGN.fontSize.sm,
    color: '#0284C7', // より明るい水色に変更
    marginTop: DESIGN.spacing.sm,
    lineHeight: 22,
    fontWeight: DESIGN.fontWeight.medium,
  },
  
  // 入力グループ
  inputGroup: {
    marginBottom: DESIGN.spacing.xxxl,
  },
  
  // 入力コンテナ
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DESIGN.colors.whiteTransparent,
    borderRadius: RADIUS.input,
    borderWidth: 1,
    borderColor: DESIGN.colors.whiteSemiTransparent,
    paddingHorizontal: DESIGN.spacing.xl,
    paddingVertical: DESIGN.spacing.lg,
    ...DESIGN.shadow.sm,
    shadowColor: DESIGN.colors.primary,
    shadowOpacity: 0.05,
  },
  
  // 入力フィールド
  input: {
    flex: 1,
    fontSize: DESIGN.fontSize.lg,
    color: '#0369A1', // 水色系に変更
    fontFamily: 'monospace',
    fontWeight: DESIGN.fontWeight.semibold,
  },
  
  // 単位ラベル
  unit: {
    fontSize: DESIGN.fontSize.lg,
    color: '#0284C7', // より明るい水色に変更
    marginLeft: DESIGN.spacing.md,
    fontWeight: DESIGN.fontWeight.semibold,
  },
  
  // 保存ボタン
  saveButton: {
    backgroundColor: DESIGN.colors.primary,
    borderRadius: RADIUS.button,
    paddingVertical: DESIGN.spacing.xl,
    paddingHorizontal: DESIGN.spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    ...DESIGN.shadow.lg,
    shadowColor: DESIGN.colors.primary,
    shadowOpacity: 0.4,
    borderWidth: 1,
    borderColor: DESIGN.colors.primaryLight,
  },
  
  saveButtonDisabled: {
    backgroundColor: 'rgba(14, 165, 233, 0.3)',
    shadowOpacity: 0.1,
    elevation: 2,
    borderColor: 'rgba(14, 165, 233, 0.2)',
  },
  
  saveButtonText: {
    color: DESIGN.colors.white,
    fontSize: DESIGN.fontSize.lg,
    fontWeight: DESIGN.fontWeight.bold,
    letterSpacing: -0.2,
  },
  
  saveButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  
  // 情報カード
  infoCard: {
    backgroundColor: DESIGN.colors.whiteTransparent,
    borderRadius: RADIUS.card,
    padding: DESIGN.spacing.xl,
    marginBottom: DESIGN.spacing.xxxl,
    borderWidth: 1,
    borderColor: DESIGN.colors.whiteSemiTransparent,
    ...DESIGN.shadow.md,
    shadowColor: DESIGN.colors.primary,
    shadowOpacity: 0.08,
  },
  
  infoTitle: {
    fontSize: DESIGN.fontSize.lg,
    fontWeight: DESIGN.fontWeight.bold,
    color: '#0369A1', // 水色系に変更
    marginBottom: DESIGN.spacing.md,
    letterSpacing: -0.3,
  },
  
  infoText: {
    fontSize: DESIGN.fontSize.sm,
    color: '#0284C7', // より明るい水色に変更
    lineHeight: 22,
    marginBottom: DESIGN.spacing.sm,
    fontWeight: DESIGN.fontWeight.medium,
  },
  
  // セクションタイトル
  sectionTitle: {
    fontSize: DESIGN.fontSize.lg,
    fontWeight: DESIGN.fontWeight.semibold,
    color: DESIGN.colors.primaryDark,
    marginBottom: DESIGN.spacing.lg,
  },
  
  // オプションボタン
  optionButton: {
    paddingVertical: DESIGN.spacing.xl,
    paddingHorizontal: DESIGN.spacing.xl,
    borderRadius: RADIUS.tab,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.25)',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DESIGN.spacing.sm,
    marginBottom: DESIGN.spacing.sm,
    ...DESIGN.shadow.sm,
    shadowColor: DESIGN.colors.primary,
    shadowOpacity: 0.05,
    flexDirection: 'column',
    minHeight: 60,
    flex: 1, // 均等幅にする
  },
  
  optionButtonSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: DESIGN.colors.primary,
    borderWidth: 1, // 1pxに統一
    ...DESIGN.shadow.lg,
    shadowColor: DESIGN.colors.primary,
    shadowOpacity: 0.3,
    transform: [{ scale: 1.02 }], // 微妙な拡大効果
  },
  
  optionText: {
    fontSize: DESIGN.fontSize.base,
    fontWeight: DESIGN.fontWeight.semibold,
    color: '#0369A1', // 水色系に変更
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  
  optionTextSelected: {
    color: DESIGN.colors.primary, // 白から水色に変更
    fontWeight: DESIGN.fontWeight.bold, // 選択時は太く
  },
  
  // チェックアイコン（選択時に表示）
  checkIcon: {
    marginLeft: 'auto',
    marginRight: 0,
  },
  
  // トグルスイッチ
  toggle: {
    width: 56,
    height: 32,
    borderRadius: 16,
    backgroundColor: DESIGN.colors.border,
    justifyContent: 'center',
    paddingHorizontal: 3,
    ...DESIGN.shadow.sm,
  },
  
  toggleActive: {
    backgroundColor: DESIGN.colors.primary,
    ...DESIGN.shadow.md,
    shadowColor: DESIGN.colors.primary,
    shadowOpacity: 0.3,
  },
  
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: DESIGN.colors.white,
    ...DESIGN.shadow.sm,
  },
  
  toggleThumbActive: {
    transform: [{ translateX: 24 }],
  },
  
  // ヘルプテキスト
  helpText: {
    fontSize: DESIGN.fontSize.sm,
    color: '#0284C7', // より明るい水色に変更
    marginTop: DESIGN.spacing.sm,
    lineHeight: 22,
    fontWeight: DESIGN.fontWeight.medium,
  },
});
