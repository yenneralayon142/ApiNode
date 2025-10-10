import React from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography } from '../theme';

export const TextLink = ({ label, onPress, style, textStyle }) => {
  return (
    <Pressable onPress={onPress} style={style}>
      <Text style={[styles.link, textStyle]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  link: {
    color: colors.primary,
    fontSize: typography.small,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
