import React from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TextInputProps, 
  ViewStyle 
} from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  containerStyle?: ViewStyle;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  containerStyle, 
  error, 
  ...props 
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputContainer,
        error ? styles.inputError : null
      ]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={COLORS.textLight}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.label,
    color: COLORS.textMid,
    marginBottom: 6,
    textTransform: 'none', // Overriding for labels if they aren't uppercase in design
    fontWeight: '700',
    fontSize: 11,
  },
  inputContainer: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    overflow: 'hidden',
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: COLORS.textDark,
    fontFamily: 'System', // Will use Inter/Nunito if installed
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: 10,
    color: COLORS.error,
    marginTop: 4,
    fontWeight: '600',
  },
});
