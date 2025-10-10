import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthLayout } from '../components/AuthLayout';
import { TextField } from '../components/TextField';
import { PrimaryButton } from '../components/PrimaryButton';
import { spacing, colors, typography } from '../theme';

export const ResetPasswordScreen = ({ navigation }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <AuthLayout
      title="Nueva Contraseña"
      subtitle="Crea una contraseña segura"
    >
      <View>
        <TextField
          style={styles.control}
          placeholder="Nueva contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextField
          style={styles.control}
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <PrimaryButton
          title="Cambiar Contraseña"
          onPress={() => navigation.navigate('PasswordChanged')}
          style={styles.control}
        />
        <Text style={styles.helper}>
          Recuerda no compartir tu nueva contraseña y actualizarla periódicamente.
        </Text>
      </View>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  control: {
    marginBottom: spacing.md,
  },
  helper: {
    color: colors.muted,
    fontSize: typography.small,
    textAlign: 'center',
  },
});
