import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    margin: 4,
  },
  disabled: {
    backgroundColor: '#E5E5EA',
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledText: {
    color: '#8E8E93',
  },
});
