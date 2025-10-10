import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, spacing, radii, typography } from '../theme';

export const TextField = ({
  label,
  style,
  inputStyle,
  ...props
}) => {
  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.muted}
        style={[styles.input, inputStyle]}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    color: colors.heading,
    fontSize: typography.small,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.infoLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    color: colors.heading,
    fontSize: typography.body,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
});
