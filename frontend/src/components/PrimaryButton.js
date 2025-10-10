import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, radii, spacing, typography } from '../theme';

const variantStyles = {
  primary: {
    backgroundColor: colors.primary,
    textColor: '#FFFFFF',
  },
  secondary: {
    backgroundColor: colors.primaryLight,
    textColor: '#FFFFFF',
  },
  ghost: {
    backgroundColor: 'transparent',
    textColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primary,
  },
};

export const PrimaryButton = ({
  title,
  onPress,
  variant = 'primary',
  style,
  textStyle,
  disabled = false,
}) => {
  const palette = variantStyles[variant] || variantStyles.primary;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        { backgroundColor: palette.backgroundColor },
        palette.borderWidth
          ? { borderWidth: palette.borderWidth, borderColor: palette.borderColor }
          : null,
        disabled ? styles.buttonDisabled : null,
        style,
      ]}
    >
      <Text style={[styles.buttonText, { color: palette.textColor }, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: typography.body,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  buttonDisabled: {
    backgroundColor: colors.muted,
  },
});
