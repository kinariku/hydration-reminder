import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface TestButtonProps {
  onPress: () => void;
  disabled: boolean;
  title: string;
  description: string;
  style?: any;
}

export const TestButton: React.FC<TestButtonProps> = ({
  onPress,
  disabled,
  title,
  description,
  style
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.testButton,
        disabled && styles.testButtonDisabled,
        style
      ]}
    >
      <Text style={[
        styles.testButtonText,
        disabled && styles.testButtonTextDisabled
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  testButton: {
    backgroundColor: '#F2F2F7',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignSelf: 'flex-start',
  },
  testButtonDisabled: {
    backgroundColor: '#F2F2F7',
    borderColor: '#E5E5EA',
  },
  testButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  testButtonTextDisabled: {
    color: '#C7C7CC',
  },
});
