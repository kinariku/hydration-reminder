import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface SaveButtonProps {
  onPress: () => void;
  disabled: boolean;
  isLoading: boolean;
  style?: any;
}

export const SaveButton: React.FC<SaveButtonProps> = ({
  onPress,
  disabled,
  isLoading,
  style
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.saveButton,
        disabled && styles.saveButtonDisabled,
        style
      ]}
    >
      <Text style={[
        styles.saveButtonText,
        disabled && styles.saveButtonTextDisabled
      ]}>
        {isLoading ? '保存中...' : '設定を保存'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: '#8E8E93',
  },
});
