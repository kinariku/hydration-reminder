import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { BUTTON_SIZES } from '../../constants/buttonSizes';

interface QuickAddButtonProps {
  amount: number;
  onPress: (amount: number) => void;
  disabled?: boolean;
}

export const QuickAddButton: React.FC<QuickAddButtonProps> = ({
  amount,
  onPress,
  disabled = false,
}) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(amount);
  };

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={handlePress}
      disabled={disabled}
    >
      <Text style={[styles.text, disabled && styles.disabledText]}>
        +{amount}ml
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: BUTTON_SIZES.medium.paddingHorizontal,
    paddingVertical: BUTTON_SIZES.medium.paddingVertical,
    borderRadius: 25,
    margin: 4,
    minWidth: BUTTON_SIZES.medium.minWidth,
  },
  disabled: {
    backgroundColor: '#E5E5EA',
  },
  text: {
    color: 'white',
    fontSize: BUTTON_SIZES.medium.fontSize,
    fontWeight: '600',
  },
  disabledText: {
    color: '#8E8E93',
  },
});
