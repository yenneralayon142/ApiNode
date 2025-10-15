import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii, typography } from '../theme';

export const TextField = ({
  label,
  style,
  inputStyle,
  secureTextEntry,
  enableVisibilityToggle = false,
  ...props
}) => {
  const [hidden, setHidden] = useState(Boolean(secureTextEntry));

  useEffect(() => {
    setHidden(Boolean(secureTextEntry));
  }, [secureTextEntry]);

  const toggleEnabled = enableVisibilityToggle && secureTextEntry;

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputWrapper}>
        <TextInput
          placeholderTextColor='rgba(14, 62, 62, 0.6)'
          style={[
            styles.input,
            toggleEnabled ? styles.inputWithToggle : null,
            inputStyle,
          ]}
          secureTextEntry={toggleEnabled ? hidden : secureTextEntry}
          {...props}
        />
        {toggleEnabled ? (
          <TouchableOpacity
            accessibilityLabel={hidden ? 'Mostrar contrasena' : 'Ocultar contrasena'}
            onPress={() => setHidden((prev) => !prev)}
            style={styles.visibilityToggle}
          >
            <Ionicons name={hidden ? 'eye-off' : 'eye'} size={20} color={colors.heading} />
          </TouchableOpacity>
        ) : null}
      </View>
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
  inputWrapper: {
    position: 'relative',
    width: '100%',
  },
  input: {
    backgroundColor: colors.primaryLight,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 999,
    color: colors.surface,
    fontSize: typography.body,
    minHeight: spacing.xl,
  },
  inputWithToggle: {
    paddingRight: spacing.xl,
  },
  visibilityToggle: {
    position: 'absolute',
    right: spacing.md,
    top: '50%',
    marginTop: -10,
    height: 20,
    justifyContent: 'center',
  },
});



