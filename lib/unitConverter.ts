// 単位変換ユーティリティ
export const convertMlToOz = (ml: number): number => {
  return Math.round(ml * 0.033814 * 10) / 10; // 小数点第1位まで
};

export const convertOzToMl = (oz: number): number => {
  return Math.round(oz * 29.5735);
};

export const formatVolume = (ml: number, unit: 'ml' | 'oz'): string => {
  if (unit === 'oz') {
    const oz = convertMlToOz(ml);
    return `${oz}oz`;
  }
  return `${ml}ml`;
};

export const formatVolumeWithUnit = (ml: number, unit: 'ml' | 'oz'): string => {
  if (unit === 'oz') {
    const oz = convertMlToOz(ml);
    return `${oz}オンス`;
  }
  return `${ml}ミリリットル`;
};

export const getUnitLabel = (unit: 'ml' | 'oz'): string => {
  return unit === 'oz' ? 'オンス (oz)' : 'ミリリットル (ml)';
};

export const getUnitShortLabel = (unit: 'ml' | 'oz'): string => {
  return unit === 'oz' ? 'oz' : 'ml';
};
